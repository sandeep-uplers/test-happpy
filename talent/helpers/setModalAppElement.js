import Modal from 'react-modal';

let configured = false;

/** react-modal root — UTS uses #app; Happpy Next app uses #happpy-root. */
export function ensureModalAppElement() {
    if (configured || typeof document === 'undefined') return;
    const el = document.getElementById('happpy-root') || document.getElementById('app') || document.body;
    configured = true;
}
