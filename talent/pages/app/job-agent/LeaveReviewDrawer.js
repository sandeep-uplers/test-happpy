import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_OUTREACH_FEEDBACK, API_OUTREACH_REFINE_MESSAGE } from '../../../components/Constant';
import { isUploadAbortError, uploadReviewMedia } from './uploadReviewMedia';

/** Figma 377:22190 — Leave a review drawer assets. */
const ASSET_BASE = '/images/talent/outreach/leave-review/';
const ICON_THUMBS_UP = `${ASSET_BASE}icon-thumbs-up.svg`;
const ICON_SPARKLE = `${ASSET_BASE}icon-sparkle.svg`;
const ICON_HEART = `${ASSET_BASE}icon-heart.svg`;
const ICON_CASSETTE = `${ASSET_BASE}icon-cassette.svg`;
const ICON_MIC = `${ASSET_BASE}icon-mic.svg`;
const ICON_VIDEO = `${ASSET_BASE}icon-video.svg`;
const ICON_UPLOAD = `${ASSET_BASE}icon-upload.svg`;
const ICON_INFO_ASPECT = `${ASSET_BASE}icon-info-aspect.svg`;
const ICON_SHARE = `${ASSET_BASE}icon-share.svg`;
const ICON_INFO_FOOTER = `${ASSET_BASE}icon-info-footer.svg`;
const EMOJI_BG = `${ASSET_BASE}emoji-bg.svg`;

const MAX_MEDIA_BYTES = 20 * 1024 * 1024;
const MIN_REVIEW_CHARS = 10;
const ACCEPTED_MEDIA_EXT = ['.mp3', '.wav', '.mp4', '.mov'];
const ACCEPTED_MEDIA_MIME = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/x-wav',
    'audio/wave',
    'video/mp4',
    'video/quicktime',
];

const RATING_OPTIONS = [
    { id: 'terrible', label: 'Terrible', emoji: '😞' },
    { id: 'bad', label: 'Bad', emoji: '😕' },
    { id: 'okay', label: 'Okay', emoji: '😐' },
    { id: 'good', label: 'Good', emoji: '😄' },
    { id: 'amazing', label: 'Amazing', emoji: '😍' },
];

const HELPED_MOST_TAGS = [
    'Job Matching',
    'AI Outreach',
    'Resume Health',
    'Agent Speed',
    'Dashboard UX',
    'Referral Engine',
    'Smart Alerts',
    'Integrations',
];

function emptyMediaState() {
    return {
        file: null,
        status: 'idle', // idle | uploading | ready | error
        progress: 0,
        mediaFile: null, // { name, original_name, size, type } from upload API
        error: null,
    };
}

function emptyFormState() {
    return {
        rating: null,
        reviewText: '',
        helpedMost: [],
        fixFeedback: '',
        sharePublicly: false,
    };
}

function emptyFieldErrors() {
    return {
        rating: '',
        reviewText: '',
    };
}

function CloseIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

function ArrowRightIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
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

