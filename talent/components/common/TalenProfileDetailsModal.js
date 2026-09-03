import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from "@/talent/navigation/routerCompat";
import { customSelectTheme, JobFunctionGroupLabel, JobFunctionSelectStyles, ReactSelectStyles } from './CustomStyleReactSelect';
import CTCBreakdown from './CTCBreakdown';
import ExperienceInput from './ExperienceInput';
import { MoneyInput } from './Inputs';
import { ArrowRightIcon, FireIcon, GlobalJobsIcon, ModalCloseIcon, ResumeFlashIcon, UploadIcon, CheckedRoundedIcon, IconLastUpdated } from '../../assets/IconSVG';
import { createRequestCancelSource } from '../Helper';
import { debounce } from 'lodash';
import toast from 'react-hot-toast';
import { checkIfFilePasswordProtected } from '../Helper';
import { buildFormData, convertNpToDays, formatCTCBreakdown, getPlaceholderLWD, groupOptionsByCategory, isAllEmpty, isValidDate, sanitizePayload } from '../Helper';
import { getJobFunctionMaster, getProfilePercent, profileUpsert, generateAwsUploadUrl } from '../../store/actions/UserActions';
import { validateContactNo, validateURL } from '../profile/formValidations';
import { getTalentLocationMaster } from '../../store/actions/UserActions';
import { useDispatch, useSelector } from 'react-redux';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import Loader from '../Loader';
import Select from 'react-select';
import Modal from 'react-modal';
import { SET_TAILOR_MODAL_OPEN } from "../../store/actions/actionsTypes";
import { mixpanelBackendTracking } from '../../store/actions/trackingActions';
import { IMAGE_URL } from '../Constant';
import { isHapppyAgentFaviconPath } from '../../helpers/happpyAgentFavicon';

