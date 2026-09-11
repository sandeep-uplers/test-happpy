import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Spinner } from 'react-bootstrap';

const MAX_NAME_LENGTH = 255;

function TailorResumeRenameModal({ isOpen, onClose, initialName, defaultName, onSave, saving, error }) {
    const [name, setName] = useState(initialName || '');
    const [localError, setLocalError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setName(initialName || '');
            setLocalError('');
        }
    }, [isOpen, initialName]);

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prevOverflow;
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }
        const onKeyDown = (e) => {
            if (e.key === 'Escape' && !saving) {
                onClose();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isOpen, onClose, saving]);

    if (!isOpen || typeof document === 'undefined') {
        return null;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) {
            setLocalError('Please enter a name.');
            return;
        }
        if (trimmed.length > MAX_NAME_LENGTH) {
            setLocalError(`Name must be ${MAX_NAME_LENGTH} characters or fewer.`);
            return;
        }
        setLocalError('');
        onSave(trimmed);
    };

    const displayError = localError || error;

    return createPortal(
        <div
            className="jad-trd-rename-modal-backdrop"
            role="presentation"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget && !saving) {
                    onClose();
                }
            }}
        >
            <div
                className="jad-trd-rename-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="jad-trd-rename-modal-title"
                onMouseDown={(e) => e.stopPropagation()}
            >
                <div className="jad-trd-rename-modal__head">
                    <h3 id="jad-trd-rename-modal-title" className="jad-trd-rename-modal__title">
                        Rename tailored resume
                    </h3>
                    <button
                        type="button"
                        className="jad-trd-rename-modal__close"
                        onClick={onClose}
                        disabled={saving}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                <form className="jad-trd-rename-modal__body" onSubmit={handleSubmit}>
                    <label className="jad-trd-rename-modal__label" htmlFor="jad-trd-rename-input">
                        Resume name
                    </label>
                    <input
                        id="jad-trd-rename-input"
                        type="text"
                        className="jad-trd-rename-modal__input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={MAX_NAME_LENGTH}
                        placeholder={defaultName || 'Tailored resume'}
                        disabled={saving}
                        autoFocus
                    />
                    <p className="jad-trd-rename-modal__hint">
                        {defaultName ? (
                            <>
                                Default: <span className="jad-trd-rename-modal__hint-default">{defaultName}</span>
                            </>
                        ) : (
                            <>Up to {MAX_NAME_LENGTH} characters</>
                        )}
                    </p>
                    {displayError ? (
                        <p className="jad-trd-rename-modal__error" role="alert">
                            {displayError}
                        </p>
                    ) : null}

                    <div className="jad-trd-rename-modal__actions">
                        <button
                            type="button"
                            className="jad-trd-rename-modal__btn jad-trd-rename-modal__btn--ghost"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="jad-trd-rename-modal__btn jad-trd-rename-modal__btn--primary"
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <Spinner size="sm" animation="border" role="status" aria-hidden="true" />
                                    <span>Saving…</span>
                                </>
                            ) : (
                                'Save'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}

export default TailorResumeRenameModal;
