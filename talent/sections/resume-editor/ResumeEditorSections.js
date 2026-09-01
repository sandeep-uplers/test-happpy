import { useEffect, useRef, useState } from "react";
import REAchievements from "./editor/REAchievements";
import RECertification from "./editor/RECertification";
import REEducation from "./editor/REEducation";
import REExperience from "./editor/REExperience";
import REGenericSection from "./editor/REGenericSection";
import REPersonalInfo from "./editor/REPersonalInfo";
import REProjects from "./editor/REProjects";
import RESkills from "./editor/RESkills";
import RESummary from "./editor/RESummary";
import { AddIcon, SortingHandleIcon } from "./ResumEditorIcons";
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
import { restrictToParentElement } from "@dnd-kit/modifiers";
import { useDispatch, useSelector } from "react-redux";
import { SET_EXPANDED_SECTION, SET_SORTING_JSON, SET_TAILOR_JSON } from "../../store/actions/actionsTypes";

export const allDefaultSections = [
    {
        label: "Basic Details",
        key: "basic_details",
    },
    {
        label: "Summary",
        key: "summary",
    },
    {
        label: "Technical Skills",
        key: "technical_skills",
    },
    {
        label: "Professional Experiences",
        key: "professional_experiences",
    },
    {
        label: "Educations",
        key: "educations",
    },
    {
        label: "Projects",
        key: "major_projects",
    },
    {
        label: "Certifications",
        key: "certifications",
    },
    {
        label: "Achievements",
        key: "achievements",
    },
    {
        label: "Interests",
        key: "interests",
    },
    {
        label: "Hobbies",
        key: "hobbies",
    },
    {
        label: "Activities",
        key: "activities",
    },
    {
        label: "Communication Languages",
        key: "communication_languages",
    },
    {
        label: "Additional Section",
        key: "additional_section",
    }
]