const TalentProfileDetailsModalContent = ({ isHRSignUp = false }) => {
    const { user: userData } = useSelector(state => state.auth)
    const user = userData || {};
    const [searchParams] = useSearchParams();
    const suppressCareerProfileModal =
        searchParams.get('directApply') == 'true' ||
        searchParams.get('showHRDetails') === 'true';
    const [isOpen, setIsOpen] = useState(!suppressCareerProfileModal && user?.status == 0);
    // var [step, setStep] = useState(isHRSignUp ? 2 : 1);
    var [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        name: user?.name || "",
        contact_number: "",
        linkedin_id: "",
        total_experience: "",
        current_ctc: "",
        expected_ctc: "",
        joining_period: "",
        serving_notice_period: "",
        last_working_day: "",
        job_function: "",
        current_location: "",
        preferred_cities: "",
        ctc_breakdown: null,
    });
    const [resumeFile, setResumeFile] = useState(null);
    const [resumeFileName, setResumeFileName] = useState("");
    const [resumeError, setResumeError] = useState(null);
    const [fileId, setFileId] = useState(null);

    const [levelUp, setLevelUp] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { jobFunctionMaster } = useSelector(state => state.profile)
    const [jobFunctionOptions, setJobFunctionOptions] = useState([])

    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (suppressCareerProfileModal) {
            setIsOpen(false);
        }
    }, [suppressCareerProfileModal])


    // job function
    useEffect(() => {
        if (jobFunctionMaster && jobFunctionMaster.length > 0) {
            const options = groupOptionsByCategory(jobFunctionMaster)
            setJobFunctionOptions(options)
        } else {
            getJobFunctionMaster()(dispatch).then(res => {
                const options = groupOptionsByCategory(res.data)
                setJobFunctionOptions(options)
            })
        }
    }, [])

    // current location
    const [currentCityOption, setCurrentCityOption] = useState([])
    const [searchLoading, setSearchLoading] = useState(null)

    const handleInputLocationChange = (locationType, inputVal) => {
        let inputValue = inputVal?.trim();
        setSearchLoading(locationType);
        fetchLocationMaster(inputValue, locationType);
    };

    const cancelSources = useRef({});

    const fetchLocationMaster = useCallback(
        debounce(async (inputValue, locationType) => {
            setCurrentCityOption([]);
            if (cancelSources.current[locationType]) {
                console.log(`[CANCEL] Cancelling previous request for ${locationType}`);
                cancelSources.current[locationType].cancel('Operation canceled by the user.');
            }
            if (inputValue.length === 0) {
                setSearchLoading(null);
                return;
            }
            const newSource = createRequestCancelSource();
            cancelSources.current = {
                ...cancelSources.current,
                [locationType]: newSource // Store the new source
            };
            const cancelToken = newSource.token;
            try {
                const res = await getTalentLocationMaster({
                    search: inputValue,
                    noState: true,
                }, cancelToken);
                if (res?.status === 200) {
                    const locationOption = res?.data?.data?.map((item) => ({ value: item.id, label: item.district }));
                    setCurrentCityOption(locationOption);
                    setSearchLoading(null);
                }
                if (res?.data?.data?.length == 0) {
                    setCurrentCityOption([]);
                }
            } catch (err) {
                console.log(err);
            }
        }, 500), []
    )

    // handle input change
    const handleInputChange = (key, value) => {
        if (key === "contact_number" && isNaN(value)) return
        let _formData = { ...formData };

        if (key == 'last_working_day') {
            _formData[key] = format(value, 'yyyy-MM-dd');
        } else {
            _formData[key] = value;
        }

        setFormData(_formData);
        setErrors({ ...errors, [key]: null })
    }

    const handleExpChange = (field, value) => {
        let _formData = { ...formData };
        _formData[field] = value;
        setFormData(_formData);
        setErrors({ ...errors, [field]: null })
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
        }
    }

    const handleCTCBreakdownChange = (name, value) => {
        let _formData = { ...formData };
        _formData['ctc_breakdown'] = value;
        setFormData(_formData);
        setErrors({ ...errors, [name]: null })
    }

    const acceptedExtensions = ['pdf', 'docx'];
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const result = await checkIfFilePasswordProtected(file);
            console.log(result);  // File is not password-protected
        } catch (error) {
            toast.error(error.message || "File is password-protected please upload unprotected file");
            console.error(error.message);
            const inp = e.target;
            if (inp) inp.value = "";
            return;
        }

        const extension = file.name.split('.')?.pop()?.toLowerCase();
        if (!acceptedExtensions?.includes(extension)) {
            setResumeError("It appears you tried to upload in a format we don't support.\nPlease upload DOCx, PDF | Max: 2 MB");
            return;
        }
        if (file?.size / 1024 > 2048) {
            setResumeError("It appears you tried to upload a file larger than 2 MB\nPlease upload DOCx, PDF | Max: 2 MB");
            return;
        }

        setResumeError(null);

        setLoading(true);
        generateAwsUploadUrl({ file_type: extension }, true)(dispatch)
            .then(async (res) => {
                if (res?.status === 200) {
                    setFileId(res?.data?.file_id);
                    await fetch(res?.data?.url,
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type": file?.type
                            },
                            body: file
                        })
                        .then(res => {
                            if (res?.status === 200) {
                                setResumeFile(file);
                                setResumeFileName(file?.name || "");
                            }
                        })
                        .catch(err => {
                            console.error("Resume upload error:", err);
                            toast.error("Resume upload failed");
                        })
                        .finally(() => {
                            setLoading(false);
                        });
                }
            })
            .catch((err) => {
                const apiErrors = err?.response?.data?.errors;
                if (apiErrors && typeof apiErrors === "object" && apiErrors.value) {
                    const msg = Array.isArray(apiErrors.value) ? apiErrors.value[0] : apiErrors.value;
                    setResumeError(typeof msg === "string" ? msg : "Failed to upload resume");
                } else {
                    setResumeError("Something went wrong. Please try again.");
                }
                toast.error("Resume upload failed");
                console.error("Resume upload error:", err);
            })
            .finally(() => {
                setLoading(false);
                if (e.target) e.target.value = "";
            });
    };

    const validateForm = () => {
        let isValid = true;
        let newErrors = {};
        let _formData = { ...formData };

        if (!_formData.name) {
            isValid = false;
            newErrors.name = "Please enter your full name";
        }

        if (!_formData.contact_number) {
            isValid = false;
            newErrors.contact_number = "Please enter your contact number";
        } else if (!validateContactNo(_formData.contact_number)) {
            isValid = false;
            newErrors.contact_number = "Please enter your 10 digit contact number";
        }

        if (!formData.linkedin_id) {
            isValid = false;
            newErrors.linkedin_id = "Linkedin profile url is a required field"
        } else if (formData.linkedin_id && (!validateURL(formData.linkedin_id) || !formData.linkedin_id?.toLowerCase()?.split("linkedin.com/")[1])) {
            isValid = false;
            newErrors.linkedin_id = "Please enter valid linkedin url. eg: https://www.linkedin.com/in/username";
            if (!formData.linkedin_id.includes("https://")) {
                newErrors.linkedin_id = "Linkedin profile url must start with https://";
            }
        }

        if (!formData.joining_period) {
            isValid = false;
            newErrors.joining_period = "Please select your notice period";
        }
        if (formData.joining_period) {
            if (convertNpToDays(formData.joining_period) != 0 && !["Yes", "No"].includes(formData.serving_notice_period)) {
                isValid = false;
                newErrors.serving_notice_period = "Please select your answer";
            }
            if ((convertNpToDays(formData.joining_period) == 0 ||
                formData.serving_notice_period == "Yes") &&
                !formData.last_working_day
            ) {
                isValid = false;
                newErrors.last_working_day = "Please add your last working day";
            }
        }

        if (!_formData.job_function) {
            isValid = false;
            newErrors.job_function = "Please select job function";
        }

        if (!_formData.total_experience) {
            isValid = false;
            newErrors.total_experience = "Please add your work experience";
        }

        if (!_formData.current_ctc) {
            isValid = false;
            newErrors.current_ctc = "Please add current annual salary";
        }
        else if (_formData.current_ctc > 0 && _formData.current_ctc <= 1) {
            isValid = false;
            newErrors.current_ctc = "Current Annual Salary must be greater than 1 lac";
        } else if (_formData.current_ctc >= 500) {
            isValid = false;
            newErrors.current_ctc = "Current Annual Salary must be less than 5 cr";
        }

        if (!_formData.expected_ctc) {
            isValid = false;
            newErrors.expected_ctc = "Please add expected annual salary";
        }
        else if (_formData.expected_ctc <= 1) {
            isValid = false;
            newErrors.expected_ctc = "Expected Annual Salary must be greater than 1 lac";
        }

        if (!_formData.current_location) {
            isValid = false;
            newErrors.current_location = "Please select current location";
        }

        if (!_formData.preferred_cities) {
            isValid = false;
            newErrors.preferred_cities = "Please select preferred location";
        }


        if (_formData.ctc_breakdown) {
            if (isAllEmpty(_formData.ctc_breakdown, ["ctc_type"])) delete _formData.ctc_breakdown;
        }

        setErrors(newErrors);
        return isValid;
    }

    const handleSubmit = () => {

        if (!validateForm()) return;

        let reqMap = {
            name: formData?.name,
            contact_number: formData?.contact_number,
            linkedin_id: formData?.linkedin_id,
            total_experience: formData?.total_experience,
            joining_period: formData?.joining_period,
            job_function: formData?.job_function?.value,
            current_ctc: Math.round(formData?.current_ctc * 100000),
            ctc_breakdown: formData?.ctc_breakdown,
            expected_ctc: Math.round(formData?.expected_ctc * 100000),
            current_location: formData?.current_location,
            preferred_cities: formData?.preferred_cities?.map(item => item.value),
            serving_notice_period: formData?.serving_notice_period,
            last_working_day: formData?.last_working_day,
            resume_file_id: fileId,
        };

        var payload = {}; var obj = {}
        for (let [k, value] of Object.entries(reqMap)) {
            obj[k] = sanitizePayload(k, value);
        }
        if (obj?.ctc_breakdown) {
            obj.ctc_breakdown = formatCTCBreakdown(obj.ctc_breakdown)
        }

        payload["field"] = "preferences";
        payload["value"] = obj;
        payload["save_source"] = "Signup Popup";

        let payloadFormData = new FormData();
        for (let [key, data] of Object.entries(payload)) {
            payloadFormData = buildFormData(payloadFormData, data, key);
        }

        setLoading(true);
        profileUpsert(payloadFormData, true)(dispatch).then(res => {
            if (res?.status === 200) {
                toast.success("Profile updated successfully");
                getProfilePercent()(dispatch)
                setStep(2);
            }
        }).catch(err => {
            const apiErrors = err?.response?.data?.errors;
            if (apiErrors && typeof apiErrors === "object") {
                const newErrors = {};

                Object.entries(apiErrors).forEach(([key, value]) => {
                    // key example: "value.resume" OR "resume"
                    const normalizedKey = key.includes(".")
                        ? key.split(".").pop()
                        : key;

                    newErrors[normalizedKey] = Array.isArray(value)
                        ? value[0]
                        : value;
                });

                setErrors(newErrors);
                toast.error("Please fix the errors below");
                return;
            }

            console.error("Profile update error:", err);
            toast.error("Something went wrong");
        }).finally(() => {
            setLoading(false);
            // setIsOpen(false);
        })
    }

    useEffect(() => {
        //need to add mixpanel event for application submitted successfully
        if (levelUp === "resume") {
            setIsOpen(false);
            navigate("/talent/resume-health-check/new");
            localStorage.setItem('auto_trigger_transformation', true); // flag to trigger resume transformation
            mixpanelBackendTracking('after_signup_user_navigate', { from_where: "Talent Profile Details Modal", selectedValue: "resume" })
        } else if (levelUp === "tailor") {
            setIsOpen(false);
            mixpanelBackendTracking('after_signup_user_navigate', { from_where: "Talent Profile Details Modal", selectedValue: "tailor" })
            // navigate("/talent/tailor-dashboard");
            // const hr_enc_id = searchParams.get("hr_enc_id");
            // if(hr_enc_id) {
            //     dispatch({ type: SET_TAILOR_MODAL_OPEN, payload: { hr_enc_id: hr_enc_id } });
            // }
        } else if (levelUp === "jobs") {
            setIsOpen(false)
            mixpanelBackendTracking('after_signup_user_navigate', { from_where: "Talent Profile Details Modal", selectedValue: "jobs" })
        }
    }, [levelUp])

    return (
        <>
            {loading && <Loader />}
            <Modal
                className={`commonModal profileDetailsModal ${step != 1 ? "levelUp" : ""}`}
                portalClassName="react-modal-portal"
                isOpen={isOpen}
                onRequestClose={() => setIsOpen(false)}
                shouldCloseOnOverlayClick={false}
            >
                <div className={`pdm-container`}>
                    <button
                        type="button"
                        className="modal-close-btn"
                        onClick={() => setIsOpen(false)}
                        aria-label="Close modal"
                    >
                        <ModalCloseIcon />
                    </button>

                    <div className='pdm-header'>
                        <h3>
                            {step === 1
                                ? "Tell Us About Your Career to Get Better-Matched Jobs"
                                : !isHRSignUp ? "Pick How You Want to Level Up" : "Application Submitted Successfully 🎉"
                            }
                        </h3>

                        {(step === 2 && !isHRSignUp) && <span style={{ marginTop: "10px" }}>We recommend starting with a quick resume improvement for better results.</span>}
                        {step === 2 && isHRSignUp && <span style={{ marginTop: "10px" }}>Make Your Application Stand Out. We recommend starting with a quick resume improvement for better results.</span>}
                    </div>

                    <hr className="pdm-hr" />

                    {step === 1 && (
                        <form className="apply-form">
                            <div className="flexible-form">
                                <div className="form-group">
                                    <label className="required_label label">Full Name</label>
                                    <input
                                        type="text"
                                        placeholder="Your first & last name"
                                        className={errors.name ? "form-control err" : "form-control"}
                                        name="name"
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        value={formData.name}
                                        onKeyDown={handleKeyDown}
                                        data-hj-allow
                                    />
                                    {errors.name && (
                                        <div
                                            className="error-msg"
                                            dangerouslySetInnerHTML={{
                                                __html: errors.name,
                                            }}
                                        ></div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label className="required_label label">Phone Number</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: 9876543210"
                                        className={errors.contact_number ? "form-control err" : "form-control"}
                                        name="contact_number"
                                        maxLength={10}
                                        onChange={(e) => handleInputChange('contact_number', e.target.value)}
                                        value={formData.contact_number}
                                        onKeyDown={handleKeyDown}
                                        data-hj-allow
                                    />
                                    {errors.contact_number && (
                                        <div
                                            className="error-msg"
                                            dangerouslySetInnerHTML={{
                                                __html: errors.contact_number,
                                            }}
                                        ></div>
                                    )}
                                </div>

                                <div className="form-group resume">
                                    <div className="resume-label-container">
                                        <label className="required_label label">
                                            {resumeFile ? 'Your resume' : 'Upload your resume'}
                                        </label>
                                        {!resumeFile && <p className="info-file-format">(DOCx or PDF | Max: 2 MB)</p>}
                                    </div>
                                    {resumeFile ?
                                        <div className="resume-edit">

                                            <div className={`resume-flex ${errors.resume ? 'err' : ''}`} >
                                                {resumeFile?.name?.split('.').pop().toLowerCase() == 'pdf' ?
                                                    <img src={IMAGE_URL + "file-pdf.svg"} />
                                                    :
                                                    resumeFile?.name?.split('.').pop().toLowerCase() == 'docx' ?
                                                        <img src={IMAGE_URL + "file-docx.svg"} /> :
                                                        <img src={IMAGE_URL + "fi_file.svg"} />
                                                }
                                                <div>
                                                    <span className="title">
                                                        {resumeFile?.name}
                                                    </span>
                                                    {resumeFile?.size && <span className="size">{Number(resumeFile?.size / (1024 * 1024)).toFixed(2)} MB</span>}
                                                    {!resumeFile?.size && isValidDate(resumeFile?.lastModifiedDate) &&
                                                        <span className="lastUpdate">
                                                            <IconLastUpdated />
                                                            <div className="right">
                                                                Last updated on: <strong>{format(new Date(resumeFile?.lastModifiedDate), 'd-MMM-yy')}</strong>
                                                            </div>
                                                        </span>
                                                    }
                                                </div>
                                                {resumeFile && !errors.resume && <CheckedRoundedIcon color={"#439494"} />}
                                            </div>

                                            <div className="resume-btn-replace">
                                                <div className="filewrap">
                                                    <input
                                                        id="resumeReplace"
                                                        name="resume"
                                                        type="file"
                                                        accept='.docx,.pdf'
                                                        onChange={handleFileChange}
                                                    />
                                                    <label htmlFor="resumeReplace">
                                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M12.25 8.75V11.0833C12.25 11.3928 12.1271 11.6895 11.9083 11.9083C11.6895 12.1271 11.3928 12.25 11.0833 12.25H2.91667C2.60725 12.25 2.3105 12.1271 2.09171 11.9083C1.87292 11.6895 1.75 11.3928 1.75 11.0833V8.75" stroke="white" stroke-width="1.16667" stroke-linecap="round" stroke-linejoin="round" />
                                                            <path d="M9.91634 4.66667L6.99967 1.75L4.08301 4.66667" stroke="white" stroke-width="1.16667" stroke-linecap="round" stroke-linejoin="round" />
                                                            <path d="M7 1.75V8.75" stroke="white" stroke-width="1.16667" stroke-linecap="round" stroke-linejoin="round" />
                                                        </svg>
                                                        Upload New Resume
                                                    </label>
                                                </div>
                                                <span className="comment">
                                                    PDF, DOCX | Max: 2 MB
                                                </span>
                                            </div>
                                        </div>
                                        :
                                        <div className="resume-btn">
                                            <div className="filewrap">
                                                <input
                                                    id="resumeUpload"
                                                    name="resume"
                                                    type="file"
                                                    accept='.docx,.pdf'
                                                    onChange={handleFileChange}
                                                />
                                                <label htmlFor="resumeUpload">
                                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M12.25 8.75V11.0833C12.25 11.3928 12.1271 11.6895 11.9083 11.9083C11.6895 12.1271 11.3928 12.25 11.0833 12.25H2.91667C2.60725 12.25 2.3105 12.1271 2.09171 11.9083C1.87292 11.6895 1.75 11.3928 1.75 11.0833V8.75" stroke="white" stroke-width="1.16667" stroke-linecap="round" stroke-linejoin="round" />
                                                        <path d="M9.91634 4.66667L6.99967 1.75L4.08301 4.66667" stroke="white" stroke-width="1.16667" stroke-linecap="round" stroke-linejoin="round" />
                                                        <path d="M7 1.75V8.75" stroke="white" stroke-width="1.16667" stroke-linecap="round" stroke-linejoin="round" />
                                                    </svg>
                                                    Upload Your Resume
                                                </label>
                                            </div>
                                        </div>
                                    }

                                    {(errors.resume || resumeError) && (
                                        <div className="error-msg mt-4 pt-1">{errors.resume || resumeError}</div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="required_label label">LinkedIn URL
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter your LinkedIn URL"
                                        className={errors.linkedin_id ? "form-control err" : "form-control"}
                                        name="linkedin_id"
                                        onChange={(e) => handleInputChange('linkedin_id', e.target.value)}
                                        value={formData.linkedin_id}
                                        autoComplete="new-linkedin_id"
                                        onKeyDown={handleKeyDown}
                                        data-hj-allow
                                    />
                                    {errors.linkedin_id && (
                                        <div
                                            className="error-msg"
                                            dangerouslySetInnerHTML={{
                                                __html: errors.linkedin_id,
                                            }}
                                        ></div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label className="required_label label infoTipLabel">
                                        Current years of work experience
                                    </label>

                                    <ExperienceInput
                                        value={formData.total_experience}
                                        onChange={(val) => handleExpChange('total_experience', val)}
                                        wrapperClass={'form-control'}
                                    />
                                    {errors.total_experience && (
                                        <div className="error-msg">
                                            {errors.total_experience}
                                        </div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label className="required_label label">Notice Period</label>
                                    <Select
                                        options={joiningMaster}
                                        isSearchable={true}
                                        className={`customSelectPicker`}
                                        classNamePrefix="customSelect react-select"
                                        value={joiningMaster.find(i => i.value == formData.joining_period)}
                                        name="joining_period"
                                        onChange={(option) => handleInputChange('joining_period', option?.value)}
                                        menuPlacement='auto'
                                    />
                                    {formData.joining_period && <div className='joiningPeriodDetails'>
                                        {convertNpToDays(formData.joining_period) != 0 &&
                                            <div className='currentNoticePeriod'>
                                                <span className='periodQuestion required_label'>Are you currently serving notice period?</span>
                                                <div className='customRadioOption'>
                                                    <label className="customRadio">
                                                        <input type="radio" name='currentNoticePeriodoption'
                                                            checked={formData['serving_notice_period'] == "Yes"}
                                                            value={"Yes"}
                                                            onChange={(e) => handleInputChange('serving_notice_period', e.target.value)}
                                                        />
                                                        <span className="checkmarkIcon"></span>Yes
                                                    </label>
                                                    <label className="customRadio">
                                                        <input type="radio" name='currentNoticePeriodoption'
                                                            checked={formData['serving_notice_period'] == "No"}
                                                            value={"No"}
                                                            onChange={(e) => handleInputChange('serving_notice_period', e.target.value)}
                                                        />
                                                        <span className="checkmarkIcon"></span>No
                                                    </label>
                                                </div>
                                            </div>}
                                        {(convertNpToDays(formData.joining_period) == 0 ||
                                            formData.serving_notice_period == "Yes") &&
                                            <div className='lastWorkingDay'>
                                                <span className='lwdQuestion required_label'>
                                                    Let us know your last working day
                                                </span>
                                                <div className='lwd-date-picker'>
                                                    <DatePicker
                                                        selected={isValidDate(formData.last_working_day) ?
                                                            new Date(formData.last_working_day) : null
                                                        }
                                                        onChange={(val) => handleInputChange("last_working_day", val)}
                                                        dateFormat="dd/MM/yyyy"
                                                        wrapperClassName="date-wrapper"
                                                        className="date-input"
                                                        calendarClassName="date-calendar"
                                                        popperClassName="calendar-container"
                                                        placeholderText={"Ex: " + getPlaceholderLWD()}
                                                        peekNextMonth
                                                        showMonthDropdown
                                                        showYearDropdown
                                                        dropdownMode="select"
                                                        onKeyDown={(e) => {
                                                            if (
                                                                /^[A-Za-z]+$/.test(e.key) &&
                                                                !e.key.includes("Backspace")
                                                            )
                                                                e.preventDefault();
                                                        }}
                                                    />
                                                </div>
                                            </div>}
                                    </div>}
                                    {(errors?.joining_period || errors?.serving_notice_period || errors?.last_working_day) && <span className="error-msg">{errors?.joining_period || errors?.serving_notice_period || errors?.last_working_day}</span>}
                                </div>
                                <div className="form-group">
                                    <label className="required_label label">
                                        Current Job Function
                                    </label>
                                    <Select
                                        options={jobFunctionOptions}
                                        value={formData.job_function}
                                        formatGroupLabel={JobFunctionGroupLabel}
                                        onChange={(option) => handleInputChange('job_function', option)}
                                        name="job_function"
                                        placeholder="Select Current Job Function"
                                        theme={customSelectTheme}
                                        styles={JobFunctionSelectStyles}
                                        classNamePrefix="react-select"
                                    />
                                    {errors.job_function && (
                                        <div className="error-msg">{errors.job_function}</div>
                                    )}
                                </div>
                                <div className="form-group relative">
                                    <label className="required_label label">
                                        Current annual salary
                                    </label>
                                    <MoneyInput
                                        type="text"
                                        placeholder="6.6"
                                        className={`form-control ${errors.current_ctc ? "err" : ""}`}
                                        name="current_ctc"
                                        onChange={(e) => handleInputChange('current_ctc', e.target.value)}
                                        value={formData.current_ctc}
                                    />
                                    {errors.current_ctc && (
                                        <div className="error-msg">{errors.current_ctc}</div>
                                    )}
                                    <CTCBreakdown ctcBreakdown={formData.ctc_breakdown} handleInputChange={handleCTCBreakdownChange} style="joinus-ctc-breakdown" />
                                </div>
                                <div className="form-group relative">
                                    <label className="required_label label">
                                        Expected annual salary
                                    </label>
                                    <MoneyInput
                                        type="text"
                                        placeholder="15.5"
                                        className={`form-control ${errors.expected_ctc ? "err" : ""}`}
                                        name="expected_ctc"
                                        onChange={(e) => handleInputChange('expected_ctc', e.target.value)}
                                        value={formData.expected_ctc}
                                    />
                                    {errors.expected_ctc && (
                                        <div className="error-msg">{errors.expected_ctc}</div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label className="required_label label">
                                        Current Location
                                    </label>
                                    <Select
                                        theme={customSelectTheme}
                                        classNamePrefix="react-select"
                                        placeholder="Search location"
                                        isClearable={false}
                                        isSearchable={true}
                                        styles={ReactSelectStyles}
                                        options={currentCityOption}
                                        name="current_location"
                                        inputId="current_location"
                                        onInputChange={(inputValue) => handleInputLocationChange('current_location', inputValue)}
                                        onChange={(val) => handleInputChange('current_location', val)}
                                        isLoading={searchLoading == 'current_location'}
                                        value={formData.current_location}
                                        filterOption={() => true}
                                        menuPlacement="top"
                                        noOptionsMessage={({ inputValue }) => {
                                            if (inputValue) return "No city found"
                                            return "Please type your city name";
                                        }}
                                    />
                                    {errors.current_location && (
                                        <div className="error-msg">{errors.current_location}</div>
                                    )}
                                </div>
                                <div className='form-group flex-wrap'>
                                    <label className='required_label label'>Preferred location</label>
                                    <Select
                                        theme={customSelectTheme}
                                        classNamePrefix="react-select"
                                        placeholder="Search location"
                                        isClearable={false}
                                        isSearchable={true}
                                        styles={ReactSelectStyles}
                                        options={currentCityOption}
                                        isMulti
                                        name="preferred_cities"
                                        inputId="preferred_cities"
                                        onInputChange={(inputValue) => handleInputLocationChange('preferred_cities', inputValue)}
                                        onChange={(val) => handleInputChange('preferred_cities', val)}
                                        isLoading={searchLoading == 'preferred_cities'}
                                        value={formData.preferred_cities}
                                        filterOption={() => true}
                                        menuPlacement="top"
                                        noOptionsMessage={({ inputValue }) => {
                                            if (inputValue) return "No city found"
                                            return "Please type your city name";
                                        }}
                                    />
                                    {errors.preferred_cities &&
                                        <div className="error-msg">{errors.preferred_cities}</div>
                                    }
                                </div>
                            </div>
                            <div className="btn-container">
                                <button type="button" disabled={loading} className="cta-button submitBtn" onClick={handleSubmit}>Submit</button>
                            </div>
                        </form>
                    )}

                    {step === 2 && (
                        <div>
                            <div className="cardsTalentDetailModal">
                                <div className="cardTalentDetailModal" onClick={() => setLevelUp("resume")}>
                                    <span className="badge-topTalentDetailModal">3 mins</span>
                                    <div className="icon-wrapTalentDetailModal yellowTalentDetailModal">
                                        <img src="/images/icons/healthcheck.png" alt="" />
                                    </div>
                                    <h3>Run A Resume Healthcheck</h3>
                                    <p>Quickly find gaps like missing keywords, formatting issues etc.</p>
                                    <button className="btnTalentDetailModal btn-darkTalentDetailModal">⚡ IMPROVE NOW</button>
                                </div>

                                <div className="cardTalentDetailModal" onClick={() => setLevelUp("jobs")}>
                                    <div className="icon-wrapTalentDetailModal brownTalentDetailModal">
                                        <img src="/images/icons/jobs.png" alt="" />
                                    </div>
                                    <h3>Explore Job Opportunities</h3>
                                    <p>Find roles that match your skills</p>
                                    <button className="btnTalentDetailModal btn-outlineTalentDetailModal">VIEW JOBS →</button>
                                </div>

                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </>
    )
}

export default function TalentProfileDetailsModal({ isHRSignUp = false }) {
    const { openSignupFlow } = useSelector(state => state.work);
    const location = useLocation();
    const { transformation_id, tailor_to_job_modal } = useSelector(state => state.resumeEditor);
    const isEditResumeModalOpen = transformation_id || tailor_to_job_modal;

    if (isHapppyAgentFaviconPath(location.pathname)) {
        return null;
    }

    return (
        <>
            {(!openSignupFlow && !isEditResumeModalOpen) && <TalentProfileDetailsModalContent isHRSignUp={isHRSignUp} />}
        </>
    )
};

const joiningMaster = [
    {
        "value": "Immediately",
        "label": "Immediately"
    },
    {
        "value": "15 Days",
        "label": "15 Days"
    },
    {
        "value": "30 Days",
        "label": "30 Days"
    },
    {
        "value": "45 Days",
        "label": "45 Days"
    },
    {
        "value": "60 Days",
        "label": "60 Days"
    },
    {
        "value": "More than 60 Days",
        "label": "More than 60 Days"
    }
]