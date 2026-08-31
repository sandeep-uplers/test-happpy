'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from '@/talent/navigation/routerCompat';
import { toast } from 'react-hot-toast';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { POST_API, GET_API } from '../../../components/Helper';
import './VerifyOutreachPerson.css';

// Icons
const LocationIcon = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const BriefcaseIcon = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
);

const DocumentIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
);

const EditIcon = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const TrashIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
);

const ViewIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const CloseIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
);

const SendIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 2L11 13" />
        <path d="M22 2L15 22L11 13L2 9L22 2Z" />
    </svg>
);

const CheckIcon = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" />
    </svg>
);

const RecoverIcon = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
    </svg>
);

const LinkedInIcon = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
);

const GmailIcon = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
    </svg>
);

const MailIcon = ({ size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
    </svg>
);

const EyeIcon = ({ size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const InfoIcon = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
);

const UserIcon = ({ size = 48 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
    </svg>
);

const defaultMasterTemplates = {
    linkedinMessage: '',
    gmailSubject: '',
    gmailMessage: ''
};

const VerifyOutreachPerson = ({
    routeBase = '/talent/verify-outreach-person',
    embeddedJobId = null,
    onClose = null,
    jobsInQueue = false,
}) => {
    const navigate = useNavigate();
    const { outreach_hr_id: urlJobId } = useParams(); // Get job ID from URL if present
    // When the host mounts this component inside a drawer/modal, it passes
    // `embeddedJobId` (the row's outreach_hr_id) + `onClose`. In that "embedded"
    // mode we ignore URL params and suppress every internal `navigate(...)`
    // call so the host URL stays put.
    const isEmbedded = typeof onClose === 'function';
    const initialJobId = embeddedJobId ?? urlJobId;

    // State for pending jobs list
    const [pendingJobs, setPendingJobs] = useState([]);
    const [isLoadingJobs, setIsLoadingJobs] = useState(true);
    const [selectedJobId, setSelectedJobId] = useState(null);

    // State for job details
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDiscarding, setIsDiscarding] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [isDiscarded, setIsDiscarded] = useState(false);
    const [completionStats, setCompletionStats] = useState({ created: 0, skipped: 0 });
    const [persons, setPersons] = useState({});
    const [expandedMessagePanel, setExpandedMessagePanel] = useState(null);
    const [activeMessageTab, setActiveMessageTab] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    // Modal states
    const [masterTemplatesModal, setMasterTemplatesModal] = useState(null); // 'linkedin' | 'gmail' | null
    const [editModal, setEditModal] = useState({ open: false, personId: null });
    const [discardModal, setDiscardModal] = useState(false);
    const [confirmSendModal, setConfirmSendModal] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState('');
    const [feedbackText, setFeedbackText] = useState('');

    // Master templates
    const [masterTemplates, setMasterTemplates] = useState(defaultMasterTemplates);
    const [editedTemplates, setEditedTemplates] = useState(defaultMasterTemplates);

    // Edited person messages
    const [editedPersonMessages, setEditedPersonMessages] = useState({});

    // Revealed emails state
    const [revealedEmails, setRevealedEmails] = useState({});
    const [revealingEmail, setRevealingEmail] = useState({});

    // Quill editor modules configuration
    const quillModules = useMemo(() => ({
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link'],
            ['clean']
        ],
    }), []);

    const quillFormats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background',
        'list', 'bullet',
        'link'
    ];

    // Job info
    const [jobInfo, setJobInfo] = useState({
        title: '',
        company: '',
        companyLogo: '',
        location: '',
        workType: '',
        applyUrl: ''
    });

    // Load pending jobs list on mount or load specific job from URL
    useEffect(() => {
        const loadPendingJobs = async () => {
            setIsLoadingJobs(true);
            try {
                const response = await GET_API('/api/talent/outreach/pending-jobs');

                if (response?.data?.status === 200 || response?.data?.status === 'success') {
                    const jobs = response.data.data || [];
                    setPendingJobs(jobs);

                    // Deep-link priority: embeddedJobId (drawer) > urlJobId (route param).
                    if (initialJobId) {
                        loadJobDetails(initialJobId);
                    }
                    // Auto-select first job if only one exists and no deep-link.
                    else if (jobs.length === 1) {
                        loadJobDetails(jobs[0].id);
                    }
                } else {
                    toast.error(response?.data?.message || 'Failed to load pending jobs');
                }
            } catch (error) {
                console.error('Error loading pending jobs:', error);
                toast.error(error?.response?.data?.message || 'Failed to load pending jobs');
            } finally {
                setIsLoadingJobs(false);
            }
        };

        loadPendingJobs();
    }, [initialJobId]);

    // Load job details when a job is selected
    const loadJobDetails = async (jobId) => {
        setSelectedJobId(jobId);
        setIsLoading(true);

        // Update URL to reflect selected job (skipped when embedded in a drawer).
        if (!isEmbedded) {
            navigate(`${routeBase}/${jobId}`, { replace: true });
        }

        // Reset states
        setPersons({});
        setExpandedMessagePanel(null);
        setActiveMessageTab({});
        setIsCompleted(false);
        setIsDiscarded(false);

        try {
            const response = await GET_API(`/api/talent/outreach/get-employee-requests?outreach_hr_id=${jobId}`);

            if (response?.data?.status === 200 || response?.data?.status === 'success') {
                const { job_info, persons: personsData } = response.data.data || {};

                // Set job info
                if (job_info) {
                    setJobInfo({
                        title: job_info.title || '',
                        company: job_info.company || '',
                        companyLogo: job_info.companyLogo || '',
                        location: job_info.location || '',
                        workType: job_info.workType || '',
                        applyUrl: job_info.applyUrl || ''
                    });

                    // Set master templates from API
                    if (job_info.default_master_templates) {
                        const apiTemplates = {
                            linkedinMessage: job_info.default_master_templates.linkedinMessage || '',
                            gmailSubject: job_info.default_master_templates.gmailSubject || '',
                            gmailMessage: job_info.default_master_templates.gmailMessage || ''
                        };
                        setMasterTemplates(apiTemplates);
                        setEditedTemplates(apiTemplates);
                    }
                }

                // Set persons
                if (personsData && personsData.length > 0) {
                    const personsMap = {};
                    personsData.forEach(p => {
                        personsMap[p.id] = { ...p, removed: false };
                    });
                    setPersons(personsMap);
                }
            } else {
                toast.error(response?.data?.message || 'Failed to load job details');
            }
        } catch (error) {
            console.error('Error loading job details:', error);
            toast.error(error?.response?.data?.message || 'Failed to load job details');
        } finally {
            setIsLoading(false);
        }
    };

    // Go back to job selection
    const backToJobSelection = useCallback(() => {
        setSelectedJobId(null);
        setPersons({});
        setJobInfo({
            title: '',
            company: '',
            companyLogo: '',
            location: '',
            workType: '',
            applyUrl: ''
        });
        setMasterTemplates(defaultMasterTemplates);
        setEditedTemplates(defaultMasterTemplates);

        // Update URL to remove job ID (skipped when embedded in a drawer).
        if (!isEmbedded) {
            navigate(routeBase, { replace: true });
        }
    }, [navigate, routeBase, isEmbedded]);

    // Calculate counts
    const getCounts = useCallback(() => {
        let total = 0, linkedin = 0, gmail = 0, removed = 0;
        Object.values(persons).forEach(p => {
            if (p.removed) {
                removed++;
                return;
            }
            if (p.linkedinEnabled || p.gmailEnabled) total++;
            if (p.linkedinEnabled) linkedin++;
            if (p.gmailEnabled) gmail++;
        });
        return { total, linkedin, gmail, removed };
    }, [persons]);

    const counts = getCounts();

    // Get removed persons
    const getRemovedPersons = useCallback(() => {
        return Object.values(persons).filter(p => p.removed);
    }, [persons]);

    // Get active persons
    const getActivePersons = useCallback(() => {
        return Object.values(persons).filter(p => !p.removed);
    }, [persons]);

    // Show success message
    const showSuccess = useCallback((text) => {
        setSuccessMessage(text);
        setTimeout(() => setSuccessMessage(''), 3000);
    }, []);

    // Get initials from name
    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('');
    };

    // Toggle platform (LinkedIn/Gmail) for a person
    const togglePlatform = useCallback((id, platform, enable) => {
        setPersons(prev => {
            const updated = { ...prev };
            if (platform === 'linkedin') {
                updated[id] = { ...updated[id], linkedinEnabled: enable };
            } else {
                updated[id] = { ...updated[id], gmailEnabled: enable };
            }

            // If both platforms are disabled, remove the person
            if (!updated[id].linkedinEnabled && !updated[id].gmailEnabled) {
                updated[id].removed = true;
            }

            return updated;
        });
        showSuccess(enable ? `${platform} restored` : `${platform} removed`);
    }, [showSuccess]);

    // Remove person
    const removePerson = useCallback((id) => {
        setPersons(prev => ({
            ...prev,
            [id]: { ...prev[id], removed: true }
        }));
        setExpandedMessagePanel(null);
        showSuccess('Person removed');
    }, [showSuccess]);

    // Recover person
    const recoverPerson = useCallback((id) => {
        setPersons(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                removed: false,
                linkedinEnabled: prev[id].linkedin,
                gmailEnabled: prev[id].gmail
            }
        }));
        showSuccess('Person recovered');
    }, [showSuccess]);

    // Reveal email
    const revealEmail = useCallback(async (personId) => {
        if (revealedEmails[personId] || revealingEmail[personId]) {
            return;
        }

        setRevealingEmail(prev => ({ ...prev, [personId]: true }));

        try {
            const response = await POST_API('/api/talent/outreach/reveal-email', {
                outreach_hr_id: selectedJobId,
                outreach_employee_id: personId
            });

            if (response?.data?.status === 200 || response?.data?.status === 'success') {
                const email = response.data.data?.email;
                if (email) {
                    setRevealedEmails(prev => ({ ...prev, [personId]: email }));
                    // Update the person's email in state
                    setPersons(prev => ({
                        ...prev,
                        [personId]: { ...prev[personId], email: email }
                    }));
                    showSuccess('Email revealed');
                }
            } else {
                toast.error(response?.data?.message || 'Failed to reveal email');
            }
        } catch (error) {
            console.error('Error revealing email:', error);
            toast.error(error?.response?.data?.message || 'Failed to reveal email');
        } finally {
            setRevealingEmail(prev => ({ ...prev, [personId]: false }));
        }
    }, [selectedJobId, revealedEmails, revealingEmail, showSuccess]);

    // Copy email to clipboard
    const copyEmail = useCallback((email, e) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(email).then(() => {
            showSuccess('Email copied to clipboard');
        }).catch(() => {
            toast.error('Failed to copy email');
        });
    }, [showSuccess]);

    // Toggle message panel
    const toggleMessagePanel = useCallback((id) => {
        setExpandedMessagePanel(prev => prev === id ? null : id);

        // Set default active tab
        if (expandedMessagePanel !== id) {
            const person = persons[id];
            const hasLinkedin = person.linkedin && person.linkedinEnabled;
            const hasGmail = person.gmail && person.gmailEnabled;
            setActiveMessageTab(prev => ({
                ...prev,
                [id]: hasLinkedin ? 'linkedin' : hasGmail ? 'gmail' : null
            }));
        }
    }, [expandedMessagePanel, persons]);

    // Switch message tab
    const switchMessageTab = useCallback((id, type) => {
        setActiveMessageTab(prev => ({ ...prev, [id]: type }));
    }, []);

    // Open edit modal
    const openEditModal = useCallback((id) => {
        const person = persons[id];
        setEditedPersonMessages({
            linkedinMsg: person.linkedinMsg || masterTemplates.linkedinMessage,
            gmailSubject: person.gmailSubject || masterTemplates.gmailSubject,
            gmailMsg: person.gmailMsg || masterTemplates.gmailMessage
        });
        setEditModal({ open: true, personId: id });
    }, [persons, masterTemplates]);

    // Save person messages
    const savePersonMessages = useCallback(() => {
        const id = editModal.personId;
        setPersons(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                linkedinMsg: editedPersonMessages.linkedinMsg,
                gmailSubject: editedPersonMessages.gmailSubject,
                gmailMsg: editedPersonMessages.gmailMsg
            }
        }));
        setEditModal({ open: false, personId: null });
        showSuccess('Messages updated');
    }, [editModal.personId, editedPersonMessages, showSuccess]);

    // Save master templates
    const saveMasterTemplates = useCallback(() => {
        setMasterTemplates(editedTemplates);
        setMasterTemplatesModal(null);
        showSuccess('Template saved');
    }, [editedTemplates, showSuccess]);

    // Discard job
    const confirmDiscard = useCallback(async () => {
        setIsDiscarding(true);

        try {
            const response = await POST_API('/api/talent/outreach/discard-job', {
                outreach_hr_id: selectedJobId,
                feedback_reason: selectedFeedback,
                feedback_text: feedbackText
            });

            if (response?.data?.status === 200 || response?.data?.status === 'success') {
                setDiscardModal(false);
                setIsDiscarded(true);
                // Remove from pending jobs list
                setPendingJobs(prev => prev.filter(job => job.id !== selectedJobId));
            } else {
                toast.error(response?.data?.message || 'Failed to discard job');
            }
        } catch (error) {
            console.error('Error discarding job:', error);
            toast.error(error?.response?.data?.message || 'Failed to discard job');
        } finally {
            setIsDiscarding(false);
        }
    }, [selectedJobId, selectedFeedback, feedbackText]);

    // Submit outreach
    const submitOutreach = useCallback(async () => {
        const allPersons = Object.values(persons);
        const activeCount = allPersons.filter(p => !p.removed && (p.linkedinEnabled || p.gmailEnabled)).length;

        if (!activeCount) {
            toast.error('No persons selected');
            return;
        }

        setIsSubmitting(true);

        try {
            // Transform persons data for API - send all persons including removed ones
            // Backend will treat persons with both linkedin_channel_reach=0 and gmail_channel_reach=0 as rejected
            const personsPayload = allPersons.map(person => ({
                outreach_employee_id: person.id,
                linkedin_channel_reach: person.removed ? false : (person.linkedinEnabled || false),
                gmail_channel_reach: person.removed ? false : (person.gmailEnabled || false),
                linkedin_url: person.linkedinUrl || null,
                gmail_email: person.email || null,
                linkedin_custom_message: person.linkedinMsg || masterTemplates.linkedinMessage || null,
                gmail_custom_message: person.gmailMsg || masterTemplates.gmailMessage || null,
                gmail_custom_message_subject: person.gmailSubject || masterTemplates.gmailSubject || null,
            }));

            const payload = {
                outreach_hr_id: selectedJobId,
                persons: personsPayload
            };

            const response = await POST_API('/api/talent/outreach/store-employee-requests', payload);

            if (response?.data?.status === 200 || response?.data?.status === 'success') {
                const { created_count, skipped_count } = response.data.data || {};
                setCompletionStats({ created: created_count || 0, skipped: skipped_count || 0 });
                setIsCompleted(true);
                // Remove from pending jobs list
                setPendingJobs(prev => prev.filter(job => job.id !== selectedJobId));
            } else {
                toast.error(response?.data?.message || 'Failed to send outreach requests');
            }
        } catch (error) {
            console.error('Error submitting outreach:', error);
            toast.error(error?.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }, [persons, selectedJobId, masterTemplates]);

    // Render person card
    const renderPersonCard = (person) => {
        const initials = getInitials(person.name);
        const hasLinkedin = person.linkedin && person.linkedinEnabled;
        const hasGmail = person.gmail && person.gmailEnabled;
        const isExpanded = expandedMessagePanel === person.id;
        const currentTab = activeMessageTab[person.id] || (hasLinkedin ? 'linkedin' : 'gmail');

        return (
            <div key={person.id} className={`vo-person-card ${person.removed ? 'hidden' : ''} ${person.firstConnection ? 'first-connection' : ''}`}>
                <div className="vo-person-card-content">
                    <div className="vo-person-avatar">{initials}</div>
                    <div className="vo-person-info">
                        <div className="vo-person-name">
                            {person.name}
                            {person.firstConnection && (
                                <span className="vo-first-connection-wrapper">
                                    <span className="vo-first-connection-badge">1st</span>
                                    <span className="vo-first-connection-tooltip">
                                        Already connected on LinkedIn. You can customize the message or skip this person for referral.
                                    </span>
                                </span>
                            )}
                        </div>
                        <div className="vo-person-title">{person.title} at {jobInfo.company}</div>
                        <div className="vo-person-contact">
                            {person.linkedinUrl && (
                                <a
                                    href={person.linkedinUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="vo-contact-link linkedin-url"
                                    title={person.linkedinUrl}
                                >
                                    <LinkedInIcon />
                                    <span>{person.linkedinUrl.replace('https://linkedin.com/in/', '')}</span>
                                </a>
                            )}
                            {person.gmail && (
                                <div className="vo-email-container">
                                    {revealedEmails[person.id] ? (
                                        <button
                                            className="vo-contact-link email-url vo-copyable"
                                            onClick={(e) => copyEmail(revealedEmails[person.id], e)}
                                            title="Click to copy email"
                                        >
                                            <MailIcon />
                                            <span>{revealedEmails[person.id]}</span>
                                        </button>
                                    ) : (
                                        <>
                                            <span className="vo-contact-link email-url vo-hidden-email">
                                                <MailIcon />
                                                <span>{person.email}</span>
                                            </span>
                                            <button
                                                className="vo-reveal-email-btn"
                                                onClick={() => revealEmail(person.id)}
                                                disabled={revealingEmail[person.id]}
                                                title="Reveal email"
                                            >
                                                {revealingEmail[person.id] ? (
                                                    <div className="vo-loading-spinner-small"></div>
                                                ) : (
                                                    <EyeIcon />
                                                )}
                                                <span>{revealingEmail[person.id] ? 'Revealing...' : 'Reveal'}</span>
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="vo-outreach-type-badges">
                        {person.linkedin && (
                            <div className={`vo-platform-badge-wrapper ${!person.linkedinEnabled ? 'disabled' : ''}`}>
                                <span className="vo-outreach-type-badge linkedin">
                                    <LinkedInIcon />
                                    LinkedIn
                                </span>
                                <button
                                    className="vo-platform-remove-btn"
                                    onClick={() => togglePlatform(person.id, 'linkedin', false)}
                                    title="Remove LinkedIn"
                                >
                                    ×
                                </button>
                                <button
                                    className="vo-platform-restore-btn"
                                    onClick={() => togglePlatform(person.id, 'linkedin', true)}
                                    title="Restore LinkedIn"
                                >
                                    ↩
                                </button>
                            </div>
                        )}
                        {person.gmail && (
                            <div className={`vo-platform-badge-wrapper ${!person.gmailEnabled ? 'disabled' : ''}`}>
                                <span className="vo-outreach-type-badge gmail">
                                    <GmailIcon />
                                    Gmail
                                </span>
                                <button
                                    className="vo-platform-remove-btn"
                                    onClick={() => togglePlatform(person.id, 'gmail', false)}
                                    title="Remove Gmail"
                                >
                                    ×
                                </button>
                                <button
                                    className="vo-platform-restore-btn"
                                    onClick={() => togglePlatform(person.id, 'gmail', true)}
                                    title="Restore Gmail"
                                >
                                    ↩
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="vo-person-actions">
                        <button
                            className="vo-btn-icon view"
                            onClick={() => toggleMessagePanel(person.id)}
                            title="View messages"
                        >
                            <ViewIcon />
                        </button>
                        <button
                            className="vo-btn-icon edit"
                            onClick={() => openEditModal(person.id)}
                            title="Edit messages"
                        >
                            <EditIcon />
                        </button>
                        <button
                            className="vo-btn-icon danger"
                            onClick={() => removePerson(person.id)}
                            title="Remove person"
                        >
                            <TrashIcon />
                        </button>
                    </div>
                </div>

                {/* Message Preview Panel */}
                <div className={`vo-message-preview-panel ${isExpanded ? 'active' : ''}`}>
                    <div className="vo-message-tabs">
                        {person.linkedin && (
                            <button
                                className={`vo-message-tab ${currentTab === 'linkedin' ? 'active linkedin' : ''} ${!hasLinkedin ? 'disabled' : ''}`}
                                onClick={() => hasLinkedin && switchMessageTab(person.id, 'linkedin')}
                                disabled={!hasLinkedin}
                            >
                                <LinkedInIcon />
                                LinkedIn
                            </button>
                        )}
                        {person.gmail && (
                            <button
                                className={`vo-message-tab ${currentTab === 'gmail' ? 'active gmail' : ''} ${!hasGmail ? 'disabled' : ''}`}
                                onClick={() => hasGmail && switchMessageTab(person.id, 'gmail')}
                                disabled={!hasGmail}
                            >
                                <GmailIcon />
                                Gmail
                            </button>
                        )}
                    </div>

                    {person.linkedin && (
                        <div className={`vo-message-content ${currentTab === 'linkedin' ? 'active' : ''}`}>
                            <div className="vo-message-box">
                                <div className="vo-message-body" dangerouslySetInnerHTML={{ __html: person.linkedinMsg || masterTemplates.linkedinMessage }} />
                            </div>
                        </div>
                    )}

                    {person.gmail && (
                        <div className={`vo-message-content ${currentTab === 'gmail' ? 'active' : ''}`}>
                            <div className="vo-message-box">
                                <div className="vo-message-subject">
                                    <span>Subject:</span> {person.gmailSubject || masterTemplates.gmailSubject}
                                </div>
                                <div className="vo-message-body" dangerouslySetInnerHTML={{ __html: person.gmailMsg || masterTemplates.gmailMessage }} />
                            </div>
                        </div>
                    )}

                    <div className="vo-message-panel-actions">
                        <button className="vo-btn-sm secondary" onClick={() => toggleMessagePanel(person.id)}>
                            Close
                        </button>
                        <button className="vo-btn-sm primary" onClick={() => openEditModal(person.id)}>
                            <EditIcon />
                            Edit Messages
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Loading pending jobs
    if (isLoadingJobs) {
        return (
            <div className="verify-outreach-container">
                <div className="vo-loading">
                    <div className="vo-loading-spinner"></div>
                </div>
            </div>
        );
    }

    // No pending jobs
    if (!isLoadingJobs && pendingJobs.length === 0 && !selectedJobId) {
        return (
            <div className="verify-outreach-container">
                <div className="vo-empty-jobs-view">
                    <div className="vo-empty-jobs-icon">
                        <CheckIcon size={64} />
                    </div>
                    <h2>All caught up!</h2>
                    <p>You have no pending outreach requests to review.</p>
                    {jobsInQueue ? null : (
                        <button
                            className="vo-btn vo-btn-primary"
                            onClick={() => navigate('/talent/outreach-agent')}
                        >
                            Back to Outreach Dashboard
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // Show pending jobs selection (when multiple jobs and none selected)
    if (!selectedJobId && pendingJobs.length > 0) {
        return (
            <div className="verify-outreach-container">
                <div className="verify-outreach-header">
                    <h1>Pending Outreach Reviews</h1>
                    <p>Select a job to review and approve outreach persons</p>
                </div>

                <div className="vo-pending-jobs-info-card">
                    <div className="vo-pending-jobs-info-icon">
                        <InfoIcon size={22} />
                    </div>
                    <div className="vo-pending-jobs-info-content">
                        <h3 className="vo-pending-jobs-info-title">About Pending External Jobs</h3>
                        <p className="vo-pending-jobs-info-text">
                            This status indicates that you need to manually click on each job to run the agent. Because the agent is currently configured in manual mode (you can switch to auto mode if you prefer), every time you run it, the job will move to Pending Request status. This requires a final confirmation before the outreach process begins for that contact.
                        </p>
                    </div>
                </div>

                <div className="vo-pending-jobs-grid">
                    {pendingJobs.map(job => (
                        <div
                            key={job.id}
                            className="vo-pending-job-card"
                            onClick={() => loadJobDetails(job.id)}
                        >
                            <div className="vo-pending-job-card-header">
                                <img
                                    src={job.company_logo || '/images/default-company.png'}
                                    alt={job.company_name}
                                    className="vo-pending-job-logo"
                                    onError={(e) => { e.target.src = '/images/default-company.png'; }}
                                />
                                <div className="vo-pending-job-badge">
                                    <span>{job.pending_count}</span> persons
                                </div>
                            </div>
                            <div className="vo-pending-job-card-body">
                                <h3 className="vo-pending-job-title">{job.job_title}</h3>
                                <p className="vo-pending-job-company">{job.company_name}</p>
                            </div>
                            <div className="vo-pending-job-card-footer">
                                <span className="vo-pending-job-date">
                                    Added {new Date(job.created_at).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </span>
                                <span className="vo-pending-job-action">
                                    Review →
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Loading job details
    if (isLoading) {
        return (
            <div className="verify-outreach-container">
                <div className="vo-loading">
                    <div className="vo-loading-spinner"></div>
                </div>
            </div>
        );
    }

    if (isCompleted) {
        return (
            <div className="verify-outreach-container">
                <div className="vo-success-page">
                    <div className="vo-success-card">
                        {/* Animated Success Icon */}
                        <div className="vo-success-icon-wrapper">
                            <div className="vo-success-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                            <div className="vo-success-ring"></div>
                        </div>

                        {/* Header */}
                        <div className="vo-success-header">
                            <h1>Outreach Requests Sent!</h1>
                            <p>Your Happpy Agent is now reaching out to your selected contacts</p>
                        </div>

                        {/* Stats Grid */}
                        <div className="vo-success-stats-grid">
                            <div className="vo-success-stat-card primary">
                                <div className="vo-success-stat-icon">
                                    <SendIcon size={20} />
                                </div>
                                <div className="vo-success-stat-content">
                                    <span className="vo-success-stat-number">{completionStats.created}</span>
                                    <span className="vo-success-stat-text">Requests Sent</span>
                                </div>
                            </div>
                            {completionStats.skipped > 0 && (
                                <div className="vo-success-stat-card secondary">
                                    <div className="vo-success-stat-icon">
                                        <CloseIcon size={20} />
                                    </div>
                                    <div className="vo-success-stat-content">
                                        <span className="vo-success-stat-number">{completionStats.skipped}</span>
                                        <span className="vo-success-stat-text">Skipped</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Job Card */}
                        <div className="vo-success-job-card">
                            <div className="vo-success-job-card-header">
                                <span>Job Details</span>
                            </div>
                            <div className="vo-success-job-card-body">
                                <img
                                    src={jobInfo.companyLogo}
                                    alt={jobInfo.company}
                                    className="vo-success-company-logo"
                                    onError={(e) => { e.target.src = '/images/default-company.png'; }}
                                />
                                <div className="vo-success-job-details">
                                    <h3>{jobInfo.title}</h3>
                                    <p>{jobInfo.company}</p>
                                    <div className="vo-success-job-meta">
                                        <span><LocationIcon size={12} /> {jobInfo.location}</span>
                                        <span><BriefcaseIcon size={12} /> {jobInfo.workType}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Timeline Info */}
                        <div className="vo-success-timeline">
                            <div className="vo-success-timeline-icon">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                            </div>
                            <div className="vo-success-timeline-text">
                                <strong>What's next?</strong>
                                <span>Our agent will send messages within 10-30 minutes. You'll receive notifications on any responses.</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="vo-success-actions">
                            {pendingJobs.length > 0 && (
                                <button
                                    className="vo-success-btn vo-success-btn-secondary"
                                    onClick={backToJobSelection}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                                        <path d="M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" />
                                    </svg>
                                    Review More Jobs ({pendingJobs.length})
                                </button>
                            )}
                            <button
                                className="vo-success-btn"
                                onClick={() => navigate('/talent/outreach-agent')}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M19 12H5M12 19l-7-7 7-7" />
                                </svg>
                                Back to Outreach Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (isDiscarded) {
        return (
            <div className="verify-outreach-container">
                <div className="vo-completion-view">
                    <div className="vo-completion-icon vo-discarded-icon">
                        <CloseIcon size={64} />
                    </div>
                    <h2>Job Discarded</h2>
                    <p className="vo-completion-subtitle">This job has been removed from your outreach list.</p>

                    <div className="vo-completion-job-info">
                        <img
                            src={jobInfo.companyLogo}
                            alt={jobInfo.company}
                            className="vo-completion-company-logo"
                            onError={(e) => { e.target.src = '/images/default-company.png'; }}
                        />
                        <div>
                            <h3>{jobInfo.title}</h3>
                            <p>{jobInfo.company}</p>
                        </div>
                    </div>

                    <div className="vo-discarded-actions" style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center' }}>
                        {pendingJobs.length > 0 && (
                            <button
                                className="vo-btn vo-btn-secondary"
                                onClick={backToJobSelection}
                            >
                                Review More Jobs ({pendingJobs.length})
                            </button>
                        )}
                        <button
                            className="vo-btn vo-btn-primary"
                            onClick={() => navigate('/talent/outreach-agent')}
                        >
                            Back to Outreach Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="verify-outreach-container">
            {/* Header */}
            <div className="verify-outreach-header">
                {pendingJobs.length > 0 && (
                    <button className="vo-back-to-jobs-btn" onClick={backToJobSelection}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Back to Jobs ({pendingJobs.length} more)
                    </button>
                )}
                <h1>Review Outreach Persons</h1>
                <p>Review and approve the people we'll reach out to for this job</p>
            </div>

            {/* Job Info Card - Compact */}
            <div className="vo-job-info-card">
                <img
                    src={jobInfo.companyLogo}
                    alt={jobInfo.company}
                    className="vo-job-company-logo"
                    onError={(e) => { e.target.src = '/images/default-company.png'; }}
                />
                <div className="vo-job-info-details">
                    <h2>{jobInfo.title}</h2>
                    <p className="vo-company-name">{jobInfo.company}</p>
                    {(jobInfo.location || jobInfo.workType) && (
                        <div className="vo-job-meta-tags">
                            {jobInfo.location && (
                                <span className="vo-job-meta-tag">
                                    <LocationIcon />
                                    {jobInfo.location}
                                </span>
                            )}
                            {jobInfo.workType && (
                                <span className="vo-job-meta-tag">
                                    <BriefcaseIcon />
                                    {jobInfo.workType}
                                </span>
                            )}
                        </div>
                    )}
                </div>
                <div className="vo-job-info-actions">
                    {jobInfo.applyUrl && (
                        <a
                            href={jobInfo.applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="vo-btn vo-btn-outline"
                            title="View Job Description"
                        >
                            <DocumentIcon />
                            View Job
                        </a>
                    )}
                    <div className="vo-job-status-badge">Pending Review</div>
                </div>
            </div>

            {/* Other Pending Jobs - Small Cards (Mobile) */}
            {pendingJobs.length > 0 && (
                <div className="vo-other-jobs-section">
                    <div className="vo-other-jobs-header">
                        <span>Other Pending Jobs</span>
                        <span className="vo-other-jobs-count">{pendingJobs.length}</span>
                    </div>
                    <div className="vo-other-jobs-list">
                        {pendingJobs.map(job => (
                            <div
                                key={job.id}
                                className="vo-other-job-card"
                                onClick={() => loadJobDetails(job.id)}
                            >
                                <img
                                    src={job.company_logo || '/images/default-company.png'}
                                    alt={job.company_name}
                                    className="vo-other-job-logo"
                                    onError={(e) => { e.target.src = '/images/default-company.png'; }}
                                />
                                <div className="vo-other-job-info">
                                    <span className="vo-other-job-title">{job.job_title}</span>
                                    <span className="vo-other-job-company">{job.company_name}</span>
                                </div>
                                <div className="vo-other-job-count">{job.pending_count}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="vo-summary-stats">
                <div className="vo-stat-card">
                    <div className="vo-stat-value">{counts.total}</div>
                    <div className="vo-stat-label">Total Persons</div>
                </div>
                <div className="vo-stat-card linkedin">
                    <div className="vo-stat-value">{counts.linkedin}</div>
                    <div className="vo-stat-label">LinkedIn Outreach</div>
                </div>
                <div className="vo-stat-card gmail">
                    <div className="vo-stat-value">{counts.gmail}</div>
                    <div className="vo-stat-label">Gmail Outreach</div>
                </div>
            </div>

            {/* Master Template Management */}
            <div className="vo-template-management">
                <div className="vo-template-management-info">
                    <div>
                        <h3>Master Message Templates</h3>
                    </div>
                </div>
                <div className="vo-template-buttons">
                    <button className="vo-btn-manage-templates linkedin" onClick={() => {
                        setEditedTemplates(masterTemplates);
                        setMasterTemplatesModal('linkedin');
                    }}>
                        <LinkedInIcon />
                        Edit
                    </button>
                    <button className="vo-btn-manage-templates gmail" onClick={() => {
                        setEditedTemplates(masterTemplates);
                        setMasterTemplatesModal('gmail');
                    }}>
                        <GmailIcon />
                        Edit
                    </button>
                </div>
            </div>

            {/* Removed Section */}
            <div className={`vo-removed-section ${counts.removed > 0 ? 'show' : ''}`}>
                <div className="vo-removed-section-header">
                    <h4>
                        <TrashIcon />
                        Removed Persons
                        <span className="vo-removed-count">{counts.removed}</span>
                    </h4>
                </div>
                {getRemovedPersons().map(person => (
                    <div key={person.id} className="vo-removed-person-item">
                        <div className="vo-removed-person-avatar">{getInitials(person.name)}</div>
                        <div className="vo-removed-person-info">
                            <div className="vo-removed-person-name">{person.name}</div>
                            <div className="vo-removed-person-title">{person.title}</div>
                        </div>
                        <button className="vo-btn-recover" onClick={() => recoverPerson(person.id)}>
                            <RecoverIcon />
                            Recover
                        </button>
                    </div>
                ))}
            </div>

            {/* Persons List */}
            <div className="vo-outreach-list-container">
                <div className="vo-outreach-list-header">
                    <h3>People to Reach Out</h3>
                    <span className="vo-person-count">{counts.total} persons selected</span>
                </div>

                {getActivePersons().map(person => renderPersonCard(person))}

                {/* Empty State */}
                {counts.total === 0 && (
                    <div className="vo-empty-state">
                        <UserIcon />
                        <h4>No persons selected</h4>
                        <p>All persons have been removed. Recover from the removed list above.</p>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="vo-action-buttons">
                {Object.keys(persons).length > 0 && (
                    <button className="vo-btn vo-btn-danger" onClick={() => setDiscardModal(true)}>
                        <CloseIcon />
                        Discard Job
                    </button>
                )}
                <button
                    className="vo-btn vo-btn-primary"
                    onClick={() => setConfirmSendModal(true)}
                    disabled={counts.total === 0 || isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <div className="vo-loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></div>
                            Sending...
                        </>
                    ) : (
                        <>
                            <SendIcon />
                            Send Outreach Requests
                        </>
                    )}
                </button>
            </div>

            {/* LinkedIn Template Modal */}
            <div className={`vo-modal-overlay ${masterTemplatesModal === 'linkedin' ? 'active' : ''}`} onClick={() => setMasterTemplatesModal(null)}>
                <div className="vo-modal vo-modal-wide" onClick={e => e.stopPropagation()}>
                    <div className="vo-modal-header">
                        <div className="vo-modal-header-icon" style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', color: '#0077b5' }}>
                            <LinkedInIcon size={32} />
                        </div>
                        <h3>LinkedIn Message Template</h3>
                        <p>This template is used as default for all LinkedIn outreach messages</p>
                    </div>
                    <div className="vo-modal-body">
                        <div className="vo-template-editor-section">
                            <div className="vo-form-group">
                                <label>Message Body</label>
                                <div className="vo-quill-wrapper">
                                    <ReactQuill
                                        theme="snow"
                                        value={editedTemplates.linkedinMessage}
                                        onChange={(value) => setEditedTemplates(prev => ({ ...prev, linkedinMessage: value }))}
                                        modules={quillModules}
                                        formats={quillFormats}
                                        placeholder="Write your LinkedIn message..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="vo-modal-actions">
                        <button className="vo-btn vo-btn-secondary" onClick={() => setMasterTemplatesModal(null)}>Cancel</button>
                        <button className="vo-btn vo-btn-primary" onClick={saveMasterTemplates}>Save Template</button>
                    </div>
                </div>
            </div>

            {/* Gmail Template Modal */}
            <div className={`vo-modal-overlay ${masterTemplatesModal === 'gmail' ? 'active' : ''}`} onClick={() => setMasterTemplatesModal(null)}>
                <div className="vo-modal vo-modal-wide" onClick={e => e.stopPropagation()}>
                    <div className="vo-modal-header">
                        <div className="vo-modal-header-icon" style={{ background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)', color: '#ea4335' }}>
                            <GmailIcon size={32} />
                        </div>
                        <h3>Gmail Message Template</h3>
                        <p>This template is used as default for all Gmail outreach messages</p>
                    </div>
                    <div className="vo-modal-body">
                        <div className="vo-template-editor-section">
                            <div className="vo-form-group">
                                <label>Subject Line</label>
                                <input
                                    type="text"
                                    value={editedTemplates.gmailSubject}
                                    onChange={e => setEditedTemplates(prev => ({ ...prev, gmailSubject: e.target.value }))}
                                />
                            </div>
                            <div className="vo-form-group">
                                <label>Message Body</label>
                                <div className="vo-quill-wrapper">
                                    <ReactQuill
                                        theme="snow"
                                        value={editedTemplates.gmailMessage}
                                        onChange={(value) => setEditedTemplates(prev => ({ ...prev, gmailMessage: value }))}
                                        modules={quillModules}
                                        formats={quillFormats}
                                        placeholder="Write your Gmail message..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="vo-modal-actions">
                        <button className="vo-btn vo-btn-secondary" onClick={() => setMasterTemplatesModal(null)}>Cancel</button>
                        <button className="vo-btn vo-btn-primary" onClick={saveMasterTemplates}>Save Template</button>
                    </div>
                </div>
            </div>

            {/* Edit Person Modal */}
            <div className={`vo-modal-overlay ${editModal.open ? 'active' : ''}`} onClick={() => setEditModal({ open: false, personId: null })}>
                <div className="vo-modal vo-modal-wide" onClick={e => e.stopPropagation()}>
                    <div className="vo-modal-header">
                        <div className="vo-modal-header-icon" style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', color: '#2563eb' }}>
                            <EditIcon size={32} />
                        </div>
                        <h3>Edit Messages</h3>
                        <p>Customize messages for {editModal.personId ? persons[editModal.personId]?.name : ''}</p>
                    </div>
                    {editModal.personId && persons[editModal.personId] && (
                        <div className="vo-modal-body">
                            {persons[editModal.personId].linkedin && (
                                <div className="vo-template-editor-section">
                                    <div className="vo-template-editor-header linkedin">
                                        <LinkedInIcon size={24} />
                                        <h4>LinkedIn Message {!persons[editModal.personId].linkedinEnabled ? '(Disabled)' : ''}</h4>
                                    </div>
                                    {persons[editModal.personId].linkedinUrl && (
                                        <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
                                            Profile: <a href={persons[editModal.personId].linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#0369a1' }}>
                                                {persons[editModal.personId].linkedinUrl}
                                            </a>
                                        </p>
                                    )}
                                    <div className="vo-form-group">
                                        <label>Message</label>
                                        <div className={`vo-quill-wrapper ${!persons[editModal.personId].linkedinEnabled ? 'disabled' : ''}`}>
                                            <ReactQuill
                                                theme="snow"
                                                value={editedPersonMessages.linkedinMsg}
                                                onChange={(value) => setEditedPersonMessages(prev => ({ ...prev, linkedinMsg: value }))}
                                                modules={quillModules}
                                                formats={quillFormats}
                                                placeholder="Write your LinkedIn message..."
                                                readOnly={!persons[editModal.personId].linkedinEnabled}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                            {persons[editModal.personId].gmail && (
                                <div className="vo-template-editor-section">
                                    <div className="vo-template-editor-header gmail">
                                        <GmailIcon size={24} />
                                        <h4>Gmail Message {!persons[editModal.personId].gmailEnabled ? '(Disabled)' : ''}</h4>
                                    </div>
                                    {persons[editModal.personId].email && (
                                        <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
                                            Email: <a href={`mailto:${persons[editModal.personId].email}`} style={{ color: '#b91c1c' }}>
                                                {persons[editModal.personId].email}
                                            </a>
                                        </p>
                                    )}
                                    <div className="vo-form-group">
                                        <label>Subject</label>
                                        <input
                                            type="text"
                                            value={editedPersonMessages.gmailSubject}
                                            onChange={e => setEditedPersonMessages(prev => ({ ...prev, gmailSubject: e.target.value }))}
                                            disabled={!persons[editModal.personId].gmailEnabled}
                                            style={!persons[editModal.personId].gmailEnabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                        />
                                    </div>
                                    <div className="vo-form-group">
                                        <label>Message</label>
                                        <div className={`vo-quill-wrapper ${!persons[editModal.personId].gmailEnabled ? 'disabled' : ''}`}>
                                            <ReactQuill
                                                theme="snow"
                                                value={editedPersonMessages.gmailMsg}
                                                onChange={(value) => setEditedPersonMessages(prev => ({ ...prev, gmailMsg: value }))}
                                                modules={quillModules}
                                                formats={quillFormats}
                                                placeholder="Write your Gmail message..."
                                                readOnly={!persons[editModal.personId].gmailEnabled}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <div className="vo-modal-actions">
                        <button className="vo-btn vo-btn-secondary" onClick={() => setEditModal({ open: false, personId: null })}>Cancel</button>
                        <button className="vo-btn vo-btn-primary" onClick={savePersonMessages}>Save Changes</button>
                    </div>
                </div>
            </div>

            {/* Discard Modal */}
            <div className={`vo-modal-overlay ${discardModal ? 'active' : ''}`} onClick={() => setDiscardModal(false)}>
                <div className="vo-modal" onClick={e => e.stopPropagation()}>
                    <div className="vo-modal-header">
                        <div className="vo-modal-header-icon" style={{ background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)', color: '#dc2626' }}>
                            <CloseIcon size={32} />
                        </div>
                        <h3>Discard This Job?</h3>
                        <p>Help us improve by telling us why you're skipping this job</p>
                    </div>
                    <div className="vo-modal-body">
                        <div className="vo-feedback-options">
                            {[
                                { value: 'not-interested', label: "I'm not interested in this job" },
                                { value: 'wrong-company', label: "Wrong company / doesn't match preferences" },
                                { value: 'already-applied', label: "I've already applied to this job" }
                            ].map(option => (
                                <label
                                    key={option.value}
                                    className={`vo-feedback-option ${selectedFeedback === option.value ? 'selected' : ''}`}
                                    onClick={() => setSelectedFeedback(option.value)}
                                >
                                    <input type="radio" name="feedback" value={option.value} />
                                    <div className="vo-feedback-radio"></div>
                                    <span className="vo-feedback-option-text">{option.label}</span>
                                </label>
                            ))}
                        </div>
                        <textarea
                            className="vo-feedback-textarea"
                            placeholder="Additional comments (optional)..."
                            value={feedbackText}
                            onChange={e => setFeedbackText(e.target.value)}
                        />
                    </div>
                    <div className="vo-modal-actions">
                        <button className="vo-btn vo-btn-secondary" onClick={() => setDiscardModal(false)} disabled={isDiscarding}>Cancel</button>
                        <button className="vo-btn vo-btn-danger" onClick={confirmDiscard} disabled={isDiscarding}>
                            {isDiscarding ? (
                                <>
                                    <div className="vo-loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></div>
                                    Discarding...
                                </>
                            ) : (
                                'Discard Job'
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Confirm Send Outreach Modal */}
            <div className={`vo-modal-overlay ${confirmSendModal ? 'active' : ''}`} onClick={() => !isSubmitting && setConfirmSendModal(false)}>
                <div className="vo-modal" onClick={e => e.stopPropagation()}>
                    <div className="vo-modal-header">
                        <div className="vo-modal-header-icon" style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', color: '#2563eb' }}>
                            <SendIcon size={32} />
                        </div>
                        <h3>Confirm Outreach</h3>
                        <p>Are you sure you want to send outreach requests?</p>
                    </div>
                    <div className="vo-modal-body">
                        <div className="vo-confirm-summary">
                            <div className="vo-confirm-summary-item">
                                <span className="vo-confirm-summary-label">Total Persons</span>
                                <span className="vo-confirm-summary-value">{counts.total}</span>
                            </div>
                            {counts.linkedin > 0 && (
                                <div className="vo-confirm-summary-item linkedin">
                                    <span className="vo-confirm-summary-label">
                                        <LinkedInIcon size={14} />
                                        LinkedIn
                                    </span>
                                    <span className="vo-confirm-summary-value">{counts.linkedin}</span>
                                </div>
                            )}
                            {counts.gmail > 0 && (
                                <div className="vo-confirm-summary-item gmail">
                                    <span className="vo-confirm-summary-label">
                                        <GmailIcon size={14} />
                                        Gmail
                                    </span>
                                    <span className="vo-confirm-summary-value">{counts.gmail}</span>
                                </div>
                            )}
                            {counts.removed > 0 && (
                                <div className="vo-confirm-summary-item removed">
                                    <span className="vo-confirm-summary-label">Skipped</span>
                                    <span className="vo-confirm-summary-value">{counts.removed}</span>
                                </div>
                            )}
                        </div>
                        <p className="vo-confirm-note">
                            Once confirmed, our Happpy Agent will reach out to these contacts on your behalf. This action cannot be undone.
                        </p>
                    </div>
                    <div className="vo-modal-actions">
                        <button
                            className="vo-btn vo-btn-secondary"
                            onClick={() => setConfirmSendModal(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            className="vo-btn vo-btn-primary"
                            onClick={() => {
                                setConfirmSendModal(false);
                                submitOutreach();
                            }}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="vo-loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></div>
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <CheckIcon size={18} />
                                    Yes, Send Requests
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Success Message */}
            <div className={`vo-success-message ${successMessage ? 'show' : ''}`}>
                <CheckIcon />
                <span>{successMessage}</span>
            </div>
        </div>
    );
};

export default VerifyOutreachPerson;
