'use client';

import { isSingleJobPath } from './jobPath';

export default function getTitleFromLocation(pathname) {
    if (pathname.includes('/talent/all-opportunities')) {
        if (isSingleJobPath(pathname)) {
            return 'Opportunity';
        }
        return 'All Jobs';
    }
    if (pathname.includes('/talent/job/')) {
        return 'Opportunity';
    }
    if (pathname.includes('/talent/password/')) {
        return 'Set Password'
    }

    if (pathname.includes('/talent/acceptence/')) {
        return 'Acceptance'
    }

    if (pathname.includes('/talent/opportunities/')) {
        return 'Public Opportunity page'
    }

    switch (pathname) {
        case '/login':
            return 'Login';

        case '/talent/joinus':
            return 'Join Us';

        case '/talent/verify':
            return 'OTP Verification';

        case '/talent/reactivate-account':
            return 'Reactivate Account';

        case '/talent':
            return 'Home';

        case '/talent/profile':
            return 'Profile';

        case '/talent/assessments':
            return 'Assessments';

        case '/talent/my-opportunities':
            return 'Applied Jobs';

        case '/talent/inhouse-positions':
            return 'In-house Jobs';

        case '/talent/my-interviews':
            return 'My Interviews';

        case '/talent/interview-feedbacks':
            return 'Interview Feedbacks';

        case '/talent/legal':
            return 'Legal';

        case '/talent/manage-account':
            return 'Manage Account';

        case '/talent/get-a-help':
            return 'Get A Help';

        case '/talent/preview':
            return 'Profile Preview';

        default:
            return null;
    }
}