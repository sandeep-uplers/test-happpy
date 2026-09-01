import { debounce } from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import { RecommendedStarIcon } from "../../assets/IconSVG";
import { RangeInput } from "../../components/common/Inputs";
import { defaultCompactConfig, IMAGE_URL } from "../../components/Constant";
import { SET_CONFIG_JSON } from "../../store/actions/actionsTypes";

const fontFamilyOptions = [
    { label: 'Arial', value: 'Arial' },
    { label: 'Calibri', value: 'Calibri' },
    { label: 'Times New Roman', value: 'Times New Roman' },
    // { label: 'Sentinel', value: 'Sentinel' },
    { label: 'EB Garamond', value: 'EB Garamond' },
    { label: 'Century', value: 'Century' },
    // { label: 'Montserrat', value: 'Montserrat' },
];

const nameFontSizeOptions = [
    { label: '18', value: 18 },
    { label: '19', value: 19 },
    { label: '20', value: 20 },
    { label: '21', value: 21 },
    { label: '22', value: 22 },
    { label: '23', value: 23 },
    { label: '24', value: 24 },
    { label: '25', value: 25 },
    { label: '26', value: 26 },
    { label: '28', value: 28 },
    { label: '30', value: 30 },
    { label: '32', value: 32 },
    { label: '34', value: 34 },
    { label: '36', value: 36 },
    { label: '38', value: 38 },
    { label: '40', value: 40 },
];

const sectionHeadersFontSizeOptions = [
    { label: '10', value: 10 },
    { label: '11', value: 11 },
    { label: '12', value: 12 },
    { label: '13', value: 13 },
    { label: '14', value: 14 },
    { label: '15', value: 15 },
    { label: '16', value: 16 },
    { label: '17', value: 17 },
    { label: '18', value: 18 },
];

const subHeadersFontSizeOptions = [
    { label: '9', value: 9 },
    { label: '10', value: 10 },
    { label: '10.5', value: 10.5 },
    { label: '11', value: 11 },
    { label: '12', value: 12 },
    { label: '13', value: 13 },
    { label: '14', value: 14 },
    { label: '15', value: 15 },
    { label: '16', value: 16 },
];

const bodyTextFontSizeOptions = [
    { label: '8', value: 8 },
    { label: '8.5', value: 8.5 },
    { label: '9', value: 9 },
    { label: '9.5', value: 9.5 },
    { label: '10', value: 10 },
    { label: '10.5', value: 10.5 },
    { label: '11', value: 11 },
    { label: '12', value: 12 },
    { label: '13', value: 13 },
    { label: '14', value: 14 },
];

