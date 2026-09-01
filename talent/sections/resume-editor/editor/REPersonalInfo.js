import { useEffect, useState } from "react";
import { ArrowDownIcon, EmailIcon, GithubIcon, LinkedInIcon, LocationIcon, PhoneIcon, WebIcon } from "../ResumEditorIcons";

export default function REPersonalInfo({ expanded, setExpanded, resumeJson, setResumeJson }) {
    const [formValue, setFormValue] = useState(resumeJson.basic_details || {});

    useEffect(() => {
        setFormValue(resumeJson.basic_details || {});
    }, []);

    const handleExpand = () => {
        if (expanded === 'basic_details') {
            setExpanded('');
        } else {
            setExpanded('basic_details');
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValue({ ...formValue, [name]: value });
    }

    useEffect(() => {
        setResumeJson({ ...resumeJson, basic_details: { ...resumeJson.basic_details, ...formValue } });
    }, [formValue]);


    return (
        <div className="re-section basic-details">
            <div className="re-section-head" onClick={handleExpand}>
                <h6>Basic Details</h6>
                <div className="re-section-head-actions">
                    <span className={`expand-icon ${expanded === "basic_details" ? "expanded" : ""}`}>
                        <ArrowDownIcon />
                    </span>
                </div>
            </div>
            {expanded === 'basic_details' && (
                <div className="re-section-content">
                    <input
                        data-editor-item-id="re$basic_details$name"
                        type="text" placeholder="Name..." name="name"
                        defaultValue={formValue.name} onBlur={handleInputChange}
                    />
                    <input
                        data-editor-item-id="re$basic_details$current_job_title"
                        type="text" placeholder="Current Job Title..." name="current_job_title"
                        defaultValue={formValue.current_job_title} onBlur={handleInputChange}
                    />

                    <div className="flex-row">
                        <div className="re-input-with-icon">
                            <span className="icon">
                                <EmailIcon />
                            </span>
                            <input
                                data-editor-item-id="re$basic_details$email"
                                type="email" placeholder="Email..." name="email"
                                defaultValue={formValue.email} onBlur={handleInputChange}
                            />
                        </div>
                        <div className="re-input-with-icon">
                            <span className="icon">
                                <PhoneIcon />
                            </span>
                            <input
                                data-editor-item-id="re$basic_details$phone"
                                type="text" placeholder="Phone..." name="phone"
                                defaultValue={formValue.phone} onBlur={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className="re-input-with-icon">
                        <span className="icon">
                            <LocationIcon />
                        </span>
                        <input
                            data-editor-item-id="re$basic_details$location"
                            type="text" placeholder="Location..." name="location"
                            defaultValue={formValue.location} onBlur={handleInputChange}
                        />
                    </div>
                    <div className="flex-column">
                        <div className="re-input-with-icon">
                            <span className="icon">
                                <LinkedInIcon />
                            </span>
                            <input
                                data-editor-item-id="re$basic_details$linkedinUrl"
                                type="text" placeholder="LinkedIn Link Text..." name="linkedinLinkText"
                                defaultValue={formValue.linkedinLinkText} onBlur={handleInputChange}
                            />
                        </div>
                        <hr />
                        <input type="text" placeholder="Linkedin URL, e.g.www.linkedin.com/in/your-id" name="linkedinUrl" defaultValue={formValue.linkedinUrl} onBlur={handleInputChange} />
                    </div>

                    <div className="flex-column">
                        <div className="re-input-with-icon">
                            <span className="icon">
                                <GithubIcon />
                            </span>
                            <input
                                data-editor-item-id="re$basic_details$githubUrl"
                                type="text" placeholder="Github Link Text..." name="githubLinkText"
                                defaultValue={formValue.githubLinkText} onBlur={handleInputChange}
                            />
                        </div>
                        <hr />
                        <input type="text" placeholder="Github URL, e.g.www.github.com/your-id" name="githubUrl" defaultValue={formValue.githubUrl} onBlur={handleInputChange} />
                    </div>
                    <div className="flex-column">
                        <div className="re-input-with-icon">
                            <span className="icon">
                                <WebIcon />
                            </span>
                            <input
                                data-editor-item-id={"re$basic_details$blogUrl"}
                                type="text" placeholder="Blog Link Text..." name="blogLinkText"
                                defaultValue={formValue.blogLinkText} onBlur={handleInputChange}
                            />
                        </div>
                        <hr />
                        <input type="text" placeholder="Blog URL, e.g.www.your-blog.com" name="blogUrl" defaultValue={formValue.blogUrl} onBlur={handleInputChange} />
                    </div>
                    <div className="flex-column">
                        <div className="re-input-with-icon">
                            <span className="icon">
                                <WebIcon />
                            </span>
                            <input

                                data-editor-item-id={"re$basic_details$portfolioUrl"}
                                type="text" placeholder="Other Link Text..." name="portfolioLinkText"
                                defaultValue={formValue.portfolioLinkText} onBlur={handleInputChange}
                            />
                        </div>
                        <hr />
                        <input type="text" placeholder="Other URL, e.g.www.your-site.com" name="portfolioUrl" defaultValue={formValue.portfolioUrl} onBlur={handleInputChange} />
                    </div>
                </div>
            )
            }
        </div>
    )
}

