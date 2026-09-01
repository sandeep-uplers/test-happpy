import React, { useEffect, useState } from "react";
import "./hscontent.css"

const HSContent = ({ content, aboutCompany = false, isAggregatorContent = false, alreadyEnagaged = false }) => {
    useEffect(() => {
        const styleTag = document.querySelector('style[data-custom-style]');
        if (styleTag) {
            styleTag.parentNode.removeChild(styleTag);
        }
    }, []);

    const [isAlreadyEnagaged, setIsAlreadyEnagaged] = useState(alreadyEnagaged);

    return (
        <div className={`HSContentWrap ${isAlreadyEnagaged ? "alreadyEnagaged" : ""}`}>
            <div
                className={`HSContent ${aboutCompany ? "aboutCompany" : ""} ${isAggregatorContent ? "aggregatorContent" : ""} `}
                id="hsContent"
                dangerouslySetInnerHTML={{ __html: content }}
            />
            {isAlreadyEnagaged && <button className="showMoreBtn" onClick={() => setIsAlreadyEnagaged(false)}>show more</button>}
        </div>
    );
};

export default HSContent;
