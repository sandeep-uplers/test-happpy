import toast from 'react-hot-toast';
import { BookmarkToastMessage } from '../assets/BookmarkNotify';

const DEFAULT_DURATION_MS = 3000;

const BASE_OPTS = {
    position: 'top-right',
    icon: null,
    className: 'bookmark-toast-bar',
    style: { maxWidth: 'none' },
};

/**
 * Bookmark save (green) / unsave (red) toast — top-right, matches app Toaster styling.
 */
export function showBookmarkNotification({
    role,
    newValue,
    undoAllowed,
    onUndo,
    duration = DEFAULT_DURATION_MS,
    style,
} = {}) {
    const notify = newValue ? toast.success : toast.error;

    return notify(
        (t) => (
            <BookmarkToastMessage
                role={role}
                saved={newValue}
                undoAllowed={undoAllowed}
                onUndo={onUndo}
                onDismiss={() => toast.dismiss(t.id)}
            />
        ),
        {
            ...BASE_OPTS,
            duration,
            ...(style ? { style: { ...BASE_OPTS.style, ...style } } : {}),
        }
    );
}
