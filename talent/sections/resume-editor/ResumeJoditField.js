import JoditEditor from 'jodit-react';
import React, { useEffect, useMemo, useRef } from 'react';

const definedConfig = {
    readonly: false,
    placeholder: '',
    removeButtons: ['insertParagraph'],
    toolbar: false,
    statusbar: false,
    spellcheck: true,
    toolbarInlineForSelection: true,
    enablePlugins: ['bold', 'italic', 'underline', 'link'],
    disablePlugins: ['fullsize', 'source', 'image', 'video', 'table', 'audio', 'code', 'enter', 'paragraph', 'ul', 'ol', 'indent', 'formatblock'],
    theme: "default",
    inline: true,
    askBeforePasteHTML: false,
    askBeforePasteFromWord: false,
    pastePlainText: true,
    defaultActionOnPaste: "insert_clear_html",
    enter: "BR",
    newline: false,

    allowTabChars: false,
    cleanHTML: {
        removeStyles: true,
        removeClasses: true,
        removeAttrs: true,
        removeEmptyBlocks: true,
    },

    breakAfterAddEl: false,
    beautifyHTML: false,

    wrapInline: false,
    style: {
        background: "#F8F8F9",
        padding: "8px 8px 8px 20px",
        height: "auto",
        minHeight: "32px",
        border: "none",
        borderRadius: "4px",
        boxShadow: "none",
        outline: "none",
        boxSizing: "border-box",
        fontSize: "13px",
        lineHeight: "16px",
    },
}

export default function ResumeJoditField({ content, setContent, onBlur, placeholder, forceEditorFocus }) {
    const editorRef = useRef(null);

    const config = useMemo(() => ({
        readonly: false, // all options from https://xdsoft.net/jodit/docs/,
        placeholder: placeholder || 'Paste your content here or Start typing...',
        // buttons: "font-style, list",
        // removeButtons:['hr', 'source'] 
        // toolbar: [
        //     ['bold', 'italic', 'underline', 'strikethrough'],
        //     ['ul', 'ol'],
        //     ['link', 'image'],
        //     ['undo', 'redo'],
        //     ['source'], // If you need source code editing
        // ],
        // enablePlugins: ['bold', 'italic', 'underline', 'ul', 'ol', 'link', 'image', 'source']
        // Remove unwanted plugins (if necessary)
        // For instance, if you don't want the "fullsize" plugin:
        // disablePlugins: ['fullsize'],
        // Or to disable all plugins except the ones you specifically want:
        // enablePlugins: ['bold', 'italic', 'underline', 'ul', 'ol', 'link', 'image', 'source'], // Be careful with this, as it disables many core features.

    }),
        [placeholder]
    );

    const handleBlur = (newContent) => {
        let cleaned = newContent.replace(/<\/?(p|div|h[1-6]|ul|ol|li|blockquote)[^>]*>/gi, "");
        cleaned = cleaned.replace(/(<br\s*\/?>\s*)+$/gi, "").replace(/(\n|\r)+$/g, "");
        onBlur(cleaned);
    }

    useEffect(() => {
        if (forceEditorFocus) {
            editorRef.current?.focus();
        }
    }, [forceEditorFocus]);

    return (
        <JoditEditor
            ref={editorRef}
            value={content}
            config={definedConfig}
            tabIndex={1} // tabIndex of textarea
            onBlur={newContent => handleBlur(newContent)} // preferred to use only this option to update the content for performance reasons
            onChange={newContent => { }}
        />
    );
};