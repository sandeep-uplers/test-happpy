import React, { useState } from "react";
import AutoSizeInput from "../AutoSizeInput";

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
    rectSortingStrategy,
    useSortable
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import {
    CheckIcon,
    CrossIcon,
    DelIcon,
    EditIcon,
    InfoNoteIcon,
    SortingHandleIcon
} from "../ResumEditorIcons";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import { v4 as uuidv4 } from 'uuid';

export default function RESkillGroup({ skillGroup, groupIndex, formValue, setFormValue }) {
    const [isEditActive, setIsEditActive] = useState(false);
    const [confirmDeleteGroup, setConfirmDeleteGroup] = useState(false);

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

    const handleSkillChange = (e, index) => {
        const val = e.target.value;
        let updated = [...formValue];
        updated[groupIndex].data[index].item = val;
        setFormValue(updated);
    };

    const handleDeleteSkill = (index) => {
        let updated = [...formValue];
        updated[groupIndex].data.splice(index, 1);
        setFormValue(updated);
    };

    const handleAddSkillKeyDown = (e) => {
        if (e.key === "Enter" && e.target.value.trim()) {
            let updated = [...formValue];
            updated[groupIndex].data.push({
                id: uuidv4(),
                item: e.target.value
            });
            setFormValue(updated);
            e.target.value = "";
        }
    };

    // SKILL SORTING LOCAL STATE
    const [overInfo, setOverInfo] = useState(null);
    const [activeId, setActiveId] = useState(null);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveId(null);
        setOverInfo(null);

        if (!over || active.id === over.id) return;

        setFormValue((prev) => {
            let arr = [...prev];
            const oldIndex = arr[groupIndex].data.findIndex((skill) => skill.item === active.id);
            const newIndex = arr[groupIndex].data.findIndex((skill) => skill.item === over.id);

            arr[groupIndex].data = arrayMove(arr[groupIndex].data, oldIndex, newIndex);
            return arr;
        });
    };

    const handleDragOver = ({ active, over }) => {
        if (!active || !over) return;

        setOverInfo({
            id: over.id,
            isBefore:
                formValue[groupIndex].data.findIndex((skill) => skill.item === active.id) <
                formValue[groupIndex].data.findIndex((skill) => skill.item === over.id),
        });
    };

    const handleBlurGroupName = (e) => {
        let updated = [...formValue];
        updated[groupIndex].groupName = e.target.value;
        setFormValue(updated);
        setIsEditActive(false);
    }

    return (
        <div className="skill-group" data-editor-item-id={'re$technical_skills$' + groupIndex}>
            <div className="skill-group-header">
                {confirmDeleteGroup ? (
                    <>
                        <text className="err-text">Delete this skill group?</text>
                        <div className="skill-group-actions">
                            <button className="icon-btn circular" onClick={() => {
                                let updated = [...formValue];
                                updated.splice(groupIndex, 1);
                                setFormValue(updated);
                            }}>
                                <CheckIcon />
                            </button>
                            <button className="icon-btn circular" onClick={() => setConfirmDeleteGroup(false)}>
                                <CrossIcon />
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        {isEditActive ? (
                            <input
                                autoFocus
                                type="text"
                                className="base-input"
                                defaultValue={skillGroup.groupName}
                                onBlur={(e) => handleBlurGroupName(e)}
                                onKeyDown={(e) => e.key === "Enter" && handleBlurGroupName(e)}
                            />
                        ) : (
                            <h6>{skillGroup.groupName}</h6>
                        )}

                        <div className="skill-group-actions">
                            <button className="icon-btn" onClick={() => setIsEditActive(true)}>
                                <EditIcon />
                            </button>
                            <button className="icon-btn" onClick={() => setConfirmDeleteGroup(true)}>
                                <DelIcon />
                            </button>
                        </div>
                    </>
                )}
            </div>

            <div className="skill-group-content">
                {skillGroup.data.length > 0 && (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={({ active }) => setActiveId(active.id)}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                        modifiers={[restrictToParentElement]}
                    >
                        <SortableContext items={skillGroup.data.map((skill) => skill.item)} strategy={rectSortingStrategy}>
                            <div className="skill-group-items">
                                {skillGroup.data.map((skill, index) => (
                                    <SkillChip
                                        key={skillGroup.groupName + "-skillchip-" + index}
                                        id={skill.item}
                                        skill={skill}
                                        isBefore={overInfo?.isBefore}
                                        isTarget={overInfo?.id === skill.item}
                                        activeId={activeId}
                                        handleSkillChange={(e) => handleSkillChange(e, index)}
                                        handleDeleteSkill={() => handleDeleteSkill(index)}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}

                <div className="add-skill-item">
                    <input
                        type="text"
                        placeholder="Add skill..."
                        onKeyDown={handleAddSkillKeyDown}
                        autoFocus={skillGroup.data.length === 0}
                    />
                    <span className="info-note-icon">
                        <InfoNoteIcon />
                        <span className="info-note-text">Press 'Enter' to add skill</span>
                    </span>
                </div>
            </div>
        </div>
    );
};

/* -----------------------------------------------------------
   SKILL CHIP SORTABLE
----------------------------------------------------------- */
const SkillChip = ({ id, skill, isTarget, activeId, handleSkillChange, handleDeleteSkill, isBefore }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useSortable({
            id,
            animateLayoutChanges: () => false,
        });

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: isDragging ? CSS.Transform.toString(transform) : undefined,
                transition: "none",
                background: "#F8F8F9",
                borderRadius: "4px",
                position: "relative",
                display: "flex",
                alignItems: "center",
                zIndex: isDragging ? 999 : "auto",
                opacity: isDragging ? 0.8 : 1
            }}
            {...attributes}
        >
            {/* green insertion bar */}
            {isTarget && id !== activeId && (
                <div
                    style={{
                        position: "absolute",
                        [isBefore ? "right" : "left"]: "-3px",
                        top: 0,
                        width: "2px",
                        height: "100%",
                        background: "limegreen",
                        zIndex: 12,
                    }}
                />
            )}

            {/* drag handle */}
            <div {...listeners} style={{ padding: "6px", cursor: "grab", touchAction: "none" }}>
                <SortingHandleIcon />
            </div>

            <div className="skill-group-item">
                <AutoSizeInput type="text" value={skill.item} onChange={handleSkillChange} />
                <span className="icon-btn" onClick={handleDeleteSkill}>
                    <CrossIcon />
                </span>
            </div>
        </div>
    );
};