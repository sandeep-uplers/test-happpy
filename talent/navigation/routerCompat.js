'use client';

import NextLink from 'next/link';
import { useCallback } from 'react';
import {
    usePathname,
    useRouter,
    useSearchParams as useNextSearchParams,
} from 'next/navigation';

function normalizePath(path) {
    return (path || '/').replace(/\/+$/, '') || '/';
}

export function Link({ to, href, children, ...props }) {
    return (
        <NextLink href={href ?? to ?? '#'} {...props}>
            {children}
        </NextLink>
    );
}

export function NavLink({ to, end = false, className, children, ...props }) {
    const pathname = usePathname() || '/';
    const normalizedPath = normalizePath(pathname);
    const normalizedHref = normalizePath(to);
    const isActive = end
        ? normalizedPath === normalizedHref
        : normalizedPath === normalizedHref || normalizedPath.startsWith(`${normalizedHref}/`);
    const resolvedClass =
        typeof className === 'function' ? className({ isActive }) : className;

    return (
        <NextLink href={to} className={resolvedClass} aria-current={isActive ? 'page' : undefined} {...props}>
            {children}
        </NextLink>
    );
}

export function useNavigate() {
    const router = useRouter();
    return useCallback(
        (to, options = {}) => {
            if (typeof to === 'number') {
                if (to < 0) router.back();
                else router.forward?.();
                return;
            }
            if (options.replace) router.replace(to);
            else router.push(to);
        },
        [router],
    );
}

export function useLocation() {
    const pathname = usePathname() || '/';
    const searchParams = useNextSearchParams();
    const search = searchParams?.toString() ? `?${searchParams.toString()}` : '';
    return { pathname, search, hash: '' };
}

export function useSearchParams() {
    const searchParams = useNextSearchParams();
    const router = useRouter();
    const pathname = usePathname() || '/';

    const setSearchParams = useCallback(
        (nextInit, options = {}) => {
            const next =
                typeof nextInit === 'function'
                    ? nextInit(new URLSearchParams(searchParams?.toString() ?? ''))
                    : nextInit;
            const query = next?.toString?.() ?? '';
            const url = query ? `${pathname}?${query}` : pathname;
            if (options.replace) router.replace(url);
            else router.push(url);
        },
        [pathname, router, searchParams],
    );

    return [searchParams ?? new URLSearchParams(), setSearchParams];
}
