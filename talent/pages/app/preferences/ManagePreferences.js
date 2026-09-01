import React, { useCallback, useEffect, useRef, useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select';
import { customSelectTheme, JobFunctionGroupLabel, JobFunctionSelectStyles, ReactSelectStyles } from '../../../components/common/CustomStyleReactSelect';
import { CheckboxInput, MoneyInput, RadioInput } from '../../../components/common/Inputs';
import { base64ToBlob, buildFormData, convertNpToDays, formatErrors, groupOptionsByCategory, formattedCTC, getLastWorkingDayBounds, getLastWorkingDayBoundsError, getPlaceholderLWD, isLastWorkingDayInBounds, isValidDate, sanitizePayload, scrollToFirstError, isAllEmpty, formatCTCBreakdown, formatCTCBreakdownLPA, checkDirectPayUser } from '../../../components/Helper';
import './preferences.css';
import _, { debounce } from 'lodash';
import { generateAwsUploadUrl, getJobFunctionMaster, getProfilePercent, getTalentLocationMaster, getTalentPreferences, profileResumeDownload, profileUpsert } from '../../../store/actions/UserActions';
import { useDispatch, useSelector } from 'react-redux';
import { validateNumber, validateURL } from '../../../components/profile/formValidations';
import { SET_PROFILE_DATA, SET_TALENT_PREFERENCES, UPDATE_CURRENT_USER } from '../../../store/actions/actionsTypes';
import Loader from '../../../components/Loader';
import toast from 'react-hot-toast';
import { savePreferencesCtaTrack, skipPreferencesModalTrack, resumeReplacedInProfileTracking, saveAndAnalyzeResumeTracking } from '../../../helpers/Mixpanel';
import { useNavigate } from '@/talent/navigation/routerCompat';
import { IMAGE_URL, JobSearchPrefMonthsOptions } from '../../../components/Constant';
import { checkIfFilePasswordProtected } from '@/talent/components/Helper';
import { CheckedRoundedIcon, MenuDots, MenuResumeDownload, MenuResumeUpload } from '../../../assets/IconSVG';
import { format } from 'date-fns';
import { Clock, EyeIconPreview } from '@/talent/assets/IconSVG';
import ExperienceInput from '../../../components/common/ExperienceInput';
import ResumeModal from './ResumeModal';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover'
import CTCBreakdown from '../../../components/common/CTCBreakdown';
import { PREFERRED_WORK_OF_MODE_OPTIONS } from '../../../components/Constant';

const internationMaster = [{ label: "Yes", value: "Yes" }, { label: "No", value: "No" }];

const fileRegex = /(\.pdf|\.docx)$/i;

export default function ManagePreferences({
    isModalOpen,
    lastPreferenceUpdate,
    setIsModalOpen,
    setIsModalLoading,
    successCallback = () => { },
    applyAggregator = false,
    disableSkip = false,
    /** When true (e.g. Outreach / Job Agent configure), never show Save & Analyze — modal is always used there. */
    hideSaveAnalyzeResumeButton = false,
    saveRedirectPath = '/talent/all-opportunities',
}) {
    const { resumeHealthControl } = useSelector(state => state.resume);
    const suppressSaveAnalyzeResumeCta = Boolean(isModalOpen || hideSaveAnalyzeResumeButton);
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { isLoading } = useSelector(state => state.loader)
    const { user } = useSelector(state => state.auth)
    const isDirectPayUser = checkDirectPayUser(user);
    const [masters, setMasters] = useState({})
    const [preferenceMaster, setPreferenceMaster] = useState([])
    const [jobFunctionOptions, setJobFunctionOptions] = useState([])
    const [selectedJobFunction, setSelectedJobFunction] = useState(null)
    const [selectedJSTillDate, setSelectedJSTillDate] = useState(null)
    const [formData, setFormData] = useState({
        linkedin_id: '',
        joining_period: {},
        current_ctc: "",
        expected_ctc: "",
        preferred_method: [],
        preferred_cities: [],
        resume: '',
        total_experience: "",
        job_function_id: null,
        ctc_breakdown: null,
        job_search_preference: [],
        job_search_unavailable_until: [],
    })
    const [profileData, setProfileData] = useState({
        linkedin_id: '',
        joining_period: {},
        current_ctc: "",
        expected_ctc: "",
        preferred_method: [],
        preferred_cities: [],
        resume: '',
        total_experience: "",
        job_search_preference: [],
        job_search_unavailable_until: [],
    })
    const [selectedResume, setSelectedResume] = useState(null)
    const [isResumeModalOpen, setIsResumeModalOpen] = useState(false)
    const preferencesData = useSelector(state => state?.profile?.preferences)
    const { jobFunctionMaster } = useSelector(state => state.profile)

    const validate = () => {
        let isValid = true;
        let newErrors = {}

        if (!formData.resume) {
            isValid = false;
            newErrors.resume = "Please upload your resume\nDOCx, PDF | Max: 2 MB";
        }
        else {
            if (!fileRegex.exec(formData.resume)) {
                isValid = false;
                newErrors.resume =
                    "The resume must be a file of type: pdf, docx.";
            } else if (resumeData && (resumeData.size / 1024 > 2048)) {
                isValid = false;
                newErrors.resume = "File size should be less than 2 MB";
            }
        }

        let totalExp = (formData.total_experience + '').replaceAll(" ", "")

        if (totalExp == "") {
            isValid = false;
            newErrors.total_experience = "Please add your work experience";
        } else if (!totalExp.match(/^(?:[0-9]\d*(?:\.\d{1,2})?|0(?:\.\d{1,2}))$/g)) {
            isValid = false;
            newErrors.total_experience = "Invalid input. Please enter numerical values only in the format of 2, 3.6, 4.11 etc.";
        }

        if (!formData.joining_period) {
            isValid = false;
            newErrors.joining_period = "Please select your notice period"
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
        if (formData.joining_period) {
            if (convertNpToDays(formData.joining_period) != 0 &&
                !["Yes", "No"].includes(formData.serving_notice_period)) {
                isValid = false;
                newErrors.serving_notice_period = "Please select your answer";
            }
            if ((convertNpToDays(formData.joining_period) == 0 ||
                formData.serving_notice_period == "Yes") &&
                !formData.last_working_day
            ) {
                isValid = false;
                newErrors.last_working_day = "Please add your last working day";
            } else if ((convertNpToDays(formData.joining_period) == 0 ||
                formData.serving_notice_period == "Yes") &&
                formData.last_working_day &&
                !isLastWorkingDayInBounds(
                    formData.last_working_day,
                    formData.joining_period,
                    formData.serving_notice_period
                )
            ) {
                isValid = false;
                newErrors.last_working_day = getLastWorkingDayBoundsError(
                    formData.joining_period,
                    formData.serving_notice_period
                );
            }
        }
        if (!formData.current_ctc && formData.current_ctc !== 0) {
            isValid = false;
            newErrors.current_ctc = "Current pay is a required field"
        } else if (formData.current_ctc === 0 && totalExp > 0) {
            isValid = false;
            newErrors.current_ctc = "Your current salary cannot be 0, please mention the last drawn salary/current salary";
        } else if (formData.current_ctc > 0 && formData.current_ctc <= 1) {
            isValid = false;
            newErrors.current_ctc = "Current Annual Salary must be greater than 1 lac"
        } else if (formData.current_ctc >= 500) {
            isValid = false;
            newErrors.current_ctc = "Current Annual Salary must be less than 5 cr"
        }
        if (!formData.expected_ctc) {
            isValid = false;
            newErrors.expected_ctc = "Expected pay is a required field"
        } else if (formData.expected_ctc <= 1) {
            isValid = false;
            newErrors.expected_ctc = "Expected Annual Salary must be greater than 1 lac"
        } else if (formData.expected_ctc >= 500) {
            isValid = false;
            newErrors.expected_ctc = "Expected Annual Salary must be less than 5 cr"
        }

        if (!formData.current_location) {
            isValid = false;
            newErrors.current_location = "Please select your current location";
        }
        // if (!formData.availability) {
        //     isValid = false;
        //     newErrors.availability = "Please select your availability"
        // }

        if (!formData.preferred_method.length) {
            isValid = false;
            newErrors.preferred_method = "Please select atleast one method"
        }
        if (!formData.preferred_cities || formData.preferred_cities?.length == 0) {
            isValid = false;
            newErrors.preferred_cities = "Please enter your preferred work city"
        }
        if (!selectedJSTillDate?.length && formData.job_search_preference?.[0]?.value == 2 && !formData.job_search_unavailable_until) {
            isValid = false;
            newErrors.job_search_preference = "Please select how long are you unavailable"
        }
        // if (!formData.job_search_preference.length) {
        //     isValid = false;
        //     newErrors.job_search_preference = "Please select your job search preference"
        // }
        if (!formData.job_function_id) {
            isValid = false;
            newErrors.job_function_id = "Please select job function"
        }
        if (formData.ctc_breakdown) {
            if (isAllEmpty(formData.ctc_breakdown, ["ctc_type"])) delete formData.ctc_breakdown;
        }

        setErrors(newErrors)
        setTimeout(() => {
            scrollToFirstError();
        }, 0);
        return isValid;
    }

    // const [emailForm, setEmailForm] = useState([])
    const [modalDataLoading, setModalDataLoading] = useState(true)


    const fetchJobFunctionMaster = async (jobFunction) => {
        let masterData = jobFunctionMaster;

        if (!masterData || masterData.length === 0) {
            const res = await getJobFunctionMaster()(dispatch);
            masterData = res?.data || [];
        }

        const options = groupOptionsByCategory(masterData);
        setJobFunctionOptions(options);
        const selectedJobFunction = (() => {
            const match = masterData.find(({ value }) => value === jobFunction);
            return match ? { label: match.label, value: match.value } : null;
        })();
        setSelectedJobFunction(selectedJobFunction);
    };

    useEffect(() => {

        if (Object.keys(preferencesData).length > 0 && !sessionStorage.getItem("fetchLatestResume")) {
            let _preferredMethodMaster = preferencesData?.masters?.preferredMethodMaster
            if (!_preferredMethodMaster?.find(item => item.value == "None")) {
                _preferredMethodMaster.push({ label: "None", value: "None" });
            }
            setMasters({ ...preferencesData?.masters, preferredMethodMaster: _preferredMethodMaster })
            let preferred_method = preferencesData?.talent?.preferred_method;
            const jobSearchPrefValue = preferencesData?.talent?.job_search_preference;
            const jobSearchPreferenceMaster = preferencesData?.masters?.jobSearchPreferenceMaster || [];
            const jobSearchPreference = jobSearchPrefValue
                ? [jobSearchPreferenceMaster.find(item => item.value == jobSearchPrefValue)].filter(Boolean)
                : [];

            const formattedData = {
                ...preferencesData?.talent,
                total_experience: preferencesData?.talent?.total_experience || "",
                current_ctc: formattedCTC(preferencesData?.talent?.current_ctc),
                expected_ctc: formattedCTC(preferencesData?.talent?.expected_ctc),
                ...(preferencesData?.talent?.ctc_breakdown && { ctc_breakdown: formatCTCBreakdownLPA(preferencesData?.talent?.ctc_breakdown) }),
                preferred_method:
                    preferred_method ?
                        preferred_method.map(({ preferred_method }) =>
                            preferencesData?.masters.preferredMethodMaster?.find(i => i.value == preferred_method))
                        :
                        [],
                job_search_preference: jobSearchPreference,
                preferred_modes: preferencesData?.talent?.preferred_modes?.map(item => PREFERRED_WORK_OF_MODE_OPTIONS.find(option => option.value == item)) || [],
            }
            setFormData(formattedData);
            fetchJobFunctionMaster(formattedData.job_function_id)

            if (isModalOpen) {
                setProfileData(formattedData);
            }
            console.log('preferencesData?.resume', preferencesData?.resume);

            setSelectedResume(preferencesData?.resume)
            setModalDataLoading(false);
        }
        else {
            sessionStorage.removeItem("fetchLatestResume")
            getTalentPreferences()(dispatch)
                .then(res => {
                    let _preferredMethodMaster = res.data?.masters.preferredMethodMaster;
                    _preferredMethodMaster.push({ label: "None", value: "None" })
                    setMasters({ ...res.data?.masters, preferredMethodMaster: _preferredMethodMaster })
                    let preferred_method = res.data?.talent.preferred_method;
                    let jobSearchPrefValue = res.data?.talent.job_search_preference;
                    const jobSearchPreferenceMaster = res.data?.masters?.jobSearchPreferenceMaster || [];
                    const jobSearchPreference = jobSearchPrefValue
                        ? [jobSearchPreferenceMaster.find(item => item.value == jobSearchPrefValue)].filter(Boolean)
                        : [];
                    const formattedData = {
                        ...res.data?.talent,
                        total_experience: res.data?.talent?.total_experience || "",
                        current_ctc: formattedCTC(res.data?.talent.current_ctc),
                        expected_ctc: formattedCTC(res.data?.talent.expected_ctc),
                        ...(res.data?.talent?.ctc_breakdown && { ctc_breakdown: formatCTCBreakdownLPA(res.data?.talent?.ctc_breakdown) }),
                        preferred_method:
                            preferred_method ?
                                preferred_method.map(({ preferred_method }) =>
                                    res.data?.masters.preferredMethodMaster?.find(i => i.value == preferred_method))
                                :
                                [],
                        job_search_preference: jobSearchPreference,
                        preferred_modes: res.data?.talent?.preferred_modes?.map(item => PREFERRED_WORK_OF_MODE_OPTIONS.find(option => option.value == item)) || [],
                    }
                    setFormData(formattedData);
                    fetchJobFunctionMaster(formattedData.job_function_id)

                    if (isModalOpen) {
                        setProfileData(formattedData);
                    }
                    console.log('setSelectedResume', res.data?.resume);
                    setSelectedResume(res.data?.resume)

                    setModalDataLoading(false);
                })
        }

    }, [])

    useEffect(() => {
        let formPreferredMethod = formData.preferred_method?.filter(filterItem => filterItem.value != "None").map(item => item.value)
        setPreferenceMaster({
            ...preferenceMaster,
            preferred_method: masters.preferredMethodMaster?.filter((item) => !formPreferredMethod?.includes(item.value)),
        })
    }, [formData.preferred_method])


    const [errors, setErrors] = useState({});
    const clearInvalidLastWorkingDay = (data) => {
        if (
            data.last_working_day &&
            !isLastWorkingDayInBounds(data.last_working_day, data.joining_period, data.serving_notice_period)
        ) {
            data.last_working_day = '';
        }
        return data;
    };

    const handleInputChange = (field, value) => {
        let newData = { ...formData };
        newData[field] = value;
        if (field == 'joining_period') {
            newData = clearInvalidLastWorkingDay(newData);
        }
        setFormData(newData);
        let newErrors = {
            [field]: null
        }
        if (field == 'joining_period') {
            if (value == "Immediately") newErrors['serving_notice_period'] = null
            else newErrors['last_working_day'] = null
        }
        setErrors({ ...errors, ...newErrors });
    }

    const handleMultiSelectChange = (field, val) => {
        let _formData = { ...formData };
        _formData[field] = val;
        setFormData(_formData);
        updateErrors({ [field]: null })
    }
    const handleDropdownChange = (field, val) => {
        let _formData = { ...formData };
        if (field == 'last_working_day') {
            _formData[field] = format(val, 'yyyy-MM-dd');
        } else {
            _formData[field] = val;
        }
        if (field == 'serving_notice_period') {
            _formData = clearInvalidLastWorkingDay(_formData);
        }
        setFormData(_formData);
        updateErrors({ [field]: null })
    }
    const updateErrors = (newErrorObj) => {
        let oldErrors = { ...errors };
        delete oldErrors['server-err'];
        setErrors({ ...oldErrors, ...newErrorObj });
    }

    const [searchLoading, setSearchLoading] = useState(null);
    const [currentCityOptions, setCurrentCityOption] = useState([]);
    let lastCurrentCityInputValue = '';
    const fetchCurrentCityMaster = debounce(async (inputVal, inputField) => {
        let inputValue = inputVal.trim();
        if (inputValue.length >= 3) {
            try {
                setSearchLoading(inputField);
                if (inputValue !== lastCurrentCityInputValue) {
                    const res = await getTalentLocationMaster(inputValue, true);
                    if (res?.status === 200) {
                        let newArr = []
                        if (res.data?.data) {
                            res.data.data.map((disctrictItem) => {
                                newArr.push({
                                    label: disctrictItem.district,
                                    value: disctrictItem.id,
                                })
                            })
                        }
                        setCurrentCityOption(newArr);
                    }
                    lastCurrentCityInputValue = inputValue;
                }
            } catch (err) {
                console.log(err);
                toast.error(err.response.data.message || "Something went wrong while searching your location!", { duration: 5000 })
            } finally {
                setSearchLoading(null);
            }
        } else {
            setCurrentCityOption([])
        }
    }, 1000);

    const handleInputLocationChange = (inputVal, locationType) => {
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
            const newSource = axios.CancelToken.source();
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


    const handleMultipleSelect = (field, preference, value) => {
        let newData = { ...formData }
        let newArray = [...newData[field]]

        if (preference == 0) {
            let alreadyIndex = newArray.findIndex(item => item.value == value.value)
            if (alreadyIndex != -1) {
                newArray[alreadyIndex] = { label: "None", value: "None" }
            }
        }

        newArray[preference] = value
        newData[field] = newArray
        setFormData(newData);
        setErrors({ ...errors, [field]: null })
    }

    const [saveLoader, setSaveLoader] = useState(false)

    const handleSubmit = async (e, saveAndAnalyzeResume = false) => {
        e.preventDefault()

        // console.log('formData', { ...formData, snooze: emailForm }, new Date());
        if (!validate()) return

        let resumeFileId = null;
        setSaveLoader(true);
        if(uploadResumeRef.current) {
            resumeFileId = await uploadResumeRef.current;
        }

        // let reqMap = { ...formData, snooze: emailForm }
        let reqMap = { ...formData }
        let filteredMethod = formData.preferred_method.filter((item) => item.value != "None")
        reqMap.preferred_method = filteredMethod.map(i => i.value);
        reqMap.preferred_cities = formData.preferred_cities.map(item => item.value);
        reqMap.current_ctc = Math.round(reqMap.current_ctc * 100000);
        reqMap.expected_ctc = Math.round(reqMap.expected_ctc * 100000);
        delete reqMap.talent_top_skills;
        delete reqMap.interested_job_functions;
        delete reqMap.target_company_types;
        delete reqMap.user_journey_status;

        if (resumeData) {
            reqMap.resume = resumeData;
        }
        if(resumeFileId) {
            reqMap.resume_file_id = resumeFileId;
        }
        if (formData?.preferred_modes?.length > 0) {
            reqMap.preferred_modes = formData.preferred_modes.map(item => item.value);
        }
        if (formData?.job_search_preference?.[0]?.value) {
            reqMap.job_search_preference = formData.job_search_preference[0]?.value;
            reqMap.job_search_unavailable_until = null;
        }
        if (formData?.job_search_preference?.[0]?.value == 2 && !formData.job_search_unavailable_until) {
            reqMap.job_search_unavailable_until = selectedJSTillDate[0]?.value;
        }

        var payload = {}; var obj = {}
        for (let [k, value] of Object.entries(reqMap)) {
            obj[k] = sanitizePayload(k, value);
        }
        if (obj?.job_function_id) {
            delete obj.job_function_id
            obj['job_function'] = selectedJobFunction?.value
        }
        if (obj?.ctc_breakdown) {
            obj.ctc_breakdown = formatCTCBreakdown(obj.ctc_breakdown)
        }

        payload["field"] = "preferences";
        payload["value"] = obj;
        if (isModalOpen) {
            payload["save_source"] = "Preferences Modal";
        } else {
            payload["save_source"] = "Profile Page";
        }

        const data = {
            ...obj,
            job_function_id: selectedJobFunction?.value,
            job_function: selectedJobFunction?.label,
            preferred_cities: formData.preferred_cities,
            ...(formData.preferred_modes?.length > 0 && { preferred_modes: formData.preferred_modes })
        }
        savePreferencesCtaTrack(data, isModalOpen ? 'update_preferences_modal' : 'manage_preferences_page', 'save_preferences_cta');
        if (saveAndAnalyzeResume) {
            saveAndAnalyzeResumeTracking(isModalOpen ? 'preferences_modal' : 'preferences_page');
        }
        let payloadFormData = new FormData();
        for (let [key, data] of Object.entries(payload)) {
            payloadFormData = buildFormData(payloadFormData, data, key);
        }

        setSaveLoader(true)
        if (isModalOpen) {
            setIsModalLoading(true)
        }
        profileUpsert(payloadFormData, true)(dispatch)
            .then((res) => {
                dispatch({
                    type: SET_PROFILE_DATA,
                    payload: {
                        ...res.data.data,
                        preferred_cities: formData.preferred_cities,
                        preferred_method: res.data.data.preferred_method.map(i => { return { preferred_method: i } }),
                    },
                })
                dispatch({
                    type: UPDATE_CURRENT_USER, payload: {
                        last_preference_at: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
                        job_search_preference: res?.data?.data?.job_search_preference,
                        job_search_unavailable_until: res?.data?.data?.job_search_unavailable_until,
                    }
                })
                toast.success("Preferences Updated Successfully", { duration: 3800 })
                if (resumeData) {
                    sessionStorage.setItem("fetchLatestResume", true)
                }
                let formattedResponse = {
                    ...formData,
                    current_ctc: String(reqMap.current_ctc),
                    expected_ctc: String(reqMap.expected_ctc),
                    preferred_method: filteredMethod.map(method => ({
                        preferred_method: method.value
                    })),
                    preferred_cities: formData.preferred_cities,
                    job_function_id: selectedJobFunction?.value,
                    job_search_preference: res?.data?.data?.job_search_preference,
                    job_search_unavailable_until: res?.data?.data?.job_search_unavailable_until,
                    ...(formData.ctc_breakdown && { ctc_breakdown: formatCTCBreakdown(formData.ctc_breakdown) }),
                    ...(formData.preferred_modes?.length > 0 && { preferred_modes: formData.preferred_modes.map(item => item.value) })
                };

                dispatch({
                    type: SET_TALENT_PREFERENCES,
                    payload: {
                        ...preferencesData,
                        talent: formattedResponse,
                        masters: masters,
                        resume: selectedResume
                    }
                });
                if (isModalOpen) {
                    setIsModalOpen(false)
                    successCallback()
                }

                getProfilePercent()(dispatch).then(() => {
                    if (saveAndAnalyzeResume) {
                        navigate("/talent/resume-health-check/new");
                        return;
                    }
                    !isModalOpen && navigate(saveRedirectPath);
                })
            })
            .catch(err => {
                if (err.response && err.response.status && err.response.status == 422) {
                    setErrors(formatErrors(err.response.data.errors).value)
                } else {
                    toast.error("Something went wrong!", { duration: 3000 })
                }
            })
            .finally(() => {
                setSaveLoader(false)
                if (isModalOpen) {
                    setIsModalLoading(false)
                }
            })

    }

    const uploadResumeRef = useRef(null);
    const [resumeData, setResumeData] = useState(null);
    const [resumeUploading, setResumeUploading] = useState(false);
    const [fileId, setFileId] = useState(null);

    const handleResume = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const result = await checkIfFilePasswordProtected(file);
        } catch (error) {
            toast.error(error.message || "File is password-protected please upload unprotected file", {
                duration: 3000
            });
            console.error(error.message);
            if (formData.resume) {
                document.getElementById("resumeReplace").value = ""
            } else {
                document.getElementById("resumeUpload").value = ""
            }
            return;
        }

        let _formData = { ...formData }
        _formData.resume = file.name;
        setFormData(_formData);
        let resumeError = null;
        if (!fileRegex.exec(_formData.resume)) {
            resumeError =
                "The resume must be a file of type: pdf, docx.";
        } else if (file.size / 1024 > 2048) {
            resumeError = "File size should be less than 2 MB";
        }

        setResumeUploading(true);
        const extension = file.name.split('.')?.pop()?.toLowerCase();

        const uploadResumePromise = generateAwsUploadUrl({ file_type: extension }, true)(dispatch)
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
                                setResumeData(file);
                                setSelectedResume(file);
                            }
                        })
                        .catch(err => {
                            console.error("Resume upload error:", err);
                            toast.error("Resume upload failed");
                        })
                        .finally(() => {
                            setResumeUploading(false);
                        });
                    return res?.data?.file_id
                }
            })
            .catch((err) => {
                const apiErrors = err?.response?.data?.errors;
                if (apiErrors && typeof apiErrors === "object" && apiErrors.value) {
                    const msg = Array.isArray(apiErrors.value) ? apiErrors.value[0] : apiErrors.value;
                    resumeError = typeof msg === "string" ? msg : "Failed to upload resume";
                } else {
                    resumeError = "Something went wrong. Please try again.";
                }
                toast.error("Resume upload failed");
                console.error("Resume upload error:", err);
            })
            .finally(() => {
                setResumeUploading(false);
                if (e.target) e.target.value = "";
            });

        updateErrors({ resume: resumeError })
        uploadResumeRef.current = uploadResumePromise;
        if (!resumeHealthControl.is_paid) {
            let floatingRocketHealthcheck = document.getElementById('floatingRocketHealthcheck');
            if (floatingRocketHealthcheck) {
                floatingRocketHealthcheck.style.display = 'none';
            }
            resumeReplacedInProfileTracking(isModalOpen ? 'preferences_modal' : 'preferences_page');
        }
        if (showPopover) setShowPopover(false);
    };

    const onDownloadClick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        let talent_id = user.talent_enc_id
        setSaveLoader(true)
        if (isModalOpen) {
            setIsModalLoading(true)
        }
        profileResumeDownload(talent_id, true)(dispatch)
            .then((response) => {
                let url = response?.data?.data;

                let blob = response?.data?.blob;
                const type = response?.data?.ext;
                const filename = response?.data?.filename;
                if (type === 'pdf') {
                    blob = base64ToBlob(blob, 'application/pdf');
                    blob.name = filename;
                    url = URL.createObjectURL(blob);
                }
                else if (type === 'docx') {
                    blob = base64ToBlob(blob, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                    blob.name = filename;
                    url = URL.createObjectURL(blob);
                }

                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("target", "_blank")
                link.setAttribute("download", filename);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);

                if (type === 'pdf' || type === 'docx') {
                    URL.revokeObjectURL(url);
                }
            })
            .catch(err => {
                toast.error("Something went wrong!", { duration: 3000 })
            })
            .finally(() => {
                setSaveLoader(false)
                if (isModalOpen) {
                    setIsModalLoading(false)
                }
            })
    }

    const [showPopover, setShowPopover] = useState(false);
    const popoverRef = useRef(null);

    const handleToggle = (show) => {
        setShowPopover(show);
    };

    useEffect(() => {
        const handleScroll = (event) => {
            if (showPopover) {
                setShowPopover(false);
            }
        };

        if (showPopover) {
            window.addEventListener('scroll', handleScroll, true); // Use capture phase

        }

        return () => {
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [showPopover]);

    const isMobile = window.innerWidth < 768;

    const handleSkip = () => {
        setIsModalOpen(false);
        skipPreferencesModalTrack({
            last_preference_at: user.last_preference_at,
            current_time: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        });

        const profileUpdateModalSkipped = {
            timestamp: Date.now() // Store current time in milliseconds
        };
        localStorage.setItem('profileUpdateModalSkipped', JSON.stringify(profileUpdateModalSkipped))
    }

    const lastWorkingDayBounds = getLastWorkingDayBounds(
        formData.joining_period,
        formData.serving_notice_period
    );

    return (
        <section className="containSection">
            {(isLoading) && <Loader />}
            {!isLoading && !modalDataLoading &&
                <div className={`manage-preferences ${isModalOpen ? "preferences-modal-open" : ""} ${(isMobile && !isModalOpen) ? "mobile-profile" : ""}`}>
                    {(isMobile && !isModalOpen) ?
                        <div className="mobile-profile-header">
                            <div className="rank-higher">
                                🚀 Recruiters see the most recently updated profiles first. Update yours often to rank higher.
                            </div>
                            <div className="avg-time">
                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="12" viewBox="0 0 13 12" fill="none">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M7.08847 0C4.37398 0 2.08203 1.8689 1.39298 4.40634H0.349712C0.285011 4.40673 0.221668 4.42523 0.16665 4.45982C0.111632 4.4944 0.0670714 4.54373 0.0378685 4.60237C0.00866571 4.66101 -0.00404759 4.7267 0.00112691 4.79221C0.00630141 4.85771 0.0291633 4.9205 0.0671979 4.97366L1.56285 7.05165C1.59549 7.09717 1.63827 7.13422 1.68769 7.15975C1.7371 7.18529 1.79177 7.1986 1.84721 7.1986C1.90266 7.1986 1.95732 7.18529 2.00674 7.15975C2.05616 7.13422 2.09893 7.09717 2.13157 7.05165L3.62446 4.97366C3.66254 4.92044 3.68541 4.85756 3.69054 4.79198C3.69568 4.72639 3.68289 4.66063 3.65358 4.60196C3.62426 4.54328 3.57957 4.49397 3.52441 4.45945C3.46926 4.42494 3.4058 4.40656 3.34102 4.40634H2.37808C3.03254 2.40103 4.89039 0.960223 7.08847 0.960223C9.83525 0.960223 12.0537 3.20969 12.0537 5.99953C12.0537 8.78937 9.83525 11.0398 7.08847 11.0398C5.45157 11.0398 3.92156 10.2203 2.99573 8.84926C2.92474 8.74457 2.81576 8.67274 2.69271 8.64954C2.56965 8.62634 2.44256 8.65365 2.3393 8.72548C2.28788 8.7612 2.24391 8.80689 2.20993 8.85993C2.17595 8.91296 2.15263 8.97229 2.1413 9.03451C2.12998 9.09674 2.13088 9.16061 2.14394 9.22248C2.15701 9.28435 2.18198 9.34299 2.21743 9.39502C3.31898 11.0263 5.14092 12 7.08847 12C10.3462 12 13 9.30832 13 5.99953C13 2.69075 10.3462 0 7.08847 0ZM6.76072 2.95944C6.69864 2.95969 6.63722 2.97235 6.57996 2.99671C6.52271 3.02106 6.47073 3.05663 6.42701 3.10139C6.38328 3.14615 6.34867 3.19921 6.32514 3.25756C6.30161 3.3159 6.28962 3.37838 6.28986 3.44143V6.41119C6.28981 6.48933 6.30854 6.5663 6.34442 6.63542C6.3803 6.70455 6.43224 6.76373 6.49575 6.80784L8.08649 7.9106C8.18987 7.98234 8.31704 8.00951 8.4401 7.98612C8.56317 7.96274 8.67207 7.89073 8.74292 7.78588C8.81327 7.68096 8.83984 7.55202 8.81683 7.42725C8.79382 7.30248 8.7231 7.19205 8.62013 7.1201L7.23526 6.15613V3.44143C7.23551 3.37807 7.2234 3.31528 7.19964 3.25669C7.17588 3.1981 7.14093 3.14487 7.09682 3.10006C7.0527 3.05526 7.00029 3.01976 6.94261 2.99563C6.88492 2.97149 6.82311 2.9592 6.76072 2.95944Z" fill="#376899" />
                                </svg>
                                Average time to complete: 1 min
                            </div>
                        </div>
                        :
                        <div className="heading">
                            <div className='left'>

                                {user.status >= 1 && lastPreferenceUpdate >= 3 && 
                                    <>
                                        <h2>👋 Welcome Back, {user?.name?.split(' ')[0] || 'User'}!</h2>
                                        <p>We’ve improved job matching since your last visit. Update your preferences to avoid missing relevant roles.</p>
                                    </>
                                }


                                <h2>
                                    {`${isModalOpen ?
                                        (user.status == 0) ? "Complete Your Profile Before Applying"

                                            : (user.status >= 1 ?
                                                (!user.job_function_id && lastPreferenceUpdate < 3) ?
                                                    "Help us match you with the right jobs, please select your current job function"
                                                    :
                                                    ``
                                                : "Update your profile"
                                            )
                                        :
                                        (user.status == 0) ? "Set Your Career Preferences to Get Better Matches" : "Manage your career preferences"
                                        }`}
                                </h2>
                                {isModalOpen && <span className="minute-badge"><Clock /> Average time to complete: 1 min</span>}
                            </div>
                            {/* {!isModalOpen &&
                                <div className='right'>
                                    <button className='primaryBtn CTA' onClick={handleSubmit}>
                                        Save my Preferences
                                    </button>
                                </div>
                            } */}
                        </div>
                    }
                    {saveLoader && !isModalOpen && <Loader />}

                    <form onSubmit={handleSubmit}>
                        <div className='form-group labelTop linkedin resume'>
                            <div className='labelCol'>
                                <label className='required_label'>
                                    {isModalOpen ? "Your Latest " : ""}Resume
                                </label>
                                {isValidDate(formData.resme_last_update) &&
                                    <span>Last updated on: <strong>{format(new Date(formData.resme_last_update), 'd-MMM-yy')}</strong></span>
                                }
                            </div>
                            <div className={`form-input ${!formData.resume && 'resumeUploadSection'}`}>
                                {formData.resume ?
                                    <div className={`resume-flex ${errors.resume ? 'err' : ''}`}>
                                        {formData.resume?.split('.').pop().toLowerCase() == 'pdf' ?
                                            <img src={IMAGE_URL + "file-pdf.svg"} />
                                            :
                                            formData.resume?.split('.').pop().toLowerCase() == 'docx' ?
                                                <img src={IMAGE_URL + "file-docx.svg"} /> :
                                                <img src={IMAGE_URL + "fi_file.svg"} />
                                        }
                                        <div>
                                            <span className="title">
                                                {formData.resume}
                                            </span>
                                            {resumeData?.size && <span className="size">{Number(resumeData?.size / (1024 * 1024)).toFixed(2)} MB</span>}
                                        </div>

                                        <OverlayTrigger
                                            trigger="click"
                                            key={'bottom'}
                                            placement={'bottom-end'}
                                            rootClose={true}
                                            show={showPopover}
                                            onToggle={handleToggle}
                                            overlay={
                                                <Popover id={`popover-positioned-bottom`} className='resume-menu-options' ref={popoverRef}>
                                                    {!resumeData && <>
                                                        <button onClick={() => { setIsResumeModalOpen(true); handleToggle(false); }} className='viewBtn'>
                                                            <EyeIconPreview width={'1.5rem'} height={'1.5rem'} /> View resume
                                                        </button>
                                                        <button onClick={(e) => { onDownloadClick(e); handleToggle(false); }}>
                                                            <MenuResumeDownload /> Download resume
                                                        </button>
                                                    </>}
                                                    <button className={`uploadBtn ${resumeData ? 'replace' : ''}`}>
                                                        <MenuResumeUpload /> {resumeData ? 'Replace' : 'Upload new'} resume
                                                        <p className='comment mt-0'>PDF, DOCX | Max: 2 MB</p>
                                                        <input
                                                            id="resumeUpload"
                                                            name="resume"
                                                            type="file"
                                                            accept='.docx,.pdf'
                                                            onChange={handleResume}
                                                        />
                                                    </button>
                                                </Popover>
                                            }
                                        >
                                            <button
                                                type='button'
                                                className="menuBtn"
                                                title="Resume Menu"
                                            >
                                                <MenuDots />
                                            </button>
                                        </OverlayTrigger>


                                        {/* {resumeData && !errors.resume && <CheckedRoundedIcon color={"#439494"} />} */}
                                    </div>

                                    :
                                    <div className="resume-btn">
                                        <div className="filewrap">
                                            <input
                                                id="resumeUpload"
                                                name="resume"
                                                type="file"
                                                accept='.docx,.pdf'
                                                onChange={handleResume}
                                                data-hj-allow
                                            />
                                            <label htmlFor="resumeUpload">
                                                Upload Resume
                                            </label>
                                        </div>
                                        <span className="comment mt-0">
                                            PDF, DOCX | Max: 2 MB
                                        </span>
                                    </div>
                                }
                                {errors.resume && <div className='error-msg'>{errors.resume}</div>}
                            </div>
                        </div>

                        <div className='form-group linkedin'>
                            <label className='required_label'>LinkedIn Profile</label>
                            <div className='form-input'>
                                <input
                                    type={"text"}
                                    placeholder="Add your linkedin profile url"
                                    name="linkedin_id"
                                    value={formData.linkedin_id}
                                    onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                                    data-hj-allow
                                />
                                {errors.linkedin_id && (
                                    <div className="error-msg">{errors.linkedin_id}</div>
                                )}
                            </div>
                        </div>

                        <div className='form-group yoe'>
                            <label className='required_label'>Years of Experience</label>
                            <div className='form-input'>
                                <ExperienceInput
                                    value={formData.total_experience}
                                    onChange={(val) => handleInputChange("total_experience", val)}
                                />
                                {errors.total_experience && <div className='error-msg'>{errors.total_experience}</div>}
                            </div>
                        </div>

                        <div className='form-group job-function'>
                            <label className='required_label'>Current Job Function</label>
                            <div className='form-input'>
                                <Select
                                    theme={customSelectTheme}
                                    options={jobFunctionOptions}
                                    inputId="job_function_id"
                                    placeholder={"Select Current Job Function"}
                                    value={selectedJobFunction}
                                    onChange={(val) => {
                                        setSelectedJobFunction(val)
                                        handleInputChange('job_function_id', val.value)
                                    }}
                                    name="job_function_id"
                                    isSearchable={true}
                                    classNamePrefix="react-select"
                                    styles={JobFunctionSelectStyles}
                                    formatGroupLabel={JobFunctionGroupLabel}
                                />
                                {errors.job_function_id && <div className='error-msg'>{errors.job_function_id}</div>}
                            </div>
                        </div>

                        <div className='form-group labelTop'>
                            <label className='required_label'>Notice Period</label>
                            <div className='form-input'>
                                <Select
                                    theme={customSelectTheme}
                                    options={masters.joiningMaster}
                                    inputId="joining_period"
                                    value={masters.joiningMaster?.find(i => i.value == formData.joining_period)}
                                    onChange={(val) => handleInputChange('joining_period', val.value)}
                                    name="joining_period"
                                    isSearchable={false}
                                    classNamePrefix="react-select"
                                    styles={ReactSelectStyles}
                                />
                                {errors.joining_period && <div className='error-msg'>{errors.joining_period}</div>}

                                <div className="joiningExtraQs">
                                    {convertNpToDays(formData.joining_period) != 0 &&
                                        <div className="serving-np" id="serving_notice_period">
                                            <span className="required_label">Are you currently serving notice period?</span>
                                            <div className='form-input'>
                                                <div className="radioFlex">
                                                    <RadioInput
                                                        name={"serving_notice_period_yes"}
                                                        label={'Yes'}
                                                        // id="serving_notice_period_yes"
                                                        checked={formData.serving_notice_period == "Yes"}
                                                        onChange={(e) => handleDropdownChange('serving_notice_period', 'Yes')}
                                                    />
                                                    <RadioInput
                                                        name={"serving_notice_period_no"}
                                                        label={'No'}
                                                        // id="serving_notice_period_no"
                                                        checked={formData.serving_notice_period == "No"}
                                                        onChange={(e) => handleDropdownChange('serving_notice_period', 'No')}
                                                    />

                                                </div>
                                                {errors.serving_notice_period && <div className="error-msg serveNp">{errors.serving_notice_period}</div>}
                                            </div>
                                        </div>
                                    }
                                    {(convertNpToDays(formData.joining_period) == 0 ||
                                        formData.serving_notice_period == "Yes") &&
                                        <div>
                                            <div className="lwd" id='last_working_day'>
                                                <span className="required_label">Let us know your last working day</span>
                                                <DatePicker
                                                    selected={isValidDate(formData.last_working_day) ?
                                                        new Date(formData.last_working_day) : null
                                                    }
                                                    onChange={(val) => handleDropdownChange("last_working_day", val)}
                                                    dateFormat="dd/MM/yyyy"
                                                    wrapperClassName="date-wrapper"
                                                    className="date-input"
                                                    calendarClassName="date-calendar"
                                                    popperClassName="calendar-container"
                                                    placeholderText={"Ex: " + getPlaceholderLWD()}
                                                    minDate={lastWorkingDayBounds.minDate}
                                                    maxDate={lastWorkingDayBounds.maxDate}
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
                                            {errors.last_working_day && <div className="error-msg serveNp">{errors.last_working_day}</div>}
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>

                        <div className='form-group labelTop'>
                            <label className='required_label'>Current Salary (Annually)</label>
                            <div className='form-input relative'>
                                <MoneyInput type={"text"}
                                    placeholder="6.6"
                                    name="current_ctc"
                                    id="current_ctc"
                                    value={formData.current_ctc}
                                    onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                                />
                                {errors.current_ctc && <div className='error-msg'>{errors.current_ctc}</div>}
                                <CTCBreakdown ctcBreakdown={formData.ctc_breakdown} handleInputChange={handleInputChange} style="preferences-ctc-breakdown" />
                            </div>
                        </div>
                        <div className='form-group'>
                            <label className='required_label'>Expected Salary (Annually)</label>
                            <div className='form-input'>
                                <MoneyInput type={"text"}
                                    placeholder="6.6"
                                    name="expected_ctc"
                                    id="expected_ctc"
                                    value={formData.expected_ctc}
                                    onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                                />
                                {errors.expected_ctc && <div className='error-msg'>{errors.expected_ctc}</div>}
                            </div>
                        </div>

                        <div className='form-group'>
                            <label className='required_label'>Current location</label>
                            <div className='form-input'>
                                <Select
                                    theme={customSelectTheme}
                                    classNamePrefix="react-select"
                                    placeholder="Search location"
                                    isClearable={false}
                                    isSearchable={true}
                                    styles={ReactSelectStyles}
                                    options={currentCityOptions}
                                    name="current_location"
                                    inputId="current_location"
                                    onInputChange={(inputValue) => handleInputLocationChange(inputValue, 'current_location')}
                                    onChange={(val) => handleDropdownChange('current_location', val)}
                                    isLoading={searchLoading == "current_location"}
                                    value={formData.current_location}
                                    filterOption={() => true}
                                    menuPlacement="auto"
                                    noOptionsMessage={({ inputValue }) => {
                                        if (inputValue) return "No city found"
                                        return "Please type your city name";
                                    }}
                                />
                                {errors.current_location && <div className='error-msg'>{errors.current_location}</div>}
                            </div>
                        </div>
                        <div className='form-group flex-wrap'>
                            <label className='required_label'>Preferred location</label>
                            <div className='form-input'>
                                <Select
                                    theme={customSelectTheme}
                                    classNamePrefix="react-select"
                                    placeholder="Search location"
                                    isClearable={false}
                                    isSearchable={true}
                                    styles={ReactSelectStyles}
                                    options={currentCityOptions}
                                    isMulti
                                    name="preferred_cities"
                                    inputId="preferred_cities"
                                    onInputChange={(inputValue) => handleInputLocationChange(inputValue, 'preferred_cities')}
                                    onChange={(val) => handleMultiSelectChange('preferred_cities', val)}
                                    isLoading={searchLoading == "preferred_cities"}
                                    value={formData.preferred_cities}
                                    filterOption={() => true}
                                    menuPlacement="auto"
                                    noOptionsMessage={({ inputValue }) => {
                                        if (inputValue) return "No city found"
                                        return "Please type your city name";
                                    }}
                                />
                                {errors.preferred_cities && <div className='error-msg'>{errors.preferred_cities}</div>}
                            </div>
                        </div>



                        {/* <div className='form-group'>
                        <label className='required_label'>How would you like to get associated with {process.env.NEXT_PUBLIC_APP_NAME}?</label>
                        <div className='form-input'>
                            <Select
                                theme={customSelectTheme}
                                options={masters.availabilityMaster}
                                value={masters.availabilityMaster?.find(i => i.value == formData.availability)}
                                name="availability"
                                inputId='availability'
                                onChange={(val) => handleInputChange('availability', val.value)}
                                isSearchable={false}
                                classNamePrefix="react-select"
                                styles={ReactSelectStyles}
                            />
                            {errors.availability && <div className='error-msg'>{errors.availability}</div>}
                        </div>
                    </div> */}

                        <div className='form-group flex-wrap'>
                            <label className='required_label'>Preferred method of working</label>
                            <div className='form-input'>
                                <Select
                                    theme={customSelectTheme}
                                    placeholder="Preference"
                                    name="preferred_method"
                                    options={masters.preferredMethodMaster}
                                    filterOption={(val) => val.value != "None"}
                                    inputId='preferred_method'
                                    value={formData.preferred_method?.[0]}
                                    onChange={(val) => handleMultipleSelect('preferred_method', 0, val)}
                                    isSearchable={false}
                                    classNamePrefix="react-select"
                                    styles={ReactSelectStyles}
                                />
                                {errors.preferred_method && <div className='error-msg'>{errors.preferred_method}</div>}
                            </div>
                        </div>

                        <div className='form-group flex-wrap job-search-preference'>
                            <label className=''>Job Search Preference</label>
                            <div className='form-input'>
                                <Select
                                    theme={customSelectTheme}
                                    placeholder="Job Search Preference"
                                    name="job_search_preference"
                                    options={masters.jobSearchPreferenceMaster}
                                    filterOption={(val) => val.value != "None"}
                                    inputId='job_search_preference'
                                    value={formData.job_search_preference?.[0]}
                                    onChange={(val) => handleMultipleSelect('job_search_preference', 0, val)}
                                    isSearchable={false}
                                    classNamePrefix="react-select"
                                    styles={ReactSelectStyles}
                                />
                                {(formData?.job_search_unavailable_until && formData.job_search_preference?.[0]?.value == 2) && <span className='available-in-text'>{`(Available after ${formData?.job_search_unavailable_until})`}</span>}
                                {(formData.job_search_preference?.[0]?.value == 2 && !formData.job_search_unavailable_until) &&
                                    <div className='js-preference-untill'>
                                        <span className='js-date-label required_label'>How long are you unavailable until?</span>
                                        <Select
                                            options={JobSearchPrefMonthsOptions}
                                            value={selectedJSTillDate}
                                            onChange={(val) => setSelectedJSTillDate([val])}
                                            menuPlacement='top'
                                            styles={ReactSelectStyles}
                                            theme={customSelectTheme}
                                            classNamePrefix='react-select'
                                        />
                                    </div>
                                }
                                {errors.job_search_preference && <div className='error-msg'>{errors.job_search_preference}</div>}
                            </div>
                        </div>

                        <div className='form-group flex-wrap'>
                            <label className=''>Preferred Mode of work</label>
                            <div className='form-input'>
                                <Select
                                    theme={customSelectTheme}
                                    classNamePrefix="react-select"
                                    placeholder="Select Mode of work"
                                    isClearable={false}
                                    isSearchable={true}
                                    styles={ReactSelectStyles}
                                    options={PREFERRED_WORK_OF_MODE_OPTIONS}
                                    isMulti
                                    name="preferred_modes"
                                    inputId="preferred_modes"
                                    onChange={(val) => handleMultiSelectChange('preferred_modes', val)}
                                    isLoading={false}
                                    value={formData.preferred_modes}
                                    filterOption={() => true}
                                    menuPlacement="auto"
                                />
                                {errors.preferred_modes && <div className='error-msg'>{errors.preferred_modes}</div>}
                            </div>
                        </div>

                        {/* <div className='form-group preferMethodWork'>
                            <div className='labelCol'>
                                <label className='required_label'>Preferred method of working</label>
                                <span>Hybrid, In-office are based in India</span>
                            </div>
                            <div className='form-input'>
                                <div className='preferredMethod'>
                                    <div>
                                        <span className='subLabel'>Preference 1</span>
                                        <Select
                                            theme={customSelectTheme}
                                            placeholder="Preference 1"
                                            name="preferred_method"
                                            options={masters.preferredMethodMaster}
                                            filterOption={(val) => val.value != "None"}
                                            inputId='preferred_method'
                                            value={formData.preferred_method?.[0]}
                                            onChange={(val) => handleMultipleSelect('preferred_method', 0, val)}
                                            isSearchable={false}
                                            classNamePrefix="react-select"
                                            styles={ReactSelectStyles}
                                        />
                                    </div>
                                    <div>
                                        <span className='subLabel'>Preference 2</span>
                                        <Select
                                            theme={customSelectTheme}
                                            placeholder="Preference 2"
                                            name="preferred_method"
                                            options={preferenceMaster.preferred_method}
                                            value={formData.preferred_method?.[1]}
                                            onChange={(val) => handleMultipleSelect('preferred_method', 1, val)}
                                            isSearchable={false}
                                            classNamePrefix="react-select"
                                            styles={ReactSelectStyles}
                                            isDisabled={!formData.preferred_method?.[0]}
                                        />
                                    </div>
                                    <div>
                                        <span className='subLabel'>Preference 3</span>
                                        <Select
                                            theme={customSelectTheme}
                                            placeholder="Preference 3"
                                            name="preferred_method"
                                            options={preferenceMaster.preferred_method}
                                            value={formData.preferred_method?.[2]}
                                            onChange={(val) => handleMultipleSelect('preferred_method', 2, val)}
                                            isSearchable={false}
                                            classNamePrefix="react-select"
                                            styles={ReactSelectStyles}
                                            isDisabled={!formData.preferred_method?.[1]}
                                        />
                                    </div>
                                </div>
                                {errors.preferred_method && <div className='error-msg'>{errors.preferred_method}</div>}
                            </div>
                        </div> */}
                        {isMobile ?
                            <>
                                <div className='bottomAction'>
                                    {isModalOpen && !applyAggregator && !disableSkip && <button type='button' className='outlinedBtn' onClick={handleSkip}>Skip</button>}
                                    <button type='submit' className='primaryBtn CTA'>
                                        Update Profile
                                    </button>
                                    {resumeData && !resumeHealthControl.is_paid && !suppressSaveAnalyzeResumeCta && (
                                        <button type='button' className='primaryBtn gradientBtn' onClick={e => handleSubmit(e, true)}>
                                            {isDirectPayUser ? 'Save & Boost My Resume' : 'Save & Analyze My Resume'}
                                        </button>
                                    )}
                                    {!isModalOpen && user.last_preference_at && isValidDate(user.last_preference_at) &&
                                        <span>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="11" viewBox="0 0 13 11" fill="none">
                                                <path fill-rule="evenodd" clip-rule="evenodd" d="M6.79983 0C4.27254 0 2.13865 1.71315 1.49711 4.03915H0.525791C0.465552 4.0395 0.406577 4.05646 0.355353 4.08817C0.304129 4.11987 0.262641 4.16508 0.235452 4.21884C0.208263 4.2726 0.196427 4.33281 0.201245 4.39286C0.206062 4.4529 0.227347 4.51046 0.262759 4.55919L1.65527 6.46401C1.68566 6.50574 1.72549 6.5397 1.7715 6.56311C1.81751 6.58652 1.8684 6.59872 1.92002 6.59872C1.97165 6.59872 2.02254 6.58652 2.06855 6.56311C2.11456 6.5397 2.15438 6.50574 2.18477 6.46401L3.57471 4.55919C3.61016 4.5104 3.63145 4.45277 3.63624 4.39264C3.64102 4.33252 3.62911 4.27224 3.60182 4.21846C3.57452 4.16468 3.53291 4.11947 3.48156 4.08783C3.43022 4.05619 3.37113 4.03934 3.31082 4.03915H2.41428C3.02361 2.20094 4.75334 0.880205 6.79983 0.880205C9.35719 0.880205 11.4226 2.94221 11.4226 5.49957C11.4226 8.05693 9.35719 10.1198 6.79983 10.1198C5.27582 10.1198 3.85132 9.36864 2.98933 8.11182C2.92324 8.01585 2.82178 7.95002 2.70721 7.92875C2.59264 7.90748 2.47431 7.93251 2.37818 7.99836C2.3303 8.0311 2.28936 8.07298 2.25773 8.1216C2.22609 8.17021 2.20438 8.2246 2.19383 8.28164C2.18329 8.33867 2.18412 8.39723 2.19629 8.45394C2.20845 8.51066 2.23171 8.5644 2.26471 8.6121C3.29029 10.1074 4.98659 11 6.79984 11C9.83289 11 12.3037 8.53263 12.3037 5.49957C12.3037 2.46652 9.83289 0 6.79983 0ZM6.49469 2.71282C6.43689 2.71305 6.37971 2.72465 6.3264 2.74698C6.27309 2.76931 6.2247 2.80191 6.18399 2.84294C6.14328 2.88397 6.11105 2.93261 6.08915 2.98609C6.06724 3.03958 6.05608 3.09685 6.0563 3.15465V5.87692C6.05626 5.94855 6.07369 6.01911 6.1071 6.08247C6.1405 6.14584 6.18886 6.20009 6.24799 6.24052L7.72904 7.25138C7.82528 7.31715 7.94368 7.34205 8.05826 7.32061C8.17284 7.29918 8.27423 7.23317 8.3402 7.13706C8.40569 7.04088 8.43043 6.92268 8.40901 6.80831C8.38758 6.69394 8.32174 6.59271 8.22587 6.52676L6.93651 5.64312V3.15465C6.93674 3.09656 6.92546 3.03901 6.90334 2.9853C6.88122 2.93159 6.84868 2.8828 6.80761 2.84172C6.76654 2.80065 6.71774 2.76812 6.66404 2.74599C6.61033 2.72387 6.55277 2.7126 6.49469 2.71282Z" fill="#6B6B6B" />
                                            </svg>
                                            Last updated on {format(new Date(user.last_preference_at), 'do MMM, yyyy')}
                                        </span>
                                    }
                                </div>
                                {isModalOpen && user.last_preference_at && isValidDate(user.last_preference_at) &&
                                    <div className='bottomAction'>
                                        <span>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="11" viewBox="0 0 13 11" fill="none">
                                                <path fill-rule="evenodd" clip-rule="evenodd" d="M6.79983 0C4.27254 0 2.13865 1.71315 1.49711 4.03915H0.525791C0.465552 4.0395 0.406577 4.05646 0.355353 4.08817C0.304129 4.11987 0.262641 4.16508 0.235452 4.21884C0.208263 4.2726 0.196427 4.33281 0.201245 4.39286C0.206062 4.4529 0.227347 4.51046 0.262759 4.55919L1.65527 6.46401C1.68566 6.50574 1.72549 6.5397 1.7715 6.56311C1.81751 6.58652 1.8684 6.59872 1.92002 6.59872C1.97165 6.59872 2.02254 6.58652 2.06855 6.56311C2.11456 6.5397 2.15438 6.50574 2.18477 6.46401L3.57471 4.55919C3.61016 4.5104 3.63145 4.45277 3.63624 4.39264C3.64102 4.33252 3.62911 4.27224 3.60182 4.21846C3.57452 4.16468 3.53291 4.11947 3.48156 4.08783C3.43022 4.05619 3.37113 4.03934 3.31082 4.03915H2.41428C3.02361 2.20094 4.75334 0.880205 6.79983 0.880205C9.35719 0.880205 11.4226 2.94221 11.4226 5.49957C11.4226 8.05693 9.35719 10.1198 6.79983 10.1198C5.27582 10.1198 3.85132 9.36864 2.98933 8.11182C2.92324 8.01585 2.82178 7.95002 2.70721 7.92875C2.59264 7.90748 2.47431 7.93251 2.37818 7.99836C2.3303 8.0311 2.28936 8.07298 2.25773 8.1216C2.22609 8.17021 2.20438 8.2246 2.19383 8.28164C2.18329 8.33867 2.18412 8.39723 2.19629 8.45394C2.20845 8.51066 2.23171 8.5644 2.26471 8.6121C3.29029 10.1074 4.98659 11 6.79984 11C9.83289 11 12.3037 8.53263 12.3037 5.49957C12.3037 2.46652 9.83289 0 6.79983 0ZM6.49469 2.71282C6.43689 2.71305 6.37971 2.72465 6.3264 2.74698C6.27309 2.76931 6.2247 2.80191 6.18399 2.84294C6.14328 2.88397 6.11105 2.93261 6.08915 2.98609C6.06724 3.03958 6.05608 3.09685 6.0563 3.15465V5.87692C6.05626 5.94855 6.07369 6.01911 6.1071 6.08247C6.1405 6.14584 6.18886 6.20009 6.24799 6.24052L7.72904 7.25138C7.82528 7.31715 7.94368 7.34205 8.05826 7.32061C8.17284 7.29918 8.27423 7.23317 8.3402 7.13706C8.40569 7.04088 8.43043 6.92268 8.40901 6.80831C8.38758 6.69394 8.32174 6.59271 8.22587 6.52676L6.93651 5.64312V3.15465C6.93674 3.09656 6.92546 3.03901 6.90334 2.9853C6.88122 2.93159 6.84868 2.8828 6.80761 2.84172C6.76654 2.80065 6.71774 2.76812 6.66404 2.74599C6.61033 2.72387 6.55277 2.7126 6.49469 2.71282Z" fill="#6B6B6B" />
                                            </svg>
                                            Last updated on {format(new Date(user.last_preference_at), 'do MMM, yyyy')}
                                        </span>
                                    </div>
                                }
                            </>
                            :
                            <div className='modal-btns'>
                                {isModalOpen && !applyAggregator && !disableSkip && <button type='button' className='outlinedBtn' onClick={handleSkip}>Skip</button>}
                                <button type='submit' className='primaryBtn CTA'>
                                    {isModalOpen ? (user.status >= 1 ? "Update & Save" : "Save") : "Save"} my {isModalOpen ? "Profile" : "Preferences"}
                                </button>
                                {resumeData && !resumeHealthControl.is_paid && !suppressSaveAnalyzeResumeCta && (
                                    <button type='button' className='primaryBtn gradientBtn' onClick={e => handleSubmit(e, true)}>
                                        {isDirectPayUser ? 'Save & Boost My Resume' : 'Save & Analyze My Resume'}
                                    </button>
                                )}
                            </div>
                        }


                    </form>
                </div>
            }
            {isResumeModalOpen && <ResumeModal isOpen={isResumeModalOpen} setOpen={setIsResumeModalOpen} data={selectedResume} onDownloadClick={onDownloadClick} />}
        </section>
    )
}