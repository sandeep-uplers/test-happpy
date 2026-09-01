import { useEffect, useState } from "react";
import { ArrowDownIcon, CheckIcon, CrossIcon, DelIcon, EditIcon } from "../ResumEditorIcons";
import { REMOVE_EDITOR_SECTION } from "../../../store/actions/actionsTypes";
import { useDispatch } from "react-redux";
import ResumeJoditField from "../ResumeJoditField";

export default function RESummary({ expanded, setExpanded, resumeJson, setResumeJson }) {
    const [formValue, setFormValue] = useState(resumeJson.summary?.data || '');
    const dispatch = useDispatch();

    useEffect(() => {
        setFormValue(resumeJson.summary?.data || '');
    }, []);

    const handleExpand = () => {
        if (expanded === 'summary') {
            setExpanded('');
        } else {
            setExpanded('summary');
        }
    }

    useEffect(() => {
        setResumeJson({ ...resumeJson, summary: { ...resumeJson.summary, data: formValue } });
    }, [formValue]);

    const [editSectionName, setEditSectionName] = useState(false);


    const [confirmDeleteSection, setConfirmDeleteSection] = useState(false);
    const handleDeleteSection = () => {
        dispatch({ type: REMOVE_EDITOR_SECTION, payload: "summary" });
        setConfirmDeleteSection(false);
    }

    const handleBlurSectionName = (e) => {
        setResumeJson({ ...resumeJson, summary: { ...resumeJson.summary, sectionName: e.target.value } });
        setEditSectionName(false);
    }

    return (
        <div className="re-section">
            <div className="re-section-head" onClick={handleExpand}>
                {confirmDeleteSection ? (
                    <>
                        <text className="err-text">Delete this section?</text>
                        <div className="re-section-head-actions">
                            <button
                                className="icon-btn circular"
                                onClick={handleDeleteSection}
                            >
                                <CheckIcon />
                            </button>
                            <button className="icon-btn circular" onClick={() => setConfirmDeleteSection(false)}>
                                <CrossIcon />
                            </button>
                        </div>
                    </>
                ) :
                    <>
                        {editSectionName ? (
                            <input
                                autoFocus
                                type="text"
                                className="base-input"
                                defaultValue={resumeJson.summary.sectionName}
                                onBlur={(e) => handleBlurSectionName(e)}
                                onKeyDown={(e) => e.key === "Enter" && handleBlurSectionName(e)}
                            />
                        ) : (
                            <h6>{resumeJson.summary.sectionName}</h6>
                        )}

                        <div className="re-section-head-actions">
                            <button
                                className="icon-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEditSectionName(true);
                                }}
                            >
                                <EditIcon />
                            </button>
                            <button
                                className="icon-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmDeleteSection(true);
                                }}
                            >
                                <DelIcon />
                            </button>
                            <span className={`expand-icon ${expanded === "summary" ? "expanded" : ""}`}>
                                <ArrowDownIcon />
                            </span>
                        </div>
                    </>
                }
            </div>

            {expanded === 'summary' &&
                <div className="re-section-content" data-editor-item-id="re$summary$data">
                    <ResumeJoditField
                        content={formValue}
                        onBlur={setFormValue}
                        placeholder="Paste your summary here or start typing..."
                        forceEditorFocus={!formValue}
                    />
                </div>
            }
        </div>
    )
}