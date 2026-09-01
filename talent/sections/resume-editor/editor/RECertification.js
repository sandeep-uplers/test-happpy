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
import ResumeJoditField from "../ResumeJoditField";

export default function RECertification({ expanded, setExpanded, resumeJson, setResumeJson }) {
    const [formValue, setFormValue] = useState(resumeJson.certifications?.data?.map(item => item ?? "") || []);
    const dispatch = useDispatch();
    // useEffect(() => {
    //     let intialValue = resumeJson.certifications?.data?.map(item => item ?? "") || [];
    //     setFormValue(intialValue);
    // }, []);

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
        setExpanded(expanded === "certifications" ? "" : "certifications");
    };


    const handleAddItem = () => {
        let updated = [...formValue];
        updated.push("");
        setFormValue(updated);
    };

    useEffect(() => {
        setResumeJson({ ...resumeJson, certifications: { ...resumeJson.certifications, data: formValue } });
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
            const oldIndex = prev.findIndex((g) => g === active.id);
            const newIndex = prev.findIndex((g) => g === over.id);
            return arrayMove(prev, oldIndex, newIndex);
        });
    };

    const handleGroupDragOver = ({ active, over }) => {
        if (!active || !over) return;

        const prev = formValue;
        const activeIndex = prev.findIndex((g) => g === active.id);
        const overIndex = prev.findIndex((g) => g === over.id);

        setGroupHover({
            id: over.id,
            isBefore: activeIndex < overIndex,
        });
    };
    const [editSectionName, setEditSectionName] = useState(false);
    const [confirmDeleteSection, setConfirmDeleteSection] = useState(false);
    const handleDeleteSection = () => {
        dispatch({ type: REMOVE_EDITOR_SECTION, payload: "certifications" });
        setConfirmDeleteSection(false);
    }

    const handleBulletChange = (value, itemIndex) => {
        let updated = [...formValue];
        updated[itemIndex] = value;
        setFormValue(updated);
    };

    const handleDeleteBullet = (index) => {
        let updated = [...formValue];
        updated.splice(index, 1);
        setFormValue(updated);
    };

    const handleBlurSectionName = (e) => {
        setResumeJson({ ...resumeJson, certifications: { ...resumeJson.certifications, sectionName: e.target.value } });
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
                                defaultValue={resumeJson.certifications?.sectionName}
                                onBlur={(e) => handleBlurSectionName(e)}
                                onKeyDown={(e) => e.key === "Enter" && handleBlurSectionName(e)}
                            />
                        ) : (
                            <h6>{resumeJson.certifications?.sectionName}</h6>
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
                            <span className={`expand-icon ${expanded === "certifications" ? "expanded" : ""}`}>
                                <ArrowDownIcon />
                            </span>
                        </div>
                    </>
                }
            </div>

            {expanded === "certifications" && (
                <div className="re-section-content" data-editor-item-id={"re$certifications$data"}>

                    <div className="skill-group-content">
                        <div className="skills-groups">
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragStart={({ active }) => setActiveGroup(active.id)}
                                onDragOver={handleGroupDragOver}
                                onDragEnd={handleGroupDragEnd}
                                modifiers={[restrictToParentElement]}
                            >
                                <SortableContext
                                    items={formValue.map((item) => item)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="bullets generic-section">
                                        {formValue.map((item, index) => (
                                            <SortableGroupWrapper
                                                key={"certi-" + index}
                                                id={item}
                                                isTarget={groupHover?.id === item}
                                                isBefore={groupHover?.isBefore}
                                                activeId={activeGroup}
                                            >
                                                <RECertItem
                                                    certificationItem={item}
                                                    itemIndex={index}
                                                    handleBulletChange={handleBulletChange}
                                                    handleDeleteBullet={handleDeleteBullet}
                                                />
                                            </SortableGroupWrapper>
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        </div>
                    </div>
                    <button className="add-skill-group" onClick={handleAddItem}>
                        <AddIcon /> Certification
                    </button>
                </div>
            )}
        </div>
    );
}


const RECertItem = ({ certificationItem, itemIndex, handleBulletChange, handleDeleteBullet }) => {
    const textAreaRef = useRef(null);

    const editorItemId = "re$certifications$" + itemIndex;
    const editorOpenFromPreview = sessionStorage.getItem(editorItemId);
    // useEffect(() => {
    //     if (editorOpenFromPreview) {
    //         textAreaRef.current.focus();
    //     }
    // }, [editorOpenFromPreview]);

    // useEffect(() => {
    //     if (textAreaRef.current) {
    //         textAreaRef.current.style.height = "auto";
    //         textAreaRef.current.style.height = textAreaRef.current.scrollHeight + "px";
    //     }
    // }, [certificationItem]);

    return (
        <div className="bullet-point" data-editor-item-id={editorItemId}>
            <ResumeJoditField
                content={certificationItem}
                forceEditorFocus={editorOpenFromPreview === "bullet" + itemIndex}
                onBlur={val => handleBulletChange(val, itemIndex)}
                rows={1}
            />
            {itemIndex > 0 && <button className="icon-btn" onClick={() => handleDeleteBullet(itemIndex)}><CrossIcon /></button>}
        </div>
    );
};


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
                        [isBefore ? "bottom" : "top"]: "-3px",
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
                style={{
                    cursor: "grab",
                    touchAction: "none",
                    display: "flex",
                    alignItems: "center",
                    userSelect: "none",
                    position: "absolute",
                    top: "8px",
                    left: "8px",
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
