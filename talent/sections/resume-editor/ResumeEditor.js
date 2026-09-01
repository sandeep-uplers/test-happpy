import { debounce } from "lodash";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ResumeEditorReport from "./ResumeEditorReport";
import ResumeEditorSections from "./ResumeEditorSections";
import ResumeEditorStyle from "./ResumeEditorStyle";
import ResumePreviewer from "./ResumePreviewer";
import { useRef } from "react";
import ResumeEditorStyleMobile from "./ResumeEditorStyleMobile";
import { TAILOR_RESUME_BETA_USERS } from "../../components/Constant";

export default function ResumeEditor({ defaultTabReport, tailor_json, config_json, sorting_json, tailored_resume_id, generic_sections, 
    tailorInputs, updateTailoredResume, transformedModal = false }) {
    const isMobile = window.innerWidth < 768;
    const [activeTab, setActiveTab] = useState('editor');
    const [showAllTemplates, setShowAllTemplates] = useState(false);
    const [tailoredPageCount, setTailoredPageCount] = useState(1);

    const getTailoredPageCount = () => {
        let pageCount = 1;
        let container = document.getElementById('resume-previewer');
        if (container) {
            let pages = container.querySelectorAll('.page-separator');
            pageCount = pages.length + 1;
        }
        setTailoredPageCount(pageCount);
        return pageCount;
    }

    useEffect(() => {
        if (defaultTabReport && !isMobile) {
            setActiveTab('report');
        }
    }, [defaultTabReport])

    const dispatch = useDispatch();
    const handleTabChange = (tab) => {
        if (isMobile) {
            document.getElementsByClassName('tr-drawer-content')[0].scrollTo({ top: 0, behavior: 'instant' });
        }
        setActiveTab(tab);
    }

    const { user } = useSelector(state => state.auth);
    const isBetaUser = TAILOR_RESUME_BETA_USERS.includes(user?.email) || process.env.NEXT_PUBLIC_APP_ENV !== 'production';

    const { page_count } = useSelector(state => state.resumeEditor);

    const flatedTailorJson = JSON.stringify(tailor_json);
    const flatedConfigJson = JSON.stringify(config_json);
    const flatedSortingJson = JSON.stringify(sorting_json);

    const firstLoadTailorJson = useRef(true);
    const firstLoadConfigJson = useRef(true);
    const firstLoadSortingJson = useRef(true);

    const countTailoredPage = useCallback(
        debounce(() => {
            getTailoredPageCount();
        }, 1000), [flatedTailorJson, flatedConfigJson, flatedSortingJson]
    )
    useEffect(() => {
        countTailoredPage()
    }, [flatedTailorJson, flatedConfigJson, flatedSortingJson])

    const updateTailorJson = useCallback(
        debounce(() => {
            updateTailoredResume({
                tailored_resume_id: tailored_resume_id,
                tailor_json: tailor_json,
                page_count: getTailoredPageCount(),
            })(dispatch);
        }, 1000), [flatedTailorJson]
    )
    useEffect(() => {
        if (firstLoadTailorJson.current) {
            firstLoadTailorJson.current = false;
            return;
        }
        updateTailorJson()
        return updateTailorJson.cancel
    }, [flatedTailorJson])

    const updateConfigJson = useCallback(
        debounce(() => {
            // console.log('config_json changed', config_json);
            updateTailoredResume({
                tailored_resume_id: tailored_resume_id,
                config_json: config_json,
                page_count: getTailoredPageCount(),
            })(dispatch);
        }, 1000), [flatedConfigJson]
    )
    useEffect(() => {
        if (firstLoadConfigJson.current) {
            firstLoadConfigJson.current = false;
            return;
        }
        updateConfigJson()
        return updateConfigJson.cancel
    }, [flatedConfigJson])


    const updateSortingJson = useCallback(
        debounce(() => {
            console.log('sorting_json changed', sorting_json);
            updateTailoredResume({
                tailored_resume_id: tailored_resume_id,
                sorting_json: sorting_json,
                page_count: getTailoredPageCount(),
            })(dispatch);
        }, 1000), [flatedSortingJson]
    )
    useEffect(() => {
        if (firstLoadSortingJson.current) {
            firstLoadSortingJson.current = false;
            return;
        }
        updateSortingJson()
        return updateSortingJson.cancel
    }, [flatedSortingJson])

    const userAgent = navigator.userAgent;
    const isMobileAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTabletAgent = /Tablet|iPad|iPod/i.test(userAgent);
    const hasEnoughScreenSize = window.screen.width >= 768;
    const [toggleEditor, setToggleEditor] = useState(false);
    const handleToggleEditor = () => {
        setToggleEditor(prev => !prev);
        document.getElementsByClassName('tr-drawer-content')[0].scrollTo({ top: 0, behavior: 'instant' });
    }
    return (
        <>
            {!isMobile && (
                <div className="resume-editor">
                    <div className="resume-editor-canvas" id="resume-editor-canvas">
                        {/* <ResumeTemplate resumeJson={resumeJson} /> */}
                        <div className="resume-editor-wrapper" id="resume-editor-wrapper">
                            <ResumePreviewer
                                templateConfig={config_json}
                                resumeJson={tailor_json}
                                sortingOrder={sorting_json}
                                genericSections={generic_sections}
                                tailorInputs={tailorInputs}
                                reportTabActive={activeTab == 'report'}
                                handleTabChange={handleTabChange}
                                showMakeCompactBtn={page_count == 1 && tailoredPageCount > 1}
                                transformedModal={transformedModal}
                            />
                        </div>
                    </div>
                    <div className="resume-editor-sidebar">
                        <div className="section-tabs">
                            {!transformedModal && (
                                <div className={`section-tab-item ${activeTab == 'report' ? 'active' : ''}`} onClick={() => handleTabChange('report')}>
                                    Report
                                </div>
                            )}
                            <div className={`section-tab-item ${activeTab == 'editor' ? 'active' : ''}`} onClick={() => handleTabChange('editor')}>
                                Editor
                            </div>
                            <div className={`section-tab-item ${activeTab == 'style' ? 'active' : ''}`} onClick={() => handleTabChange('style')}>
                                Style
                            </div>
                        </div>
                        {activeTab == 'report' &&
                            <ResumeEditorReport />
                        }
                        {activeTab == 'editor' &&
                            <ResumeEditorSections />
                        }
                        {activeTab == 'style' &&
                            <div className="re-sections">
                                <ResumeEditorStyle />
                            </div>
                        }
                    </div>
                </div>
            )}
            {isMobile && (
                <div className="resume-editor mobile-resume-ui" id="resume-editor-wrapper">
                    {toggleEditor &&<text className="mobile-note-for-edits">👋  <strong>Note:</strong> Any changes you make here are saved automatically</text>}
                    {!toggleEditor &&
                        <div className="resume-tabs">
                            <div
                                className="tab-item"
                                onClick={() => setShowAllTemplates(true)}
                            >
                                Change Template
                            </div>
                        </div>
                    }
                    <div className={`toggle-editor-button ${toggleEditor ? 'editor-on' : ''}`} onClick={handleToggleEditor}>
                        {toggleEditor ? 'Show Preview' : 'Edit Resume'}
                    </div>
                    {toggleEditor ?
                        <div className="resume-editor-sidebar">
                            <div className="section-tabs">
                                <div className={`section-tab-item ${activeTab == 'editor' ? 'active' : ''}`} onClick={() => handleTabChange('editor')}>
                                    Editor
                                </div>
                                <div className={`section-tab-item ${activeTab == 'style' ? 'active' : ''}`} onClick={() => handleTabChange('style')}>
                                    Style
                                </div>
                            </div>
                            {activeTab == 'editor' &&
                                <ResumeEditorSections />
                            }
                            {activeTab == 'style' &&
                                <div className="re-sections">
                                    <ResumeEditorStyle />
                                </div>
                            }
                        </div>
                        :
                        <>
                            {showAllTemplates && (
                                <ResumeEditorStyleMobile
                                    isOpen={showAllTemplates}
                                    onClose={() => setShowAllTemplates(false)}
                                />
                            )}
                            <div className="resume-editor-canvas" id="resume-editor-canvas">
                                <ResumePreviewer
                                    templateConfig={config_json}
                                    resumeJson={tailor_json}
                                    sortingOrder={sorting_json}
                                    tailorInputs={tailorInputs}
                                    genericSections={generic_sections}
                                    reportTabActive={activeTab == 'report'}
                                    isMobile={true}
                                    showMakeCompactBtn={page_count == 1 && tailoredPageCount > 1}
                                    transformedModal={transformedModal}
                                />
                            </div>
                        </>
                    }

                </div>
            )}
        </>
    )
}