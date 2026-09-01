/*
 * UTS talent platform styles — same load order as resources/views/talent/index.blade.php.
 * Includes resume modal (work.css + custom.css) and editor (resume-template.css + resume-editor.css).
 */
export default function TalentLayout({ children }) {
    return (
        <>
            <link href="/css/talent/global.css" rel="stylesheet" />
            <link href="/css/talent/style.css" rel="stylesheet" />
            <link href="/css/talent/custom.css" rel="stylesheet" />
            <link href="/css/talent/beforeAfter.css" rel="stylesheet" />
            <link href="/css/talent/profile.css" rel="stylesheet" />
            <link href="/css/talent/work.css" rel="stylesheet" />
            <link href="/css/editor-styles.css" rel="stylesheet" />
            <link href="/css/talent/resume-template.css" rel="stylesheet" />
            <link href="/css/talent/resume-editor.css" rel="stylesheet" />
            {children}
        </>
    );
}
