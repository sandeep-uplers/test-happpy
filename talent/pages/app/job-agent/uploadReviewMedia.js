import { isRequestCanceled, postFormDataWithProgress } from '../../../components/Helper';
import { API_OUTREACH_FEEDBACK_UPLOAD_MEDIA } from '../../../components/Constant';

/**
 * True when the upload was aborted/cancelled (not a real failure).
 */
export function isUploadAbortError(err) {
    return (
        isRequestCanceled(err)
        || err?.name === 'CanceledError'
        || err?.message === 'canceled'
    );
}

/**
 * Upload a leave-review audio/video clip via multipart FormData.
 * Returns { name, original_name, size, type } for submitFeedback.media_file.
 *
 * @param {File} file
 * @param {{ signal?: AbortSignal, onProgress?: (percent: number) => void }} [options]
 */
export async function uploadReviewMedia(file, { signal, onProgress } = {}) {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');

    let res;
    try {
        res = await postFormDataWithProgress(API_OUTREACH_FEEDBACK_UPLOAD_MEDIA, formData, {
            token,
            signal,
            onProgress,
        });
    } catch (err) {
        if (isUploadAbortError(err)) throw err;
        const message =
            err?.response?.data?.message
            || err?.response?.data?.errors?.file?.[0]
            || err?.message
            || 'Failed to upload clip.';
        throw new Error(message);
    }

    const body = res?.data || {};
    if (body.status !== 'success' || !body.data?.name) {
        throw new Error(body.message || 'Failed to upload clip.');
    }

    const data = body.data;
    return {
        name: data.name,
        original_name: data.original_name || file.name,
        size: data.size ?? file.size,
        type: data.type || file.type || null,
    };
}