/** Circular back control — same pattern as ReferFriendDrawer footer. */
function FooterBackIcon() {
    return (
        <svg width="41" height="41" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="20.5" cy="20.5" r="20" fill="#FFFFFF" stroke="#DEE1E7" />
            <path
                d="M23 13L16 20.5L23 28"
                stroke="#231F20"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function ChevronDownIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
                d="M4 6l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isAcceptedMediaFile(file) {
    if (!file) return false;
    const name = (file.name || '').toLowerCase();
    const hasExt = ACCEPTED_MEDIA_EXT.some((ext) => name.endsWith(ext));
    const hasMime = !file.type || ACCEPTED_MEDIA_MIME.includes(file.type);
    return hasExt || hasMime;
}

/**
 * Leave a review drawer — Figma 377:22190 / 377:20705.
 * Desktop: right rail (~974px). Mobile: bottom sheet with 64px top gap.
 * Clip uploads via feedback/upload-media; submit via talent/outreach/feedback;
 * AI tidy via talent/outreach/refine-message (min 10 review chars).
 */
const LeaveReviewDrawer = ({ open, onClose }) => {
    const [form, setForm] = useState(emptyFormState);
    const [fieldErrors, setFieldErrors] = useState(emptyFieldErrors);
    const [media, setMedia] = useState(emptyMediaState);
    const [clipSectionOpen, setClipSectionOpen] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [refining, setRefining] = useState(false);
    const [preRefineText, setPreRefineText] = useState(null);
    const [lastRefinedText, setLastRefinedText] = useState(null);
    const fileInputRef = useRef(null);
    const uploadAbortRef = useRef(null);
    const refineAbortRef = useRef(null);
    const ratingFieldRef = useRef(null);
    const reviewTextFieldRef = useRef(null);
    const mediaRef = useRef(media);

    mediaRef.current = media;

    const reviewTextTrimmed = form.reviewText.trim();
    const hasMinReviewChars = reviewTextTrimmed.length >= MIN_REVIEW_CHARS;
    const isMediaUploading = media.status === 'uploading';
    const canSubmit = !isMediaUploading && !refining && !submitting;
    const hasChangedSinceRefine =
        lastRefinedText === null || form.reviewText !== lastRefinedText;
    const canTidy = hasMinReviewChars && !refining && !submitting && hasChangedSinceRefine;
    const canUndoRefine = Boolean(preRefineText !== null) && !refining;

    const abortUpload = useCallback(() => {
        if (uploadAbortRef.current) {
            uploadAbortRef.current.abort();
            uploadAbortRef.current = null;
        }
    }, []);

    const abortRefine = useCallback(() => {
        if (refineAbortRef.current) {
            refineAbortRef.current.abort();
            refineAbortRef.current = null;
        }
    }, []);

    const resetForm = useCallback(() => {
        abortUpload();
        abortRefine();
        setForm(emptyFormState());
        setFieldErrors(emptyFieldErrors());
        setMedia(emptyMediaState());
        setClipSectionOpen(false);
        setDragOver(false);
        setSubmitting(false);
        setRefining(false);
        setPreRefineText(null);
        setLastRefinedText(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, [abortRefine, abortUpload]);

    useEffect(() => {
        if (!open) return undefined;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prevOverflow;
        };
    }, [open]);

    useEffect(() => {
        if (!open) return undefined;
        const onKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    useEffect(() => {
        if (!open) resetForm();
    }, [open, resetForm]);

    useEffect(() => () => {
        abortUpload();
        abortRefine();
    }, [abortRefine, abortUpload]);

    const setField = useCallback((key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    }, []);

    const handleReviewTextChange = useCallback((e) => {
        const value = e.target.value;
        setPreRefineText(null);
        setForm((prev) => ({ ...prev, reviewText: value }));
        setFieldErrors((prev) => (prev.reviewText ? { ...prev, reviewText: '' } : prev));
    }, []);

    const handleRatingSelect = useCallback((ratingId) => {
        setField('rating', ratingId);
        setFieldErrors((prev) => (prev.rating ? { ...prev, rating: '' } : prev));
    }, [setField]);

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

    const scrollToFirstError = useCallback((errors) => {
        if (!window.matchMedia('(max-width: 767px)').matches) return;

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const target = errors.rating ? ratingFieldRef.current : reviewTextFieldRef.current;
                target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        });
    }, []);

    const toggleClipSection = useCallback(() => {
        setClipSectionOpen((prev) => !prev);
    }, []);

    const toggleTag = useCallback((tag) => {
        setForm((prev) => {
            const exists = prev.helpedMost.includes(tag);
            return {
                ...prev,
                helpedMost: exists
                    ? prev.helpedMost.filter((t) => t !== tag)
                    : [...prev.helpedMost, tag],
            };
        });
    }, []);

    const startMediaUpload = useCallback(
        async (file) => {
            abortUpload();
            const controller = new AbortController();
            uploadAbortRef.current = controller;

            setClipSectionOpen(true);
            setMedia({
                file,
                status: 'uploading',
                progress: 0,
                mediaFile: null,
                error: null,
            });

            try {
                const result = await uploadReviewMedia(file, {
                    signal: controller.signal,
                    onProgress: (progress) => {
                        setMedia((prev) => {
                            if (prev.file !== file || prev.status !== 'uploading') return prev;
                            return { ...prev, progress };
                        });
                    },
                });

                if (uploadAbortRef.current === controller) {
                    uploadAbortRef.current = null;
                }

                setMedia({
                    file,
                    status: 'ready',
                    progress: 100,
                    mediaFile: result,
                    error: null,
                });
            } catch (err) {
                if (isUploadAbortError(err)) return;
                const message = err?.message || 'Failed to upload clip.';
                toast.error(message);
                setMedia({
                    file,
                    status: 'error',
                    progress: 0,
                    mediaFile: null,
                    error: message,
                });
            }
        },
        [abortUpload],
    );

    const applyMediaFile = useCallback(
        (file) => {
            if (!file) return;
            if (!isAcceptedMediaFile(file)) {
                toast.error('Please upload MP3, WAV, MP4, or MOV.');
                return;
            }
            if (file.size > MAX_MEDIA_BYTES) {
                toast.error('File must be 20MB or smaller.');
                return;
            }
            startMediaUpload(file);
        },
        [startMediaUpload],
    );

    const handleFileInputChange = useCallback(
        (e) => {
            const file = e.target.files?.[0];
            applyMediaFile(file);
            e.target.value = '';
        },
        [applyMediaFile],
    );

    const handleDrop = useCallback(
        (e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragOver(false);
            const file = e.dataTransfer?.files?.[0];
            applyMediaFile(file);
        },
        [applyMediaFile],
    );

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
    }, []);

    const clearMedia = useCallback(() => {
        abortUpload();
        setMedia(emptyMediaState());
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, [abortUpload]);

    const retryMediaUpload = useCallback(() => {
        const file = mediaRef.current.file;
        if (!file) return;
        startMediaUpload(file);
    }, [startMediaUpload]);

    const handleTidyWithAi = useCallback(async () => {
        if (!canTidy) {
            if (!hasMinReviewChars) {
                toast.error(`Write at least ${MIN_REVIEW_CHARS} characters before tidying.`);
            }
            return;
        }

        const original = form.reviewText;
        abortRefine();
        const controller = new AbortController();
        refineAbortRef.current = controller;
        setRefining(true);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                API_OUTREACH_REFINE_MESSAGE,
                { message: original.trim() },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    signal: controller.signal,
                },
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
            const message =
                err?.response?.data?.message
                || err?.message
                || 'Failed to refine review. Please try again.';
            toast.error(message);
        } finally {
            if (refineAbortRef.current === controller) {
                refineAbortRef.current = null;
            }
            setRefining(false);
        }
    }, [abortRefine, canTidy, form.reviewText, hasMinReviewChars]);

    const handleUndoRefine = useCallback(() => {
        if (preRefineText === null) return;
        setForm((prev) => ({ ...prev, reviewText: preRefineText }));
        setPreRefineText(null);
        setLastRefinedText(null);
    }, [preRefineText]);

    const buildPayload = useCallback(() => {
        const payload = {
            rating: form.rating,
            review_text: form.reviewText.trim(),
            helped_most: form.helpedMost,
            fix_feedback: form.fixFeedback.trim() || null,
            share_publicly: Boolean(form.sharePublicly),
        };
        if (media.status === 'ready' && media.mediaFile) {
            payload.media_file = media.mediaFile;
        }
        return payload;
    }, [form, media.mediaFile, media.status]);

    const handleSubmit = useCallback(async () => {
        if (submitting || refining) return;
        if (isMediaUploading) {
            toast('Wait for your clip to finish uploading.', { icon: '⏳' });
            return;
        }

        const nextErrors = validateForm();
        if (nextErrors.rating || nextErrors.reviewText) {
            setFieldErrors(nextErrors);
            scrollToFirstError(nextErrors);
            return;
        }
        setFieldErrors(emptyFieldErrors());

        setSubmitting(true);
        const payload = buildPayload();

        if (media.status === 'error') {
            toast('Clip upload failed — submitting review without the clip.', { icon: '⚠️' });
        }

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(API_OUTREACH_FEEDBACK, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            });
            const body = res?.data || {};
            if (body.status !== 'success') {
                throw new Error(body.message || 'Failed to submit feedback.');
            }
            toast.success(body.message || 'Thanks for the feedback!');
            onClose();
        } catch (err) {
            const message =
                err?.response?.data?.message
                || err?.message
                || 'Failed to submit feedback. Please try again.';
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    }, [
        buildPayload,
        isMediaUploading,
        media.status,
        onClose,
        refining,
        submitting,
        validateForm,
        scrollToFirstError,
    ]);

    const mediaHint = useMemo(() => {
        if (!media.file) return null;
        return `${media.file.name} · ${formatFileSize(media.file.size)}`;
    }, [media.file]);

    const footerHint = useMemo(() => {
        if (refining) {
            return 'Wait for AI to finish rewriting your review';
        }
        if (isMediaUploading) {
            return 'Wait for your clip to finish uploading';
        }
        return null;
    }, [isMediaUploading, refining]);

    if (typeof document === 'undefined' || !open) return null;

    return createPortal(
        <div
            className="jad-leave-review-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="jad-leave-review-drawer-title"
        >
            <button
                type="button"
                className="jad-leave-review-drawer__backdrop"
                aria-label="Close leave a review"
                onClick={onClose}
            />
            <aside
                className="jad-leave-review-drawer__panel"
                onMouseDown={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    className="jad-leave-review-drawer__close"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <CloseIcon />
                </button>

                <div className="jad-leave-review-drawer__header">
                    <h2 id="jad-leave-review-drawer-title" className="jad-leave-review-drawer__title">
                        How&apos;s HAPPPY treating you?
                    </h2>
                    <p className="jad-leave-review-drawer__subtitle">
                        <span className="jad-leave-review-drawer__subtitle-strong">30 seconds, thats it!</span>{' '}
                        Because it helps the next engineer trust this actually works.
                    </p>
                </div>

                <div className="jad-leave-review-drawer__body">
                    <div className="jad-leave-review-drawer__card">
                        <section className="jad-leave-review-drawer__section" aria-labelledby="jad-leave-review-section">
                            <div className="jad-leave-review-drawer__section-head">
                                <img src={ICON_THUMBS_UP} alt="" width={18} height={18} />
                                <h3 id="jad-leave-review-section" className="jad-leave-review-drawer__section-title">
                                    Your Review
                                </h3>
                            </div>

                            <div
                                ref={ratingFieldRef}
                                className={`jad-leave-review-drawer__field${
                                    fieldErrors.rating ? ' jad-leave-review-drawer__field--error' : ''
                                }`}
                            >
                                <p className="jad-leave-review-drawer__label">
                                    How&apos;s the agent working for you?
                                    <span className="jad-leave-review-drawer__required" aria-hidden="true">
                                        *
                                    </span>
                                </p>
                                <div
                                    className={`jad-leave-review-drawer__ratings${
                                        fieldErrors.rating ? ' jad-leave-review-drawer__ratings--error' : ''
                                    }`}
                                    role="radiogroup"
                                    aria-label="Agent rating"
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
                                                className={`jad-leave-review-drawer__rating${
                                                    selected ? ' jad-leave-review-drawer__rating--selected' : ''
                                                }`}
                                                onClick={() => handleRatingSelect(option.id)}
                                            >
                                                <span
                                                    className="jad-leave-review-drawer__rating-emoji-wrap"
                                                    aria-hidden="true"
                                                >
                                                    <img
                                                        className="jad-leave-review-drawer__rating-emoji-bg"
                                                        src={EMOJI_BG}
                                                        alt=""
                                                        width={42}
                                                        height={42}
                                                    />
                                                    <span className="jad-leave-review-drawer__rating-emoji">
                                                        {option.emoji}
                                                    </span>
                                                </span>
                                                <span className="jad-leave-review-drawer__rating-label">
                                                    {option.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                                {fieldErrors.rating ? (
                                    <p className="jad-leave-review-drawer__field-error" role="alert">
                                        {fieldErrors.rating}
                                    </p>
                                ) : null}
                            </div>

                            <div
                                ref={reviewTextFieldRef}
                                className={`jad-leave-review-drawer__field${
                                    fieldErrors.reviewText ? ' jad-leave-review-drawer__field--error' : ''
                                }`}
                            >
                                <label className="jad-leave-review-drawer__label" htmlFor="jad-leave-review-text">
                                    Say a bit more - your words, raw is fine (but you can also let AI refine them)
                                    <span className="jad-leave-review-drawer__required" aria-hidden="true">
                                        *
                                    </span>
                                </label>
                                <div
                                    className={`jad-leave-review-drawer__textarea-wrap${
                                        refining ? ' jad-leave-review-drawer__textarea-wrap--refining' : ''
                                    }${
                                        fieldErrors.reviewText ? ' jad-leave-review-drawer__textarea-wrap--error' : ''
                                    }`}
                                >
                                    <textarea
                                        id="jad-leave-review-text"
                                        className={`jad-leave-review-drawer__textarea${
                                            refining ? ' jad-leave-review-drawer__textarea--refining' : ''
                                        }${
                                            fieldErrors.reviewText ? ' jad-leave-review-drawer__textarea--error' : ''
                                        }`}
                                        rows={4}
                                        value={form.reviewText}
                                        onChange={handleReviewTextChange}
                                        placeholder="Ex: Got an interview at a Microsoft in week one - and it was just my free trial..."
                                        disabled={refining}
                                        aria-busy={refining}
                                        aria-required="true"
                                        aria-invalid={Boolean(fieldErrors.reviewText)}
                                        aria-describedby={
                                            fieldErrors.reviewText ? 'jad-leave-review-text-error' : undefined
                                        }
                                    />
                                    {refining ? (
                                        <div
                                            className="jad-leave-review-drawer__textarea-skeleton"
                                            aria-hidden="true"
                                        >
                                            <span className="jad-leave-review-drawer__textarea-skeleton-line" />
                                            <span className="jad-leave-review-drawer__textarea-skeleton-line" />
                                            <span className="jad-leave-review-drawer__textarea-skeleton-line jad-leave-review-drawer__textarea-skeleton-line--short" />
                                        </div>
                                    ) : null}
                                    <div className="jad-leave-review-drawer__ai-actions">
                                        {canUndoRefine ? (
                                            <button
                                                type="button"
                                                className="jad-leave-review-drawer__undo-btn"
                                                onClick={handleUndoRefine}
                                            >
                                                Undo
                                            </button>
                                        ) : null}
                                        <button
                                            type="button"
                                            className={`jad-leave-review-drawer__ai-btn${
                                                refining ? ' jad-leave-review-drawer__ai-btn--loading' : ''
                                            }`}
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
                                        id="jad-leave-review-text-error"
                                        className="jad-leave-review-drawer__field-error"
                                        role="alert"
                                    >
                                        {fieldErrors.reviewText}
                                    </p>
                                ) : null}
                            </div>
                        </section>

                        <hr className="jad-leave-review-drawer__divider" />

                        <section
                            className="jad-leave-review-drawer__section"
                            aria-labelledby="jad-leave-review-helped"
                        >
                            <div className="jad-leave-review-drawer__section-head">
                                <img src={ICON_HEART} alt="" width={18} height={18} />
                                <h3 id="jad-leave-review-helped" className="jad-leave-review-drawer__section-title">
                                    What actually helped you the most?
                                </h3>
                            </div>
                            <div className="jad-leave-review-drawer__tags" role="group" aria-label="Features that helped">
                                {HELPED_MOST_TAGS.map((tag) => {
                                    const selected = form.helpedMost.includes(tag);
                                    return (
                                        <button
                                            key={tag}
                                            type="button"
                                            className={`jad-leave-review-drawer__tag${
                                                selected ? ' jad-leave-review-drawer__tag--selected' : ''
                                            }`}
                                            aria-pressed={selected}
                                            onClick={() => toggleTag(tag)}
                                        >
                                            {tag}
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        <section
                            className={`jad-leave-review-drawer__section jad-leave-review-drawer__section--accordion${
                                clipSectionOpen ? ' jad-leave-review-drawer__section--open' : ''
                            }`}
                        >
                            <button
                                type="button"
                                className="jad-leave-review-drawer__section-trigger"
                                aria-expanded={clipSectionOpen}
                                aria-controls="jad-leave-review-clip-panel"
                                onClick={toggleClipSection}
                            >
                                <img src={ICON_CASSETTE} alt="" width={24} height={24} />
                                <span id="jad-leave-review-clip" className="jad-leave-review-drawer__section-title">
                                    Rather talk? Drop a 30-second clip.
                                </span>
                                <span
                                    className={`jad-leave-review-drawer__section-chevron${
                                        clipSectionOpen ? ' jad-leave-review-drawer__section-chevron--open' : ''
                                    }`}
                                    aria-hidden="true"
                                >
                                    <ChevronDownIcon />
                                </span>
                            </button>

                            {clipSectionOpen ? (
                                <div
                                    id="jad-leave-review-clip-panel"
                                    className="jad-leave-review-drawer__section-panel"
                                    role="region"
                                    aria-labelledby="jad-leave-review-clip"
                                >
                            <div
                                className={`jad-leave-review-drawer__dropzone${
                                    dragOver ? ' jad-leave-review-drawer__dropzone--drag' : ''
                                }${media.file ? ' jad-leave-review-drawer__dropzone--has-file' : ''}${
                                    media.status === 'error' ? ' jad-leave-review-drawer__dropzone--error' : ''
                                }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="jad-leave-review-drawer__file-input"
                                    accept=".mp3,.wav,.mp4,.mov,audio/mpeg,audio/wav,video/mp4,video/quicktime"
                                    onChange={handleFileInputChange}
                                    aria-label="Upload audio or video clip"
                                />

                                <div className="jad-leave-review-drawer__dropzone-icons" aria-hidden="true">
                                    <span className="jad-leave-review-drawer__dropzone-icon">
                                        <img src={ICON_MIC} alt="" width={20} height={20} />
                                    </span>
                                    <span className="jad-leave-review-drawer__dropzone-icon">
                                        <img src={ICON_VIDEO} alt="" width={20} height={20} />
                                    </span>
                                </div>

                                <p className="jad-leave-review-drawer__dropzone-title">
                                    Drop an audio or video clip here - 30 seconds is plenty
                                </p>
                                <p className="jad-leave-review-drawer__dropzone-formats">
                                    MP3, WAV, MP4, MOV · max 20MB
                                </p>

                                {media.file ? (
                                    <div
                                        className={`jad-leave-review-drawer__file-chip${
                                            media.status === 'uploading'
                                                ? ' jad-leave-review-drawer__file-chip--uploading'
                                                : ''
                                        }${
                                            media.status === 'error'
                                                ? ' jad-leave-review-drawer__file-chip--error'
                                                : ''
                                        }${
                                            media.status === 'ready'
                                                ? ' jad-leave-review-drawer__file-chip--ready'
                                                : ''
                                        }`}
                                    >
                                        <div className="jad-leave-review-drawer__file-chip-main">
                                            <span className="jad-leave-review-drawer__file-chip-name">
                                                {mediaHint}
                                            </span>
                                            {media.status === 'uploading' ? (
                                                <span
                                                    className="jad-leave-review-drawer__file-chip-status"
                                                    role="status"
                                                    aria-live="polite"
                                                >
                                                    Uploading {media.progress}%
                                                </span>
                                            ) : null}
                                            {media.status === 'error' ? (
                                                <span
                                                    className="jad-leave-review-drawer__file-chip-status jad-leave-review-drawer__file-chip-status--error"
                                                    role="alert"
                                                >
                                                    {media.error || 'Upload failed'}
                                                </span>
                                            ) : null}
                                            {media.status === 'uploading' ? (
                                                <div
                                                    className="jad-leave-review-drawer__file-chip-progress"
                                                    role="progressbar"
                                                    aria-valuenow={media.progress}
                                                    aria-valuemin={0}
                                                    aria-valuemax={100}
                                                    aria-label="Upload progress"
                                                >
                                                    <span
                                                        className="jad-leave-review-drawer__file-chip-progress-bar"
                                                        style={{ width: `${media.progress}%` }}
                                                    />
                                                </div>
                                            ) : null}
                                        </div>
                                        <div className="jad-leave-review-drawer__file-chip-actions">
                                            {media.status === 'error' ? (
                                                <button
                                                    type="button"
                                                    className="jad-leave-review-drawer__file-chip-retry"
                                                    onClick={retryMediaUpload}
                                                >
                                                    Retry
                                                </button>
                                            ) : null}
                                            <button
                                                type="button"
                                                className="jad-leave-review-drawer__file-chip-remove"
                                                onClick={clearMedia}
                                                aria-label={
                                                    media.status === 'uploading'
                                                        ? 'Cancel upload and remove file'
                                                        : 'Remove uploaded file'
                                                }
                                            >
                                                {media.status === 'uploading' ? 'Cancel' : 'Remove'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        className="jad-leave-review-drawer__browse-btn"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <img src={ICON_UPLOAD} alt="" width={14} height={14} />
                                        <span>Browse Files</span>
                                    </button>
                                )}

                                <div className="jad-leave-review-drawer__aspect-note" role="note">
                                    <img src={ICON_INFO_ASPECT} alt="" width={12} height={12} />
                                    <span>We recommend that the video you upload is of the 16:9 aspect ratio</span>
                                </div>
                            </div>
                                </div>
                            ) : null}
                        </section>

                        <div className="jad-leave-review-drawer__field">
                            <label className="jad-leave-review-drawer__fix-label" htmlFor="jad-leave-review-fix">
                                Anything we should fix? Even the small stuff helps - we read all of it
                            </label>
                            <textarea
                                id="jad-leave-review-fix"
                                className="jad-leave-review-drawer__textarea jad-leave-review-drawer__textarea--fix"
                                rows={3}
                                value={form.fixFeedback}
                                onChange={(e) => setField('fixFeedback', e.target.value)}
                                placeholder="Start typing here..."
                            />
                        </div>

                        <hr className="jad-leave-review-drawer__divider" />

                        <div className="jad-leave-review-drawer__share-row">
                            <div className="jad-leave-review-drawer__share-copy">
                                <span className="jad-leave-review-drawer__share-icon" aria-hidden="true">
                                    <img src={ICON_SHARE} alt="" width={20} height={20} />
                                </span>
                                <div>
                                    <p className="jad-leave-review-drawer__share-title">
                                        Cool if we share your review publicly?
                                    </p>
                                    <p className="jad-leave-review-drawer__share-sub">Off unless you turn it on</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className={`jad-leave-review-drawer__toggle${
                                    form.sharePublicly ? ' jad-leave-review-drawer__toggle--on' : ''
                                }`}
                                role="switch"
                                aria-checked={form.sharePublicly}
                                aria-label="Share review publicly"
                                onClick={() => setField('sharePublicly', !form.sharePublicly)}
                            >
                                <span className="jad-leave-review-drawer__toggle-knob" />
                            </button>
                        </div>
                    </div>
                </div>

                <footer className="jad-leave-review-drawer__footer">
                    <button
                        type="button"
                        className="jad-leave-review-drawer__footer-back"
                        onClick={onClose}
                        aria-label="Close review drawer"
                    >
                        <FooterBackIcon />
                    </button>

                    {footerHint ? (
                        <p className="jad-leave-review-drawer__footer-hint" role="status">
                            <img src={ICON_INFO_FOOTER} alt="" width={14} height={14} />
                            <span>{footerHint}</span>
                        </p>
                    ) : (
                        <span className="jad-leave-review-drawer__footer-spacer" aria-hidden="true" />
                    )}

                    <button
                        type="button"
                        className="jad-leave-review-drawer__submit"
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                    >
                        <span>submit my review</span>
                        <ArrowRightIcon />
                    </button>
                </footer>
            </aside>
        </div>,
        document.body,
    );
};

export default LeaveReviewDrawer;
