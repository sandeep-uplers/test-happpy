import { debounce } from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RecommendedStarIcon } from "../../assets/IconSVG";
import { IMAGE_URL } from "../../components/Constant";
import { SET_CONFIG_JSON } from "../../store/actions/actionsTypes";

const templates = [
    {
        label: "Classic",
        value: 1,
        image: "transformed_resume_templateClassic.png"
    },
    {
        label: "Modern",
        value: 2,
        image: "transformed_resume_templateModern.png"
    },
    {
        label: "Elegant",
        value: 3,
        image: "transformed_resume_templateElegant.png"
    },
    {
        label: "Professional",
        value: 4,
        image: "transformed_resume_templateProfessional.png"
    },
    {
        label: "Elite",
        value: 5,
        image: "transformed_resume_templateElite.png"
    },
]


export default function ResumeEditorStyleMobile({ isOpen, onClose }) {
    const { config_json } = useSelector(state => state.resumeEditor);
    const [templateConfig, setterTemplateConfig] = useState(config_json);

    useEffect(() => {
        setTemplateConfig(config_json);
    }, []);

    const firstLoadTemplateConfig = useRef(true);
    const updateSortingJson = useCallback(
        debounce(() => {
            dispatch({ type: SET_CONFIG_JSON, payload: templateConfig });
            onClose();
        }, 80), [templateConfig]
    )
    useEffect(() => {
        if (firstLoadTemplateConfig.current) {
            firstLoadTemplateConfig.current = false;
            return;
        }
        updateSortingJson()
        return updateSortingJson.cancel
    }, [templateConfig])

    const dispatch = useDispatch();

    const setTemplateConfig = (newTemplateConfig) => {
        setterTemplateConfig(newTemplateConfig);
    }

    const handleTemplateConfigChange = (key, value) => {
        setTemplateConfig({ ...templateConfig, [key]: value });
    }

    return (
        <div className="re-all-templates-modal-overlay" onClick={onClose}>
            <div className="re-all-templates-modal-content" onClick={e => e.stopPropagation()}>
                <div className="re-all-templates-modal-header">
                    <h3>All Templates</h3>
                    <button className="close-btn" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
                <div className="re-all-templates-grid">
                    {templates.map((template) => (
                        <div
                            key={template.value}
                            className={`re-template-card ${config_json.template_id === template.value ? 'selected' : ''}`}
                            onClick={() => handleTemplateConfigChange('template_id', template.value)}
                        >
                            <div className="template-img-wrapper">
                                <img src={IMAGE_URL + "resume/" + template.image} alt={template.label} />
                                {config_json.template_id === template.value && (
                                    <div className="selected-check">
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="10" cy="10" r="10" fill="var(--accent-color-main)" />
                                            <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <div className="template-info">
                                <span>{template.label}</span>
                                {template.value === 1 &&
                                    <div className="recommended-badge">
                                        <RecommendedStarIcon />
                                        Recommended
                                    </div>
                                }
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}