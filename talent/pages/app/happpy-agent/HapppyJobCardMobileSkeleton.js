import React from 'react';

export function HapppyJobCardMobileSkeleton() {
    return (
        <div className="happpy-job-card-mobile happpy-job-card-mobile--skeleton" aria-hidden="true">
            <div className="happpy-job-card-mobile__title-row">
                <div className="happpy-job-card-mobile__logo">
                    <span className="happpy-job-card-mobile__skel happpy-job-card-mobile__skel--logo" />
                </div>
                <div className="happpy-job-card-mobile__content">
                    <div className="happpy-job-card-mobile__role">
                        <span className="happpy-job-card-mobile__skel happpy-job-card-mobile__skel--role" />
                        <span className="happpy-job-card-mobile__skel happpy-job-card-mobile__skel--bookmark" />
                    </div>
                    <span className="happpy-job-card-mobile__skel happpy-job-card-mobile__skel--company" />
                </div>
            </div>

            <div className="happpy-job-card-mobile__attribs happpy-job-card-mobile__attribs--skeleton">
                <span className="happpy-job-card-mobile__skel happpy-job-card-mobile__skel--attrib" />
                <span className="happpy-job-card-mobile__skel happpy-job-card-mobile__skel--attrib happpy-job-card-mobile__skel--attrib-wide" />
            </div>

            <div className="happpy-job-card-mobile__skills happpy-job-card-mobile__skills--skeleton">
                <span className="happpy-job-card-mobile__skel happpy-job-card-mobile__skel--skill" />
                <span className="happpy-job-card-mobile__skel happpy-job-card-mobile__skel--skill happpy-job-card-mobile__skel--skill-wide" />
                <span className="happpy-job-card-mobile__skel happpy-job-card-mobile__skel--skill" />
                <span className="happpy-job-card-mobile__skel happpy-job-card-mobile__skel--skill" />
            </div>
        </div>
    );
}

function getSkeletonCount({ totalOpp, currentPage, bookMarkedTab }) {
    if (bookMarkedTab) {
        return 3;
    }
    if (typeof totalOpp === 'undefined' || totalOpp === null) {
        return 5;
    }
    const remaining = totalOpp - (currentPage * 10);
    if (remaining > 1) {
        return remaining > 10 ? 10 : remaining;
    }
    return 5;
}

export default function HapppyJobCardMobileSkeletonList({ totalOpp, currentPage, bookMarkedTab, count }) {
    const cardCount = count ?? getSkeletonCount({ totalOpp, currentPage, bookMarkedTab });

    return (
        <>
            {[...Array(cardCount)].map((_, index) => (
                <HapppyJobCardMobileSkeleton key={`happpy-job-card-mobile-skel-${index}`} />
            ))}
        </>
    );
}
