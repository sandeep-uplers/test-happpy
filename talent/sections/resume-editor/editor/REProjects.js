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

export default function REProjects({ expanded, setExpanded, resumeJson, setResumeJson }) {
    const [formValue, setFormValue] = useState(resumeJson.major_projects.data || []);
    const dispatch = useDispatch();
    useEffect(() => {
        setFormValue(resumeJson.major_projects.data || []);
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
        setExpanded(expanded === "major_projects" ? "" : "major_projects");
    };

    const handleAddItem = () => {
        setFormValue((prev) => [
            ...prev,
            {
                id: uuidv4(),
                "title": "",
                "description": "",
                "link": "",
                "bullet_items": [
                    "",
                ],
                "company_name": "",
            },
        ]);
    };

    useEffect(() => {
        setResumeJson({ ...resumeJson, major_projects: { ...resumeJson.major_projects, data: formValue } });
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
        dispatch({ type: REMOVE_EDITOR_SECTION, payload: "major_projects" });
        setConfirmDeleteSection(false);
    }
    const handleBlurSectionName = (e) => {
        setResumeJson({ ...resumeJson, major_projects: { ...resumeJson.major_projects, sectionName: e.target.value } });
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
                                defaultValue={resumeJson.major_projects.sectionName}
                                onBlur={(e) => handleBlurSectionName(e)}
                                onKeyDown={(e) => e.key === "Enter" && handleBlurSectionName(e)}
                            />
                        ) : (
                            <h6>{resumeJson.major_projects.sectionName}</h6>
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
                            <span className={`expand-icon ${expanded === "major_projects" ? "expanded" : ""}`}>
                                <ArrowDownIcon />
                            </span>
                        </div>
                    </>
                }
            </div>

            {expanded === "major_projects" && (
                <div className="re-section-content" data-editor-item-id={"re$major_projects$data"}>

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
                                        <REProjectItem
                                            projectItem={item}
                                            itemIndex={index}
                                            formValue={formValue}
                                            setFormValue={setFormValue}
                                        />
                                    </SortableGroupWrapper>
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>

                    <button className="add-skill-group" onClick={handleAddItem}>
                        <AddIcon /> Project
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


const REProjectItem = ({ projectItem, itemIndex, formValue, setFormValue }) => {
    const [isEditActive, setIsEditActive] = useState(false);
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(false);
    const textAreaRef = useRef(null);
    const [activeBullet, setActiveBullet] = useState(null);
    const [bulletHover, setBulletHover] = useState(null);

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

    const editorItemId = "re$major_projects$" + itemIndex;
    const editorOpenFromPreview = sessionStorage.getItem(editorItemId);
    useEffect(() => {
        if (editorOpenFromPreview) {
            setIsEditActive(true);
        }
    }, [editorOpenFromPreview]);

    useEffect(() => {
        if (!projectItem.title) {
            setIsEditActive(true);
        }
    }, []);

    // useEffect(() => {
    //     if (isEditActive) {
    //         textAreaRef.current.style.height = "auto";
    //         textAreaRef.current.style.height = textAreaRef.current.scrollHeight + "px";
    //     }
    // }, [isEditActive]);

    const handleItemChange = (e) => {
        const { name, value } = e.target;
        let updated = [...formValue];
        updated[itemIndex][name] = value;
        if (name === "description") {
            textAreaRef.current.style.height = "auto";
            textAreaRef.current.style.height = textAreaRef.current.scrollHeight + "px";
        }
        setFormValue(updated);
    };

    const handleBulletChange = (value, index) => {
        let updated = [...formValue];
        updated[itemIndex].bullet_items = updated[itemIndex].bullet_items.map((item, i) => i === index ? value : item);
        setFormValue(updated);
    };

    const handleAddBullet = () => {
        let updated = [...formValue];
        updated[itemIndex].bullet_items.push("");
        setFormValue(updated);
    };

    const handleDeleteBullet = (index) => {
        let updated = [...formValue];
        updated[itemIndex].bullet_items.splice(index, 1);
        setFormValue(updated);
    };

    const bulletIds = (projectItem.bullet_items || []).map((_, index) => `${projectItem.id}-bullet-${index}`);

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
                        <text className="err-text">Delete this project?</text>
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
                            <h6>{projectItem.title || "Project Name"}</h6>
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
                        name="title"
                        placeholder="Project Name..."
                        defaultValue={projectItem.title}
                        onBlur={handleItemChange}
                        className={`${!projectItem.title ? "required" : ""}`}
                    />
                    {/* <textarea
                        name="description"
                        ref={textAreaRef}
                        placeholder="Description..."
                        defaultValue={projectItem.description}
                        onBlur={handleItemChange}
                        rows={1}
                    /> */}
                    <input
                        type="text"
                        name="link"
                        placeholder="Project URL..."
                        defaultValue={projectItem.link}
                        onBlur={handleItemChange}
                    />
                    <input
                        type="text"
                        name="company_name"
                        placeholder="Organization..."
                        defaultValue={projectItem.company_name}
                        onBlur={handleItemChange}
                        className={`${!projectItem.company_name ? "required" : ""}`}
                    />
                    <div className="bullets re-projects">
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
                                {projectItem.bullet_items.map((item, index) => (
                                    <SortableBulletWrapper
                                        key={`bullet-${index}`}
                                        id={`bullet-${index}`}
                                        isTarget={bulletHover?.id === `bullet-${index}`}
                                        isBefore={bulletHover?.isBefore}
                                        activeId={activeBullet}
                                    >
                                        <div
                                            className="bullet-point"
                                            data-editor-item-id={editorItemId + "$bullet" + index}
                                        >
                                            <ResumeJoditField
                                                content={item}
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