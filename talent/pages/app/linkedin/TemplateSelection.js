import { useEffect, useState } from "react";
import { ActivateAgentIcon, BrowseJobsIcon, DeleteIcon2, EditIcon2, GmailIcon, LinkAccountIcon, OutreachAgentIcon } from '../../../assets/IconSVG';
import { useDispatch } from "react-redux";
import { getOutreachTemplates, saveOutreachTemplate } from "../../../store/actions/UserActions";
import TemplateEditor from "./TemplateEditor";
import { toast } from 'react-hot-toast';
import axios from 'axios';

const TemplateSelection = ({ outreachStepConfig, onAfterTemplateSave }) => {
    
    const dispatch = useDispatch();
    const [templates, setTemplates] = useState({
        linkedin_template: '',
        gmail_template: ''
    });
    const [templateType, setTemplateType] = useState(null);
    const [defaultTemplates, setDefaultTemplates] = useState({
        linkedin_template: [],
        gmail_template: []
    });
    const [selectedDefaultTemplate, setSelectedDefaultTemplate] = useState(null);

    const [customTemplate, setCustomTemplate] = useState({
        title: '',
        message_template: '',
        active: false
    });
    const [customTemplateErrors, setCustomTemplateErrors] = useState({});
    const [templateAppliedAt, setTemplateAppliedAt] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDefaultTemplatesLoading, setIsDefaultTemplatesLoading] = useState(false);
    const [linkedinStatus, setLinkedinStatus] = useState(null);
    const [gmailStatus, setGmailStatus] = useState(null);
    const [errorMessageText, setErrorMessageText] = useState(null);
    const [setupComplete, setSetupComplete] = useState(false);


    useEffect(() => {
        // Auto-select Gmail Template (2) by default when user visits
        setTemplateType(2);
    }, []);

    const handleEditTemplate = () => {
        const currentTemplate = templateType === 1 ? templates.linkedin_template : templates.gmail_template;
        setCustomTemplate({ 
            title: '', 
            message_template: currentTemplate || '', 
            provider: templateType, 
            active: false 
        });
        setTemplateAppliedAt(new Date());
        setCustomTemplateErrors({});
    };

    const validateTemplate = (template) => {
        const newErrors = {};
        const _customTemplate = template || customTemplate;
        if (!_customTemplate.title && templateType == 2) {
            newErrors.title = 'Subject is required';
        }
        if (!_customTemplate.message_template) {
            newErrors.message_template = 'Template is required';
        }

        const missingFields = varFields.filter(field => !_customTemplate?.message_template?.includes(field));
        if (missingFields.length > 0) {
            newErrors['message_template'] = `${missingFields.join(', ')} is required`;
        }

        setCustomTemplateErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveTemplate = async () => {

        setErrorMessageText(null);
        
        if (!validateTemplate()) return;

        setIsLoading(true);
        const payload = {
            message_template: customTemplate.message_template || '',
            message_subject: customTemplate.title || '',
            provider: templateType,
        }

        try {
            const res = await dispatch(saveOutreachTemplate(payload));
            setIsLoading(false);
            if (res?.data?.status === "success") {
                toast.success('Template saved successfully');
                setSetupComplete(true);
                if (typeof onAfterTemplateSave === 'function') {
                    onAfterTemplateSave();
                }
                // Scroll to top to show completion message (with delay for DOM update)
                setTimeout(() => {
                    const completionMessage = document.querySelector('.manage-templates-section-wrapper');
                    if (completionMessage) {
                        completionMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 100);
            }
            else if (res?.data?.status === "error") {
                toast.error(res?.data?.message);
                setErrorMessageText(res?.data?.message);
            }
            else {
                toast.error(res?.data?.message || 'Something went wrong. Please try again.');
            }
        } catch (err) {
            console.log("err", err);
            setIsLoading(false);
            toast.error('Something went wrong. Please try again.');
            setErrorMessageText('Something went wrong. Please try again.');
        }
        finally {
            setIsLoading(false);
        }
    };


 
    const varFields = ["{{outreachEmployeeName}}", "{{jobTitle}}", "{{companyName}}", "{{jobLink}}"];

    const handleCustomTemplateChange = (name, value) => {
        setCustomTemplate(prev => ({ ...prev, [name]: value }));
        setTemplateAppliedAt(new Date());
    };


    // fetch templates
    const fetchTemplates = () => {
        setIsLoading(true);
        dispatch(getOutreachTemplates())
            .then((res) => {
                setTemplates(res?.data?.data || { linkedin_template: '', gmail_template: '' });
            })
            .catch((err) => {
                console.log("err", err);
                toast.error('Something went wrong. Please try again.');
            })
            .finally(() => {
                setIsLoading(false);
            });
    }

    // fetch default templates
    const fetchDefaultTemplates = () => {
        setIsDefaultTemplatesLoading(true);
        axios.get('/api/talent/outreach/default-auto-templates')
            .then((res) => {
                setDefaultTemplates(res?.data?.data || { linkedin_template: [], gmail_template: [] });
            })
            .catch((err) => {
                console.log("err", err);
                toast.error('Something went wrong. Please try again.');
            })
            .finally(() => {
                setIsDefaultTemplatesLoading(false);
            });
    }

    // handle default template selection
    const handleDefaultTemplateSelect = (template) => {
        setSelectedDefaultTemplate(template);
        setCustomTemplate({
            title: template.title || '',
            message_template: template.message_template || '',
            provider: templateType,
            active: false
        });
        setTemplateAppliedAt(new Date());
        setCustomTemplateErrors({});
        
        // Show success message
        toast.success('Template loaded successfully! You can now customize it.');
    }

    // get preview text for template
    const getTemplatePreview = (template) => {
        if (!template || !template.message_template) return '';
        // Remove HTML tags and get first 100 characters
        const textContent = template.message_template.replace(/<[^>]*>/g, '');
        return textContent.length > 100 ? textContent.substring(0, 100) + '...' : textContent;
    }

    // scroll to template editor
    const scrollToTemplateEditor = () => {
        const templateEditor = document.getElementById('custom-template-wrapper');
        if (templateEditor) {
            templateEditor.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    useEffect(() => {
        fetchTemplates();
        fetchDefaultTemplates();
    }, []);

    // Sync editor from saved template, or default to first default template when body is empty
    useEffect(() => {
        if (!templateType) return;
        const templateKey = templateType === 1 ? 'linkedin_template' : 'gmail_template';
        const currentBody = (templateType === 1 ? templates.linkedin_template : templates.gmail_template) || '';
        const currentSubject = templateType === 1 ? templates.linkedin_template_subject : templates.gmail_template_subject;
        const availableTemplates = defaultTemplates[templateKey];
        const bodyEmpty = !currentBody.trim();

        if (bodyEmpty && availableTemplates?.length > 0) {
            const firstTemplate = availableTemplates[0];
            setSelectedDefaultTemplate(firstTemplate);
            setCustomTemplate({
                title: firstTemplate.title || '',
                message_template: firstTemplate.message_template || '',
                provider: templateType,
                active: false
            });
        } else {
            if (bodyEmpty) setSelectedDefaultTemplate(null);
            setCustomTemplate({
                title: currentSubject || '',
                message_template: currentBody,
                provider: templateType,
                active: false
            });
        }
        setTemplateAppliedAt(new Date());
        setCustomTemplateErrors({});
    }, [templateType, templates, defaultTemplates]);

    return (
        <div className='manage-templates-section-wrapper'>
        <div className="manage-templates-section">
            {setupComplete ? (
                <div className="template-complete-compact">
                    <div className="template-complete-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="white"/>
                        </svg>
                    </div>
                    <div className="template-complete-content">
                        <h3>{templateType === 2 ? 'Gmail Template Saved!' : 'All Steps Completed!'} 🎉</h3>
                        <p>{templateType === 2 ? 'Your Gmail template has been saved successfully.' : 'Your outreach setup is complete. Messages will now be sent automatically.'}</p>
                        <div className="template-complete-actions" style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            {templateType === 2 && (
                                <button 
                                    type="button" 
                                    className="go-to-linkedin-btn"
                                    onClick={() => {
                                        setSetupComplete(false);
                                        setTemplateType(1);
                                    }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '10px 20px',
                                        backgroundColor: '#0077B5',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="white"/>
                                    </svg>
                                    Now Update LinkedIn Template
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ) : null}

            {!setupComplete && (
            <>
            {/* <div className="section-header">
                <h2>Manage Templates</h2>
                <p>Choose a template type, customize it with your data, and preview the results</p>
            </div> */}

            <div className='template-type-toggle mt-4'>
                <button type='button' className={`tt-btn ${templateType == 2 ? "active" : ""}`} disabled={gmailStatus?.status != 2 && false} 
                onClick={() => setTemplateType(2)}>
                    <GmailIcon />
                    Gmail Template
                </button>
                <button type='button' className={`tt-btn ${templateType == 1 ? "active" : ""}`} disabled={linkedinStatus?.status != 2 && false} onClick={() => setTemplateType(1)}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="#0077B5"/>
                    </svg>
                    Linkedin Template
                </button>
            </div>


            {/* Default Template Selection - Compact Horizontal */}
            {templateType && (
                <div className='default-templates-section-compact'>
                    <div className='default-templates-header-compact'>
                        {isDefaultTemplatesLoading ? (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: '16px',
                                width: '100%'
                            }}>
                                <div style={{
                                    width: '24px',
                                    height: '24px',
                                    border: '3px solid #f3f3f3',
                                    borderTop: '3px solid #667eea',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }}></div>
                                <span style={{ marginLeft: '10px', color: '#666', fontSize: '14px' }}>Loading templates...</span>
                                <style>{`
                                    @keyframes spin {
                                        0% { transform: rotate(0deg); }
                                        100% { transform: rotate(360deg); }
                                    }
                                `}</style>
                            </div>
                        ) : defaultTemplates[templateType === 1 ? 'linkedin_template' : 'gmail_template']?.length > 0 ? (
                        <div className='default-templates-scroll'>
                            {/* Start from Scratch Option */}
                            <button 
                                type="button"
                                className={`template-pill ${selectedDefaultTemplate === 'scratch' ? 'selected' : ''}`}
                                onClick={() => {
                                    setSelectedDefaultTemplate('scratch');
                                    setCustomTemplate({
                                        title: '',
                                        message_template: '',
                                        provider: templateType,
                                        active: false
                                    });
                                    setTemplateAppliedAt(new Date());
                                    setCustomTemplateErrors({});
                                }}
                            >
                                <span className="template-pill-icon">✏️</span>
                                <span>Start from Scratch</span>
                            </button>

                            {/* Default Templates as Pills */}
                            {defaultTemplates[templateType === 1 ? 'linkedin_template' : 'gmail_template'].map((template, index) => (
                                <button 
                                    type="button"
                                    key={template.id || index}
                                    className={`template-pill ${selectedDefaultTemplate?.id === template.id ? 'selected' : ''}`}
                                    onClick={() => handleDefaultTemplateSelect(template)}
                                >
                                    {selectedDefaultTemplate?.id === template.id && (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    )}
                                    <span>{template.title}</span>
                                </button>
                            ))}
                        </div>
                        ) : null}
                    </div>
                </div>
            )}

            {templateType && (
            <div id='custom-template-wrapper' className='custom-template-wrapper compact'>
                <form>
                    {templateType == 2 && (
                    <div className='form-group'>
                        <label className='form-label required-label'>Subject</label>
                        <input type='text' value={customTemplate?.title} onChange={(e) => handleCustomTemplateChange('title', e.target.value)} className='form-control' placeholder='Enter template name' />
                        {customTemplateErrors.title && <p className='error'>{customTemplateErrors.title}</p>}
                    </div>
                    )}
                    <div className='form-group'>
                        <label className='form-label required-label'>Template</label>
                        <TemplateEditor
                            placeholder="Type here..."
                            value={customTemplate?.message_template || ''}
                            onChange={(content) => handleCustomTemplateChange('message_template', content)}
                            hasError={!!customTemplateErrors.message_template}
                            dynamicFields={varFields}
                            showDynamicDropdowns={true}
                            templateAppliedAt={templateAppliedAt}
                        />
                        {errorMessageText && <p className='error' style={{ color: 'red', fontSize: '15px', marginTop: '4px' }}>{errorMessageText}</p>}
                    </div>
                </form>
                {/* Show Error Here */}
                {customTemplateErrors.message_template && <p className='error'>{customTemplateErrors.message_template}</p>}
                <div className="template-save-footer">
                    <div className="button-group-outreach-agent">
                        {templateType === 1 && !outreachStepConfig?.step1?.linkedin_connected ? (
                            <p className="step4-linkedin-connect-message text-bold jad-text-bold text-danger"  >
                                You can’t update the LinkedIn template because you haven’t connected LinkedIn with the agent. However, no worries—it’s optional, and you can still use the agent without it.
                            </p>
                        ) : (
                            <button 
                                type='button' 
                                className='save-template-btn' 
                                onClick={handleSaveTemplate}
                                disabled={isLoading}
                                style={{
                                    opacity: isLoading ? 0.7 : 1,
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                {isLoading && (
                                    <span style={{
                                        width: '16px',
                                        height: '16px',
                                        border: '2px solid #ffffff',
                                        borderTopColor: 'transparent',
                                        borderRadius: '50%',
                                        animation: 'spin 0.8s linear infinite',
                                        display: 'inline-block'
                                    }}></span>
                                )}
                                {isLoading ? 'Saving...' : 'Save Template'}
                            </button>
                        )}
                    </div>
                    {templateType === 2 && (
                        <aside className="template-email-note" role="note">
                            <div className="template-email-note__icon" aria-hidden="true">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 16V12M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <div className="template-email-note__body">
                                <p className="template-email-note__title">How Happpy Agent find work emails</p>
                                <p>
                                    Happpy Agent looks up each outreach contact&apos;s{' '}
                                    <strong>official work email</strong> using Lusha, Apollo, ContactOut, and SignalHire. The same information is available across many B2B tools and APIs that resolve business emails from a
                                    LinkedIn profile URL or company name. If a contact asks how we have their address, you can explain it
                                    comes from these widely used professional data platforms not a personal or guessed inbox.
                                </p>
                            </div>
                        </aside>
                    )}
                </div>
            </div>
            )}
            </>
            )}
        </div>
    </div>
    )
}

export default TemplateSelection;