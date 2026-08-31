import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Editor, EditorProvider, Toolbar, BtnBold, BtnItalic, BtnUnderline, BtnStrikeThrough, BtnNumberedList, BtnBulletList, BtnLink, BtnClearFormatting } from 'react-simple-wysiwyg';


// --- Highlight helpers ------------------------------------------------------
export function rawToDisplay(html = '') {
    // --- Step 1: protect every <a>…</a> block -------------------------------
    const anchorPlaceholders = [];
    let anchorIndex = 0;

    // Replace each whole anchor with a unique placeholder
    let protectedHtml = html.replace(
        /<a\b[^>]*>[\s\S]*?<\/a>/gi,
        (match) => {
            const placeholder = `__ANCHOR_PLACEHOLDER_${anchorIndex}__`;
            anchorPlaceholders[anchorIndex] = match;
            anchorIndex += 1;
            return placeholder;
        },
    );

    // --- Step 2: highlight remaining {{ … }} tags ---------------------------
    protectedHtml = protectedHtml.replace(
        /(\{\{[^}]*\}\})/g,
        '<span class="dynamic-field" style="color:#007bff;font-weight:500">$1</span>',
    );

    // --- Step 3: restore the anchors ---------------------------------------
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



export default function TemplateEditor({
    className,
    value,
    onChange,
    hasError,
    scrollingContainer,
    readOnly = false,

    dynamicFields = [],
    showDynamicDropdowns = false,
    templateAppliedAt,
    ...rest
}) {
    // This state will hold the "display" version of the HTML with highlighting
    const [editorHtml, setEditorHtml] = useState(rawToDisplay(value || ''));

    // Keep track of the current editor DOM node and last caret position
    const editorRootRef = useRef(null);
    const savedRangeRef = useRef(null);

    // Sync editorHtml with the parent's `value` when template applied
    useEffect(() => {
        if (templateAppliedAt) {
            setEditorHtml(rawToDisplay(value || ''));
        }
    }, [templateAppliedAt]);


    useEffect(() => { // save the current selection/cursor position in the editor on selection change
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

    const insertTagAtCursor = (format) => { // insert the dynamic field at the cursor position
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
                const editorElements = [editorRootRef.current];

                let isWithinEditor = false;

                // Check whether the current caret/selection is inside this editor
                for (let element of editorElements) {
                    if (element.contains(range.commonAncestorContainer)) {
                        isWithinEditor = true;
                        console.log('[RichEmailEditor] Cursor IS inside this editor – inserting at caret.');

                        // Replace current selection with the tag's HTML
                        range.deleteContents();
                        const tempDiv = document.createElement('div');
                        // IMPORTANT: Insert the *highlighted* version of the tag
                        tempDiv.innerHTML = rawToDisplay(format);

                        const frag = document.createDocumentFragment();
                        let node, lastNode;
                        while ((node = tempDiv.firstChild)) {
                            lastNode = frag.appendChild(node);
                        }
                        range.insertNode(frag);

                        // Move caret just after the inserted tag
                        if (lastNode) {
                            range.setStartAfter(lastNode);
                            range.collapse(true);
                            selection.removeAllRanges();
                            selection.addRange(range);
                        }
                        break;
                    }
                }

                if (!isWithinEditor) {
                    console.log('[RichEmailEditor] Cursor NOT inside this editor – appending at end.');
                    // Append the raw format, it will be highlighted on next render
                    content += rawToDisplay(format);
                }
            } else {
                console.log('[RichEmailEditor] No selection/range – appending at end.');
                content += rawToDisplay(format);
            }
            return content;
        };

        // Update local and parent state
        setEditorHtml(prev => {
            const updated = insertAtCursorOrEnd(prev);
            // Notify the parent with the raw, un-highlighted version
            onChange(displayToRaw(updated));
            return updated;
        });
    };

    // --- helpers to convert caret ↔ character offset ----------------------------
    function getCaretOffset(rootEl) {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return null;

        const range = sel.getRangeAt(0).cloneRange();
        range.setStart(rootEl, 0);
        return range.toString().length;       // # of characters from start
    }

    function setCaretOffset(rootEl, offset) {
        if (offset == null) return;

        const nodeIterator = document.createNodeIterator(
            rootEl,
            NodeFilter.SHOW_TEXT,
            null,
        );
        let currentNode, chars = 0;

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
    // ----------------------------------------------------------------------------

    const handleEditorChange = (e) => {
        const newHtml = e.target.value;
        const rawHtml = displayToRaw(newHtml);

        const isEnterKey = e.nativeEvent && e.nativeEvent.inputType === 'insertParagraph';

        // save caret BEFORE we change the HTML
        const caretOffset = getCaretOffset(editorRootRef.current);

        const highlighted = rawToDisplay(rawHtml);
        setEditorHtml(highlighted);   // triggers re-render
        onChange(rawHtml);

        // re-apply caret AFTER the DOM updates
        // we wait for the next micro-task so React has painted
        Promise.resolve().then(() => {
            if (isEnterKey) {
                // For Enter key, don't restore the old position.
                // The browser has already moved the cursor to the new line.
                return;
            }
            setCaretOffset(editorRootRef.current, caretOffset)
        });
    };


    // LOGS
    // console.log('Parent value - raw content:', value);
    // console.log('Editor value - display content:', editorHtml);


    if (readOnly) {
        return (
            <div
                className={`${className ?? ''}`}
                // In readOnly mode, we should always display the highlighted version
                dangerouslySetInnerHTML={{ __html: rawToDisplay(value) }}
                style={{ border: '1px solid #ccc', padding: '8px', borderRadius: '4px' }}
            />
        );
    }

    return (
        <div className="rich-editor-container">
            <EditorProvider>
                <Editor
                    ref={editorRootRef}
                    value={editorHtml}
                    onChange={handleEditorChange}
                    containerProps={{ style: { resize: 'vertical' } }}
                    className={`${className ?? ''} resizableEditor`}
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

                        {showDynamicDropdowns && (
                            <>
                                {dynamicFields?.length > 0 && (
                                    <CustomTagButton
                                        label="{{jobTitle}}"
                                        options={dynamicFields}
                                        onSelect={insertTagAtCursor}
                                    />
                                )}
                            </>
                        )}

                    </Toolbar>
                </Editor>
            </EditorProvider>
        </div>
    );
}

// Custom Tag Button Component
function CustomTagButton({ label, options, onSelect }) {
    const [isOpen, setIsOpen] = useState(false);
    const [, setPositionTick] = useState(0); // force re-render on scroll/resize so we re-read rect
    const buttonRef = useRef();
    const dropdownRef = useRef();

    const updatePosition = () => setPositionTick(t => t + 1);

    const handleButtonClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const handleOptionClick = (option) => {
        onSelect(option);
        setIsOpen(false);
    };

    const handleOutsideClick = (e) => {
        if (buttonRef.current && !buttonRef.current.contains(e.target) &&
            dropdownRef.current && !dropdownRef.current.contains(e.target)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('mousedown', handleOutsideClick);
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);
        }

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isOpen]);

    // Compute position at render time from the button rect so dropdown opens in the right place
    const dropdownPosition = isOpen && buttonRef.current
        ? (() => {
            const rect = buttonRef.current.getBoundingClientRect();
            return { top: rect.bottom + 5, left: rect.left };
        })()
        : null;

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            <button
                ref={buttonRef}
                type="button"
                onClick={handleButtonClick}
                style={{
                    backgroundColor: isOpen ? '#edf3ff' : 'transparent',
                    border: 'none',
                    padding: '8px 10px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    color: '#495057',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                    if (!isOpen) e.target.style.backgroundColor = '#edf3ff';
                }}
                onMouseLeave={(e) => {
                    if (!isOpen) e.target.style.backgroundColor = 'transparent';
                }}
                title={`Insert dynamic ${label.replace(/[{}]/g, '').toLowerCase()} fields`}
            >
                {label}
            </button>

            {isOpen && dropdownPosition && createPortal(
                <div
                    className="template-custom-tag-dropdown template-editor-variables-dropdown"
                    ref={dropdownRef}
                    style={{
                        position: 'fixed',
                        top: dropdownPosition.top,
                        left: dropdownPosition.left,
                        backgroundColor: '#fff',
                        border: '1px solid #dee2e6',
                        borderRadius: '6px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        zIndex: 99999,
                        maxHeight: '300px',
                        overflowY: 'auto',
                        minWidth: '200px',
                    }}
                >
                    {options.map((option, index) => (
                        <div
                            key={index}
                            onClick={() => handleOptionClick(option)}
                            style={{
                                padding: '8px 12px',
                                fontSize: '12px',
                                fontFamily: 'monospace',
                                cursor: 'pointer',
                                borderBottom: index < options.length - 1 ? '1px solid #eee' : 'none',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8f9fa'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; }}
                        >
                            {option}
                        </div>
                    ))}
                </div>,
                document.body
            )}
        </div>
    );
}