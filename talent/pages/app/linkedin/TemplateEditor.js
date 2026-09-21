import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
    Editor,
    EditorProvider,
    Toolbar,
    BtnBold,
    BtnItalic,
    BtnUnderline,
    BtnStrikeThrough,
    BtnNumberedList,
    BtnBulletList,
    BtnLink,
    BtnClearFormatting,
} from 'react-simple-wysiwyg';
import './TemplateEditor.css';

const DROPDOWN_MAX_HEIGHT = 300;
const DROPDOWN_GAP = 5;

// --- Highlight helpers ------------------------------------------------------
export function rawToDisplay(html = '') {
    const anchorPlaceholders = [];
    let anchorIndex = 0;

    let protectedHtml = html.replace(
        /<a\b[^>]*>[\s\S]*?<\/a>/gi,
        (match) => {
            const placeholder = `__ANCHOR_PLACEHOLDER_${anchorIndex}__`;
            anchorPlaceholders[anchorIndex] = match;
            anchorIndex += 1;
            return placeholder;
        },
    );

    protectedHtml = protectedHtml.replace(
        /(\{\{[^}]*\}\})/g,
        '<span class="dynamic-field">$1</span>',
    );

    anchorPlaceholders.forEach((original, idx) => {
        protectedHtml = protectedHtml.replace(`__ANCHOR_PLACEHOLDER_${idx}__`, original);
    });

    return protectedHtml;
}

function displayToRaw(html = '') {
    return html.replace(
        /<span[^>]*\bdynamic-field\b[^>]*>([\s\S]*?)<\/span>/g,
        '$1',
    );
}
// ----------------------------------------------------------------------------

function computeDropdownPosition(buttonEl) {
    const rect = buttonEl.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - DROPDOWN_GAP;
    const spaceAbove = rect.top - DROPDOWN_GAP;
    const openAbove = spaceBelow < DROPDOWN_MAX_HEIGHT && spaceAbove > spaceBelow;

    if (openAbove) {
        return {
            bottom: window.innerHeight - rect.top + DROPDOWN_GAP,
            left: rect.left,
            maxHeight: Math.min(DROPDOWN_MAX_HEIGHT, spaceAbove),
        };
    }

    return {
        top: rect.bottom + DROPDOWN_GAP,
        left: rect.left,
        maxHeight: Math.min(DROPDOWN_MAX_HEIGHT, spaceBelow),
    };
}

const VARIANT_CLASS = {
    default: '',
    compact: 'rich-editor-container--compact',
    tall: 'rich-editor-container--tall',
};

