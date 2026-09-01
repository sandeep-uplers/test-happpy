import React, { useEffect, useRef, useState } from "react";

import {
    DndContext,
    PointerSensor,
    TouchSensor,
    closestCenter,
    useSensor,
    useSensors,
} from "@dnd-kit/core";

import {
    SortableContext,
    arrayMove,
    useSortable,
    verticalListSortingStrategy
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import { v4 as uuidv4 } from 'uuid';
import { CheckboxInput } from "../../../components/common/Inputs";
import {
    AddIcon,
    ArrowDownIcon,
    CheckIcon,
    CrossIcon,
    DelIcon,
    EditIcon,
    SortingHandleIcon,
    ToRightArrowIcon
} from "../ResumEditorIcons";
import ResumeJoditField from "../ResumeJoditField";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import { REMOVE_EDITOR_SECTION } from "../../../store/actions/actionsTypes";
import { useDispatch } from "react-redux";

export default function REExperience({ expanded, setExpanded, resumeJson, setResumeJson }) {
    const [formValue, setFormValue] = useState(resumeJson.professional_experiences.data || []);
    const dispatch = useDispatch();
    useEffect(() => {
        setFormValue(resumeJson.professional_experiences.data || []);
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // prevents accidental drags on touch
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 200,      // ms hold before drag starts
                tolerance: 5,    // px finger can move during delay
            },
        })
    );
    const handleExpand = () => {
        setEditSectionName(false);
        setExpanded(expanded === "professional_experiences" ? "" : "professional_experiences");
    };

    const handleAddExperience = () => {
        setFormValue((prev) => [
            ...prev,
            {
                id: uuidv4(),
                "company_name": "",
                "job_title": "",
                "start_date": "",
                "end_date": "",
                "is_current": "",
                "bullet_items": [
                ],
                "technologies": "",
                "company_location": "",
                "link": "",
                "promoted_from": "",
                "is_promoted": ""
            },
        ]);
    };

    useEffect(() => {
        setResumeJson({ ...resumeJson, professional_experiences: { ...resumeJson.professional_experiences, data: formValue } });
    }, [formValue]);

    // ----------------------------
    // GROUP DRAGGING HANDLERS
    // ----------------------------
    const [activeGroup, setActiveGroup] = useState(null);
    const [groupHover, setGroupHover] = useState(null);

    const handleGroupDragEnd = ({ active, over }) => {
        setActiveGroup(null);
        setGroupHover(null);
        if (!over || active.id === over.id) return;

        setFormValue((prev) => {
            const oldIndex = prev.findIndex((g) => g.id === active.id);
            const newIndex = prev.findIndex((g) => g.id === over.id);
            return arrayMove(prev, oldIndex, newIndex);
        });
    };

    const handleGroupDragOver = ({ active, over }) => {
        if (!active || !over) return;

        const prev = formValue;
        const activeIndex = prev.findIndex((g) => g.id === active.id);
        const overIndex = prev.findIndex((g) => g.id === over.id);

        setGroupHover({
            id: over.id,
            isBefore: activeIndex < overIndex,
        });
    };
    const [editSectionName, setEditSectionName] = useState(false);
    const [confirmDeleteSection, setConfirmDeleteSection] = useState(false);
    const handleDeleteSection = () => {
        dispatch({ type: REMOVE_EDITOR_SECTION, payload: "professional_experiences" });
        setConfirmDeleteSection(false);
    }

    const handleBlurSectionName = (e) => {
        setResumeJson({ ...resumeJson, professional_experiences: { ...resumeJson.professional_experiences, sectionName: e.target.value } });
        setEditSectionName(false);
    }

    return (
        <div className="re-section">
            <div className="re-section-head" onClick={handleExpand}>
                {confirmDeleteSection ?
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
                    :
                    <>
                        {editSectionName ? (
                            <input
                                autoFocus
                                type="text"
                                className="base-input"
                                defaultValue={resumeJson.professional_experiences.sectionName}
                                onBlur={(e) => handleBlurSectionName(e)}
                                onKeyDown={(e) => e.key === "Enter" && handleBlurSectionName(e)}
                            />
                        ) : (
                            <h6>{resumeJson.professional_experiences.sectionName}</h6>
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
                            <span className={`expand-icon ${expanded === "professional_experiences" ? "expanded" : ""}`}>
                                <ArrowDownIcon />
                            </span>
                        </div>
                    </>
                }
            </div>

            {expanded === "professional_experiences" && (
                <div className="re-section-content" data-editor-item-id={"re$professional_experiences$data"}>

                    {/* ------------------------ */}
                    {/* GROUP SORTING CONTEXT */}
                    {/* ------------------------ */}
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={({ active }) => setActiveGroup(active.id)}
                        onDragOver={handleGroupDragOver}
                        onDragEnd={handleGroupDragEnd}
                        modifiers={[restrictToParentElement]}
                    >
                        <SortableContext
                            items={formValue.map((item) => item.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="skills-groups">
                                {formValue.map((item, index) => (
                                    <SortableGroupWrapper
                                        key={item.id}
                                        id={item.id}
                                        isTarget={groupHover?.id === item.id}
                                        isBefore={groupHover?.isBefore}
                                        activeId={activeGroup}
                                    >
                                        <REExperienceItem
                                            experienceItem={item}
                                            itemIndex={index}
                                            formValue={formValue}
                                            setFormValue={setFormValue}
                                        />
                                    </SortableGroupWrapper>
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>

                    <button className="add-skill-group" onClick={handleAddExperience}>
                        <AddIcon /> Work Experience
                    </button>
                </div>
            )}
        </div>
    );
}

/* -----------------------------------------------------------
   SORTABLE GROUP WRAPPER (DRAGGABLE GROUP)
----------------------------------------------------------- */
const SortableGroupWrapper = ({ id, children, isTarget, isBefore, activeId }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({
            id,
            animateLayoutChanges: () => false,
        });

    const style = {
        transform: isDragging ? CSS.Transform.toString(transform) : undefined,
        transition: "none",
        position: "relative",
        zIndex: isDragging ? 13 : "auto",
        opacity: isDragging ? 0.9 : 1,
    };

    const showBar = isTarget && id !== activeId;

    return (
        <div ref={setNodeRef} style={style}>

            {/* Green Insertion Bar */}
            {showBar && (
                <div
                    style={{
                        position: "absolute",
                        [isBefore ? "bottom" : "top"]: "-8px",
                        left: 0,
                        right: 0,
                        height: "2px",
                        background: "limegreen",
                        borderRadius: "2px",
                        zIndex: 12,
                    }}
                />
            )}

            {/* Drag Handle (NO injection!) */}
            <div
                {...attributes}
                {...listeners}
                className="drag-handle"
                style={{
                    cursor: "grab",
                    touchAction: "none",
                    display: "flex",
                    alignItems: "center",
                    userSelect: "none",
                    position: "absolute",
                    top: "12px",
                    left: 0,
                    zIndex: 11
                }}
            >
                <SortingHandleIcon />
            </div>

            {/* Original content untouched */}
            <div>
                {children}
            </div>
        </div>
    );
};


const REExperienceItem = ({ experienceItem, itemIndex, formValue, setFormValue }) => {
    const [isEditActive, setIsEditActive] = useState(false);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(false);
    const [isPromoted, setIsPromoted] = useState(false);
    const textAreaRef = useRef(null);

    // Bullet drag state (for reordering bullets within this experience)
    const [activeBullet, setActiveBullet] = useState(null);
    const [bulletHover, setBulletHover] = useState(null);

    const editorItemId = "re$professional_experiences$" + itemIndex;
    const editorOpenFromPreview = sessionStorage.getItem(editorItemId);
    useEffect(() => {
        if (editorOpenFromPreview) {
            setIsEditActive(true);
        }
    }, [editorOpenFromPreview]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // prevents accidental drags on touch
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 200,      // ms hold before drag starts
                tolerance: 5,    // px finger can move during delay
            },
        })
    );

    useEffect(() => {
        if (!experienceItem.job_title) {
            setIsEditActive(true);
        }
    }, []);

    useEffect(() => {
        if (isEditActive) {
            textAreaRef.current.style.height = "auto";
            textAreaRef.current.style.height = textAreaRef.current.scrollHeight + "px";
        }
    }, [isEditActive]);

    const handleItemChange = (e) => {
        const { name, value } = e.target;
        let updated = [...formValue];
        updated[itemIndex][name] = value;
        if (name === "technologies") {
            textAreaRef.current.style.height = "auto";
            textAreaRef.current.style.height = textAreaRef.current.scrollHeight + "px";
        }
        // if (name === "end_date") {
        //     if (value === "Present") {
        //         updated[itemIndex].is_current = true;
        //     } else {
        //         updated[itemIndex].is_current = false;
        //     }
        // }
        setFormValue(updated);
    };


    const handleItemChecked = (e) => {
        const { name, checked } = e.target;
        let updated = [...formValue];
        updated[itemIndex][name] = checked;
        setFormValue(updated);
    };

    const handleIsPromoted = (e) => {
        const { checked } = e.target;
        setIsPromoted(checked);
        if (!checked) {
            let updated = [...formValue];
            updated[itemIndex]["is_promoted"] = checked;
            updated[itemIndex]["promoted_from"] = "";
            setFormValue(updated);
        }
    }

    useEffect(()=>{
        if (experienceItem.is_promoted) {
            setIsPromoted(true);
        }
    },[])

    const handlePromotedFrom = (e) => {
        const { name, value } = e.target;
        let updated = [...formValue];
        updated[itemIndex][name] = value;
        if (value && value?.trim()?.length > 0) {
            updated[itemIndex]["is_promoted"] = true;
        }
        setFormValue(updated);
    }

    const handleBulletChange = (value, index) => {
        let updated = [...formValue];
        updated[itemIndex].bullet_items = updated[itemIndex].bullet_items.map((item, i) => i === index ? { ...item, item: value } : item);
        setFormValue(updated);
    };

    const handleAddBullet = () => {
        let updated = [...formValue];
        updated[itemIndex].bullet_items.push({ id: uuidv4(), item: "" });
        setFormValue(updated);
    };

    const handleDeleteBullet = (index) => {
        let updated = [...formValue];
        updated[itemIndex].bullet_items.splice(index, 1);
        setFormValue(updated);
    };

    // Bullet reorder handlers (drag and drop)
    const bulletIds = (experienceItem.bullet_items || []).map((_, index) => `${experienceItem.id}-bullet-${index}`);

    const handleBulletDragEnd = ({ active, over }) => {
        setActiveBullet(null);
        setBulletHover(null);
        if (!over || active.id === over.id) return;

        const parseIndex = (id) => parseInt(String(id).split("-").pop(), 10);
        const oldIndex = parseIndex(active.id);
        const newIndex = parseIndex(over.id);
        if (oldIndex === newIndex) return;

        let updated = [...formValue];
        const bullets = [...(updated[itemIndex].bullet_items || [])];
        updated[itemIndex].bullet_items = arrayMove(bullets, oldIndex, newIndex);
        setFormValue(updated);
    };

    const handleBulletDragOver = ({ active, over }) => {
        if (!active || !over) return;
        const parseIndex = (id) => parseInt(String(id).split("-").pop(), 10);
        const activeIndex = parseIndex(active.id);
        const overIndex = parseIndex(over.id);
        setBulletHover({
            id: over.id,
            isBefore: activeIndex < overIndex,
        });
    };

    return (
        <div className="skill-group" data-editor-item-id={editorItemId}>
            <div className="skill-group-header list-items" onClick={(e) => !confirmDeleteItem && setIsEditActive(!isEditActive)}>
                {confirmDeleteItem ? (
                    <>
                        <text className="err-text">Delete this experience?</text>
                        <div className="skill-group-actions">
                            <button className="icon-btn circular"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    let updated = [...formValue];
                                    updated.splice(itemIndex, 1);
                                    setFormValue(updated);
                                }}>
                                <CheckIcon />
                            </button>
                            <button className="icon-btn circular"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmDeleteItem(false);
                                }}>
                                <CrossIcon />
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="exp-header">
                            <h6>{experienceItem.company_name || "Company Name"}</h6>
                            <span className="exp-header-text">{experienceItem.job_title || "Job Title"}</span>
                        </div>
                        <div className="skill-group-actions">
                            <button className="icon-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmDeleteItem(true);
                                }}>
                                <DelIcon />
                            </button>
                            <button className={`icon-btn expand-icon ${isEditActive ? "expanded" : ""}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsEditActive(!isEditActive);
                                }}>
                                <ArrowDownIcon />
                            </button>
                        </div>
                    </>
                )}
            </div>
            {isEditActive &&
                <div className="skill-group-content">
                    <input
                        type="text"
                        name="company_name"
                        placeholder="Company Name..."
                        defaultValue={experienceItem.company_name}
                        onBlur={handleItemChange}
                        className={`${!experienceItem.company_name ? "required" : ""}`}
                    />
                    <input
                        type="url"
                        name="link"
                        placeholder="Link"
                        defaultValue={experienceItem.link}
                        onBlur={handleItemChange}
                    />
                    <div className="flex-row align-start">
                        <input
                            type="text"
                            name="start_date"
                            placeholder="Start Date"
                            defaultValue={experienceItem.start_date}
                            onBlur={handleItemChange}
                        />
                        <ToRightArrowIcon />
                        <div className="flex-column w-100 gap-1">
                            <input
                                type="text"
                                name="end_date"
                                placeholder="End Date"
                                defaultValue={experienceItem.is_current ? "Present" : experienceItem.end_date == "{{MM}} {{YYYY}}" ? "" : experienceItem.end_date}
                                onBlur={handleItemChange}
                                disabled={experienceItem.is_current}
                                style={experienceItem.is_current ? { cursor: "not-allowed", opacity: 0.5 } : {}}
                            />
                            <CheckboxInput
                                name="is_current"
                                label="Present"
                                checked={experienceItem.is_current}
                                onChange={handleItemChecked}
                                disabled={experienceItem.end_date && experienceItem.end_date !== "Present"}
                                style={experienceItem.end_date && experienceItem.end_date !== "Present" ? { cursor: "not-allowed", opacity: 0.5 } : {}}
                            />
                        </div>
                    </div>
                    <input
                        type="text"
                        name="company_location"
                        placeholder="Location..."
                        defaultValue={experienceItem.company_location}
                        onBlur={handleItemChange}
                    />
                    <input
                        type="text"
                        name="job_title"
                        placeholder="Job Title..."
                        defaultValue={experienceItem.job_title}
                        onBlur={handleItemChange}
                        className={`${!experienceItem.job_title ? "required" : ""}`}
                    />
                    <div className="exp-promoted-wrapper">
                        <CheckboxInput
                            name="is_promoted"
                            label="Got promoted to this role"
                            checked={isPromoted}
                            onChange={handleIsPromoted}
                        />
                        {isPromoted &&
                            <div className="exp-tech-used">
                                <label className="base-label">Promoted From:</label>
                                <input
                                    type="text"
                                    name="promoted_from"
                                    placeholder="Your previous role..."
                                    defaultValue={experienceItem.promoted_from}
                                    onBlur={handlePromotedFrom}
                                    className="required"
                                />
                            </div>
                        }
                    </div>
                    <div className="flex-column w-100 exp-tech-used">
                        <label className="base-label">Technologies Used:</label>
                        <textarea
                            name="technologies"
                            ref={textAreaRef}
                            placeholder="Technologies used..."
                            defaultValue={experienceItem.technologies}
                            onBlur={handleItemChange}
                            rows={1}
                        />
                    </div>
                    <div className="bullets re-experience">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragStart={({ active }) => setActiveBullet(active.id)}
                            onDragOver={handleBulletDragOver}
                            onDragEnd={handleBulletDragEnd}
                            modifiers={[restrictToParentElement]}
                        >
                            <SortableContext
                                items={bulletIds}
                                strategy={verticalListSortingStrategy}
                            >
                                {(experienceItem.bullet_items || []).map((item, index) => (
                                    <SortableBulletWrapper
                                        key={`${experienceItem.id}-bullet-${index}`}
                                        id={`${experienceItem.id}-bullet-${index}`}
                                        isTarget={bulletHover?.id === `${experienceItem.id}-bullet-${index}`}
                                        isBefore={bulletHover?.isBefore}
                                        activeId={activeBullet}
                                    >
                                        <div
                                            className="bullet-point"
                                            data-editor-item-id={editorItemId + "$bullet" + index}
                                        >
                                            <ResumeJoditField
                                                content={item.item}
                                                onBlur={val => handleBulletChange(val, index)}
                                                forceEditorFocus={editorOpenFromPreview === "bullet" + index}
                                            />
                                            {index > 0 && <button className="icon-btn" onClick={() => handleDeleteBullet(index)}><CrossIcon /></button>}
                                        </div>
                                    </SortableBulletWrapper>
                                ))}
                            </SortableContext>
                        </DndContext>

                        <button className="add-skill-group" onClick={handleAddBullet}>
                            <AddIcon /> Bullet Points
                        </button>
                    </div>
                </div>
            }
        </div>
    );
};

/* -----------------------------------------------------------
   SORTABLE BULLET WRAPPER (DRAGGABLE BULLET)
----------------------------------------------------------- */
const SortableBulletWrapper = ({ id, children, isTarget, isBefore, activeId }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({
            id,
            animateLayoutChanges: () => false,
        });

    const style = {
        transform: isDragging ? CSS.Transform.toString(transform) : undefined,
        transition: "none",
        position: "relative",
        zIndex: isDragging ? 13 : "auto",
        opacity: isDragging ? 0.9 : 1,
    };

    const showBar = isTarget && id !== activeId;

    return (
        <div ref={setNodeRef} style={style}>

            {/* Green Insertion Bar */}
            {showBar && (
                <div
                    style={{
                        position: "absolute",
                        [isBefore ? "bottom" : "top"]: "-8px",
                        left: 0,
                        right: 0,
                        height: "2px",
                        background: "limegreen",
                        borderRadius: "2px",
                        zIndex: 12,
                    }}
                />
            )}

            {/* Drag Handle (NO injection!) */}
            <div
                {...attributes}
                {...listeners}
                className="drag-handle"
                style={{
                    cursor: "grab",
                    touchAction: "none",
                    display: "flex",
                    alignItems: "center",
                    userSelect: "none",
                    position: "absolute",
                    top: "12px",
                    left: "5px",
                    zIndex: 11
                }}
            >
                <SortingHandleIcon />
            </div>

            {/* Original content untouched */}
            <div>
                {children}
            </div>
        </div>
    );
};
