import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { API_OUTREACH_REFINE_MESSAGE, IMAGE_URL } from '../../../components/Constant';
import { POST_API } from '../../../components/Helper';
import { NEGATIVE_RATINGS, NEGATIVE_REASON_TAGS } from './interviewFeedbackConstants';
import { isUploadAbortError } from './uploadReviewMedia';
import { submitOutreachFeedback } from './submitOutreachFeedback';

const ASSET_BASE = '/images/talent/outreach/leave-review/';
const ICON_SPARKLE = `${ASSET_BASE}icon-sparkle.svg`;
const EMOJI_BG = `${ASSET_BASE}emoji-bg.svg`;
const MASCOT_WIN = `${IMAGE_URL}/outreach/mascot-celebrate.svg`;
const MASCOT_NEGATIVE = `${ASSET_BASE}mascot-negative-feedback.svg`;

const MIN_REVIEW_CHARS = 10;
const SCREEN_REVIEW = 'review';
const SCREEN_NEGATIVE = 'negative';

const RATING_OPTIONS = [
    { id: 'terrible', label: 'Terrible', emoji: '😞' },
    { id: 'bad', label: 'Bad', emoji: '😕' },
    { id: 'okay', label: 'Okay', emoji: '😐' },
    { id: 'good', label: 'Good', emoji: '😄' },
    { id: 'amazing', label: 'Amazing', emoji: '😍' },
];

function emptyFormState() {
    return {
        rating: null,
        reviewText: '',
        sharePublicly: false,
    };
}

function emptyFieldErrors() {
    return {
        rating: '',
        reviewText: '',
    };
}

function emptyNegativeState() {
    return {
        reasons: [],
        detailText: '',
    };
}

function ArrowRightIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

/**
 * Interview win feedback modal — Figma 481:79008 + negative follow-up 481:73910.
 * Single shell toggles between review and negative screens via local state.
 */