export default function TemplateEditor({
    className,
    value,
    onChange,
    hasError,
    placeholder,
    variant = 'default',
    readOnly = false,
    dynamicFields = [],
    showDynamicDropdowns = false,
    templateAppliedAt,
}) {
    const [editorHtml, setEditorHtml] = useState(rawToDisplay(value || ''));

    const containerRef = useRef(null);
    const editorRootRef = useRef(null);
    const savedRangeRef = useRef(null);
    const isFocusedRef = useRef(false);
    const lastEmittedRawRef = useRef(value || '');

    const syncEditorHeight = useCallback(() => {
        const ce = containerRef.current?.querySelector('.rsw-ce');
        if (!ce) {
            return;
        }

        ce.style.height = 'auto';
        const minHeight = parseFloat(window.getComputedStyle(ce).minHeight) || 0;
        ce.style.height = `${Math.max(minHeight, ce.scrollHeight)}px`;
    }, []);

    useEffect(() => {
        if (templateAppliedAt) {
            const raw = value || '';
            setEditorHtml(rawToDisplay(raw));
            lastEmittedRawRef.current = raw;
        }
    }, [templateAppliedAt, value]);

    useEffect(() => {
        const raw = value || '';
        if (raw === lastEmittedRawRef.current) {
            return;
        }
        if (isFocusedRef.current) {
            return;
        }
        setEditorHtml(rawToDisplay(raw));
        lastEmittedRawRef.current = raw;
    }, [value]);

    useLayoutEffect(() => {
        syncEditorHeight();
    }, [editorHtml, syncEditorHeight]);

    useEffect(() => {
        syncEditorHeight();
    }, [templateAppliedAt, value, syncEditorHeight]);

    useEffect(() => {
        const handleResize = () => syncEditorHeight();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [syncEditorHeight]);

    useEffect(() => {
        const saveSelection = () => {
            const sel = window.getSelection();
            if (sel && sel.rangeCount > 0 && editorRootRef.current &&
                editorRootRef.current.contains(sel.anchorNode)) {
                savedRangeRef.current = sel.getRangeAt(0).cloneRange();
            }
        };
        document.addEventListener('selectionchange', saveSelection);
        return () => document.removeEventListener('selectionchange', saveSelection);
    }, []);

    const handleEditorFocus = () => {
        isFocusedRef.current = true;
    };

    const handleEditorBlur = () => {
        isFocusedRef.current = false;
    };

    const insertTagAtCursor = (format) => {
        const sel = window.getSelection();
        if (savedRangeRef.current &&
            sel && (!sel.anchorNode || !editorRootRef.current.contains(sel.anchorNode))) {
            sel.removeAllRanges();
            sel.addRange(savedRangeRef.current);
        }

        const insertAtCursorOrEnd = (content) => {
            const selection = window.getSelection();

            if (selection && selection.rangeCount) {
                const range = selection.getRangeAt(0);
                const editorEl = editorRootRef.current;

                if (editorEl && editorEl.contains(range.commonAncestorContainer)) {
                    range.deleteContents();
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = rawToDisplay(format);

                    const frag = document.createDocumentFragment();
                    let node;
                    let lastNode;
                    while ((node = tempDiv.firstChild)) {
                        lastNode = frag.appendChild(node);
                    }
                    range.insertNode(frag);

                    if (lastNode) {
                        range.setStartAfter(lastNode);
                        range.collapse(true);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                } else {
                    content += rawToDisplay(format);
                }
            } else {
                content += rawToDisplay(format);
            }
            return content;
        };

        setEditorHtml((prev) => {
            const updated = insertAtCursorOrEnd(prev);
            const raw = displayToRaw(updated);
            lastEmittedRawRef.current = raw;
            onChange(raw);
            return updated;
        });
    };

    function getCaretOffset(rootEl) {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return null;

        const range = sel.getRangeAt(0).cloneRange();
        range.setStart(rootEl, 0);
        return range.toString().length;
    }

    function setCaretOffset(rootEl, offset) {
        if (offset == null) return;

        const nodeIterator = document.createNodeIterator(
            rootEl,
            NodeFilter.SHOW_TEXT,
            null,
        );
        let currentNode;
        let chars = 0;

        while ((currentNode = nodeIterator.nextNode())) {
            const nextChars = chars + currentNode.textContent.length;
            if (offset <= nextChars) {
                const range = document.createRange();
                range.setStart(currentNode, offset - chars);
                range.collapse(true);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
                break;
            }
            chars = nextChars;
        }
    }

    const handleEditorChange = (e) => {
        const newHtml = e.target.value;
        const rawHtml = displayToRaw(newHtml);

        const isEnterKey = e.nativeEvent && e.nativeEvent.inputType === 'insertParagraph';

        const caretOffset = getCaretOffset(editorRootRef.current);

        const highlighted = rawToDisplay(rawHtml);
        setEditorHtml(highlighted);
        lastEmittedRawRef.current = rawHtml;
        onChange(rawHtml);

        Promise.resolve().then(() => {
            syncEditorHeight();
            if (isEnterKey) {
                return;
            }
            setCaretOffset(editorRootRef.current, caretOffset);
        });
    };

    const variantClass = VARIANT_CLASS[variant] || '';
    const readonlyVariantClass = variant !== 'default' ? `template-editor-readonly--${variant}` : '';

    const containerClassName = [
        'template-editor',
        'rich-editor-container',
        variantClass,
        hasError ? 'rich-editor-container--error' : '',
    ].filter(Boolean).join(' ');

    if (readOnly) {
        return (
            <div
                className={`template-editor template-editor-readonly ${readonlyVariantClass} ${className ?? ''}`.trim()}
                dangerouslySetInnerHTML={{ __html: rawToDisplay(value) }}
            />
        );
    }

    return (
        <div ref={containerRef} className={containerClassName}>
            <EditorProvider>
                <Editor
                    ref={editorRootRef}
                    value={editorHtml}
                    onChange={handleEditorChange}
                    placeholder={placeholder}
                    onFocus={handleEditorFocus}
                    onBlur={handleEditorBlur}
                    className={`${className ?? ''} resizableEditor`.trim()}
                >
                    <Toolbar>
                        <BtnBold />
                        <BtnItalic />
                        <BtnUnderline />
                        <BtnStrikeThrough />
                        <BtnNumberedList />
                        <BtnBulletList />
                        <BtnLink />
                        <BtnClearFormatting />

                        {showDynamicDropdowns && dynamicFields?.length > 0 && (
                            <>
                                <span className="template-editor-toolbar-divider" aria-hidden="true" />
                                <CustomTagButton
                                    options={dynamicFields}
                                    onSelect={insertTagAtCursor}
                                />
                            </>
                        )}
                    </Toolbar>
                </Editor>
            </EditorProvider>
        </div>
    );
}

function CustomTagButton({ options, onSelect }) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [, setPositionTick] = useState(0);
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);
    const listboxId = useRef(`template-editor-vars-${Math.random().toString(36).slice(2, 9)}`);

    const updatePosition = useCallback(() => setPositionTick((t) => t + 1), []);

    const closeDropdown = useCallback(() => {
        setIsOpen(false);
        setActiveIndex(-1);
    }, []);

    const openDropdown = useCallback(() => {
        setIsOpen(true);
        setActiveIndex(0);
    }, []);

    const handleButtonClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isOpen) {
            closeDropdown();
        } else {
            openDropdown();
        }
    };

    const handleOptionSelect = useCallback((option) => {
        onSelect(option);
        closeDropdown();
        buttonRef.current?.focus();
    }, [closeDropdown, onSelect]);

    const handleOutsideClick = useCallback((e) => {
        if (buttonRef.current && !buttonRef.current.contains(e.target) &&
            dropdownRef.current && !dropdownRef.current.contains(e.target)) {
            closeDropdown();
        }
    }, [closeDropdown]);

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        document.addEventListener('mousedown', handleOutsideClick);
        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [handleOutsideClick, isOpen, updatePosition]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }
        dropdownRef.current?.focus();
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || activeIndex < 0) {
            return;
        }
        const activeEl = dropdownRef.current?.querySelector(
            `[data-option-index="${activeIndex}"]`,
        );
        activeEl?.scrollIntoView({ block: 'nearest' });
    }, [activeIndex, isOpen]);

    const handleButtonKeyDown = (e) => {
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!isOpen) {
                openDropdown();
            }
            return;
        }
        if (e.key === 'Escape' && isOpen) {
            e.preventDefault();
            closeDropdown();
        }
    };

    const handleDropdownKeyDown = (e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            closeDropdown();
            buttonRef.current?.focus();
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, options.length - 1));
            return;
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
            return;
        }
        if (e.key === 'Enter' && activeIndex >= 0) {
            e.preventDefault();
            handleOptionSelect(options[activeIndex]);
        }
    };

    const dropdownPosition = isOpen && buttonRef.current
        ? computeDropdownPosition(buttonRef.current)
        : null;

    return (
        <div className="template-editor-variables-wrap">
            <button
                ref={buttonRef}
                type="button"
                className={`template-editor-variables-btn${isOpen ? ' template-editor-variables-btn--open' : ''}`}
                onClick={handleButtonClick}
                onKeyDown={handleButtonKeyDown}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={listboxId.current}
                title="Insert dynamic variable fields"
            >
                Variables
                <svg
                    className="template-editor-variables-btn__chevron"
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    <path d="M2 4L5 7L8 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {isOpen && dropdownPosition && createPortal(
                <div
                    id={listboxId.current}
                    className="template-custom-tag-dropdown template-editor-variables-dropdown"
                    ref={dropdownRef}
                    role="listbox"
                    aria-label="Dynamic variables"
                    tabIndex={-1}
                    onKeyDown={handleDropdownKeyDown}
                    style={{
                        top: dropdownPosition.top,
                        bottom: dropdownPosition.bottom,
                        left: dropdownPosition.left,
                        maxHeight: dropdownPosition.maxHeight,
                    }}
                >
                    {options.map((option, index) => (
                        <button
                            key={option}
                            type="button"
                            role="option"
                            aria-selected={index === activeIndex}
                            data-option-index={index}
                            className={`template-editor-variables-dropdown__item${
                                index === activeIndex ? ' template-editor-variables-dropdown__item--active' : ''
                            }`}
                            onClick={() => handleOptionSelect(option)}
                            onMouseEnter={() => setActiveIndex(index)}
                        >
                            {option}
                        </button>
                    ))}
                </div>,
                document.body,
            )}
        </div>
    );
}