export default function ResumeEditorSections() {

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

    const {
        tailor_json: resumeJson,
        sorting_json: sectionsOrder,
        generic_sections: genericSections,
        expanded_section: expanded
    } = useSelector(state => state.resumeEditor);

    const setExpanded = (newExpandedSection) => {
        dispatch({ type: SET_EXPANDED_SECTION, payload: newExpandedSection });
    }

    const dispatch = useDispatch();

    const setResumeJson = (newResumeJson) => {
        dispatch({ type: SET_TAILOR_JSON, payload: newResumeJson });
    }

    const setSectionsOrder = (newSectionsOrder) => {
        dispatch({ type: SET_SORTING_JSON, payload: newSectionsOrder });
    }

    const [newSectionMenu, setNewSectionMenu] = useState(false);
    const [openUpwards, setOpenUpwards] = useState(false);
    const newSectionRef = useRef(null);
    const menuRef = useRef(null);

    const clickOutside = (e) => {
        if (newSectionRef.current && !newSectionRef.current.contains(e.target)) {
            setNewSectionMenu(false);
        }
    }

    useEffect(() => {
        if (newSectionMenu) {
            document.addEventListener('click', clickOutside);
            return () => {
                document.removeEventListener('click', clickOutside);
            }
        }
    }, [newSectionMenu]);

    const getNextAdditionalSectionIndex = (sectionsOrder) => {
        const usedNumbers = sectionsOrder
            .map(s => s.key.match(/^additional_section_(\d+)$/))
            .filter(Boolean)
            .map(match => Number(match[1]));

        return usedNumbers.length ? Math.max(...usedNumbers) + 1 : 1;
    };

    const handleAddSection = (newSection) => {
        let prev = [...sectionsOrder];
        let existingIndex = prev.findIndex(s => s.key === newSection.key);
        let sectionKey = newSection.key;
        let sectionLabel = newSection.label;

        if (newSection.key === "additional_section") {
            const nextIndex = getNextAdditionalSectionIndex(prev);
            sectionKey = `additional_section_${nextIndex}`;
            sectionLabel = `Additional Section ${nextIndex}`;
        }

        if (existingIndex !== -1 && newSection.key !== "additional_section") {
            prev.splice(existingIndex, 1);
            prev.push({
                key: sectionKey,
                show: true,
            });
            setSectionsOrder(prev);
            setNewSectionMenu(false);
            return;
        }
        prev.push({
            key: sectionKey,
            show: true,
        });
        setSectionsOrder(prev);
        setNewSectionMenu(false);
        let newResumeJson = { ...resumeJson };
        newResumeJson[sectionKey] = {
            sectionName: sectionLabel,
            data: sectionKey === "summary" ? "" : [],
        };
        setResumeJson(newResumeJson);
    }

    // ----------------------------
    // GROUP DRAGGING HANDLERS
    // ----------------------------
    const [activeGroup, setActiveGroup] = useState(null);
    const [groupHover, setGroupHover] = useState(null);

    const handleGroupDragEnd = ({ active, over }) => {
        setActiveGroup(null);
        setGroupHover(null);
        if (!over || active.id === over.id) return;

        let prev = [...sectionsOrder];
        const oldIndex = prev.findIndex((s) => s.key === active.id);
        const newIndex = prev.findIndex((s) => s.key === over.id);
        let newSectionsOrder = arrayMove(prev, oldIndex, newIndex);
        setSectionsOrder(newSectionsOrder);
    };

    const handleGroupDragOver = ({ active, over }) => {
        if (!active || !over) return;

        const prev = [...sectionsOrder];
        const activeIndex = prev.findIndex((s) => s.key === active.id);
        const overIndex = prev.findIndex((s) => s.key === over.id);

        setGroupHover({
            id: over.id,
            isBefore: activeIndex < overIndex,
        });
    };


    useEffect(() => {
        if (newSectionMenu && newSectionRef.current) {
            const buttonRect = newSectionRef.current.getBoundingClientRect();

            const spaceBelow = window.innerHeight - buttonRect.bottom;
            const spaceAbove = buttonRect.top;

            const menuHeight = 250; // expected dropdown height

            if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
                setOpenUpwards(true);
            } else {
                setOpenUpwards(false);
            }
        }
    }, [newSectionMenu]);

    useEffect(() => {
        console.log('sectionsOrder', sectionsOrder);
    }, [sectionsOrder]);

    return (
        <div className="re-sections-wrapper">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={({ active }) => setActiveGroup(active.id)}
                onDragOver={handleGroupDragOver}
                onDragEnd={handleGroupDragEnd}
                modifiers={[restrictToParentElement]}
            >
                <SortableContext
                    items={sectionsOrder.map(s => s.key)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="re-sections" id="re-editor-sections">
                        {sectionsOrder.map((section) => (
                            section.key === "basic_details" ?
                                <REPersonalInfo
                                    expanded={expanded} setExpanded={setExpanded}
                                    resumeJson={resumeJson} setResumeJson={setResumeJson}
                                />
                                :
                                section.show && resumeJson[section.key] && (
                                    <SortableGroupWrapper
                                        key={section.key}
                                        id={section.key}
                                        isTarget={groupHover?.id === section.key}
                                        isBefore={groupHover?.isBefore}
                                        activeId={activeGroup}
                                        expanded={expanded}
                                    >
                                        {section.key == "summary" && <RESummary expanded={expanded} setExpanded={setExpanded} resumeJson={resumeJson} setResumeJson={setResumeJson} />}
                                        {section.key == "technical_skills" && <RESkills expanded={expanded} setExpanded={setExpanded} resumeJson={resumeJson} setResumeJson={setResumeJson} />}
                                        {section.key == "professional_experiences" && <REExperience expanded={expanded} setExpanded={setExpanded} resumeJson={resumeJson} setResumeJson={setResumeJson} />}
                                        {section.key == "educations" && <REEducation expanded={expanded} setExpanded={setExpanded} resumeJson={resumeJson} setResumeJson={setResumeJson} />}
                                        {section.key == "major_projects" && <REProjects expanded={expanded} setExpanded={setExpanded} resumeJson={resumeJson} setResumeJson={setResumeJson} />}
                                        {section.key == "certifications" && <RECertification expanded={expanded} setExpanded={setExpanded} resumeJson={resumeJson} setResumeJson={setResumeJson} />}
                                        {section.key == "achievements" && <REAchievements expanded={expanded} setExpanded={setExpanded} resumeJson={resumeJson} setResumeJson={setResumeJson} />}
                                        {genericSections.includes(section.key) && <REGenericSection expanded={expanded} setExpanded={setExpanded} resumeJson={resumeJson} setResumeJson={setResumeJson} sectionKey={section.key} />}
                                        {!allDefaultSections.map(s => s.key).includes(section.key) && <REGenericSection expanded={expanded} setExpanded={setExpanded} resumeJson={resumeJson} setResumeJson={setResumeJson} sectionKey={section.key} />}
                                    </SortableGroupWrapper>
                                )
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
            <div className="re-sections-new" ref={newSectionRef}>
                <button className="add-section-btn" onClick={() => setNewSectionMenu(true)} disabled={!sectionsOrder.some(s => s.key && s.show)}>
                    <AddIcon /> Add Section
                </button>
                {newSectionMenu &&
                    <ul
                        className={`new-section-list ${openUpwards ? "open-up" : "open-down"}`}
                        ref={menuRef}
                    >
                        {allDefaultSections.map((section) => (
                            <>
                                {!sectionsOrder.some(s => s.key === section.key && s.show) &&
                                    <li onClick={() => handleAddSection(section)}>
                                        <AddIcon /> {section.label}
                                    </li>
                                }
                            </>
                        ))}
                    </ul>
                }
            </div>
        </div >
    );
}

const SortableGroupWrapper = ({ id, children, isTarget, isBefore, activeId, expanded }) => {
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
                style={{
                    cursor: "grab",
                    touchAction: "none",
                    display: "flex",
                    alignItems: "center",
                    userSelect: "none",
                    position: "absolute",
                    top: "12px",
                    left: "8px",
                    zIndex: 11,
                    pointerEvents: expanded == id ? "none" : "auto",
                    opacity: expanded == id ? 0.5 : 1,
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