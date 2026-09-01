import React, { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { isIOS } from "../../components/Helper";
import { trackTailorPreviewClicked } from "../../helpers/Mixpanel";
import { SET_EXPANDED_SECTION } from "../../store/actions/actionsTypes";
import MakeResumeCompact from "./MakeResumeCompact";
import { allDefaultSections } from "./ResumeEditorSections";
import { usePaginatedPreview } from "./usePaginatedPreview";

/* -------------------------------------------
   CONSTANTS
-------------------------------------------- */

const PAGE_HEIGHT = 1056; // A4 height in pixels at 96 DPI
const PAGE_WIDTH = 794;   // browser-css width in pixels at 96 DPI
const PAGE_SEPARATOR_HEIGHT = 20;
const EPSILON = 16;
const TOP_OFFSET = 40;

const getLineSpacing = (lineSpacingInput) => {
    const lineSpacing = lineSpacingInput - 8;
    switch (lineSpacing) {
        case 1:
            return 1.107;
        case 2:
            return 1.214;
        case 3:
            return 1.321;
        case 4:
            return 1.454;
        case 5:
            return 1.507;
        case 6:
            return 1.561;
        case 7:
            return 1.618;
        default:
            return 1.107;
    }
}

export default function ResumePreviewer({
    templateConfig, resumeJson: resumeData, sortingOrder, genericSections, tailorInputs, showMakeCompactBtn = false, transformedModal = false,
    reportTabActive, isMobile = false, handleTabChange, hidden = false, raPreview = false }) {

    const previewerRef = useRef(null);
    const dispatch = useDispatch();
    const flatedTailorJson = JSON.stringify(resumeData);
    const flatedConfigJson = JSON.stringify(templateConfig);
    const flatedSortingJson = JSON.stringify(sortingOrder);
    const { sourceRef, workspaceRef, pages } = usePaginatedPreview([flatedTailorJson, flatedSortingJson, flatedConfigJson], templateConfig.spacing.top_bottom_margin);

    const cssVariables = {
        '--rt-main-heading': templateConfig.font_size.main_heading + 'px',
        '--rt-section-heading': templateConfig.font_size.section_heading + 'px',
        '--rt-subheader': templateConfig.font_size.subheader + 'px',
        '--rt-body': templateConfig.font_size.body + 'px',
        '--rt-line-space': getLineSpacing(templateConfig.spacing.line_spacing),
        '--rt-item-space': templateConfig.spacing.item_spacing + 'pt',
        '--rt-section-space': templateConfig.spacing.section_spacing + 'pt',
        '--rt-tb-margin': templateConfig.spacing.top_bottom_margin + 'pt',
        '--rt-side-margin': templateConfig.spacing.side_margin + 'pt',
        '--rt-font-family': templateConfig.font_style,
        '--rt-theme-color': templateConfig.theme_color,
        '--rt-letter-spacing': templateConfig.font_style == 'Sentinel' ? '0.4px' : '0',
    }
    const zoomRatio = ((window.innerWidth - 32 - EPSILON) / PAGE_WIDTH);

    const canvasWidthPC = window.innerWidth - (raPreview ? 240 : 516) - EPSILON;
    const maxAllowedWidth = raPreview ? Math.min(1274, canvasWidthPC) : canvasWidthPC;
    const zoomRatioPC = (!raPreview && maxAllowedWidth > 794) ? 1 : maxAllowedWidth / PAGE_WIDTH;

    // On mobile: use transform-scale in a fixed-size wrapper to avoid iOS zoom bugs (text merging)
    // and to avoid extra blank space / horizontal scroll from naive scale.
    const totalContentHeight = (pages.length * PAGE_HEIGHT) + (Math.max(0, pages.length - 1) * PAGE_SEPARATOR_HEIGHT);
    const scale = isMobile ? zoomRatio : zoomRatioPC;
    const scaledHeight = totalContentHeight * scale;

    useEffect(() => {
        const workspace = previewerRef.current;
        if (!previewerRef) return;

        function handleClick(e) {
            e.stopPropagation();
            e.preventDefault();
            const targetItem = e.target.closest("[data-item-id]");
            if (!targetItem) return;

            const itemId = targetItem.dataset.itemId;
            const sectionId = itemId.split('$')[1];
            const preciseItemId = itemId.split('$')[2];
            const preciseBulletId = itemId.split('$')[3];

            openEditorFor(sectionId, preciseItemId, preciseBulletId);
        }

        workspace.addEventListener("click", handleClick);
        return () => workspace.removeEventListener("click", handleClick);
    }, []);

    function openEditorFor(sectionId, itemId = '', bulletId = '') {
        handleTabChange('editor');
        dispatch({ type: SET_EXPANDED_SECTION, payload: sectionId });
        trackTailorPreviewClicked(sectionId, bulletId ? true : false)
        if (!['basic_details', 'summary', 'technical_skills'].includes(sectionId)) {
            sessionStorage.setItem(`re$${sectionId}$${itemId}`, bulletId ? bulletId : 'true');
            setTimeout(() => {
                sessionStorage.removeItem(`re$${sectionId}$${itemId}`);
            }, 100);
        }

        // 3. Focus exact item
        setTimeout(() => {
            requestAnimationFrame(() => {
                let querySelect = `[data-editor-item-id="${'re$' + sectionId + '$' + itemId}"]`;
                if (bulletId) {
                    querySelect = `[data-editor-item-id="${'re$' + sectionId + '$' + itemId + '$' + bulletId}"]`;
                }
                const el = document.querySelector(querySelect);
                const editorSection = document.getElementById('re-editor-sections');
                let maxInnerHeight = window.innerHeight - 300;
                if (editorSection?.scrollHeight > maxInnerHeight && el) {
                    const editorRect = editorSection.getBoundingClientRect();
                    const elRect = el.getBoundingClientRect();

                    const itemTop =
                        elRect.top - editorRect.top + editorSection.scrollTop;

                    editorSection.scrollTo({
                        top: Math.max(itemTop - TOP_OFFSET, TOP_OFFSET),
                        behavior: "smooth"
                    });
                }
                el?.focus?.();
                setTimeout(() => {
                    el?.classList?.add('re-focus-item');
                }, 200)
                setTimeout(() => {
                    el?.classList?.remove('re-focus-item');
                }, 1300);
            });
        }, 100);
    }
    useEffect(() => {
        if (previewerRef.current && pages.length > 0) {
            let canvas = document.getElementById('resume-editor-canvas');
            let resumePreviewer = document.getElementById('resume-previewer');
            if (isIOS() && canvas) {
                canvas.style.transform = `scale(${scale})`;
                canvas.style.transformOrigin = 'top left';
                canvas.style.WebkitBackfaceVisibility = 'hidden';
                canvas.style.backfaceVisibility = 'hidden';
                canvas.style.willChange = 'transform';
                canvas.style.isolation = 'isolate';
                canvas.style.width = 'inherit';
                canvas.style.height = 'max-content';

                if (isMobile) {
                    canvas.style.overflow = 'initial';
                    canvas.style.margin = '0 12px';
                    let editorWrapper = document.getElementById('resume-editor-wrapper');
                    if (editorWrapper) {
                        editorWrapper.style.height = `${scaledHeight + 24}px`;
                    }
                }
            } else {
                resumePreviewer.style.zoom = scale
            }
        }
    }, [pages, scale]);

    return (
        <>
            {/* Paginated Preview */}

            {showMakeCompactBtn &&
                <MakeResumeCompact />
            }
            <div className="previewer-wrapper" id="previewer-wrapper">
                <div
                    id="resume-previewer"
                    className={`resume-preview-container classic-resume-template 
                        ${transformedModal ? ' transformed-modal' : ''}
                    ${reportTabActive ? ' report-tab-active' : ''} ${hidden ? ' hidden' : ''}
                    `}
                    style={{
                        ...cssVariables,
                    }}
                    ref={previewerRef}
                >
                    {pages.map((html, i) => (
                        <React.Fragment key={"preview-page-" + i}>
                            <div dangerouslySetInnerHTML={{ __html: html }} />
                            {i < pages.length - 1 && <div className="page-separator page-break-marker" />}
                        </React.Fragment>
                    ))}
                </div>

                {/* Workspace that creates & measures pages */}
                <div
                    ref={workspaceRef}
                    className={`workspace classic-resume-template`}
                    style={{
                        ...cssVariables,
                        position: "absolute",
                        visibility: "hidden",
                        top: 0,
                        right: 0,
                        width: PAGE_WIDTH,
                        height: PAGE_HEIGHT
                    }}
                ></div>
                {/* Raw template (hidden) */}
                <div className={`classic-resume-template`}
                    id="resume-print-demo"
                    role="document"
                    ref={sourceRef}
                    // id="resume-print-source"
                    style={{
                        ...cssVariables,
                        display: 'block', backgroundColor: 'white',
                        width: PAGE_WIDTH,
                        position: "absolute",
                        top: -9999,
                        visibility: "hidden"
                    }}
                >
                    {templateConfig.template_id == 1 && (
                        <div className="classic-resume-template-page" >
                            <div className="template-header" >
                                <h2 data-item-id={"re$basic_details$name"}>{resumeData?.basic_details?.name}</h2>
                                <h4 data-item-id={"re$basic_details$current_job_title"}>{resumeData?.basic_details?.current_job_title}</h4>
                                <ContactSection resumeData={resumeData} />
                            </div>
                            {sortingOrder.map((section) => (
                                section.show && (
                                    <div className="section-wrapper" key={section.key} >
                                        {section.key == "summary" && resumeData?.summary?.data && (
                                            <div className="tmp-summary-section section" data-item-id={"re$" + section.key + "$data"}>
                                                <h3 className="section-title" >{resumeData?.summary?.sectionName}</h3>
                                                <p
                                                    className={tailorInputs?.summary ? "highlight" : ""}
                                                    dangerouslySetInnerHTML={{ __html: convertDynamicContent(resumeData?.summary?.data) }}
                                                />
                                            </div>
                                        )}
                                        {section.key == "technical_skills" && (
                                            <div className="tmp-skills-section section" data-item-id={"re$" + section.key + "$data"}>
                                                <h3 className="section-title" >{resumeData?.technical_skills?.sectionName}</h3>
                                                {resumeData?.technical_skills?.data?.map((skill, index) => (
                                                    skill?.data.length > 0 &&
                                                    <p key={index} data-item-id={"re$" + section.key + "$" + index}>
                                                        <b>{skill?.groupName}: </b>
                                                        {skill?.data.map((skill, index, refArr) =>
                                                            <React.Fragment key={skill.id}>
                                                                <span className={skill.highlight ? 'highlight' : ''}>{skill.item}</span>
                                                                {index < refArr.length - 1 && `, `}
                                                            </React.Fragment>
                                                        )}
                                                    </p>
                                                ))}
                                            </div>
                                        )}

                                        {section.key == "professional_experiences" && (
                                            <div className="experience-section section" data-item-id={"re$" + section.key + "$data"}>
                                                <h3 className="section-title">{resumeData?.professional_experiences?.sectionName}</h3>
                                                <div className='exp-items section-items' >
                                                    {resumeData?.professional_experiences?.data?.map((experience, index) => (
                                                        <div
                                                            className='section-item exp-item' key={index}
                                                            data-item-id={"re$" + section.key + "$" + index}
                                                        >
                                                            <div className="exp-info">
                                                                {experience?.job_title &&
                                                                    <span className="exp-flex"
                                                                        dangerouslySetInnerHTML={{
                                                                            __html: convertDynamicContent(`<b>${experience?.job_title}</b>${datePreview(experience.start_date, experience.end_date, experience.is_current)}`)
                                                                        }}
                                                                    />
                                                                }
                                                                {experience?.company_name &&
                                                                    <span className="exp-flex"
                                                                        dangerouslySetInnerHTML={{
                                                                            __html: convertDynamicContent(`
                                                                    <b>${experience?.link ?
                                                                                    `<a href="${experience?.link}" target="_blank" rel="noopener noreferrer">${experience?.company_name}</a>` :
                                                                                    experience?.company_name
                                                                                }
                                                                    </b>
                                                                    ${experience?.company_location ? ` ${experience?.company_location}` : ''}`)
                                                                        }}
                                                                    />
                                                                }
                                                                {experience?.is_promoted && experience?.promoted_from && (
                                                                    <span className='exp-promoted-from'>Promoted from {experience?.promoted_from}</span>
                                                                )}
                                                            </div>
                                                            {experience?.bullet_items?.length > 0 &&
                                                                <ul className="exp-description">
                                                                    {experience?.bullet_items?.map((item, bIndex) => (
                                                                        item.item &&
                                                                        <li key={bIndex}
                                                                            data-item-id={"re$" + section.key + "$" + index + "$bullet" + bIndex}
                                                                        >
                                                                            <span className={`${item.highlight ? 'highlight' : ''}`} dangerouslySetInnerHTML={{ __html: convertDynamicContent(item.item) }} />
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            }
                                                            {experience?.technologies &&
                                                                <div className="exp-tech-skills">
                                                                    <p>
                                                                        <b>Technologies Used:</b> {experience?.technologies}
                                                                    </p>
                                                                </div>
                                                            }
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {section.key == "major_projects" && (
                                            <div className="tmp-projects-section section" data-item-id={"re$" + section.key + "$data"}>
                                                <h3 className="section-title">{resumeData?.major_projects?.sectionName}</h3>
                                                <div className="project-items section-items">
                                                    {resumeData?.major_projects?.data?.map((project, index) => (
                                                        <div
                                                            className="section-item prj-item" key={index}
                                                            data-item-id={"re$" + section.key + "$" + index}
                                                        >
                                                            {project?.title &&
                                                                <h4 className="project-title">
                                                                    {project?.link ? <a href={project?.link} target="_blank" rel="noopener noreferrer">{project?.title}</a> : <b>{project?.title}</b>}
                                                                    {project?.company_name ? ` | ${project?.company_name}` : ''}
                                                                </h4>
                                                            }
                                                            {/* {project?.description && (
                                                                <p className="project-desc">{project?.description}</p>
                                                            )} */}
                                                            {project?.bullet_items?.length > 0 && (
                                                                <ul className='project-points'>
                                                                    {project?.bullet_items?.map((item, bIndex) => (
                                                                        item &&
                                                                        <li
                                                                            key={bIndex} dangerouslySetInnerHTML={{ __html: convertDynamicContent(item) }}
                                                                            data-item-id={"re$" + section.key + "$" + index + "$bullet" + bIndex}
                                                                        />
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {section.key == "educations" && (
                                            <div className="tmp-education-section section" data-item-id={"re$" + section.key + "$data"}>
                                                <h3 className="section-title">{resumeData?.educations?.sectionName}</h3>
                                                <div className="education-items section-items">
                                                    {resumeData?.educations?.data?.map((education, index) => (
                                                        <div
                                                            className="section-item ed-item" key={index}
                                                            data-item-id={"re$" + section.key + "$" + index}
                                                        >
                                                            <span className='ed-title' dangerouslySetInnerHTML={{ __html: convertDynamicContent(`<b>${education?.degree} ${education?.grade ? ` | ${education?.grade}` : ''}</b>${education?.end_date ? `${education?.end_date}` : ''}`) }} />
                                                            {education?.college_name && <span className='ed-from' dangerouslySetInnerHTML={{ __html: convertDynamicContent(`${education?.college_name}${education?.location ? ` | ${education?.location}` : ''}`) }} />}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {section.key == "certifications" && (
                                            <CommonSection section={resumeData?.certifications} sectionKey={section.key} />
                                        )}

                                        {section.key == "achievements" && (
                                            <CommonSection section={resumeData?.achievements} sectionKey={section.key} />
                                        )}

                                        {genericSections.includes(section.key) && (
                                            <CommonSection section={resumeData[section.key]} sectionKey={section.key} />
                                        )}

                                        {!allDefaultSections?.map(s => s.key).includes(section.key) && (
                                            <CommonSection section={resumeData[section.key]} sectionKey={section.key} />
                                        )}
                                    </div>
                                )
                            ))}
                        </div>
                    )}
                    {templateConfig.template_id == 6 && (
                        <div className="classic-resume-template-page compact" >
                            <div className="template-header" >
                                <h2 data-item-id={"re$basic_details$name"}>{resumeData?.basic_details?.name}</h2>
                                <h4 data-item-id={"re$basic_details$current_job_title"}>{resumeData?.basic_details?.current_job_title}</h4>
                                <ContactSection resumeData={resumeData} />
                            </div>
                            {sortingOrder.map((section) => (
                                section.show && (
                                    <div className="section-wrapper" key={section.key} >
                                        {section.key == "summary" && resumeData?.summary?.data && (
                                            <div className="tmp-summary-section section" data-item-id={"re$" + section.key + "$data"}>
                                                <h3 className="section-title" >{resumeData?.summary?.sectionName}</h3>
                                                <p
                                                    className={tailorInputs?.summary ? "highlight" : ""}
                                                    dangerouslySetInnerHTML={{ __html: convertDynamicContent(resumeData?.summary?.data) }}
                                                />
                                            </div>
                                        )}
                                        {section.key == "technical_skills" && (
                                            <div className="tmp-skills-section section" data-item-id={"re$" + section.key + "$data"}>
                                                <h3 className="section-title" >{resumeData?.technical_skills?.sectionName}</h3>
                                                {resumeData?.technical_skills?.data?.map((skill, index) => (
                                                    skill?.data.length > 0 &&
                                                    <p key={index} data-item-id={"re$" + section.key + "$" + index}>
                                                        <b>{skill?.groupName}: </b>
                                                        {skill?.data.map((skill, index, refArr) =>
                                                            <React.Fragment key={skill.id}>
                                                                <span className={skill.highlight ? 'highlight' : ''}>{skill.item}</span>
                                                                {index < refArr.length - 1 && `, `}
                                                            </React.Fragment>
                                                        )}
                                                    </p>
                                                ))}
                                            </div>
                                        )}

                                        {section.key == "professional_experiences" && (
                                            <div className="experience-section section" data-item-id={"re$" + section.key + "$data"}>
                                                <h3 className="section-title">{resumeData?.professional_experiences?.sectionName}</h3>
                                                <div className='exp-items section-items' >
                                                    {resumeData?.professional_experiences?.data?.map((experience, index) => (
                                                        <div
                                                            className='section-item exp-item' key={index}
                                                            data-item-id={"re$" + section.key + "$" + index}
                                                        >
                                                            <div className="exp-info">
                                                                <span className='exp-title'>
                                                                    <span className='exp-title-left'>
                                                                        {experience?.job_title}
                                                                        {experience?.company_name && (
                                                                            <>
                                                                                {" | "}
                                                                                {experience?.link ? (
                                                                                    <a
                                                                                        href={experience.link}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                    >
                                                                                        {experience.company_name}
                                                                                    </a>
                                                                                ) : (
                                                                                    experience.company_name
                                                                                )}
                                                                            </>
                                                                        )}
                                                                        {experience?.company_location ? ` | ${experience?.company_location}` : ''}
                                                                    </span>
                                                                    <span className='exp-date'>
                                                                        {datePreview(experience.start_date, experience.end_date, experience.is_current, false)}
                                                                    </span>
                                                                </span>
                                                                {experience?.is_promoted && experience?.promoted_from && (
                                                                    <span className='exp-promoted-from'>Promoted from {experience?.promoted_from}</span>
                                                                )}
                                                            </div>
                                                            {experience?.bullet_items?.length > 0 &&
                                                                <ul className="exp-description">
                                                                    {experience?.bullet_items?.map((item, bIndex) => (
                                                                        item.item &&
                                                                        <li key={bIndex}
                                                                            data-item-id={"re$" + section.key + "$" + index + "$bullet" + bIndex}
                                                                        >
                                                                            <span className={`${item.highlight ? 'highlight' : ''}`} dangerouslySetInnerHTML={{ __html: convertDynamicContent(item.item) }} />
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            }
                                                            {experience?.technologies &&
                                                                <div className="exp-tech-skills">
                                                                    <p>
                                                                        <b>Technologies Used:</b> {experience?.technologies}
                                                                    </p>
                                                                </div>
                                                            }
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {section.key == "major_projects" && (
                                            <div className="tmp-projects-section section" data-item-id={"re$" + section.key + "$data"}>
                                                <h3 className="section-title">{resumeData?.major_projects?.sectionName}</h3>
                                                <div className="project-items section-items">
                                                    {resumeData?.major_projects?.data?.map((project, index) => (
                                                        <div
                                                            className="section-item prj-item" key={index}
                                                            data-item-id={"re$" + section.key + "$" + index}
                                                        >
                                                            {project?.title &&
                                                                <h4 className="project-title">
                                                                    {project?.link ? <a href={project?.link} target="_blank" rel="noopener noreferrer">{project?.title}</a> : <b>{project?.title}</b>}
                                                                    {project?.company_name ? ` | ${project?.company_name}` : ''}
                                                                </h4>
                                                            }
                                                            {/* {project?.description && (
                                                                <p className="project-desc">{project?.description}</p>
                                                            )} */}
                                                            {project?.bullet_items?.length > 0 && (
                                                                <ul className='project-points'>
                                                                    {project?.bullet_items?.map((item, bIndex) => (
                                                                        item &&
                                                                        <li
                                                                            key={bIndex} dangerouslySetInnerHTML={{ __html: convertDynamicContent(item) }}
                                                                            data-item-id={"re$" + section.key + "$" + index + "$bullet" + bIndex}
                                                                        />
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {section.key == "educations" && (
                                            <div className="tmp-education-section section" data-item-id={"re$" + section.key + "$data"}>
                                                <h3 className="section-title">{resumeData?.educations?.sectionName}</h3>
                                                <div className="education-items section-items">
                                                    {resumeData?.educations?.data?.map((education, index) => (
                                                        <div
                                                            className="section-item ed-item" key={index}
                                                            data-item-id={"re$" + section.key + "$" + index}
                                                        >
                                                            <span className='ed-title' dangerouslySetInnerHTML={{ __html: convertDynamicContent(`<b>${education?.degree} ${education?.grade ? ` | ${education?.grade}` : ''}</b>${education?.end_date ? `${education?.end_date}` : ''}`) }} />
                                                            {education?.college_name && <span className='ed-from' dangerouslySetInnerHTML={{ __html: convertDynamicContent(`${education?.college_name}${education?.location ? ` | ${education?.location}` : ''}`) }} />}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {section.key == "certifications" && (
                                            <CommonSection section={resumeData?.certifications} sectionKey={section.key} />
                                        )}

                                        {section.key == "achievements" && (
                                            <CommonSection section={resumeData?.achievements} sectionKey={section.key} />
                                        )}

                                        {genericSections.includes(section.key) && (
                                            <CommonSection section={resumeData[section.key]} sectionKey={section.key} />
                                        )}

                                        {!allDefaultSections?.map(s => s.key).includes(section.key) && (
                                            <CommonSection section={resumeData[section.key]} sectionKey={section.key} />
                                        )}
                                    </div>
                                )
                            ))}
                        </div>
                    )}
                    {templateConfig.template_id == 2 && (
                        <div className="modern-resume-template-page" >
                            <div className="template-header">
                                <h2 className='name-heading' data-item-id={"re$basic_details$name"}>{resumeData?.basic_details?.name}</h2>
                                <h4 data-item-id={"re$basic_details$current_job_title"}>{resumeData?.basic_details?.current_job_title}</h4>
                                <ContactSection resumeData={resumeData} />
                            </div>
                            {sortingOrder.map((section) => (
                                section.show && (
                                    <div className="section-wrapper" key={section.key}>
                                        {section.key == "summary" && resumeData?.summary?.data && (
                                            <div className="mt-summary-section section" data-item-id={"re$summary$data"}>
                                                <h3 className="section-title">{resumeData?.summary?.sectionName}</h3>
                                                <p
                                                    className={tailorInputs?.summary ? "highlight" : ""}
                                                    dangerouslySetInnerHTML={{ __html: convertDynamicContent(resumeData?.summary?.data) }}
                                                />
                                            </div>
                                        )}

                                        {section.key == "technical_skills" && (
                                            <div className="mt-skills-section section" data-item-id={"re$" + section.key + "$data"}>
                                                <h3 className="section-title">{resumeData?.technical_skills?.sectionName}</h3>
                                                {resumeData?.technical_skills?.data?.map((skill, index) => (
                                                    skill?.data.length > 0 &&
                                                    <p key={index} data-item-id={"re$" + section.key + "$" + index}>
                                                        <b>{skill?.groupName}: </b>
                                                        {skill?.data.map((skill, index, refArr) =>
                                                            <React.Fragment key={skill.id}>
                                                                <span className={skill.highlight ? 'highlight' : ''}>{skill.item}</span>
                                                                {index < refArr.length - 1 && `, `}
                                                            </React.Fragment>
                                                        )}
                                                    </p>
                                                ))}
                                            </div>
                                        )}

                                        {section.key == "professional_experiences" && (
                                            <div className="mt-experience-section section" data-item-id={"re$" + section.key + "$data"}>
                                                <h3 className="section-title">{resumeData?.professional_experiences?.sectionName}</h3>
                                                <div className='exp-items section-items' >
                                                    {resumeData?.professional_experiences?.data?.map((experience, index) => (
                                                        <div
                                                            className='section-item exp-item' key={index}
                                                            data-item-id={"re$" + section.key + "$" + index}
                                                        >
                                                            <div className="exp-info">
                                                                {experience?.job_title &&
                                                                    <span className='exp-title exp-flex'
                                                                        dangerouslySetInnerHTML={{
                                                                            __html: convertDynamicContent(`<b>${experience?.job_title}</b>${datePreview(experience.start_date, experience.end_date, experience.is_current)}`)
                                                                        }}
                                                                    />
                                                                }
                                                                {experience?.company_name && (
                                                                    <span className='exp-flex'
                                                                        dangerouslySetInnerHTML={{
                                                                            __html: convertDynamicContent(`
                                                                    <b>${experience?.link ?
                                                                                    `<a href="${experience?.link}" target="_blank" rel="noopener noreferrer">${experience?.company_name}</a>` :
                                                                                    experience?.company_name}
                                                                    </b>
                                                                    ${experience?.company_location ? ` ${experience?.company_location}` : ''}`)
                                                                        }}
                                                                    />
                                                                )}
                                                                {experience?.is_promoted && experience?.promoted_from && (
                                                                    <span className='exp-promoted-from'>Promoted from {experience?.promoted_from}</span>
                                                                )}
                                                            </div>
                                                            {experience?.bullet_items?.length > 0 && (
                                                                <ul className="exp-description">
                                                                    {experience?.bullet_items?.map((item, bIndex) => (
                                                                        item.item &&
                                                                        <li
                                                                            key={bIndex}
                                                                            data-item-id={"re$" + section.key + "$" + index + "$bullet" + bIndex}
                                                                        >
                                                                            <span className={`${item.highlight ? 'highlight' : ''}`} dangerouslySetInnerHTML={{ __html: convertDynamicContent(item.item) }} />
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                            {experience?.technologies && (
                                                                <div className="exp-tech-skills">
                                                                    <p>
                                                                        <b>Technologies Used:</b> {experience?.technologies}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {section.key == "major_projects" && (
                                            <div className="mt-projects-section section" data-item-id={"re$" + section.key + "$data"}>
                                                <h3 className="section-title">{resumeData?.major_projects?.sectionName}</h3>
                                                <div className="project-items section-items">
                                                    {resumeData?.major_projects?.data?.map((project, index) => (
                                                        <div
                                                            className="section-item prj-item" key={index}
                                                            data-item-id={"re$" + section.key + "$" + index}
                                                        >
                                                            {project?.title &&
                                                                <h4 className="project-title">
                                                                    {project?.link ? <a href={project?.link} target="_blank" rel="noopener noreferrer">{project?.title}</a> : <b>{project?.title}</b>}
                                                                    {project?.company_name ? ` | ${project?.company_name}` : ''}
                                                                </h4>
                                                            }
                                                            {/* {project?.description && (
                                                                <p className="project-desc">{project?.description}</p>
                                                            )} */}
                                                            {project?.bullet_items?.length > 0 && (
                                                                <ul className='project-points'>
                                                                    {project?.bullet_items?.map((item, bIndex) => (
                                                                        item &&
                                                                        <li
                                                                            key={bIndex}
                                                                            data-item-id={"re$" + section.key + "$" + index + "$bullet" + bIndex}
                                                                            dangerouslySetInnerHTML={{ __html: convertDynamicContent(item) }}
                                                                        />
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {section.key == "educations" && (
                                            <div className="mt-education-section section" data-item-id={"re$" + section.key + "$data"}>
                                                <h3 className="section-title">{resumeData?.educations?.sectionName}</h3>
                                                <div className="education-items section-items">
                                                    {resumeData?.educations?.data?.map((education, index) => (
                                                        <div
                                                            className="section-item ed-item" key={index}
                                                            data-item-id={"re$" + section.key + "$" + index}
                                                        >
                                                            <span className='ed-title' dangerouslySetInnerHTML={{ __html: convertDynamicContent(`<b>${education?.degree} ${education?.grade ? ` | ${education?.grade}` : ''}</b>${education?.end_date ? `${education?.end_date}` : ''}`) }} />
                                                            {education?.college_name && <span className='ed-from' dangerouslySetInnerHTML={{ __html: convertDynamicContent(`${education?.college_name}${education?.location ? ` | ${education?.location}` : ''}`) }} />}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {section.key == "certifications" && (
                                            <CommonSection section={resumeData?.certifications} sectionKey={section.key} />
                                        )}

                                        {section.key == "achievements" && (
                                            <CommonSection section={resumeData?.achievements} sectionKey={section.key} />
                                        )}

                                        {genericSections.includes(section.key) && (
                                            <CommonSection section={resumeData[section.key]} sectionKey={section.key} />
                                        )}

                                        {!allDefaultSections?.map(s => s.key).includes(section.key) && (
                                            <CommonSection section={resumeData[section.key]} sectionKey={section.key} />
                                        )}
                                    </div>
                                )
                            ))}
                        </div>
                    )}
                    {templateConfig.template_id == 3 && (
                        <div className="elegant-resume-template-page">
                            <div className="template-header">
                                <h2 className='name-heading' data-item-id={"re$basic_details$name"}>{resumeData?.basic_details?.name}</h2>
                                <h4 data-item-id={"re$basic_details$current_job_title"}>{resumeData?.basic_details?.current_job_title}</h4>
                                <ContactSection resumeData={resumeData} />
                            </div>
                            {sortingOrder.map((section) => (
                                section.show && (
                                    <div className="section-wrapper" key={section.key}>
                                        {section.key == "summary" && resumeData?.summary?.data && (
                                            <div className="elt-summary-section section" data-item-id={"re$summary$data"}>
                                                <h3 className="section-title">{resumeData?.summary?.sectionName}</h3>
                                                <p
                                                    className={tailorInputs?.summary ? "highlight" : ""}
                                                    dangerouslySetInnerHTML={{ __html: convertDynamicContent(resumeData?.summary?.data) }}
                                                />
                                            </div>
                                        )}

                                        {section.key == "technical_skills" && (
                                            <div className="elt-skills-section section" data-item-id={"re$" + section.key + "$data"}>
                                                <h3 className="section-title">{resumeData?.technical_skills?.sectionName}</h3>
                                                {resumeData?.technical_skills?.data?.map((skill, index) => (
                                                    skill?.data.length > 0 &&
                                                    <p key={index} data-item-id={"re$" + section.key + "$" + index}>
                                                        <b>{skill?.groupName}: </b>
                                                        {skill?.data.map((skill, index, refArr) =>
                                                            <React.Fragment key={skill.id}>
                                                                <span className={skill.highlight ? 'highlight' : ''}>{skill.item}</span>
                                                                {index < refArr.length - 1 && `, `}
                                                            </React.Fragment>
                                                        )}
                                                    </p>
                                                ))}
                                            </div>
                                        )}

                                        {section.key == "professional_experiences" && (
                                            <div className="elt-experience-section section" data-item-id={"re$" + section.key + "$data"}>
                                                <h3 className="section-title">{resumeData?.professional_experiences?.sectionName}</h3>
                                                <div className='exp-items section-items' >
                                                    {resumeData?.professional_experiences?.data?.map((experience, index) => (
                                                        <div
                                                            className='section-item exp-item' key={index}
                                                            data-item-id={"re$" + section.key + "$" + index}
                                                        >
                                                            <div className="exp-info">
                                                                <span className='exp-title'>{experience?.job_title}
                                                                    {experience?.company_name && (
                                                                        <>
                                                                            {" | "}
                                                                            {experience?.link ? (
                                                                                <a
                                                                                    href={experience.link}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                >
                                                                                    {experience.company_name}
                                                                                </a>
                                                                            ) : (
                                                                                experience.company_name
                                                                            )}
                                                                        </>
                                                                    )}
                                                                    {experience?.company_location ? ` | ${experience?.company_location}` : ''}
                                                                    <span className='exp-date'>
                                                                        {datePreview(experience.start_date, experience.end_date, experience.is_current, false)}
                                                                    </span>
                                                                </span>
                                                                {experience?.is_promoted && experience?.promoted_from && (
                                                                    <span className='exp-promoted-from'>Promoted from {experience?.promoted_from}</span>
                                                                )}
                                                            </div>
                                                            {experience?.bullet_items?.length > 0 && (
                                                                <ul className="exp-description">
                                                                    {experience?.bullet_items?.map((item, bIndex) => (
                                                                        item.item &&
                                                                        <li key={bIndex}
                                                                            data-item-id={"re$" + section.key + "$" + index + "$bullet" + bIndex}
                                                                        >
                                                                            <span className={`${item.highlight ? 'highlight' : ''}`} dangerouslySetInnerHTML={{ __html: convertDynamicContent(item.item) }} />
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                            {experience?.technologies && (
                                                                <div className="exp-tech-skills">
                                                                    <p>
                                                                        <b>Technologies Used:</b> {experience?.technologies}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {section.key == "major_projects" && (
                                            <div className="elt-projects-section section" data-item-id={"re$" + section.key + "$data"}>
                                                <h3 className="section-title">{resumeData?.major_projects?.sectionName}</h3>
                                                <div className="project-items section-items">
                                                    {resumeData?.major_projects?.data?.map((project, index) => (
                                                        <div
                                                            className="section-item prj-item" key={index}
                                                            data-item-id={"re$" + section.key + "$" + index}
                                                        >
                                                            {project?.title &&
                                                                <h4 className="project-title">
                                                                    {project?.link ? <a href={project?.link} target="_blank" rel="noopener noreferrer">{project?.title}</a> : <b>{project?.title}</b>}
                                                                    {project?.company_name ? ` | ${project?.company_name}` : ''}
                                                                </h4>
                                                            }
                                                            {/* {project?.description && (
                                                                <p className="project-desc">{project?.description}</p>
                                                            )} */}
                                                            {project?.bullet_items?.length > 0 && (
                                                                <ul className='project-points'>
                                                                    {project?.bullet_items?.map((item, bIndex) => (
                                                                        item &&
                                                                        <li
                                                                            key={bIndex} dangerouslySetInnerHTML={{ __html: convertDynamicContent(item) }}
                                                                            data-item-id={"re$" + section.key + "$" + index + "$bullet" + bIndex}
                                                                        />
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {section.key == "educations" && (
                                            <div className="elt-education-section section" data-item-id={"re$" + section.key + "$data"}>
                                                <h3 className="section-title">{resumeData?.educations?.sectionName}</h3>
                                                <div className="education-items section-items">
                                                    {resumeData?.educations?.data?.map((education, index) => (
                                                        <div
                                                            className="section-item ed-item" key={index}
                                                            data-item-id={"re$" + section.key + "$" + index}
                                                        >
                                                            <span className='ed-title' dangerouslySetInnerHTML={{ __html: convertDynamicContent(`<b>${education?.degree} ${education?.grade ? ` | ${education?.grade}` : ''}</b>${education?.end_date ? `${education?.end_date}` : ''}`) }} />
                                                            {education?.college_name && <span className='ed-from' dangerouslySetInnerHTML={{ __html: convertDynamicContent(`${education?.college_name}${education?.location ? ` | ${education?.location}` : ''}`) }} />}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {section.key == "certifications" && (
                                            <CommonSection section={resumeData?.certifications} sectionKey={section.key} />
                                        )}

                                        {section.key == "achievements" && (
                                            <CommonSection section={resumeData?.achievements} sectionKey={section.key} />
                                        )}

                                        {genericSections.includes(section.key) && (
                                            <CommonSection section={resumeData[section.key]} sectionKey={section.key} />
                                        )}

                                        {!allDefaultSections?.map(s => s.key).includes(section.key) && (
                                            <CommonSection section={resumeData[section.key]} sectionKey={section.key} />
                                        )}
                                    </div>
                                )
                            ))}

                        </div>
                    )}
                    {templateConfig.template_id == 4 && (
                        <div className="professional-resume-template-page">
                            <div className="template-header">
                                <h2 className='name-heading' data-item-id={"re$basic_details$name"}>
                                    {(() => {
                                        const name = resumeData?.basic_details?.name || '';
                                        const parts = name.trim().split(/\s+/);
                                        const first = parts[0] || '';
                                        const rest = parts.slice(1).join(' ');
                                        return (
                                            <>
                                                {first ? <strong>{first}</strong> : null}
                                                {rest ? <span className="name-last"> {rest}</span> : null}
                                                {!first && !rest ? name : null}
                                            </>
                                        );
                                    })()}
                                </h2>
                                <h4 data-item-id={"re$basic_details$current_job_title"}>
                                    {(resumeData?.basic_details?.current_job_title || '')
                                        .replace(/\s*\|\s*/g, ' \u2022 ')
                                        .toUpperCase()}
                                </h4>
                                <ContactSection resumeData={resumeData} />
                            </div>
                            {sortingOrder.map((section) => (
                                section.show && (
                                    <div className="section-wrapper" key={section.key}>
                                        {section.key == "summary" && resumeData?.summary?.data && (
                                            <div className="pt-summary-section section" data-item-id={"re$summary$data"}>
                                                <div className="section-header-professional-template">
                                                    <h3 className="section-title">{resumeData?.summary?.sectionName}</h3>
                                                    <hr />
                                                </div>
                                                <p className="summary-text" dangerouslySetInnerHTML={{ __html: convertDynamicContent(resumeData?.summary?.data) }} />
                                            </div>
                                        )}

                                        {section.key == "technical_skills" && (
                                            <div className="pt-skills-section section" data-item-id={"re$" + section.key + "$data"}>
                                                <div className="section-header-professional-template">
                                                    <h3 className="section-title">{resumeData?.technical_skills?.sectionName}</h3>
                                                    <hr />
                                                </div>
                                                <div className="skills-grid">
                                                    {resumeData?.technical_skills?.data?.map((skill, index) => (
                                                        skill?.data.length > 0 &&
                                                        <div className="skill-group" key={index} data-item-id={"re$" + section.key + "$" + index}>
                                                            <span className="skill-group-name"><b>{skill?.groupName}: </b></span>
                                                            <span className="skill-list">
                                                                {skill?.data.map((skillItem, sIndex, refArr) =>
                                                                    <React.Fragment key={skillItem.id}>
                                                                        <span className={skillItem.highlight ? 'highlight' : ''}>{skillItem.item}</span>
                                                                        {sIndex < refArr.length - 1 && ` • `}
                                                                    </React.Fragment>
                                                                )}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {section.key == "professional_experiences" && (
                                            <div className="pt-experience-section section" data-item-id={"re$" + section.key + "$data"}>
                                                <div className="section-header-professional-template">
                                                    <h3 className="section-title">{resumeData?.professional_experiences?.sectionName}</h3>
                                                    <hr />
                                                </div>
                                                <div className='exp-items section-items' >
                                                    {resumeData?.professional_experiences?.data?.map((experience, index) => (
                                                        <div
                                                            className='section-item exp-item' key={index}
                                                            data-item-id={"re$" + section.key + "$" + index}
                                                        >
                                                            <div className="exp-info">
                                                                <div className="exp-info-top">
                                                                    <div className="exp-company-title">
                                                                        <span className="exp-company-name">
                                                                            <b>{experience?.company_name && (
                                                                                experience?.link ? (
                                                                                    <a href={experience.link} target="_blank" rel="noopener noreferrer">{experience.company_name}</a>
                                                                                ) : experience.company_name
                                                                            )}</b>
                                                                        </span>
                                                                        {experience?.job_title && <span className="exp-job-title">{` | ${experience?.job_title}`}</span>}
                                                                    </div>
                                                                    <span className='exp-date'>{datePreview(experience.start_date, experience.end_date, experience.is_current)}</span>
                                                                </div>
                                                                {experience?.is_promoted && experience?.promoted_from && (
                                                                    <span className='exp-promoted-from'>Promoted from {experience?.promoted_from}</span>
                                                                )}
                                                            </div>
                                                            {experience?.bullet_items?.length > 0 && (
                                                                <ul className="exp-description">
                                                                    {experience?.bullet_items?.map((item, bIndex) => (
                                                                        item.item &&
                                                                        <li key={bIndex}
                                                                            data-item-id={"re$" + section.key + "$" + index + "$bullet" + bIndex}
                                                                        >
                                                                            <span className={`${item.highlight ? 'highlight' : ''}`} dangerouslySetInnerHTML={{ __html: convertDynamicContent(item.item) }} />
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                            {experience?.technologies && (
                                                                <div className="exp-tech-skills">
                                                                    <b>Technologies Used:</b> <span className="tech-list">{experience?.technologies}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {section.key == "major_projects" && (
                                            <div className="pt-projects-section section" data-item-id={"re$" + section.key + "$data"}>
                                                <div className="section-header-professional-template">
                                                    <h3 className="section-title">{resumeData?.major_projects?.sectionName}</h3>
                                                    <hr />
                                                </div>
                                                <div className="project-items section-items">
                                                    {resumeData?.major_projects?.data?.map((project, index) => (
                                                        <div
                                                            className="section-item prj-item" key={index}
                                                            data-item-id={"re$" + section.key + "$" + index}
                                                        >
                                                            <div className="prj-info-top">
                                                                <div className="prj-title-company">
                                                                    <b>{project?.title &&
                                                                        (project?.link ? <a href={project?.link} target="_blank" rel="noopener noreferrer">{project?.title}</a> : project?.title)
                                                                    }</b>
                                                                    {project?.company_name && <b>{` | ${project?.company_name}`}</b>}
                                                                </div>
                                                            </div>
                                                            {/* {project?.description && (
                                                                <p className="project-desc">{project?.description}</p>
                                                            )} */}
                                                            {project?.bullet_items?.length > 0 && (
                                                                <ul className='project-points'>
                                                                    {project?.bullet_items?.map((item, bIndex) => (
                                                                        item &&
                                                                        <li
                                                                            key={bIndex} dangerouslySetInnerHTML={{ __html: convertDynamicContent(item) }}
                                                                            data-item-id={"re$" + section.key + "$" + index + "$bullet" + bIndex}
                                                                        />
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* {section.key == "educations" && (
                                        <div className="pt-education-section section" data-item-id={"re$" + section.key + "$data"}>
                                            <div className="section-header-professional-template">
                                                <h3 className="section-title">{resumeData?.educations?.sectionName}</h3>
                                                <hr />
                                            </div>
                                            <div className="education-items section-items">
                                                {resumeData?.educations?.data?.map((education, index) => (
                                                    <div
                                                        className="section-item ed-item" key={index}
                                                        data-item-id={"re$" + section.key + "$" + index}
                                                    >
                                                        <div className="ed-grid">
                                                            <span className='ed-date'>{education?.end_date || ''}</span>
                                                            <span className='ed-degree'><b>{education?.degree || ''}</b></span>
                                                            <span className='ed-college'>{education?.college_name || ''}{education?.location ? ` | ${education?.location}` : ''}</span>
                                                            <span className='ed-grade'>{education?.grade || ''}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )} */}

                                        {section.key == "educations" && (
                                            <div className="tmp-education-section section" data-item-id={"re$" + section.key + "$data"}>
                                                <div className="section-header-professional-template">
                                                    <h3 className="section-title">{resumeData?.educations?.sectionName}</h3>
                                                    <hr />
                                                </div>
                                                <div className="education-items section-items">
                                                    {resumeData?.educations?.data?.map((education, index) => (
                                                        <div
                                                            className="section-item ed-item" key={index}
                                                            data-item-id={"re$" + section.key + "$" + index}
                                                        >
                                                            <span className='ed-title' dangerouslySetInnerHTML={{ __html: convertDynamicContent(`<b>${education?.degree} ${education?.grade ? ` | ${education?.grade}` : ''}</b>${education?.end_date ? `${education?.end_date}` : ''}`) }} />
                                                            {education?.college_name && <span className='ed-from' dangerouslySetInnerHTML={{ __html: convertDynamicContent(`${education?.college_name}${education?.location ? ` | ${education?.location}` : ''}`) }} />}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {section.key == "certifications" && (
                                            <CommonSection section={resumeData?.certifications} sectionKey={section.key} template={'professional'} />
                                        )}

                                        {section.key == "achievements" && (
                                            <CommonSection section={resumeData?.achievements} sectionKey={section.key} template={'professional'} />
                                        )}

                                        {genericSections.includes(section.key) && (
                                            <CommonSection section={resumeData[section.key]} sectionKey={section.key} template={'professional'} />
                                        )}

                                        {!allDefaultSections?.map(s => s.key).includes(section.key) && (
                                            <CommonSection section={resumeData[section.key]} sectionKey={section.key} template={'professional'} />
                                        )}
                                    </div>
                                )
                            ))}
                        </div>
                    )}

                    {templateConfig.template_id == 5 && (
                        <div className="elite-resume-template-page">
                            <div className="template-header">
                                <h2 className='name-heading' data-item-id={"re$basic_details$name"}>
                                    {resumeData?.basic_details?.name}
                                </h2>
                                <h4 data-item-id={"re$basic_details$current_job_title"}>
                                    {(resumeData?.basic_details?.current_job_title || '')
                                        .replace(/\s*\|\s*/g, ' \u2022 ')
                                        .toUpperCase()}
                                </h4>
                                <ContactSection resumeData={resumeData} />
                            </div>
                            {sortingOrder.map((section) => (
                                section.show && (
                                    <div className="section-wrapper" key={section.key}>
                                        {section.key == "summary" && resumeData?.summary?.data && (
                                            <div className="pt-summary-section section" data-item-id={"re$summary$data"}>
                                                <h3 className="section-title">{resumeData?.summary?.sectionName}</h3>
                                                <p className="summary-text" dangerouslySetInnerHTML={{ __html: convertDynamicContent(resumeData?.summary?.data) }} />
                                            </div>
                                        )}

                                        {section.key == "technical_skills" && (
                                            <div className="pt-skills-section section" data-item-id={"re$" + section.key + "$data"}>
                                                <h3 className="section-title">{resumeData?.technical_skills?.sectionName}</h3>
                                                <div className="skills-grid">
                                                    {resumeData?.technical_skills?.data?.map((skill, index) => (
                                                        skill?.data.length > 0 &&
                                                        <div className="skill-group" key={index} data-item-id={"re$" + section.key + "$" + index}>
                                                            <span className="skill-group-name">{skill?.groupName} —&nbsp;</span>
                                                            <span className="skill-list">
                                                                {skill?.data.map((skillItem, sIndex, refArr) =>
                                                                    <React.Fragment key={skillItem.id}>
                                                                        <span className={skillItem.highlight ? 'highlight' : ''}>{skillItem.item}</span>
                                                                        {sIndex < refArr.length - 1 && `, `}
                                                                    </React.Fragment>
                                                                )}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {section.key == "professional_experiences" && (
                                            <div className="pt-experience-section section" data-item-id={"re$" + section.key + "$data"}>
                                                <h3 className="section-title">{resumeData?.professional_experiences?.sectionName}</h3>
                                                <div className='exp-items section-items' >
                                                    {resumeData?.professional_experiences?.data?.map((experience, index) => (
                                                        <div
                                                            className='section-item exp-item' key={index}
                                                            data-item-id={"re$" + section.key + "$" + index}
                                                        >
                                                            <div className="exp-info">
                                                                <div className="exp-info-top">
                                                                    <div className="exp-company-title">
                                                                        <span className="exp-company-name">
                                                                            {experience?.company_name && (
                                                                                experience?.link ? (
                                                                                    <a href={experience.link} target="_blank" rel="noopener noreferrer">{experience.company_name}</a>
                                                                                ) : experience.company_name
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                    <span className='exp-date'>{datePreviewElite(experience.start_date, experience.end_date, experience.is_current)}</span>
                                                                </div>
                                                                {experience?.job_title && <span className="exp-job-title">{experience?.job_title}{experience?.company_location ? ` | ${experience?.company_location}` : ''}</span>}
                                                                {experience?.is_promoted && experience?.promoted_from && (
                                                                    <span className='exp-promoted-from'>Promoted from {experience?.promoted_from}</span>
                                                                )}
                                                            </div>
                                                            {experience?.bullet_items?.length > 0 && (
                                                                <ul className="exp-description">
                                                                    {experience?.bullet_items?.map((item, bIndex) => (
                                                                        item.item &&
                                                                        <li key={bIndex}
                                                                            data-item-id={"re$" + section.key + "$" + index + "$bullet" + bIndex}
                                                                        >
                                                                            <span className={`${item.highlight ? 'highlight' : ''}`} dangerouslySetInnerHTML={{ __html: convertDynamicContent(item.item) }} />
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                            {experience?.technologies && (
                                                                <div className="exp-tech-skills">
                                                                    <b>Technologies Used:</b> <span className="tech-list">{experience?.technologies}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {section.key == "major_projects" && (
                                            <div className="pt-projects-section section" data-item-id={"re$" + section.key + "$data"}>
                                                <h3 className="section-title">{resumeData?.major_projects?.sectionName}</h3>
                                                <div className="project-items section-items">
                                                    {resumeData?.major_projects?.data?.map((project, index) => (
                                                        <div
                                                            className="section-item prj-item" key={index}
                                                            data-item-id={"re$" + section.key + "$" + index}
                                                        >
                                                            <div className="prj-info-top">
                                                                <div className="prj-title-company">
                                                                    {project?.title &&
                                                                        (project?.link ? <a href={project?.link} target="_blank" rel="noopener noreferrer">{project?.title}</a> : project?.title)
                                                                    }
                                                                    {project?.company_name && <>{` | ${project?.company_name}`}</>}
                                                                </div>
                                                            </div>
                                                            {/* {project?.description && (
                                                                <p className="project-desc">{project?.description}</p>
                                                            )} */}
                                                            {project?.bullet_items?.length > 0 && (
                                                                <ul className='project-points'>
                                                                    {project?.bullet_items?.map((item, bIndex) => (
                                                                        item &&
                                                                        <li
                                                                            key={bIndex} dangerouslySetInnerHTML={{ __html: convertDynamicContent(item) }}
                                                                            data-item-id={"re$" + section.key + "$" + index + "$bullet" + bIndex}
                                                                        />
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {section.key == "educations" && (
                                            <div className="pt-education-section section" data-item-id={"re$" + section.key + "$data"}>
                                                <h3 className="section-title">{resumeData?.educations?.sectionName}</h3>
                                                <div className="education-items section-items">
                                                    {resumeData?.educations?.data?.map((education, index) => (
                                                        <div
                                                            className="section-item ed-item" key={index}
                                                            data-item-id={"re$" + section.key + "$" + index}
                                                        >
                                                            <div className="ed-left">
                                                                <span className='ed-degree'>{education?.degree || ''}</span>
                                                                <span className='ed-college'>{education?.college_name || ''}{education?.location ? ` | ${education?.location}` : ''}</span>

                                                            </div>
                                                            <div className="ed-right">
                                                                <span className='ed-date'>{education?.end_date ?? ''}</span>
                                                                <span className='ed-grade'>{education?.grade ?? ''}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {section.key == "certifications" && (
                                            <CommonSection section={resumeData?.certifications} sectionKey={section.key} template={'elite'} />
                                        )}

                                        {section.key == "achievements" && (
                                            <CommonSection section={resumeData?.achievements} sectionKey={section.key} template={'elite'} />
                                        )}

                                        {genericSections.includes(section.key) && (
                                            <CommonSection section={resumeData[section.key]} sectionKey={section.key} template={'elite'} />
                                        )}

                                        {!allDefaultSections?.map(s => s.key).includes(section.key) && (
                                            <CommonSection section={resumeData[section.key]} sectionKey={section.key} template={'elite'} />
                                        )}
                                    </div>
                                )
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Required CSS */}

        </>
    );
}

const ContactSection = ({ resumeData }) => {
    return (
        <div className='tmp-contact-info'>
            <span data-item-id={"re$basic_details$phone"}>{resumeData?.basic_details?.phone}</span>
            {resumeData?.basic_details?.email &&
                <>&nbsp;|&nbsp;
                    <a href={"mailto:" + resumeData?.basic_details?.email} data-item-id={"re$basic_details$email"}>{resumeData?.basic_details?.email}</a>
                </>
            }
            {resumeData?.basic_details && 'linkedinUrl' in resumeData.basic_details &&
                <>
                    {!resumeData?.basic_details?.linkedinUrl && resumeData?.basic_details?.linkedinLinkText &&
                        <>
                            &nbsp;|&nbsp;
                            <span data-item-id={"re$basic_details$linkedinUrl"}>
                                <span className="dynamic-content">Linkedin</span>
                            </span>
                        </>
                    }
                    {resumeData?.basic_details?.linkedinUrl &&
                        <>
                            &nbsp;|&nbsp;
                            <span data-item-id={"re$basic_details$linkedinUrl"}>
                                <a href={resumeData?.basic_details?.linkedinUrl} target="_blank" rel="noopener noreferrer">
                                    {resumeData?.basic_details?.linkedinLinkText ? resumeData?.basic_details?.linkedinLinkText : resumeData?.basic_details?.linkedinUrl}
                                </a>
                            </span>
                        </>
                    }
                </>
            }
            {resumeData?.basic_details?.githubUrl &&
                <>&nbsp;|&nbsp;
                    <span data-item-id={"re$basic_details$githubUrl"}>
                        <a href={resumeData?.basic_details?.githubUrl} target="_blank" rel="noopener noreferrer">
                            {resumeData?.basic_details?.githubLinkText ? resumeData?.basic_details?.githubLinkText : resumeData?.basic_details?.githubUrl}
                        </a>
                    </span>
                </>
            }
            {resumeData?.basic_details?.blogUrl &&
                <>&nbsp;|&nbsp;
                    <span data-item-id={"re$basic_details$blogUrl"}>
                        <a href={resumeData?.basic_details?.blogUrl} target="_blank" rel="noopener noreferrer">
                            {resumeData?.basic_details?.blogLinkText ? resumeData?.basic_details?.blogLinkText : resumeData?.basic_details?.blogUrl}
                        </a>
                    </span>
                </>
            }
            {resumeData?.basic_details?.portfolioUrl &&
                <>&nbsp;|&nbsp;
                    <span data-item-id={"re$basic_details$portfolioUrl"}>
                        <a href={resumeData?.basic_details?.portfolioUrl} target="_blank" rel="noopener noreferrer">
                            {resumeData?.basic_details?.portfolioLinkText ? resumeData?.basic_details?.portfolioLinkText : resumeData?.basic_details?.portfolioUrl}
                        </a>
                    </span>
                </>
            }
            {resumeData?.basic_details?.location &&
                <>&nbsp;|&nbsp;
                    <span data-item-id={"re$basic_details$location"}>{resumeData?.basic_details?.location}</span>
                </>
            }
        </div>
    )
}

const datePreview = (startDate, endDate, isCurrent, isSeparator = false) => {
    if (!startDate) {
        return "";
    }
    return `${isSeparator ? ' | ' : ''}${startDate} - ${(isCurrent && isCurrent !== "false") ? "Present" : endDate}`;
}

const datePreviewElite = (startDate, endDate, isCurrent) => {
    if (!startDate) {
        return "";
    }
    return `${startDate} - ${(isCurrent && isCurrent !== "false") ? "Present" : endDate}`;
}


const convertDynamicContent = (input) => {
    if (!input || typeof input !== "string") return input;

    // Convert <b> to <strong>
    let output = input.replace(/<b>(.*?)<\/b>/g, "<strong>$1</strong>");

    // Convert {{value}} → span.dynamic-content
    output = output.replace(/{{(.*?)}}/g, (_, content) => {
        return `<span class="dynamic-content">{{${content.trim()}}}</span>`;
    });

    return output;
}

const CommonSection = ({ section, sectionKey, template = '' }) => {
    return (
        <>
            <div className="common-section section" data-item-id={"re$" + sectionKey + "$data"}>
                {template === 'professional' ? (
                    <div className="section-header-professional-template">
                        <h3 className="section-title">{section?.sectionName}</h3>
                        <hr />
                    </div>
                ) : (
                    <h3 className="section-title">{section?.sectionName}</h3>
                )}
                <ul>
                    {section?.data?.map((item, index) => (
                        <li
                            key={index}
                            dangerouslySetInnerHTML={{ __html: convertDynamicContent(item) }}
                            data-item-id={"re$" + sectionKey + "$" + index}
                        />
                    ))}
                </ul>
            </div>
        </>
    );
}