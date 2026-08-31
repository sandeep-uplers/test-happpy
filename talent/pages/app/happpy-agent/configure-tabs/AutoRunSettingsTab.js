'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Link } from '@/talent/navigation/routerCompat';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { POST_API } from '../../../../components/Helper';
import { API_UPDATE_AUTO_RUN_HAPPPY } from '../../../../components/Constant';
import { PrecisionMatchingIcon } from '../../../../assets/IconSVG';
import { setHapppyAgentAutoRunHapppy } from '../../../../store/actions/UserActions';

/**
 * Auto Run tab — let Happpy Agent find and apply to jobs after inactivity.
 *
 * Reads `happpyAgent.dashboardData.auto_run_consent` (from get-outreach-dashboard-data).
 * Saves via POST /talent/outreach/update-auto-run-happpy on toggle, then patches Redux.
 */

const HELP_GUIDE_RAISE_TICKET_PATH = '/talent/job-agent/need-help';
const AUTO_RUN_INACTIVITY_DAYS = 2;

const AutoRunSettingsTab = () => {
    const dispatch = useDispatch();
    const savedAutoRunHapppy = useSelector(
        (state) => !!state.happpyAgent.dashboardData?.auto_run_consent,
    );
    const isLoading = useSelector((state) => state.happpyAgent.dailyLimitLoading);

    const [autoRunHapppy, setAutoRunHapppy] = useState(savedAutoRunHapppy);
    const [isSaving, setIsSaving] = useState(false);

    const mountedRef = useRef(true);
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        setAutoRunHapppy(savedAutoRunHapppy);
    }, [savedAutoRunHapppy]);

    const handleToggle = async (checked) => {
        if (isSaving) return;

        const previous = autoRunHapppy;
        setAutoRunHapppy(checked);
        setIsSaving(true);

        try {
            const res = await POST_API(API_UPDATE_AUTO_RUN_HAPPPY, {
                consent: Boolean(checked),
            });
            if (res?.data?.status === 200) {
                dispatch(setHapppyAgentAutoRunHapppy(checked));
                toast.success(`HAPPPY auto run ${checked ? 'enabled' : 'disabled'}`);
            } else {
                if (mountedRef.current) setAutoRunHapppy(previous);
                toast.error('Failed to update');
            }
        } catch (e) {
            if (mountedRef.current) setAutoRunHapppy(previous);
            toast.error('Failed to update');
        } finally {
            if (mountedRef.current) setIsSaving(false);
        }
    };

    const inactivityLabel = AUTO_RUN_INACTIVITY_DAYS === 1
        ? '1 day of inactivity'
        : `${AUTO_RUN_INACTIVITY_DAYS} days of inactivity`;

    return (
        <div className="hc-tab-content">
            <p className="hc-tab-content__title">
                Let Happpy Agent find and apply to relevant jobs on your behalf.
            </p>

            {isLoading ? (
                <div className="hc-loading">
                    <span className="hc-loading__spinner" />
                    Loading auto run settings…
                </div>
            ) : (
                <>
                    <section className="hc-run-card">
                        <header className="hc-run-card__head">
                            <span className="hc-run-card__title">
                                <span className="hc-run-card__title-icon">
                                    <PrecisionMatchingIcon />
                                </span>
                                Auto run HAPPPY
                            </span>
                        </header>

                        <div className="hc-run-card__trigger">
                            <span className="hc-run-card__trigger-label">Auto run trigger</span>
                            <span className="hc-run-card__trigger-badge">{inactivityLabel}</span>
                        </div>

                        <div className="hc-run-card__panel">
                            <label
                                className={`hc-run-check${isSaving ? ' hc-run-check--loading' : ''}`}
                            >
                                <input
                                    type="checkbox"
                                    className="hc-run-check__input"
                                    checked={autoRunHapppy}
                                    disabled={isSaving}
                                    onChange={(e) => handleToggle(e.target.checked)}
                                />
                                <span className="hc-run-check__box" aria-hidden="true" />
                                <span className="hc-run-check__text">
                                    <span className="hc-run-check__title">
                                        Let Happpy Agent find and apply to relevant jobs on my behalf after{' '}
                                        {AUTO_RUN_INACTIVITY_DAYS} days of inactivity
                                    </span>
                                    <span className="hc-run-check__hint">
                                        Agent will find matching jobs and apply without asking for approval each time.
                                    </span>
                                </span>
                            </label>
                        </div>
                    </section>

                    <div className="hc-footer">
                        <Link className="hc-footer__help" to={HELP_GUIDE_RAISE_TICKET_PATH}>
                            Need help? Raise a query
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
};

export default AutoRunSettingsTab;
