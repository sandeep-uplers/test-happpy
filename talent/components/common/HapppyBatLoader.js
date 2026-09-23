import React from 'react';
import HapppyAgentLogo from './HapppyAgentLogo';
import './HapppyBatLoader.css';

/** Full-screen Happpy page loader — flying bat mascot over streaking air lines. */
const HapppyBatLoader = () => {
    return (
        <div className="happpy-bat-overlay" role="status" aria-label="Loading Happpy">
            <div className="happpy-bat__lines" aria-hidden="true">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>
            <div className="happpy-bat__lockup">
                <img
                    className="happpy-bat__flier"
                    src="/images/talent/outreach/happpy-bat-fly.svg"
                    alt=""
                    aria-hidden="true"
                />
                <HapppyAgentLogo />
            </div>
        </div>
    );
};

export default HapppyBatLoader;
