import JobAgentClientLayout from './JobAgentClientLayout';

/*
 * UTS talent platform styles — same load order as resources/views/talent/index.blade.php.
 */
export default function JobAgentLayout({ children }) {
    return (
        <>
            <link href="/css/talent/global.css" rel="stylesheet" />
            <link href="/css/talent/style.css" rel="stylesheet" />
            <link href="/css/talent/custom.css" rel="stylesheet" />
            <JobAgentClientLayout>{children}</JobAgentClientLayout>
        </>
    );
}
