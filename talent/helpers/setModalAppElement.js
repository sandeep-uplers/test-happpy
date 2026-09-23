import Modal from 'react-modal';

let configured = false;

/** react-modal root — UTS uses #app; Happpy Next app uses #happpy-root. */
export function ensureModalAppElement() {
    if (configured || typeof document === 'undefined') return;
    const el =
        document.getElementById('happpy-root') ||
        document.getElementById('app') ||
        document.body;
    try {
        Modal.setAppElement(el);
        configured = true;
    } catch {
        // Never crash module load if the root is not in the DOM yet.
        Modal.setAppElement(document.body);
        configured = true;
    }
}