const InterviewFeedbackModal = ({ open, companyName = 'a company', onClose, onSubmitted }) => {
    const [screen, setScreen] = useState(SCREEN_REVIEW);
    const [form, setForm] = useState(emptyFormState);
    const [fieldErrors, setFieldErrors] = useState(emptyFieldErrors);
    const [negativeForm, setNegativeForm] = useState(emptyNegativeState);
    const [pendingPayload, setPendingPayload] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [refining, setRefining] = useState(false);
    const [preRefineText, setPreRefineText] = useState(null);
    const [lastRefinedText, setLastRefinedText] = useState(null);
    const refineAbortRef = useRef(null);

    const reviewTextTrimmed = form.reviewText.trim();
    const hasMinReviewChars = reviewTextTrimmed.length >= MIN_REVIEW_CHARS;
    const hasChangedSinceRefine =
        lastRefinedText === null || form.reviewText !== lastRefinedText;
    const canTidy = hasMinReviewChars && !refining && !submitting && hasChangedSinceRefine;
    const canUndoRefine = Boolean(preRefineText !== null) && !refining;
    const canSubmit = !refining && !submitting;

    const resetForm = useCallback(() => {
        if (refineAbortRef.current) {
            refineAbortRef.current.abort();
            refineAbortRef.current = null;
        }
        setScreen(SCREEN_REVIEW);
        setForm(emptyFormState());
        setFieldErrors(emptyFieldErrors());
        setNegativeForm(emptyNegativeState());
        setPendingPayload(null);
        setSubmitting(false);
        setRefining(false);
        setPreRefineText(null);
        setLastRefinedText(null);
    }, []);

    useEffect(() => {
        if (!open) return undefined;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prevOverflow;
        };
    }, [open]);

    const submitNegativeFeedback = useCallback(async () => {
        if (submitting || !pendingPayload) return false;
        setSubmitting(true);
        const payload = {
            ...pendingPayload,
            negative_reasons: negativeForm.reasons,
            negative_detail: negativeForm.detailText.trim() || null,
        };
        try {
            const body = await submitOutreachFeedback(payload);
            toast.success(body.message || 'Thanks — your feedback goes straight to the team.');
            onSubmitted?.();
            return true;
        } catch (err) {
            const message =
                err?.response?.data?.message
                || err?.message
                || 'Failed to submit feedback. Please try again.';
            toast.error(message);
            return false;
        } finally {
            setSubmitting(false);
        }
    }, [negativeForm.detailText, negativeForm.reasons, onSubmitted, pendingPayload, submitting]);

    const handleDismiss = useCallback(async () => {
        if (screen === SCREEN_NEGATIVE) {
            await submitNegativeFeedback();
            return;
        }
        onClose();
    }, [onClose, screen, submitNegativeFeedback]);

    useEffect(() => {
        if (!open) return undefined;
        const onKey = (e) => {
            if (e.key === 'Escape') handleDismiss();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [handleDismiss, open]);

    useEffect(() => {
        if (!open) resetForm();
    }, [open, resetForm]);

    useEffect(
        () => () => {
            if (refineAbortRef.current) {
                refineAbortRef.current.abort();
                refineAbortRef.current = null;
            }
        },
        [],
    );

    const buildPayload = useCallback(() => ({
        rating: form.rating,
        review_text: reviewTextTrimmed,
        share_publicly: Boolean(form.sharePublicly),
    }), [form.rating, form.sharePublicly, reviewTextTrimmed]);

    const submitReview = useCallback(
        async (payload) => {
            setSubmitting(true);
            try {
                const body = await submitOutreachFeedback(payload);
                toast.success(body.message || 'Thanks for sharing your review!');
                onSubmitted?.();
            } catch (err) {
                const message =
                    err?.response?.data?.message
                    || err?.message
                    || 'Failed to submit feedback. Please try again.';
                toast.error(message);
                throw err;
            } finally {
                setSubmitting(false);
            }
        },
        [onSubmitted],
    );

    const validateForm = useCallback(() => {
        const next = emptyFieldErrors();
        if (!form.rating) {
            next.rating = 'This field is required';
        }
        if (!reviewTextTrimmed) {
            next.reviewText = 'This field is required';
        } else if (!hasMinReviewChars) {
            next.reviewText = `Write at least ${MIN_REVIEW_CHARS} characters in your review`;
        }
        return next;
    }, [form.rating, hasMinReviewChars, reviewTextTrimmed]);

    const handleShareReview = useCallback(async () => {
        if (submitting || refining) return;

        const nextErrors = validateForm();
        if (nextErrors.rating || nextErrors.reviewText) {
            setFieldErrors(nextErrors);
            return;
        }
        setFieldErrors(emptyFieldErrors());

        const payload = buildPayload();
        if (NEGATIVE_RATINGS.has(form.rating)) {
            setPendingPayload(payload);
            setScreen(SCREEN_NEGATIVE);
            return;
        }

        await submitReview(payload);
    }, [buildPayload, form.rating, refining, submitReview, submitting, validateForm]);

    const handleReviewTextChange = useCallback((e) => {
        setPreRefineText(null);
        setLastRefinedText(null);
        setForm((prev) => ({ ...prev, reviewText: e.target.value }));
        setFieldErrors((prev) => (prev.reviewText ? { ...prev, reviewText: '' } : prev));
    }, []);

    const handleRatingSelect = useCallback((ratingId) => {
        setForm((prev) => ({ ...prev, rating: ratingId }));
        setFieldErrors((prev) => (prev.rating ? { ...prev, rating: '' } : prev));
    }, []);

    const handleTidyWithAi = useCallback(async () => {
        if (!canTidy) {
            if (!hasMinReviewChars) {
                toast.error(`Write at least ${MIN_REVIEW_CHARS} characters before tidying.`);
            }
            return;
        }

        const original = form.reviewText;
        if (refineAbortRef.current) {
            refineAbortRef.current.abort();
        }
        const controller = new AbortController();
        refineAbortRef.current = controller;
        setRefining(true);

        try {
            const res = await POST_API(
                API_OUTREACH_REFINE_MESSAGE,
                { message: original.trim() },
                1,
                { signal: controller.signal },
            );
            const body = res?.data || {};
            if (body.status !== 'success' || !body.data?.message) {
                throw new Error(body.message || 'Failed to refine review.');
            }
            const refined = body.data.message;
            setPreRefineText(original);
            setLastRefinedText(refined);
            setForm((prev) => ({ ...prev, reviewText: refined }));
        } catch (err) {
            if (isUploadAbortError(err)) return;
            toast.error(
                err?.response?.data?.message
                || err?.message
                || 'Failed to refine review. Please try again.',
            );
        } finally {
            if (refineAbortRef.current === controller) {
                refineAbortRef.current = null;
            }
            setRefining(false);
        }
    }, [canTidy, form.reviewText, hasMinReviewChars]);

    const handleUndoRefine = useCallback(() => {
        if (preRefineText === null) return;
        setForm((prev) => ({ ...prev, reviewText: preRefineText }));
        setPreRefineText(null);
        setLastRefinedText(null);
    }, [preRefineText]);

    const toggleReason = useCallback((tag) => {
        setNegativeForm((prev) => {
            const exists = prev.reasons.includes(tag);
            return {
                ...prev,
                reasons: exists
                    ? prev.reasons.filter((t) => t !== tag)
                    : [...prev.reasons, tag],
            };
        });
    }, []);

    const handleNegativeSubmit = useCallback(async () => {
        await submitNegativeFeedback();
    }, [submitNegativeFeedback]);

    const displayCompany = useMemo(() => {
        const name = (companyName || '').trim();
        return name || 'a company';
    }, [companyName]);

    if (!open || typeof document === 'undefined') return null;

    const titleId =
        screen === SCREEN_NEGATIVE
            ? 'happpy-interview-feedback-negative-title'
            : 'happpy-interview-feedback-title';

    return createPortal(
        <div
            className="happpy-interview-feedback"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
        >
            <button
                type="button"
                className="happpy-interview-feedback__backdrop"
                aria-label="Close interview feedback"
                onClick={handleDismiss}
            />
            <div
                className="happpy-interview-feedback__panel"
                onMouseDown={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    className="happpy-interview-feedback__close"
                    onClick={handleDismiss}
                    aria-label={screen === SCREEN_NEGATIVE ? 'Close and submit feedback' : 'Close'}
                >
                    ✕
                </button>

                <div className="happpy-interview-feedback__scroll">
                    {screen === SCREEN_REVIEW ? (
                        <>
                            <header className="happpy-interview-feedback__hero">
                                <img
                                    className="happpy-interview-feedback__mascot"
                                    src={MASCOT_WIN}
                                    alt=""
                                    width={98}
                                    height={84}
                                />
                                <p className="happpy-interview-feedback__eyebrow">You just landed an interview!</p>
                                <h2 id={titleId} className="happpy-interview-feedback__title">
                                    Landed Interview at {displayCompany}.
                                </h2>
                            </header>

                            <div className="happpy-interview-feedback__body">
                                <div
                                    className={`happpy-interview-feedback__section${
                                        fieldErrors.rating ? ' happpy-interview-feedback__section--error' : ''
                                    }`}
                                >
                                    <p className="happpy-interview-feedback__section-title">
                                        Rate your experience with HAPPPY
                                        <span className="happpy-interview-feedback__required" aria-hidden="true">
                                            *
                                        </span>
                                    </p>
                                    <div
                                        className={`happpy-interview-feedback__ratings${
                                            fieldErrors.rating ? ' happpy-interview-feedback__ratings--error' : ''
                                        }`}
                                        role="radiogroup"
                                        aria-label="Interview rating"
                                        aria-required="true"
                                        aria-invalid={Boolean(fieldErrors.rating)}
                                    >
                                        {RATING_OPTIONS.map((option) => {
                                            const selected = form.rating === option.id;
                                            return (
                                                <button
                                                    key={option.id}
                                                    type="button"
                                                    role="radio"
                                                    aria-checked={selected}
                                                    className={`happpy-interview-feedback__rating${
                                                        selected ? ' happpy-interview-feedback__rating--selected' : ''
                                                    }`}
                                                    onClick={() => handleRatingSelect(option.id)}
                                                >
                                                    <span
                                                        className="happpy-interview-feedback__rating-emoji-wrap"
                                                        aria-hidden="true"
                                                    >
                                                        <img
                                                            className="happpy-interview-feedback__rating-emoji-bg"
                                                            src={EMOJI_BG}
                                                            alt=""
                                                            width={42}
                                                            height={42}
                                                        />
                                                        <span className="happpy-interview-feedback__rating-emoji">
                                                            {option.emoji}
                                                        </span>
                                                    </span>
                                                    <span className="happpy-interview-feedback__rating-label">
                                                        {option.label}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {fieldErrors.rating ? (
                                        <p className="happpy-interview-feedback__field-error" role="alert">
                                            {fieldErrors.rating}
                                        </p>
                                    ) : null}
                                </div>

                                <div
                                    className={`happpy-interview-feedback__section${
                                        fieldErrors.reviewText ? ' happpy-interview-feedback__section--error' : ''
                                    }`}
                                >
                                    <p className="happpy-interview-feedback__section-title">
                                        Add a line for the fellow job seekers
                                        <span className="happpy-interview-feedback__required" aria-hidden="true">
                                            *
                                        </span>
                                    </p>
                                    <div
                                        className={`happpy-interview-feedback__textarea-wrap${
                                            refining ? ' happpy-interview-feedback__textarea-wrap--refining' : ''
                                        }${
                                            fieldErrors.reviewText
                                                ? ' happpy-interview-feedback__textarea-wrap--error'
                                                : ''
                                        }`}
                                    >
                                        <textarea
                                            id="happpy-interview-feedback-text"
                                            className={`happpy-interview-feedback__textarea${
                                                refining ? ' happpy-interview-feedback__textarea--refining' : ''
                                            }${
                                                fieldErrors.reviewText
                                                    ? ' happpy-interview-feedback__textarea--error'
                                                    : ''
                                            }`}
                                            rows={4}
                                            value={form.reviewText}
                                            onChange={handleReviewTextChange}
                                            placeholder="Type whatever comes to mind - a sentence is plenty"
                                            disabled={refining}
                                            aria-busy={refining}
                                            aria-required="true"
                                            aria-invalid={Boolean(fieldErrors.reviewText)}
                                            aria-describedby={
                                                fieldErrors.reviewText
                                                    ? 'happpy-interview-feedback-text-error'
                                                    : undefined
                                            }
                                        />
                                        {refining ? (
                                            <div
                                                className="happpy-interview-feedback__textarea-skeleton"
                                                aria-hidden="true"
                                            >
                                                <span className="happpy-interview-feedback__textarea-skeleton-line" />
                                                <span className="happpy-interview-feedback__textarea-skeleton-line" />
                                                <span className="happpy-interview-feedback__textarea-skeleton-line happpy-interview-feedback__textarea-skeleton-line--short" />
                                            </div>
                                        ) : null}
                                        <div className="happpy-interview-feedback__ai-actions">
                                            {canUndoRefine ? (
                                                <button
                                                    type="button"
                                                    className="happpy-interview-feedback__undo-btn"
                                                    onClick={handleUndoRefine}
                                                >
                                                    Undo
                                                </button>
                                            ) : null}
                                            <button
                                                type="button"
                                                className="happpy-interview-feedback__ai-btn"
                                                onClick={handleTidyWithAi}
                                                disabled={!canTidy}
                                                aria-busy={refining}
                                            >
                                                <img src={ICON_SPARKLE} alt="" width={12} height={12} />
                                                <span>
                                                    {refining ? 'Rewriting...' : 'Tidy this up with AI (recommended)'}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                    {fieldErrors.reviewText ? (
                                        <p
                                            id="happpy-interview-feedback-text-error"
                                            className="happpy-interview-feedback__field-error"
                                            role="alert"
                                        >
                                            {fieldErrors.reviewText}
                                        </p>
                                    ) : null}
                                </div>

                                <div className="happpy-interview-feedback__share-row">
                                    <div className="happpy-interview-feedback__share-copy">
                                        <p className="happpy-interview-feedback__share-title">
                                            Cool if we share your review publicly?
                                        </p>
                                        <p className="happpy-interview-feedback__share-sub">Off unless you flip it on.</p>
                                    </div>
                                    <button
                                        type="button"
                                        className={`happpy-interview-feedback__toggle${
                                            form.sharePublicly ? ' happpy-interview-feedback__toggle--on' : ''
                                        }`}
                                        role="switch"
                                        aria-checked={form.sharePublicly}
                                        aria-label="Share review publicly"
                                        onClick={() =>
                                            setForm((prev) => ({ ...prev, sharePublicly: !prev.sharePublicly }))
                                        }
                                    >
                                        <span className="happpy-interview-feedback__toggle-knob" />
                                    </button>
                                </div>

                                <div className="happpy-interview-feedback__actions">
                                    <button
                                        type="button"
                                        className="happpy-interview-feedback__submit"
                                        onClick={handleShareReview}
                                        disabled={!canSubmit}
                                    >
                                        <span>Share my review</span>
                                        <ArrowRightIcon />
                                    </button>
                                    <button
                                        type="button"
                                        className="happpy-interview-feedback__later"
                                        onClick={onClose}
                                    >
                                        maybe later
                                    </button>
                                    <p className="happpy-interview-feedback__footnote">
                                        takes 30 seconds — and it helps the next engineer trust this works.
                                    </p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="happpy-interview-feedback__negative">
                            <div className="happpy-interview-feedback__negative-hero">
                                <img
                                    className="happpy-interview-feedback__negative-mascot"
                                    src={MASCOT_NEGATIVE}
                                    alt=""
                                    width={71}
                                    height={76}
                                />
                                <div className="happpy-interview-feedback__negative-copy">
                                    <h2 id={titleId} className="happpy-interview-feedback__negative-title">
                                        Ah - what went sideways?
                                    </h2>
                                    <p className="happpy-interview-feedback__negative-subtitle">
                                        This isn&apos;t a form, it comes straight to the core team - who built this
                                    </p>
                                </div>
                            </div>

                            <div
                                className="happpy-interview-feedback__negative-tags"
                                role="group"
                                aria-label="What went wrong"
                            >
                                {NEGATIVE_REASON_TAGS.map((tag) => {
                                    const selected = negativeForm.reasons.includes(tag);
                                    return (
                                        <button
                                            key={tag}
                                            type="button"
                                            className={`happpy-interview-feedback__negative-tag${
                                                selected ? ' happpy-interview-feedback__negative-tag--selected' : ''
                                            }`}
                                            aria-pressed={selected}
                                            onClick={() => toggleReason(tag)}
                                        >
                                            {tag}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="happpy-interview-feedback__negative-field">
                                <label
                                    className="happpy-interview-feedback__negative-label"
                                    htmlFor="happpy-interview-feedback-negative-detail"
                                >
                                    Tell us what happened, we read every feedback.
                                </label>
                                <textarea
                                    id="happpy-interview-feedback-negative-detail"
                                    className="happpy-interview-feedback__negative-textarea"
                                    rows={3}
                                    value={negativeForm.detailText}
                                    onChange={(e) =>
                                        setNegativeForm((prev) => ({ ...prev, detailText: e.target.value }))
                                    }
                                    placeholder="Start typing here..."
                                />
                            </div>

                            <footer className="happpy-interview-feedback__negative-footer">
                                <button
                                    type="button"
                                    className="happpy-interview-feedback__submit"
                                    onClick={handleNegativeSubmit}
                                    disabled={submitting || !pendingPayload}
                                >
                                    Submit my feedback
                                </button>
                                <p className="happpy-interview-feedback__negative-footnote">
                                    We usually reply within a day. no bots, no ticket numbers.
                                </p>
                            </footer>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body,
    );
};

export default InterviewFeedbackModal;
