'use client';

import React from 'react';
import { renderTextWithLinks } from '../../../components/Helper';

/**
 * Inline paste job link — Figma Happpy Agent Referral 3639:38681.
 */
export default function HappyLandingPasteJobSection({
    jobUrl,
    onJobUrlChange,
    onSubmit,
    errorMessage,
}) {
    return (
        <div className="happy-agent-paste-job" data-happy-landing-section="paste_job_link">
            <div className="happy-agent-paste-job__inner">
                <div className="happy-agent-paste-job__intro">
                    <h2 id="happy-agent-paste-job-title" className="happy-agent-paste-job__title">
                        Run Agent on External Job by Link
                    </h2>
                    <p className="happy-agent-paste-job__desc">
                        Paste any job URL from LinkedIn, Indeed, or career sites. HAPPPY will process it and reach
                        out for you
                    </p>
                </div>

                {errorMessage ? (
                    <div className="happy-agent-paste-job__alert happy-agent-paste-job__alert--error" role="alert">
                        {renderTextWithLinks(errorMessage, 'happy-agent-paste-job__alert-link')}
                    </div>
                ) : null}

                <form
                    onSubmit={onSubmit}
                    className="happy-agent-paste-job__form"
                    noValidate
                    aria-labelledby="happy-agent-paste-job-title"
                >
                    <div className="happy-agent-paste-job__input-wrap">
                        <input
                            type="text"
                            inputMode="url"
                            className="happy-agent-paste-job__input"
                            placeholder="Paste a job URL from LinkedIn, Indeed, or any career site…"
                            value={jobUrl}
                            onChange={(e) => onJobUrlChange(e.target.value)}
                            autoComplete="off"
                            aria-invalid={errorMessage ? 'true' : undefined}
                        />
                    </div>
                    <button type="submit" className="happy-agent-paste-job__submit">
                        Add &amp; Run Agent
                    </button>
                </form>
            </div>
        </div>
    );
}
