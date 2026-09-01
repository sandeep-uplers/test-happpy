import React, { useEffect, useState } from "react";

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
    SortingHandleIcon
} from "../ResumEditorIcons";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import { REMOVE_EDITOR_SECTION } from "../../../store/actions/actionsTypes";
import { useDispatch } from "react-redux";

export default function REEducation({ expanded, setExpanded, resumeJson, setResumeJson }) {
    const [formValue, setFormValue] = useState(resumeJson.educations.data || []);
    const dispatch = useDispatch();
    useEffect(() => {
        setFormValue(resumeJson.educations.data || []);
    }, []);

    const handleExpand = () => {
        setEditSectionName(false);
        setExpanded(expanded === "educations" ? "" : "educations");
    };

    const handleAddEducation = () => {
        setFormValue((prev) => [
            ...prev,
            {
                id: uuidv4(),
                "college_name": "",
                "degree": "",
                "end_date": "",
                "location": "",
                "grade": ""
            },
        ]);
    };

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
        setResumeJson({ ...resumeJson, educations: { ...resumeJson.educations, data: formValue } });
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
        dispatch({ type: REMOVE_EDITOR_SECTION, payload: "educations" });
        setConfirmDeleteSection(false);
    }

    const handleBlurSectionName = (e) => {
        setResumeJson({ ...resumeJson, educations: { ...resumeJson.educations, sectionName: e.target.value } });
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
                                defaultValue={resumeJson.educations.sectionName}
                                onBlur={(e) => handleBlurSectionName(e)}
                                onKeyDown={(e) => e.key === "Enter" && handleBlurSectionName(e)}
                            />
                        ) : (
                            <h6>{resumeJson.educations.sectionName}</h6>
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
                            <span className={`expand-icon ${expanded === "educations" ? "expanded" : ""}`}>
                                <ArrowDownIcon />
                            </span>
                        </div>
                    </>
                }
            </div>

            {expanded === "educations" && (
                <div className="re-section-content" data-editor-item-id={"re$educations$data"}>

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
                                        <REEducationItem
                                            educationItem={item}
                                            itemIndex={index}
                                            formValue={formValue}
                                            setFormValue={setFormValue}
                                        />
                                    </SortableGroupWrapper>
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>

                    <button className="add-skill-group" onClick={handleAddEducation}>
                        <AddIcon /> Education
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


const REEducationItem = ({ educationItem, itemIndex, formValue, setFormValue }) => {
    const [isEditActive, setIsEditActive] = useState(false);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(false);

    const editorItemId = "re$educations$" + itemIndex;
    const editorOpenFromPreview = sessionStorage.getItem(editorItemId);
    useEffect(() => {
        if (editorOpenFromPreview) {
            setIsEditActive(true);
        }
    }, [editorOpenFromPreview]);

    useEffect(() => {
        if (!educationItem.college_name) {
            setIsEditActive(true);
        }
    }, []);

    const handleItemChange = (e) => {
        const { name, value } = e.target;
        let updated = [...formValue];
        updated[itemIndex][name] = value;
        setFormValue(updated);
    };


    const handleItemChecked = (e) => {
        const { name, checked } = e.target;
        let updated = [...formValue];
        updated[itemIndex][name] = checked;
        if (name === "is_current") {
            updated[itemIndex].end_date = checked ? "Present" : "";
        }
        setFormValue(updated);
    };


    return (
        <div className="skill-group" data-editor-item-id={editorItemId} >
            <div className="skill-group-header list-items" onClick={(e) => !confirmDeleteItem && setIsEditActive(!isEditActive)}>
                {confirmDeleteItem ? (
                    <>
                        <text className="err-text">Delete this education?</text>
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
                            <h6>{educationItem.college_name || "School Name"}</h6>
                            <span className="exp-header-text">{educationItem.degree || "Degree & Majors"}</span>
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
                        name="college_name"
                        placeholder="School Name..."
                        defaultValue={educationItem.college_name}
                        onBlur={handleItemChange}
                        className={`${!educationItem.college_name ? "required" : ""}`}
                    />
                    <input
                        type="text"
                        name="degree"
                        placeholder="Degree & Majors..."
                        defaultValue={educationItem.degree}
                        onBlur={handleItemChange}
                    />
                    <input
                        type="text"
                        name="grade"
                        placeholder="Grade / Marks"
                        defaultValue={educationItem.grade}
                        onBlur={handleItemChange}
                    />
                    <input
                        type="text"
                        name="location"
                        placeholder="Location..."
                        defaultValue={educationItem.location}
                        onBlur={handleItemChange}
                    />
                    <div className="flex-row">
                        <input
                            type="text"
                            name="end_date"
                            placeholder="End Date (MM YYYY)"
                            className="w-50"
                            defaultValue={educationItem.end_date == "{{MM}} {{YYYY}}" ? "" : educationItem.end_date}
                            onBlur={handleItemChange}
                        />
                        <CheckboxInput
                            name="is_current"
                            label="Present"
                            checked={educationItem.end_date == "Present"}
                            onChange={handleItemChecked}
                        />
                    </div>
                </div>
            }
        </div>
    );
};
