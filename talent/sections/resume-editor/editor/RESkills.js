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

import RESkillGroup from "./RESkillGroup";
import {
    AddIcon,
    ArrowDownIcon,
    CheckIcon,
    CrossIcon,
    DelIcon,
    EditIcon,
    SortingHandleIcon
} from "../ResumEditorIcons";
import { v4 as uuidv4 } from 'uuid';
import { restrictToParentElement } from "@dnd-kit/modifiers";
import { REMOVE_EDITOR_SECTION } from "../../../store/actions/actionsTypes";
import { useDispatch } from "react-redux";
export default function RESkills({ expanded, setExpanded, resumeJson, setResumeJson }) {
    const [formValue, setFormValue] = useState(resumeJson.technical_skills.data || []);
    const dispatch = useDispatch();
    useEffect(() => {
        setFormValue(resumeJson.technical_skills.data || []);
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
        setExpanded(expanded === "technical_skills" ? "" : "technical_skills");
    };

    const handleAddSkillGroup = () => {
        setFormValue((prev) => [
            ...prev,
            {
                groupName: `Skill Group ${prev.length + 1}`,
                id: uuidv4(),
                data: [],
            },
        ]);
    };

    useEffect(() => {
        setResumeJson({ ...resumeJson, technical_skills: { ...resumeJson.technical_skills, data: formValue } });
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
        dispatch({ type: REMOVE_EDITOR_SECTION, payload: "technical_skills" });
        setConfirmDeleteSection(false);
    }

    const handleBlurSectionName = (e) => {
        setResumeJson({ ...resumeJson, technical_skills: { ...resumeJson.technical_skills, sectionName: e.target.value } });
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
                                defaultValue={resumeJson.technical_skills.sectionName}
                                onBlur={(e) => handleBlurSectionName(e)}
                                onKeyDown={(e) => e.key === "Enter" && handleBlurSectionName(e)}
                            />
                        ) : (
                            <h6>{resumeJson.technical_skills.sectionName}</h6>
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
                            <span className={`expand-icon ${expanded === "technical_skills" ? "expanded" : ""}`}>
                                <ArrowDownIcon />
                            </span>
                        </div>
                    </>
                }
            </div>

            {expanded === "technical_skills" && (
                <div className="re-section-content" data-editor-item-id={"re$technical_skills$data"}>

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
                            items={formValue.map((g) => g.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="skills-groups">
                                {formValue.map((group, index) => (
                                    <SortableGroupWrapper
                                        key={group.id}
                                        id={group.id}
                                        isTarget={groupHover?.id === group.id}
                                        isBefore={groupHover?.isBefore}
                                        activeId={activeGroup}
                                    >
                                        <RESkillGroup
                                            skillGroup={group}
                                            groupIndex={index}
                                            formValue={formValue}
                                            setFormValue={setFormValue}
                                        />
                                    </SortableGroupWrapper>
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>

                    <button className="add-skill-group" onClick={handleAddSkillGroup}>
                        <AddIcon /> Skills
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
                // className="drag-handle" //no needed as it is not collapsible
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