const templates = [
    {
        label: "Classic",
        value: 1,
        image: "transformed_resume_templateClassic.png"
    },
    {
        label: "Compact",
        value: 6,
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


const defaultConfig = {
    template_id: 1,
    font_style: "Arial",
    font_size: {
        main_heading: 20,
        section_heading: 13,
        subheader: 12,
        body: 11,
    },
    spacing: {
        section_spacing: 2,
        item_spacing: 5,
        line_spacing: 12,
        top_bottom_margin: 26,
        side_margin: 36
    },
    theme_color: "#0070c0"
}



export default function ResumeEditorStyle() {
    const { config_json } = useSelector(state => state.resumeEditor);
    const [templateConfig, setterTemplateConfig] = useState(config_json);
    const [showAllTemplates, setShowAllTemplates] = useState(false);
    const { user } = useSelector(state => state.auth);

    const displayedTemplates = (() => {
        const firstThree = templates.slice(0, 3);
        const selectedTemplate = templates.find(t => t.value === templateConfig.template_id);
        const isSelectedInFirstThree = firstThree.some(t => t.value === templateConfig.template_id);

        if (isSelectedInFirstThree) {
            return firstThree;
        }
        return [templates[0], selectedTemplate, templates[1]];
    })();

    useEffect(() => {
        setTemplateConfig(config_json);
    }, []);

    const firstLoadTemplateConfig = useRef(true);
    const updateSortingJson = useCallback(
        debounce(() => {
            dispatch({ type: SET_CONFIG_JSON, payload: templateConfig });
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
        // setTemplateConfig({ ...templateConfig, [key]: value });

        setTemplateConfig(prev => {
            if (key === 'template_id') {
                if (value === 6 && prev.template_id !== 6) {
                    return {
                        ...prev,
                        [key]: value,
                        font_size: { ...prev.font_size, ...defaultCompactConfig.font_size },
                        spacing: { ...prev.spacing, ...defaultCompactConfig.spacing }
                    };
                } else if (value !== 6 && prev.template_id === 6) {
                    return {
                        ...prev,
                        [key]: value,
                        font_size: { ...prev.font_size, ...defaultConfig.font_size },
                        spacing: { ...prev.spacing, ...defaultConfig.spacing }
                    };
                }
                return { ...prev, [key]: value };
            }
            return { ...prev, [key]: value };
        });
    }

    const handleFontSizeChange = (key, value) => {
        setTemplateConfig({ ...templateConfig, font_size: { ...templateConfig.font_size, [key]: value } });
    }

    const handleSpacingChange = (key, value) => {
        setTemplateConfig({ ...templateConfig, spacing: { ...templateConfig.spacing, [key]: value } });
    }

    const handleResetConfig = () => {
        setTemplateConfig({ ...templateConfig, ...defaultConfig });
    }

    return (
        <div className="re-styles">
            <div className="re-styles-item ">
                <div className="re-template-selector-header">
                    <h2>Resume Template</h2>
                    <button className="re-view-all-templates-btn" onClick={() => setShowAllTemplates(true)}>
                        View all
                    </button>
                </div>
                <hr className="hr-line" />
                <div className="re-styles-template-selector">
                    {displayedTemplates.map((template) => (
                        <div className={`tem-item ${templateConfig.template_id === template.value ? 'selected' : ''}`} onClick={() => handleTemplateConfigChange('template_id', template.value)}>
                            <div className="resume-img">
                                <img src={IMAGE_URL + "resume/" + template.image} alt="" />
                            </div>
                            <span>{template.label}</span>
                            {template.value === 1 &&
                                <div className="recommended-badge">
                                    <RecommendedStarIcon />
                                    Recommended
                                </div>
                            }
                        </div>
                    ))}
                </div>
            </div>
            <div className="re-styles-item re-style-font-editor">
                <h2>Font</h2>
                <hr className="hr-line" />
                <div className="ed-items-wrapper">
                    <div className="ed-item-group">
                        <div className="ed-item">
                            <label>Font Family</label>
                            <Select
                                classNamePrefix="re-select"
                                options={fontFamilyOptions}
                                value={fontFamilyOptions.find(option => option.value === templateConfig.font_style)}
                                onChange={(val) => handleTemplateConfigChange('font_style', val.value)}
                            />
                        </div>
                        <div className="ed-item">
                            <label>Theme color</label>
                            <div className="re-theme-color-picker">
                                <input
                                    type="color"
                                    value={templateConfig.theme_color}
                                    onChange={(e) => handleTemplateConfigChange('theme_color', e.target.value)}
                                    className="re-theme-color-input"
                                    title="Theme color"
                                />
                                <span className="re-theme-color-value">{templateConfig.theme_color}</span>
                            </div>
                        </div>
                    </div>
                    <div className="ed-item-group">
                        <div className="ed-item">
                            <label>Name</label>
                            <Select
                                classNamePrefix="re-select"
                                options={nameFontSizeOptions}
                                value={nameFontSizeOptions.find(option => option.value === templateConfig.font_size.main_heading)}
                                onChange={(val) => handleFontSizeChange('main_heading', val.value)}
                            />
                        </div>
                        <div className="ed-item">
                            <label>Section Headers</label>
                            <Select
                                classNamePrefix="re-select"
                                options={sectionHeadersFontSizeOptions}
                                value={sectionHeadersFontSizeOptions.find(option => option.value === templateConfig.font_size.section_heading)}
                                onChange={(val) => handleFontSizeChange('section_heading', val.value)}
                            />
                        </div>
                    </div>
                    <div className="ed-item-group">
                        <div className="ed-item">
                            <label>Sub-Headers</label>
                            <Select
                                classNamePrefix="re-select"
                                options={subHeadersFontSizeOptions}
                                value={subHeadersFontSizeOptions.find(option => option.value === templateConfig.font_size.subheader)}
                                onChange={(val) => handleFontSizeChange('subheader', val.value)}
                            />
                        </div>
                        <div className="ed-item">
                            <label>Body Text</label>
                            <Select
                                classNamePrefix="re-select"
                                options={bodyTextFontSizeOptions}
                                value={bodyTextFontSizeOptions.find(option => option.value === templateConfig.font_size.body)}
                                onChange={(val) => handleFontSizeChange('body', val.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="re-styles-item re-style-spacing-margin-editor">
                <h2>Spacing & Margin</h2>
                <hr className="hr-line" />
                <div className="ed-items-wrapper">
                    <div className="ed-item">
                        <label>
                            Section Spacing
                            <div className="info-note-icon">
                                <InfoIcon />
                                <span className="info-note-text">
                                    Space between top-level sections (e.g., Experience and Education)
                                </span>
                            </div>
                        </label>
                        <RangeInput
                            value={templateConfig.spacing.section_spacing}
                            onChange={(e) => handleSpacingChange('section_spacing', e.target.value)}
                            min="0" max="10" step="1"

                        />
                    </div>
                    <div className="ed-item">
                        <label>
                            Entry Spacing
                            <div className="info-note-icon">
                                <InfoIcon />
                                <span className="info-note-text">
                                    Space between entries within a section, like different experiences
                                </span>
                            </div>
                        </label>
                        <RangeInput
                            value={templateConfig.spacing.item_spacing}
                            onChange={(e) => handleSpacingChange('item_spacing', e.target.value)}
                            min="0" max="10" step="1"
                        />
                    </div>
                    {templateConfig.template_id !== 5 &&
                        <div className="ed-item">
                            <label>Line Spacing</label>
                            <RangeInput
                                value={templateConfig.spacing.line_spacing}
                                onChange={(e) => handleSpacingChange('line_spacing', e.target.value)}
                                min={"9"} max="15" step="1"
                                lineSpacing
                            />
                        </div>
                    }
                    <div className="ed-item">
                        <label>Top & Bottom Margin</label>
                        <RangeInput
                            value={templateConfig.spacing.top_bottom_margin}
                            onChange={(e) => handleSpacingChange('top_bottom_margin', e.target.value)}
                            min={"10"} max="50" step="1"
                        />
                    </div>
                    <div className="ed-item">
                        <label>Side Margins</label>
                        <RangeInput
                            value={templateConfig.spacing.side_margin}
                            onChange={(e) => handleSpacingChange('side_margin', e.target.value)}
                            min={templateConfig.template_id === 6 ? "10" : "30"} max="50" step="1"
                        />
                    </div>
                </div>
            </div>
            <button className="re-styles-item reset-btn" onClick={handleResetConfig}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.4636 6.28571L13.1985 6.87198C13.5656 6.99605 13.9292 6.68855 13.8196 6.31683C13.0846 3.82243 10.7573 2 8 2C5.25418 2 2.93479 3.8073 2.18963 6.28571M4.53633 9.71428L2.80155 9.12802C2.43442 9.00395 2.07083 9.31145 2.18037 9.68318C2.91541 12.1776 5.2427 14 8 14C10.7458 14 13.0652 12.1927 13.8104 9.71428" stroke="black" stroke-width="1.44" stroke-linecap="round" />
                </svg>
                Reset formatting
            </button>

            {showAllTemplates && (
                <TemplatesModal
                    isOpen={showAllTemplates}
                    onClose={() => setShowAllTemplates(false)}
                    templates={templates}
                    currentTemplateId={templateConfig.template_id}
                    onSelect={(id) => {
                        handleTemplateConfigChange('template_id', id);
                        setShowAllTemplates(false);
                    }}
                />
            )}
        </div>
    )
}

function TemplatesModal({ isOpen, onClose, templates, currentTemplateId, onSelect }) {
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
                            className={`re-template-card ${currentTemplateId === template.value ? 'selected' : ''}`}
                            onClick={() => onSelect(template.value)}
                        >
                            <div className="template-img-wrapper">
                                <img src={IMAGE_URL + "resume/" + template.image} alt={template.label} />
                                {currentTemplateId === template.value && (
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

const InfoIcon = () => (
    <svg viewBox="64 64 896 896" focusable="false" data-icon="info-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path><path d="M464 336a48 48 0 1096 0 48 48 0 10-96 0zm72 112h-48c-4.4 0-8 3.6-8 8v272c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V456c0-4.4-3.6-8-8-8z"></path>
    </svg>
)