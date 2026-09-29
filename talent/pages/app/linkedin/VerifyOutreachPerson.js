'use client';

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from '@/talent/navigation/routerCompat';
import { toast } from 'react-hot-toast';
import { POST_API, GET_API } from '../../../components/Helper';
import TemplateEditor from './TemplateEditor';
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

const ClockIcon = ({ size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
    </svg>
);

const PendingPickerCloseIcon = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const PendingReviewArrowIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
    </svg>
);

const PENDING_PICKER_MASCOT_SRC = '/images/talent/outreach/mascot-insight.svg';
const OUTREACH_SENT_MASCOT_SRC = '/images/talent/outreach/mascot-thumbsup.svg';

const OutreachSentInfoIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="10" stroke="#086D7E" strokeWidth="2" />
        <path d="M12 16v-4" stroke="#086D7E" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="8" r="1" fill="#086D7E" />
    </svg>
);
const DISCARD_FEEDBACK_OPTIONS = [
    { value: 'not-interested', label: "I'm not interested in this job" },
    { value: 'wrong-company', label: "Wrong company / doesn't match preferences" },
    { value: 'already-applied', label: "I've already applied to this job" },
];

function formatJobAddedLabel(createdAt) {
    if (!createdAt) return 'Added —';
    const label = new Date(createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
    return `Added ${label}`;
}

function formatPendingContactLabel(count) {
    const n = Number(count) || 0;
    return n === 1 ? '1 contact' : `${n} contacts`;
}

function formatContactsSelectedLabel(count) {
    const n = Number(count) || 0;
    return n === 1 ? '1 contact selected' : `${n} contacts selected`;
}

function PersonInclusionCheckIcon() {
    return (
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

function ReviewFooterBackIcon() {
    return (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
        </svg>
    );
}

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
    // const [confirmSendModal, setConfirmSendModal] = useState(false);
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

    /** Last linkedinEnabled/gmailEnabled before exclude (checkbox, trash, or both channels off). */
    const personChannelSnapshotRef = useRef({});

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
                    personChannelSnapshotRef.current = {};
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
        setIsCompleted(false);
        setSelectedJobId(null);
        personChannelSnapshotRef.current = {};
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

    const dismissOutreachSentModal = useCallback(() => {
        setIsCompleted(false);
        if (pendingJobs.length > 0) {
            backToJobSelection();
        } else if (isEmbedded && onClose) {
            onClose();
        } else {
            navigate('/talent/job-agent');
        }
    }, [pendingJobs.length, backToJobSelection, navigate, isEmbedded, onClose]);

    const outreachSentJobMeta = useMemo(() => {
        return [jobInfo.location, jobInfo.workType].filter(Boolean).join(' • ');
    }, [jobInfo.location, jobInfo.workType]);

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

    const selectedPendingJob = useMemo(
        () => pendingJobs.find((j) => String(j.id) === String(selectedJobId)),
        [pendingJobs, selectedJobId]
    );

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

    const snapshotPersonChannels = useCallback((id, person) => {
        if (!person) return;
        personChannelSnapshotRef.current[id] = {
            linkedinEnabled: person.linkedinEnabled,
            gmailEnabled: person.gmailEnabled,
        };
    }, []);

    // Toggle platform (LinkedIn/Gmail) for a person
    const togglePlatform = useCallback((id, platform, enable) => {
        setPersons(prev => {
            const updated = { ...prev };
            const before = updated[id];
            if (!before) return prev;

            if (!enable) {
                snapshotPersonChannels(id, before);
            }

            const patch = { ...before };

            if (platform === 'linkedin') {
                patch.linkedinEnabled = enable;
            } else {
                patch.gmailEnabled = enable;
            }

            if (enable) {
                patch.removed = false;
            } else if (!patch.linkedinEnabled && !patch.gmailEnabled) {
                patch.removed = true;
            }

            updated[id] = patch;
            return updated;
        });

        const label = platform === 'linkedin' ? 'LinkedIn' : 'Gmail';
        showSuccess(enable ? `${label} restored` : `${label} removed`);
    }, [showSuccess, snapshotPersonChannels]);

    // Remove person
    const removePerson = useCallback((id) => {
        setPersons(prev => {
            const person = prev[id];
            if (person) {
                snapshotPersonChannels(id, person);
            }
            return {
                ...prev,
                [id]: {
                    ...prev[id],
                    removed: true,
                    linkedinEnabled: false,
                    gmailEnabled: false,
                },
            };
        });
        setExpandedMessagePanel(null);
        showSuccess('Person removed');
    }, [showSuccess, snapshotPersonChannels]);

    // Recover person
    const recoverPerson = useCallback((id) => {
        setPersons(prev => {
            const person = prev[id];
            if (!person) return prev;

            const snap = personChannelSnapshotRef.current[id];
            const linkedinEnabled = snap
                ? snap.linkedinEnabled
                : Boolean(person.linkedin);
            const gmailEnabled = snap
                ? snap.gmailEnabled
                : Boolean(person.gmail);

            delete personChannelSnapshotRef.current[id];

            return {
                ...prev,
                [id]: {
                    ...person,
                    removed: false,
                    linkedinEnabled: person.linkedin ? linkedinEnabled : false,
                    gmailEnabled: person.gmail ? gmailEnabled : false,
                },
            };
        });
        showSuccess('Person recovered');
    }, [showSuccess]);

    const isPersonIncluded = useCallback((person) => {
        if (!person || person.removed) return false;
        return Boolean(person.linkedinEnabled || person.gmailEnabled);
    }, []);

    const togglePersonInclusion = useCallback((id) => {
        const person = persons[id];
        if (!person) return;
        if (isPersonIncluded(person)) {
            snapshotPersonChannels(id, person);
            setPersons((prev) => ({
                ...prev,
                [id]: {
                    ...prev[id],
                    removed: true,
                    linkedinEnabled: false,
                    gmailEnabled: false,
                },
            }));
            setExpandedMessagePanel((prev) => (prev === id ? null : prev));
            showSuccess('Contact removed');
            return;
        }
        recoverPerson(id);
    }, [persons, isPersonIncluded, recoverPerson, showSuccess, snapshotPersonChannels]);

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

    const renderEditMessageModal = () => {
        if (!editModal.open || !editModal.personId || !persons[editModal.personId]) {
            return null;
        }

        const editPerson = persons[editModal.personId];
        const editGmailAddress = revealedEmails[editPerson.id] || editPerson.email || '';
        const closeEditModal = () => setEditModal({ open: false, personId: null });

        return (
            <div
                className="vo-modal-overlay vo-edit-message-overlay active"
                onClick={closeEditModal}
            >
                <div
                    className="vo-edit-message-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="vo-edit-message-modal-title"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="vo-edit-message-modal__body">
                        <div className="vo-edit-message-modal__top">
                            <header className="vo-edit-message-modal__head">
                                <h2 id="vo-edit-message-modal-title" className="vo-edit-message-modal__title">
                                    Edit message
                                </h2>
                                <p className="vo-edit-message-modal__subtitle">
                                    Customize messages for {editPerson.name}
                                </p>
                            </header>
                            <button
                                type="button"
                                className="vo-edit-message-modal__close"
                                aria-label="Close"
                                onClick={closeEditModal}
                            >
                                <PendingPickerCloseIcon />
                            </button>
                        </div>

                        {editPerson.linkedin ? (
                            <section className="vo-edit-message-modal__channel">
                                {editPerson.linkedinUrl ? (
                                    <a
                                        className="vo-edit-message-modal__status vo-edit-message-modal__status--linkedin"
                                        href={editPerson.linkedinUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <span className="vo-edit-message-modal__linkedin-badge" aria-hidden>
                                            in
                                        </span>
                                        <span className="vo-edit-message-modal__status-text">
                                            {editPerson.linkedinUrl}
                                        </span>
                                    </a>
                                ) : null}
                                <label className="vo-edit-message-modal__field-label">
                                    Message
                                    {!editPerson.linkedinEnabled ? ' (Disabled)' : ''}
                                </label>
                                <div className="vo-edit-message-modal__editor">
                                    <TemplateEditor
                                        variant="tall"
                                        value={editedPersonMessages.linkedinMsg || ''}
                                        onChange={(content) => setEditedPersonMessages(prev => ({ ...prev, linkedinMsg: content }))}
                                        readOnly={!editPerson.linkedinEnabled}
                                        placeholder="Write your LinkedIn message..."
                                    />
                                </div>
                            </section>
                        ) : null}

                        {editPerson.gmail ? (
                            <section className="vo-edit-message-modal__channel">
                                {editGmailAddress ? (
                                    <a
                                        className="vo-edit-message-modal__status vo-edit-message-modal__status--gmail"
                                        href={`mailto:${editGmailAddress}`}
                                    >
                                        <span className="vo-edit-message-modal__gmail-icon" aria-hidden>
                                            <GmailIcon size={12} />
                                        </span>
                                        <span className="vo-edit-message-modal__status-text">
                                            {editGmailAddress}
                                        </span>
                                    </a>
                                ) : null}
                                <div className="vo-edit-message-modal__subject-field">
                                    <label className="vo-edit-message-modal__field-label" htmlFor="vo-edit-gmail-subject">
                                        Email Subject
                                        {!editPerson.gmailEnabled ? ' (Disabled)' : ''}
                                    </label>
                                    <input
                                        id="vo-edit-gmail-subject"
                                        type="text"
                                        className="vo-edit-message-modal__subject"
                                        value={editedPersonMessages.gmailSubject}
                                        onChange={e => setEditedPersonMessages(prev => ({ ...prev, gmailSubject: e.target.value }))}
                                        disabled={!editPerson.gmailEnabled}
                                        placeholder="Could you refer me for {{title}} at {{company}}?"
                                    />
                                </div>
                                <label className="vo-edit-message-modal__field-label vo-edit-message-modal__field-label--spaced">
                                    Message
                                    {!editPerson.gmailEnabled ? ' (Disabled)' : ''}
                                </label>
                                <div className="vo-edit-message-modal__editor">
                                    <TemplateEditor
                                        variant="tall"
                                        value={editedPersonMessages.gmailMsg || ''}
                                        onChange={(content) => setEditedPersonMessages(prev => ({ ...prev, gmailMsg: content }))}
                                        readOnly={!editPerson.gmailEnabled}
                                        placeholder="Write your Gmail message..."
                                    />
                                </div>
                            </section>
                        ) : null}
                    </div>
                    <footer className="vo-edit-message-modal__foot">
                        <button
                            type="button"
                            className="vo-edit-message-modal__save"
                            onClick={savePersonMessages}
                        >
                            Save changes
                            <PendingReviewArrowIcon size={20} />
                        </button>
                    </footer>
                </div>
            </div>
        );
    };

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
        const included = isPersonIncluded(person);
        const gmailDisplay = revealedEmails[person.id] || person.email || '';
        const hasBothOutreachChannels = Boolean(person.linkedin && person.gmail);

        return (
            <div key={person.id} className={`vo-review-person${person.firstConnection ? ' vo-review-person--first-connection' : ''}`}>
                <div className="vo-review-person__row">
                    <button
                        type="button"
                        className={`vo-review-person__check${included ? ' is-on' : ''}`}
                        aria-pressed={included}
                        aria-label={`${included ? 'Remove' : 'Include'} ${person.name}`}
                        onClick={() => togglePersonInclusion(person.id)}
                    >
                        {included ? <PersonInclusionCheckIcon /> : null}
                    </button>
                    <div className="vo-review-person__avatar" aria-hidden>
                        {initials}
                    </div>
                    <div className="vo-review-person__body">
                        <div className="vo-review-person__name-row">
                            <span className="vo-review-person__name">{person.name}</span>
                            {person.firstConnection ? (
                                <span className="vo-first-connection-badge">1st</span>
                            ) : null}
                        </div>
                        <p className="vo-review-person__title">{person.title}</p>
                        <div className="vo-review-person__channels">
                            {person.linkedin && person.linkedinEnabled && person.linkedinUrl ? (
                                <a
                                    href={person.linkedinUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="vo-review-channel vo-review-channel--linkedin"
                                    title={person.linkedinUrl}
                                >
                                    <span className="vo-review-channel__icon vo-review-channel__icon--linkedin" aria-hidden>
                                        <LinkedInIcon size={12} />
                                    </span>
                                    <span className="vo-review-channel__text">{person.linkedinUrl}</span>
                                </a>
                            ) : null}
                            {person.gmail && person.gmailEnabled ? (
                                <div className="vo-review-channel vo-review-channel--gmail">
                                    <span className="vo-review-channel__icon vo-review-channel__icon--gmail" aria-hidden>
                                        <GmailIcon size={12} />
                                    </span>
                                    {revealedEmails[person.id] ? (
                                        <button
                                            type="button"
                                            className="vo-review-channel__text vo-review-channel__text-btn"
                                            onClick={(e) => copyEmail(revealedEmails[person.id], e)}
                                            title="Click to copy email"
                                        >
                                            {gmailDisplay}
                                        </button>
                                    ) : (
                                        <>
                                            <span className="vo-review-channel__text">{gmailDisplay}</span>
                                            <button
                                                type="button"
                                                className="vo-review-channel__reveal"
                                                onClick={() => revealEmail(person.id)}
                                                disabled={revealingEmail[person.id]}
                                            >
                                                {revealingEmail[person.id] ? '…' : 'Reveal'}
                                            </button>
                                        </>
                                    )}
                                </div>
                            ) : null}
                        </div>
                    </div>
                    <div className="vo-review-person__actions">
                        {hasBothOutreachChannels ? (
                            <div className="vo-outreach-type-badges vo-review-person__outreach-badges">
                                <div
                                    className={`vo-platform-badge-wrapper${!person.linkedinEnabled ? ' disabled' : ''
                                        }`}
                                >
                                    <span className="vo-outreach-type-badge linkedin">
                                        <LinkedInIcon size={14} />
                                        LinkedIn
                                    </span>
                                    {person.linkedinEnabled ? (
                                        <button
                                            type="button"
                                            className="vo-platform-remove-btn"
                                            title="Remove LinkedIn"
                                            aria-label="Remove LinkedIn"
                                            onClick={() => togglePlatform(person.id, 'linkedin', false)}
                                        >
                                            ×
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            className="vo-platform-restore-btn"
                                            title="Restore LinkedIn"
                                            aria-label="Restore LinkedIn"
                                            onClick={() => togglePlatform(person.id, 'linkedin', true)}
                                        >
                                            <RecoverIcon size={10} />
                                        </button>
                                    )}
                                </div>
                                <div
                                    className={`vo-platform-badge-wrapper${!person.gmailEnabled ? ' disabled' : ''
                                        }`}
                                >
                                    <span className="vo-outreach-type-badge gmail">
                                        <GmailIcon size={14} />
                                        Gmail
                                    </span>
                                    {person.gmailEnabled ? (
                                        <button
                                            type="button"
                                            className="vo-platform-remove-btn"
                                            title="Remove Gmail"
                                            aria-label="Remove Gmail"
                                            onClick={() => togglePlatform(person.id, 'gmail', false)}
                                        >
                                            ×
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            className="vo-platform-restore-btn"
                                            title="Restore Gmail"
                                            aria-label="Restore Gmail"
                                            onClick={() => togglePlatform(person.id, 'gmail', true)}
                                        >
                                            <RecoverIcon size={10} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : null}
                        <div className="vo-review-person__toolbar">
                            <button
                                type="button"
                                className="vo-review-person__action-btn"
                                onClick={() => toggleMessagePanel(person.id)}
                                title="View messages"
                            >
                                <ViewIcon />
                            </button>
                            <button
                                type="button"
                                className="vo-review-person__action-btn"
                                onClick={() => openEditModal(person.id)}
                                title="Edit messages"
                            >
                                <EditIcon />
                            </button>
                            <button
                                type="button"
                                className="vo-review-person__action-btn"
                                onClick={() => removePerson(person.id)}
                                title="Remove person"
                            >
                                <TrashIcon />
                            </button>
                        </div>
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

    const jobAddedLabel = formatJobAddedLabel(selectedPendingJob?.created_at);

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
                            onClick={() => navigate('/talent/job-agent')}
                        >
                            Back to Dashboard
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // Show pending jobs selection (when multiple jobs and none selected)
    if (!selectedJobId && pendingJobs.length > 0) {
        return (
            <div
                className={`verify-outreach-container vo-pending-picker${isEmbedded ? ' vo-pending-picker--embedded' : ''
                    }`}
            >
                <header className="vo-pending-picker__head">
                    <div className="vo-pending-picker__head-copy">
                        <h1 id="vo-pending-picker-title" className="vo-pending-picker__title">
                            Your Pending manual outreach
                        </h1>
                        <p className="vo-pending-picker__subtitle">
                            Select a job to review and approve outreach persons
                        </p>
                    </div>
                    {isEmbedded ? (
                        <button
                            type="button"
                            className="vo-pending-picker__close"
                            aria-label="Close"
                            onClick={onClose}
                        >
                            <PendingPickerCloseIcon />
                        </button>
                    ) : null}
                </header>

                <div className="vo-pending-picker__intro">
                    <img
                        src={PENDING_PICKER_MASCOT_SRC}
                        alt=""
                        className="vo-pending-picker__mascot"
                        width={54}
                        height={56}
                        aria-hidden
                    />
                    <div className="vo-pending-picker__callout" role="note">
                        <p className="vo-pending-picker__callout-title">About pending jobs</p>
                        <p className="vo-pending-picker__callout-text">
                            This status means you need to manually click each job to run the agent. Since the
                            agent is in Manual Mode, each run moves the job to Pending Request, where you&apos;ll
                            need to confirm before outreach begins.
                        </p>
                    </div>
                </div>

                <div className="vo-pending-picker__grid">
                    {pendingJobs.map((job) => (
                        <article key={job.id} className="vo-pending-picker__card">
                            <div className="vo-pending-picker__card-top">
                                <img
                                    src={job.company_logo || '/images/default-company.png'}
                                    alt=""
                                    className="vo-pending-picker__logo"
                                    width={24}
                                    height={24}
                                    onError={(e) => {
                                        e.target.src = '/images/default-company.png';
                                    }}
                                />
                                <span className="vo-pending-picker__date">
                                    <ClockIcon />
                                    {formatJobAddedLabel(job.created_at)}
                                </span>
                            </div>
                            <div className="vo-pending-picker__card-main">
                                <h2 className="vo-pending-picker__job-title">{job.job_title}</h2>
                                <p className="vo-pending-picker__company">{job.company_name}</p>
                            </div>
                            <div className="vo-pending-picker__card-foot">
                                <span className="vo-pending-picker__contacts">
                                    {formatPendingContactLabel(job.pending_count)}
                                </span>
                                <button
                                    type="button"
                                    className="vo-pending-picker__review-btn"
                                    onClick={() => loadJobDetails(job.id)}
                                >
                                    Review
                                    <PendingReviewArrowIcon />
                                </button>
                            </div>
                        </article>
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
                            onClick={() => navigate('/talent/job-agent')}
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`verify-outreach-container vo-review-detail${isEmbedded ? ' vo-review-detail--embedded' : ''
                }`}
        >
            <header className="vo-review-detail__head">
                <div className="vo-review-detail__head-top">
                    <h1 id="vo-review-detail-title" className="vo-review-detail__title">
                        Review and approve the people we&apos;ll reach out to for this job
                    </h1>
                    {isEmbedded ? (
                        <button
                            type="button"
                            className="vo-review-detail__close"
                            aria-label="Close"
                            onClick={onClose}
                        >
                            <PendingPickerCloseIcon />
                        </button>
                    ) : null}
                </div>
                <div className="vo-review-detail__stats">
                    <div className="vo-review-detail__stat vo-review-detail__stat--total">
                        <span className="vo-review-detail__stat-value">{counts.total}</span>
                        <span className="vo-review-detail__stat-label">Total contacts</span>
                    </div>
                    <div className="vo-review-detail__stat vo-review-detail__stat--linkedin">
                        <span className="vo-review-detail__stat-value">{counts.linkedin}</span>
                        <span className="vo-review-detail__stat-label">LinkedIn Outreach</span>
                    </div>
                    <div className="vo-review-detail__stat vo-review-detail__stat--gmail">
                        <span className="vo-review-detail__stat-value">{counts.gmail}</span>
                        <span className="vo-review-detail__stat-label">Gmail Outreach</span>
                    </div>
                </div>
            </header>

            <div className="vo-review-detail__scroll">
                <article className="vo-review-detail__job-card">
                    <div className="vo-review-detail__job-main">
                        <img
                            src={jobInfo.companyLogo || '/images/default-company.png'}
                            alt=""
                            className="vo-review-detail__job-logo"
                            width={32}
                            height={32}
                            onError={(e) => {
                                e.target.src = '/images/default-company.png';
                            }}
                        />
                        <div className="vo-review-detail__job-copy">
                            <h2 className="vo-review-detail__job-title">{jobInfo.title}</h2>
                            <p className="vo-review-detail__job-company">{jobInfo.company}</p>
                        </div>
                    </div>
                    <div className="vo-review-detail__job-foot">
                        <span className="vo-review-detail__job-date">
                            <ClockIcon />
                            {jobAddedLabel}
                        </span>
                        <div className="vo-review-detail__job-foot-end">
                            <span className="vo-review-detail__status-pill">
                                <span className="vo-review-detail__status-dot" aria-hidden />
                                Review Pending
                            </span>
                            {jobInfo.applyUrl ? (
                                <a
                                    href={jobInfo.applyUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="vo-review-detail__view-job"
                                >
                                    View Job
                                    <PendingReviewArrowIcon />
                                </a>
                            ) : null}
                        </div>
                    </div>
                </article>

                {pendingJobs.length > 0 ? (
                    <div className="vo-other-jobs-section vo-other-jobs-section--happpy">
                        <div className="vo-other-jobs-header">
                            <span>Other Pending Jobs</span>
                            <span className="vo-other-jobs-count">{pendingJobs.length}</span>
                        </div>
                        <div className="vo-other-jobs-list">
                            {pendingJobs.map((job) => (
                                <div
                                    key={job.id}
                                    className="vo-other-job-card"
                                    onClick={() => loadJobDetails(job.id)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') loadJobDetails(job.id);
                                    }}
                                    role="button"
                                    tabIndex={0}
                                >
                                    <img
                                        src={job.company_logo || '/images/default-company.png'}
                                        alt=""
                                        className="vo-other-job-logo"
                                        onError={(e) => {
                                            e.target.src = '/images/default-company.png';
                                        }}
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
                ) : null}

                <section className="vo-review-detail__people" aria-label="People to reach out to">
                    <div className="vo-review-detail__people-head">
                        <h3 className="vo-review-detail__people-title">People to reach out to</h3>
                        <span className="vo-review-detail__people-count">
                            {formatContactsSelectedLabel(counts.total)}
                        </span>
                    </div>

                    <div className="vo-review-detail__people-list">
                        {getActivePersons().map((person) => renderPersonCard(person))}

                        {counts.total === 0 ? (
                            <div className="vo-review-detail__people-empty">
                                <UserIcon />
                                <h4>No contacts selected</h4>
                                <p>All contacts have been removed. Recover them from the list below.</p>
                            </div>
                        ) : null}

                    </div>

                    <div className="vo-review-detail__people-list">
                        <div className={`vo-removed-section vo-removed-section--happpy ${counts.removed > 0 ? 'show' : ''}`}>
                            <div className="vo-removed-section-header">
                                <h4>
                                    <TrashIcon />
                                    Removed contacts
                                    <span className="vo-removed-count">{counts.removed}</span>
                                </h4>
                            </div>
                            {getRemovedPersons().map((person) => (
                                <div key={person.id} className="vo-removed-person-item">
                                    <div className="vo-removed-person-avatar">{getInitials(person.name)}</div>
                                    <div className="vo-removed-person-info">
                                        <div className="vo-removed-person-name">{person.name}</div>
                                        <div className="vo-removed-person-title">{person.title}</div>
                                    </div>
                                    <button
                                        type="button"
                                        className="vo-btn-recover"
                                        onClick={() => recoverPerson(person.id)}
                                    >
                                        <RecoverIcon />
                                        Recover
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <p className="vo-review-detail__disclaimer">
                    <InfoIcon size={16} />
                    <span>
                        Once confirmed, our Happpy Agent will reach out to these contacts on your behalf. This
                        action cannot be undone.
                    </span>
                </p>

                <div className="vo-review-detail__templates">
                    <p className="vo-review-detail__templates-label">Master Message Templates</p>
                    <div className="vo-review-detail__templates-actions">
                        <button
                            type="button"
                            className="vo-review-detail__template-btn vo-review-detail__template-btn--linkedin"
                            onClick={() => {
                                setEditedTemplates(masterTemplates);
                                setMasterTemplatesModal('linkedin');
                            }}
                        >
                            <LinkedInIcon size={16} />
                            Edit template
                        </button>
                        <button
                            type="button"
                            className="vo-review-detail__template-btn vo-review-detail__template-btn--gmail"
                            onClick={() => {
                                setEditedTemplates(masterTemplates);
                                setMasterTemplatesModal('gmail');
                            }}
                        >
                            <GmailIcon size={16} />
                            Edit template
                        </button>
                    </div>
                </div>
            </div>

            <footer className="vo-review-detail__foot">
                {pendingJobs.length > 0 ? (
                    <button
                        type="button"
                        className="vo-review-detail__back"
                        aria-label="Back to job list"
                        onClick={backToJobSelection}
                    >
                        <ReviewFooterBackIcon />
                    </button>
                ) : (
                    <span className="vo-review-detail__foot-spacer" aria-hidden />
                )}
                <div className="vo-review-detail__foot-actions">
                    {Object.keys(persons).length > 0 ? (
                        <button
                            type="button"
                            className="vo-review-detail__discard"
                            onClick={() => {
                                setSelectedFeedback('');
                                setFeedbackText('');
                                setDiscardModal(true);
                            }}
                        >
                            Discard Job
                        </button>
                    ) : null}
                    <button
                        type="button"
                        className="vo-review-detail__send"
                        onClick={submitOutreach}
                        disabled={counts.total === 0 || isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="vo-loading-spinner vo-review-detail__send-spinner" />
                                Sending…
                            </>
                        ) : (
                            <>
                                <span className="vo-review-detail__send-label vo-review-detail__send-label--desktop">
                                    Send outreach request
                                </span>
                                <span className="vo-review-detail__send-label vo-review-detail__send-label--mobile">
                                    Send requests
                                </span>
                                <PendingReviewArrowIcon size={20} />
                            </>
                        )}
                    </button>
                </div>
            </footer>

            {/* LinkedIn master template modal (same shell as Gmail 3238:63497) */}
            <div
                className={`vo-modal-overlay vo-master-template-overlay${masterTemplatesModal === 'linkedin' ? ' active' : ''
                    }`}
                onClick={() => setMasterTemplatesModal(null)}
            >
                <div
                    className="vo-master-template-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="vo-linkedin-master-template-title"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="vo-master-template-modal__body">
                        <div className="vo-master-template-modal__head-row">
                            <div className="vo-master-template-modal__intro">
                                <div className="vo-master-template-modal__linkedin-mark" aria-hidden>
                                    <LinkedInIcon size={31} />
                                </div>
                                <div className="vo-master-template-modal__head-copy">
                                    <h2 id="vo-linkedin-master-template-title" className="vo-master-template-modal__title">
                                        Edit Master Template for LinkedIn
                                    </h2>
                                    <p className="vo-master-template-modal__subtitle">
                                        This template is used as default for all LinkedIn outreach messages on this job
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="vo-master-template-modal__close"
                                aria-label="Close"
                                onClick={() => setMasterTemplatesModal(null)}
                            >
                                <PendingPickerCloseIcon />
                            </button>
                        </div>

                        <div className="vo-master-template-modal__fields">
                            <div className="vo-master-template-modal__message-field">
                                <label className="vo-edit-message-modal__field-label" htmlFor="vo-linkedin-master-message">
                                    Message
                                </label>
                                <div className="vo-edit-message-modal__editor" id="vo-linkedin-master-message">
                                    <TemplateEditor
                                        variant="tall"
                                        value={editedTemplates.linkedinMessage || ''}
                                        onChange={(content) => setEditedTemplates(prev => ({ ...prev, linkedinMessage: content }))}
                                        placeholder="Write your LinkedIn message..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <footer className="vo-master-template-modal__foot">
                        <button
                            type="button"
                            className="vo-master-template-modal__save"
                            onClick={saveMasterTemplates}
                        >
                            Save changes
                            <PendingReviewArrowIcon size={20} />
                        </button>
                    </footer>
                </div>
            </div>

            {/* Gmail master template modal (Figma 3238:63497) */}
            <div
                className={`vo-modal-overlay vo-master-template-overlay${masterTemplatesModal === 'gmail' ? ' active' : ''
                    }`}
                onClick={() => setMasterTemplatesModal(null)}
            >
                <div
                    className="vo-master-template-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="vo-gmail-master-template-title"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="vo-master-template-modal__body">
                        <div className="vo-master-template-modal__head-row">
                            <div className="vo-master-template-modal__intro">
                                <div className="vo-master-template-modal__gmail-mark" aria-hidden>
                                    <GmailIcon size={31} />
                                </div>
                                <div className="vo-master-template-modal__head-copy">
                                    <h2 id="vo-gmail-master-template-title" className="vo-master-template-modal__title">
                                        Edit Master Template for Gmail
                                    </h2>
                                    <p className="vo-master-template-modal__subtitle">
                                        This template is used as default for all Gmail outreach messages on this job
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="vo-master-template-modal__close"
                                aria-label="Close"
                                onClick={() => setMasterTemplatesModal(null)}
                            >
                                <PendingPickerCloseIcon />
                            </button>
                        </div>

                        <div className="vo-master-template-modal__fields">
                            <div className="vo-edit-message-modal__subject-field">
                                <label className="vo-edit-message-modal__field-label" htmlFor="vo-gmail-master-subject">
                                    Email Subject
                                </label>
                                <input
                                    id="vo-gmail-master-subject"
                                    type="text"
                                    className="vo-edit-message-modal__subject"
                                    value={editedTemplates.gmailSubject}
                                    onChange={e => setEditedTemplates(prev => ({ ...prev, gmailSubject: e.target.value }))}
                                    placeholder="Could you refer me for {{title}} at {{company}}?"
                                />
                            </div>
                            <div className="vo-master-template-modal__message-field">
                                <label className="vo-edit-message-modal__field-label" htmlFor="vo-gmail-master-message">
                                    Message
                                </label>
                                <div className="vo-edit-message-modal__editor" id="vo-gmail-master-message">
                                    <TemplateEditor
                                        variant="tall"
                                        value={editedTemplates.gmailMessage || ''}
                                        onChange={(content) => setEditedTemplates(prev => ({ ...prev, gmailMessage: content }))}
                                        placeholder="Write your Gmail message..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <footer className="vo-master-template-modal__foot">
                        <button
                            type="button"
                            className="vo-master-template-modal__save"
                            onClick={saveMasterTemplates}
                        >
                            Save changes
                            <PendingReviewArrowIcon size={20} />
                        </button>
                    </footer>
                </div>
            </div>

            {renderEditMessageModal()}

            {/* Discard Modal */}
            <div
                className={`vo-modal-overlay vo-discard-overlay${discardModal ? ' active' : ''}`}
                onClick={() => !isDiscarding && setDiscardModal(false)}
            >
                <div
                    className="vo-discard-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="vo-discard-modal-title"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="vo-discard-modal__body">
                        <div className="vo-discard-modal__top">
                            <header className="vo-discard-modal__head">
                                <h2 id="vo-discard-modal-title" className="vo-discard-modal__title">
                                    Discard this job?
                                </h2>
                                <p className="vo-discard-modal__subtitle">
                                    Help us improve by telling us why you&apos;re skipping this job
                                </p>
                            </header>
                            <button
                                type="button"
                                className="vo-discard-modal__close"
                                aria-label="Close"
                                disabled={isDiscarding}
                                onClick={() => setDiscardModal(false)}
                            >
                                <PendingPickerCloseIcon />
                            </button>
                        </div>
                        <div className="vo-discard-modal__options" role="radiogroup" aria-labelledby="vo-discard-modal-title">
                            {DISCARD_FEEDBACK_OPTIONS.map(option => {
                                const isSelected = selectedFeedback === option.value;
                                return (
                                    <label
                                        key={option.value}
                                        className={`vo-discard-modal__option${isSelected ? ' is-selected' : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            name="vo-discard-feedback"
                                            value={option.value}
                                            checked={isSelected}
                                            onChange={() => setSelectedFeedback(option.value)}
                                        />
                                        <span className="vo-discard-modal__radio" aria-hidden />
                                        <span className="vo-discard-modal__option-label">{option.label}</span>
                                    </label>
                                );
                            })}
                        </div>
                        <textarea
                            className="vo-discard-modal__comments"
                            placeholder="Additional comments (optional)..."
                            value={feedbackText}
                            onChange={e => setFeedbackText(e.target.value)}
                            rows={4}
                        />
                    </div>
                    <footer className="vo-discard-modal__foot">
                        <button
                            type="button"
                            className="vo-discard-modal__submit"
                            onClick={confirmDiscard}
                            disabled={isDiscarding || !selectedFeedback}
                        >
                            {isDiscarding ? (
                                <>
                                    <span className="vo-loading-spinner vo-discard-modal__submit-spinner" aria-hidden />
                                    Discarding…
                                </>
                            ) : (
                                'Discard job'
                            )}
                        </button>
                    </footer>
                </div>
            </div>

            {/* Confirm Send Outreach Modal — disabled for now; footer calls submitOutreach directly
            <div className={`vo-modal-overlay ${confirmSendModal ? 'active' : ''}`} onClick={() => !isSubmitting && setConfirmSendModal(false)}>
                ...
            </div>
            */}

            <div
                className={`vo-modal-overlay vo-outreach-sent-overlay${isCompleted ? ' active' : ''}`}
                onClick={dismissOutreachSentModal}
                role="presentation"
            >
                <div
                    className="vo-outreach-sent-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="vo-outreach-sent-title"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        type="button"
                        className="vo-outreach-sent-modal__close"
                        aria-label="Close"
                        onClick={dismissOutreachSentModal}
                    >
                        <PendingPickerCloseIcon />
                    </button>

                    <div className="vo-outreach-sent-modal__hero">
                        <img
                            src={OUTREACH_SENT_MASCOT_SRC}
                            alt=""
                            className="vo-outreach-sent-modal__mascot"
                        />
                        <div className="vo-outreach-sent-modal__intro">
                            <h2 id="vo-outreach-sent-title" className="vo-outreach-sent-modal__title">
                                Outreach requests sent!
                            </h2>
                            <p className="vo-outreach-sent-modal__subtitle">
                                Your HAPPPY Agent is now reaching out to your selected contacts
                            </p>
                            <div className="vo-outreach-sent-modal__badge">
                                <span className="vo-outreach-sent-modal__badge-count">{completionStats.created}</span>
                                <span className="vo-outreach-sent-modal__badge-label">Requests sent</span>
                            </div>
                            {completionStats.skipped > 0 ? (
                                <p className="vo-outreach-sent-modal__skipped">
                                    {completionStats.skipped} contact{completionStats.skipped === 1 ? '' : 's'} skipped
                                </p>
                            ) : null}
                        </div>
                    </div>

                    <div className="vo-outreach-sent-modal__job">
                        <div className="vo-outreach-sent-modal__job-head">Job Details</div>
                        <div className="vo-outreach-sent-modal__job-body">
                            <img
                                src={jobInfo.companyLogo || '/images/default-company.png'}
                                alt=""
                                className="vo-outreach-sent-modal__job-logo"
                                width={48}
                                height={48}
                                onError={(e) => {
                                    e.target.src = '/images/default-company.png';
                                }}
                            />
                            <div className="vo-outreach-sent-modal__job-copy">
                                <h3 className="vo-outreach-sent-modal__job-title">{jobInfo.title}</h3>
                                <p className="vo-outreach-sent-modal__job-company">{jobInfo.company}</p>
                                {outreachSentJobMeta ? (
                                    <p className="vo-outreach-sent-modal__job-meta">{outreachSentJobMeta}</p>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    <div className="vo-outreach-sent-modal__info">
                        <OutreachSentInfoIcon />
                        <p>
                            Our agent will send messages within 10-30 mins. You&apos;ll receive notifications on any responses
                        </p>
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
