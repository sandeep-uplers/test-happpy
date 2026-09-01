import React, { useRef, useLayoutEffect, useState } from "react";

const AutoSizeInput = ({ value, onChange, className = "", ...props }) => {
    const inputRef = useRef(null);
    const mirrorRef = useRef(null);
    const [width, setWidth] = useState(20); // default

    useLayoutEffect(() => {
        if (mirrorRef.current) {
            setWidth(mirrorRef.current.offsetWidth + 4); // add small padding
        }
    }, [value]);

    return (
        <div className={`autosize-input-wrapper ${className}`}>
            <span ref={mirrorRef} className="autosize-input-mirror">
                {value || props.placeholder || ""}
            </span>

            <input
                {...props}
                ref={inputRef}
                value={value}
                onChange={onChange}
                style={{ width }}
            />
        </div>
    );
};

export default AutoSizeInput;
