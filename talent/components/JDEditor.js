import React, { useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';
import { v4 as uuidv4 } from 'uuid';
const pasteHandler = (e) => {
    e.preventDefault();
    var text = e.clipboardData.getData("text/plain");
    document.execCommand("insertHTML", false, text);
}
export default function JDEditor({
    className, placeholder, value, onChange, modules, formats, theme, bounds, readOnly = false,
    scrollingContainer, ...rest }) {

    const editorRef = useRef();
    const editorID = uuidv4()

    useEffect(() => {
        document.getElementById(editorID)?.addEventListener("paste", pasteHandler);
        return () => document.getElementById(editorID)?.removeEventListener("paste", pasteHandler);
    }, [])

    return (

        <ReactQuill
            ref={editorRef}
            id={editorID}
            className={`${className ?? ''} ${readOnly ? '' : 'resizableEditor'}`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            modules={{ toolbar: false }}
            style={{height:'100%'}}
            formats={formats}
            theme={theme}
            bounds={bounds}
            readOnly={readOnly}
            preserveWhitespace
            scrollingContainer={scrollingContainer ?? null}  //if parent scroll is used
            {...rest}
        />
    )
}