'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import Select from "react-select";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { debounce } from "lodash";
import { GET_API, createRequestCancelSource } from "../../../components/Helper";
import ExperienceInput from "../../../components/common/ExperienceInput";
import {
    customSelectTheme,
    JobFunctionGroupLabel,
    JobFunctionSelectStyles,
} from "../../../components/common/CustomStyleReactSelect";
import { groupOptionsByCategory, isValidDate } from "../../../components/Helper";
import { IMAGE_URL } from "../../../components/Constant";
import { MenuResumeUpload } from "../../../assets/IconSVG";
import { checkIfFilePasswordProtected } from "../../../components/Helper";
import {
    generateAwsUploadUrl,
    getJobFunctionMaster,
    getTalentLocationMaster,
} from "../../../store/actions/UserActions";
import { UPDATE_CURRENT_USER } from "../../../store/actions/actionsTypes";
import {
    saveHapppyGtmPreferences,
    trackHapppyGtm,
    ensureTalentPreferences,
    formatPreferredMethodsFromApi,
    FALLBACK_PREFERRED_METHOD_OPTIONS,
} from "../../../helpers/happpyGtmOnboarding";
import JobAgentWorkLocationField, {
    MAX_PREFERRED_CITIES,
} from "../../app/job-agent/preference/JobAgentWorkLocationField";
import "../../app/job-agent/JobAgentUpdateProfile.css";
import "../../app/preferences/preferences.css";
import "../../access-public/HappyJobAgentPublic.css";
import "../../app/agent-onboarding/AgentOnboarding.css";
import "./HapppyGtmOnboarding.css";

const FILE_REGEX = /(\.pdf|\.docx)$/i;
const FORM_ID = "happpy-gtm-prefs-form";
const RESUME_INPUT_ID = `${FORM_ID}-resume`;

const resumeFileIcon = (name) => {
    const ext = String(name || "").split(".").pop()?.toLowerCase();
    if (ext === "pdf") return IMAGE_URL + "happpy-file-pdf.svg";
    if (ext === "docx") return IMAGE_URL + "file-docx.svg";
    return IMAGE_URL + "fi_file.svg";
};

const mapPreferredCities = (cities) => {
    if (!Array.isArray(cities)) return [];
    return cities
        .map((item) => {
            if (item?.value != null && item?.label) {
                return { value: item.value, label: item.label };
            }
            const id = item?.city_id ?? item?.id;
            const label = item?.district ?? item?.city ?? item?.name;
            if (id == null) return null;
            return { value: id, label: label || String(id) };
        })
        .filter(Boolean);
};

const resolveExistingResumeLabel = (prefData, talent, user) => {
    if (talent?.resume) {
        return talent.resume;
    }
    const resume = prefData?.resume;
    if (!resume) {
        return user?.resume || "";
    }
    if (typeof resume === "string") {
        return resume;
    }
    return resume.filename || resume.name || resume.original_name || "";
};

const applyPrefPayload = ({
    prefData,
    masterData,
    user,
    setters,
}) => {
    const talent = prefData?.talent;
    let jobFn = user?.job_function_id ?? null;
    let yoe = user?.total_experience ?? "";
    let lastUpdate = null;

    if (talent?.job_function_id != null) jobFn = talent.job_function_id;
    if (talent?.total_experience !== undefined && talent?.total_experience !== null) {
        yoe = talent.total_experience;
    }
    lastUpdate = talent?.resme_last_update || talent?.resume_last_update || null;
    const resumeLabel = (resolveExistingResumeLabel(prefData, talent, user) || "").trim();
    const hasResume = Boolean(resumeLabel);

    setters.setTotalExperience(yoe === 0 || yoe === "0" ? "0" : yoe || "");
    if (hasResume) {
        setters.setResumeName(resumeLabel);
        setters.setHasExistingResume(true);
        setters.setResumeLastUpdate(lastUpdate);
    }
    if (talent) {
        setters.setPreferredCities(mapPreferredCities(talent.preferred_cities));
    }
    const methodMaster = prefData?.masters?.preferredMethodMaster?.length
        ? prefData.masters.preferredMethodMaster
        : FALLBACK_PREFERRED_METHOD_OPTIONS;
    setters.setMethodOptions(methodMaster);
    setters.setPreferredMethods(
        formatPreferredMethodsFromApi(talent?.preferred_method, methodMaster, true)
    );
    const match = (masterData || []).find(({ value }) => String(value) === String(jobFn));
    setters.setSelectedJobFunction(match ? { label: match.label, value: match.value } : null);
};

export default function HapppyGtmPreferencesStep({ onAdvance, onBack }) {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth) || {};
    const { jobFunctionMaster, preferences: cachedPreferences } = useSelector((state) => state.profile) || {};
    const [jobFunctionOptions, setJobFunctionOptions] = useState([]);
    const [selectedJobFunction, setSelectedJobFunction] = useState(null);
    const [totalExperience, setTotalExperience] = useState("");
    const [resumeName, setResumeName] = useState("");
    const [resumeData, setResumeData] = useState(null);
    const [resumeSize, setResumeSize] = useState(null);
    const [resumeLastUpdate, setResumeLastUpdate] = useState(null);
    const [hasExistingResume, setHasExistingResume] = useState(false);
    const [preferredCities, setPreferredCities] = useState([]);
    const [preferredMethods, setPreferredMethods] = useState([]);
    const [methodOptions, setMethodOptions] = useState(FALLBACK_PREFERRED_METHOD_OPTIONS);
    const [cityOptions, setCityOptions] = useState([]);
    const [searchLoading, setSearchLoading] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [resumeUploading, setResumeUploading] = useState(false);
    const [showPopover, setShowPopover] = useState(false);
    const uploadResumeRef = useRef(null);
    const cancelSources = useRef({});
    const prefsLoadedRef = useRef(false);
    const initialLoadStartedRef = useRef(false);

    useEffect(() => {
        if (initialLoadStartedRef.current) return undefined;
        initialLoadStartedRef.current = true;

        let cancelled = false;
        const load = async () => {
            setLoading(true);
            try {
                let masterData = jobFunctionMaster;
                if (!masterData || masterData.length === 0) {
                    const res = await getJobFunctionMaster(true)(dispatch);
                    masterData = res?.data || [];
                }
                if (cancelled) return;
                setJobFunctionOptions(groupOptionsByCategory(masterData || []));

                let prefData = null;
                try {
                    const prefRes = await ensureTalentPreferences(dispatch, cachedPreferences);
                    prefData = prefRes?.data;
                } catch {
                    /* prefs GET optional */
                }
                if (cancelled) return;

                if (prefData?.talent) {
                    prefsLoadedRef.current = true;
                }

                applyPrefPayload({
                    prefData,
                    masterData,
                    user,
                    setters: {
                        setTotalExperience,
                        setResumeName,
                        setHasExistingResume,
                        setResumeLastUpdate,
                        setPreferredCities,
                        setSelectedJobFunction,
                        setMethodOptions,
                        setPreferredMethods,
                    },
                });
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
        // Intentionally mount-only: re-running when Redux/user updates caused duplicate GET preference calls.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!showPopover) return undefined;
        const handleScroll = () => setShowPopover(false);
        window.addEventListener("scroll", handleScroll, true);
        return () => window.removeEventListener("scroll", handleScroll, true);
    }, [showPopover]);

    const validate = () => {
        const next = {};
        if (!resumeName && !hasExistingResume) {
            next.resume = "Please upload your resume\nDOCx, PDF | Max: 2 MB";
        }
        if (!selectedJobFunction?.value) {
            next.job_function_id = "Please select job function";
        }
        const totalExp = `${totalExperience}`.replaceAll(" ", "");
        if (totalExp === "") {
            next.total_experience = "Please add your work experience";
        } else if (!totalExp.match(/^(?:[0-9]\d*(?:\.\d{1,2})?|0(?:\.\d{1,2}))$/g)) {
            next.total_experience = "Invalid input. Please enter numerical values only in the format of 2, 3.6, 4.11 etc.";
        }
        if (!preferredCities.length) {
            next.preferred_cities = "Please enter your preferred work city";
        } else if (preferredCities.length > MAX_PREFERRED_CITIES) {
            next.preferred_cities = `You can select up to ${MAX_PREFERRED_CITIES} preferred locations`;
        }
        if (!preferredMethods.length) {
            next.preferred_method = "Please select atleast one method";
        }
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const fetchLocationMaster = useCallback(
        debounce(async (inputValue, locationType) => {
            setCityOptions([]);
            if (cancelSources.current[locationType]) {
                cancelSources.current[locationType].cancel("Operation canceled by the user.");
            }
            if (!inputValue) {
                setSearchLoading(null);
                return;
            }
            const newSource = createRequestCancelSource();
            cancelSources.current[locationType] = newSource;
            try {
                const res = await getTalentLocationMaster(
                    { search: inputValue, noState: true },
                    newSource.token
                );
                if (res?.status === 200) {
                    setCityOptions(
                        (res?.data?.data || []).map((item) => ({ value: item.id, label: item.district }))
                    );
                }
            } catch {
                /* cancelled or failed search */
            } finally {
                setSearchLoading(null);
            }
        }, 500),
        []
    );

    const handleLocationSearch = (inputVal, locationType) => {
        const inputValue = inputVal?.trim() || "";
        setSearchLoading(locationType);
        fetchLocationMaster(inputValue, locationType);
    };

    const handleResume = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setShowPopover(false);
        try {
            await checkIfFilePasswordProtected(file);
        } catch (error) {
            toast.error(error.message || "File is password-protected please upload unprotected file", {
                duration: 3000,
            });
            e.target.value = "";
            return;
        }

        if (!FILE_REGEX.exec(file.name)) {
            setErrors((prev) => ({ ...prev, resume: "The resume must be a file of type: pdf, docx." }));
            e.target.value = "";
            return;
        }
        if (file.size / 1024 > 2048) {
            setErrors((prev) => ({ ...prev, resume: "File size should be less than 2 MB" }));
            e.target.value = "";
            return;
        }

        setResumeName(file.name);
        setResumeSize(file.size);
        setResumeLastUpdate(null);
        setErrors((prev) => ({ ...prev, resume: "" }));
        setResumeUploading(true);
        const extension = file.name.split(".")?.pop()?.toLowerCase();
        const uploadPromise = generateAwsUploadUrl({ file_type: extension }, true)(dispatch)
            .then(async (res) => {
                if (res?.status === 200) {
                    const fileId = res?.data?.file_id;
                    const put = await fetch(res?.data?.url, {
                        method: "PUT",
                        headers: { "Content-Type": file?.type },
                        body: file,
                    });
                    if (put?.status === 200) {
                        setResumeData(file);
                        setHasExistingResume(true);
                        return fileId;
                    }
                    throw new Error("Resume upload failed");
                }
                throw new Error("Resume upload failed");
            })
            .catch(() => {
                toast.error("Resume upload failed");
                setErrors((prev) => ({ ...prev, resume: "Failed to upload resume" }));
                return null;
            })
            .finally(() => {
                setResumeUploading(false);
                if (e.target) e.target.value = "";
            });
        uploadResumeRef.current = uploadPromise;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSaving(true);
        try {
            let resumeFileId = null;
            if (uploadResumeRef.current) {
                resumeFileId = await uploadResumeRef.current;
            }

            const cityIds = preferredCities.map((city) => city.value);
            const methodIds = preferredMethods
                .filter((method) => method?.value && method.value !== "None")
                .map((method) => method.value);
            await saveHapppyGtmPreferences(
                {
                    resumeData,
                    resumeFileId,
                    jobFunctionId: selectedJobFunction.value,
                    totalExperience,
                    preferredCities: cityIds,
                    preferredMethods: methodIds,
                },
                dispatch
            );
            dispatch({
                type: UPDATE_CURRENT_USER,
                payload: {
                    job_function_id: selectedJobFunction.value,
                    total_experience: totalExperience,
                    preferred_cities: preferredCities,
                },
            });
            if (resumeData) {
                sessionStorage.setItem("fetchLatestResume", true);
            }
            trackHapppyGtm("happpy_gtm_prefs_saved");
            toast.success("Preferences saved");
            if (typeof onAdvance === "function") onAdvance();
        } catch (err) {
            if (err?.response?.status === 422) {
                toast.error("Please check your inputs and try again.");
            } else {
                toast.error("Could not save preferences. Please try again.");
            }
        } finally {
            setSaving(false);
        }
    };

    const ctaDisabled = saving || loading;
    const hasResumeFile = Boolean(hasExistingResume && resumeName);

    return (
        <>
            <div className="agent-onb-scroll agent-onb-scroll--profile" id="happpyGtmOnbScroll">
                <header className="happy-public-profile-drawer__header happy-public-profile-drawer__header--in-onboarding">
                    <div className="happy-public-profile-drawer__header-main">
                        <img
                            src="/images/talent/outreach/mascot-chill.svg"
                            alt=""
                            className="happy-public-profile-drawer__mascot"
                            aria-hidden
                        />
                        <h2 className="happy-public-profile-drawer__title">
                            Hey! Let&apos;s{" "}
                            <span className="happy-public-profile-drawer__title-word">
                                create your profile
                                <img
                                    className="happy-public-profile-drawer__title-underline"
                                    src="/images/talent/outreach/create-profile-underline.svg"
                                    alt=""
                                    aria-hidden
                                />
                            </span>
                        </h2>
                    </div>
                </header>

                <div className="jad-update-profile-wrap happy-public-profile-drawer__prefs">
                    <section className="containSection">
                        {loading && (
                            <div className="jad-jobs__toolbar-msg jad-jobs__toolbar-msg--loading text-center happpy-gtm-prefs-loading">
                                <span className="jad-jobs__toolbar-msg">Loading preferences…</span>
                                <div className="jad-jobs__toolbar-spinner" aria-hidden />
                            </div>
                        )}
                        {!loading && (
                            <div className="manage-preferences preferences-modal-open">
                                <form id={FORM_ID} className="happpy-gtm-prefs-form" onSubmit={handleSubmit}>
                                    <div className="form-group labelTop resume">
                                        <div className="labelCol">
                                            <label className="required_label sectionTitle">Your Latest Resume</label>
                                            {hasResumeFile && isValidDate(resumeLastUpdate) && (
                                                <span>
                                                    Last updated on: <strong>{format(new Date(resumeLastUpdate), "d-MMM-yy")}</strong>
                                                </span>
                                            )}
                                        </div>
                                        <div className="form-input">
                                            {hasResumeFile ? (
                                                <div className={`resume-flex ${errors.resume ? "err" : ""}`}>
                                                    <img src={resumeFileIcon(resumeName)} alt="" />
                                                    <div>
                                                        <span className="title">{resumeName}</span>
                                                        {resumeSize ? (
                                                            <span className="size">{Number(resumeSize / (1024 * 1024)).toFixed(2)} MB</span>
                                                        ) : null}
                                                    </div>
                                                    <OverlayTrigger
                                                        trigger="click"
                                                        placement="bottom-end"
                                                        rootClose
                                                        show={showPopover}
                                                        onToggle={setShowPopover}
                                                        overlay={
                                                            <Popover id={`${FORM_ID}-resume-menu`} className="resume-menu-options happpy-pref">
                                                                <button type="button" className="uploadBtn replace">
                                                                    <MenuResumeUpload /> Replace resume
                                                                    <p className="comment mt-0">PDF, DOCX | Max: 2 MB</p>
                                                                    <input
                                                                        id={RESUME_INPUT_ID}
                                                                        name="resume"
                                                                        type="file"
                                                                        accept=".docx,.pdf"
                                                                        onChange={handleResume}
                                                                    />
                                                                </button>
                                                            </Popover>
                                                        }
                                                    >
                                                        <button type="button" className="menuBtn" title="Resume Menu">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                                                                <rect width="32" height="32" rx="16" fill="#DFEFEC" />
                                                                <path d="M15.332 26.668C16.4366 26.668 17.332 25.7725 17.332 24.668C17.332 23.5634 16.4366 22.668 15.332 22.668C14.2275 22.668 13.332 23.5634 13.332 24.668C13.332 25.7725 14.2275 26.668 15.332 26.668Z" fill="#231F20" />
                                                                <path d="M15.332 18.668C16.4366 18.668 17.332 17.7725 17.332 16.668C17.332 15.5634 16.4366 14.668 15.332 14.668C14.2275 14.668 13.332 15.5634 13.332 16.668C13.332 17.7725 14.2275 18.668 15.332 18.668Z" fill="#231F20" />
                                                                <path d="M15.332 10.668C16.4366 10.668 17.332 9.77254 17.332 8.66797C17.332 7.5634 16.4366 6.66797 15.332 6.66797C14.2275 6.66797 13.332 7.5634 13.332 8.66797C13.332 9.77254 14.2275 10.668 15.332 10.668Z" fill="#231F20" />
                                                            </svg>
                                                        </button>
                                                    </OverlayTrigger>
                                                </div>
                                            ) : (
                                                <label
                                                    htmlFor={RESUME_INPUT_ID}
                                                    className={`resume-flex resume-flex--upload-prompt${errors.resume ? " err" : ""}${resumeUploading ? " resume-flex--upload-prompt-loading" : ""}`}
                                                >
                                                    <img src={`${IMAGE_URL}fi_file.svg`} alt="" />
                                                    <div>
                                                        <span className="title">
                                                            {resumeUploading ? "Uploading resume…" : "Upload your resume"}
                                                        </span>
                                                    </div>
                                                    <input
                                                        id={RESUME_INPUT_ID}
                                                        name="resume"
                                                        type="file"
                                                        accept=".docx,.pdf"
                                                        onChange={handleResume}
                                                        disabled={resumeUploading}
                                                        data-hj-allow
                                                        className="resume-flex__file-input"
                                                    />
                                                </label>
                                            )}
                                            {errors.resume && <div className="error-msg">{errors.resume}</div>}
                                        </div>
                                    </div>

                                    <div className="jad-background-section">
                                        <div className="jad-background-section__header">
                                            <h4 className="jad-background-section__title">Your Background</h4>
                                        </div>
                                        <div className="jad-background-section__fields">
                                            <div className="form-group job-function">
                                                <label className="required_label">Current Role</label>
                                                <div className="form-input">
                                                    <Select
                                                        theme={customSelectTheme}
                                                        options={jobFunctionOptions}
                                                        inputId="happpy_gtm_job_function_id"
                                                        placeholder="Select current role"
                                                        value={selectedJobFunction}
                                                        onChange={(val) => {
                                                            setSelectedJobFunction(val);
                                                            setErrors((prev) => ({ ...prev, job_function_id: "" }));
                                                        }}
                                                        name="job_function_id"
                                                        isSearchable
                                                        classNamePrefix="react-select"
                                                        styles={JobFunctionSelectStyles}
                                                        formatGroupLabel={JobFunctionGroupLabel}
                                                    />
                                                    {errors.job_function_id && <div className="error-msg">{errors.job_function_id}</div>}
                                                </div>
                                            </div>
                                            <div className="form-group yoe">
                                                <label className="required_label">Work Experience</label>
                                                <div className="form-input">
                                                    <ExperienceInput
                                                        value={totalExperience}
                                                        onChange={(val) => {
                                                            setTotalExperience(val);
                                                            setErrors((prev) => ({ ...prev, total_experience: "" }));
                                                        }}
                                                    />
                                                    {errors.total_experience && <div className="error-msg">{errors.total_experience}</div>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <JobAgentWorkLocationField
                                        hideCurrentLocation
                                        preferredCities={preferredCities}
                                        onPreferredCitiesChange={(val) => {
                                            setPreferredCities(val || []);
                                            setErrors((prev) => ({ ...prev, preferred_cities: "" }));
                                        }}
                                        onPreferredLocationSearch={(inputValue) => handleLocationSearch(inputValue, "preferred_cities")}
                                        preferredMethods={preferredMethods}
                                        methodOptions={methodOptions}
                                        onPreferredMethodsChange={(methods) => {
                                            setPreferredMethods(methods || []);
                                            setErrors((prev) => ({ ...prev, preferred_method: "" }));
                                        }}
                                        locationOptions={cityOptions}
                                        locationLoadingType={searchLoading}
                                        errors={{
                                            preferred_cities: errors.preferred_cities,
                                            preferred_method: errors.preferred_method,
                                        }}
                                    />
                                </form>
                            </div>
                        )}
                    </section>
                </div>
            </div>

            <div className="agent-onb-footer agent-onb-footer--profile">
                {onBack ? (
                    <button
                        type="button"
                        className="agent-onb-footer__back"
                        onClick={onBack}
                        aria-label="Back to previous step"
                        disabled={ctaDisabled}
                    >
                        <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M25.9668 16.4004H6.83346" stroke="#231F20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M16.4001 6.83301L6.83348 16.3997L16.4001 25.9663" stroke="#231F20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                ) : null}
                <button
                    type="submit"
                    form={FORM_ID}
                    className={`happy-public-profile-drawer__cta agent-onb-footer__cta agent-onb-footer__cta--dark${ctaDisabled ? " happy-public-profile-drawer__cta--disabled" : ""}`}
                    disabled={ctaDisabled}
                    aria-busy={saving || loading}
                >
                    <span>{saving ? "Saving…" : loading ? "Loading…" : "Save & continue"}</span>
                    {!ctaDisabled && (
                        <svg className="happy-public-profile-drawer__cta-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                            <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </button>
            </div>
        </>
    );
}
