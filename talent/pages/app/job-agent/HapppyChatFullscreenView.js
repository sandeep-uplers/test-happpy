'use client';

import React, { useMemo, useState } from 'react';
import { Link } from '@/talent/navigation/routerCompat';
import { HapppyAgentIcon } from '../../../components/common/HapppyAgentLogo';
import './HapppyChatFullscreenView.css';

const TypingDots = () => (
    <span className="happpy-chatbot__typing" aria-hidden>
        <span />
        <span />
        <span />
    </span>
);

const MatIcon = ({ name, className = '', ...rest }) => (
    <span className={`material-symbols-outlined ${className}`.trim()} aria-hidden {...rest}>
        {name}
    </span>
);

function sessionTitle(session) {
    const title = String(session?.title || '').trim();
    return title || 'New chat';
}

function userInitials(name) {
    const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return 'U';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
}

const HapppyChatFullscreenView = ({
    firstName,
    user,
    sessions,
    activeSessionId,
    messages,
    busy,
    chatLoading,
    draft,
    setDraft,
    pendingTool,
    showLongChatHint,
    longChatHintThreshold,
    threadRef,
    inputRef,
    onSend,
    onNewChat,
    onLoadSession,
    onDeleteSession,
    onExport,
    onClose,
    onOpenPasteJob,
    onStartNewFromHint,
    renderAssistant,
}) => {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const hasUserTurn = useMemo(
        () => messages.some((msg) => msg.role === 'user'),
        [messages],
    );
    const isLanding = !hasUserTurn && !busy && !chatLoading;

    const activeSession = useMemo(
        () => sessions.find((item) => item.id === activeSessionId) || null,
        [sessions, activeSessionId],
    );

    const mainTitle = activeSession ? sessionTitle(activeSession) : 'HAPPPY Chat';

    const closeMobileSidebar = () => setMobileSidebarOpen(false);

    const sidebar = (
        <aside
            className={`hc-fs-sidebar${sidebarCollapsed ? ' hc-fs-sidebar--collapsed' : ''}${
                mobileSidebarOpen ? ' hc-fs-sidebar--mobile-open' : ''
            }`}
            aria-label="Chat history"
        >
            <div className="hc-fs-sidebar__head">
                <div className="hc-fs-sidebar__brand">
                    <HapppyAgentIcon className="hc-fs-sidebar__mark" />
                    {!sidebarCollapsed ? <span className="hc-fs-sidebar__brand-text">HAPPPY Chat</span> : null}
                </div>
                <button
                    type="button"
                    className="hc-fs-sidebar__icon-btn hc-fs-sidebar__icon-btn--desktop"
                    onClick={() => setSidebarCollapsed((value) => !value)}
                    aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    <MatIcon name={sidebarCollapsed ? 'chevron_right' : 'chevron_left'} />
                </button>
                <button
                    type="button"
                    className="hc-fs-sidebar__icon-btn hc-fs-sidebar__icon-btn--mobile"
                    onClick={closeMobileSidebar}
                    aria-label="Close sidebar"
                >
                    <MatIcon name="close" />
                </button>
            </div>

            <button
                type="button"
                className="hc-fs-sidebar__new-chat"
                onClick={() => {
                    onNewChat();
                    closeMobileSidebar();
                }}
                disabled={busy}
            >
                <MatIcon name="edit_square" />
                {!sidebarCollapsed ? <span>New chat</span> : null}
            </button>

            {!sidebarCollapsed ? (
                <div className="hc-fs-sidebar__section-label">Recent</div>
            ) : null}

            <div className="hc-fs-sidebar__sessions">
                {sessions.length ? (
                    sessions.map((session) => {
                        const active = session.id === activeSessionId;
                        return (
                            <div
                                key={session.id}
                                className={`hc-fs-sidebar__session${active ? ' is-active' : ''}`}
                            >
                                <button
                                    type="button"
                                    className="hc-fs-sidebar__session-btn"
                                    title={sessionTitle(session)}
                                    onClick={() => {
                                        onLoadSession(session.id);
                                        closeMobileSidebar();
                                    }}
                                >
                                    {!sidebarCollapsed ? (
                                        <span className="hc-fs-sidebar__session-title">
                                            {sessionTitle(session)}
                                        </span>
                                    ) : (
                                        <MatIcon name="chat_bubble_outline" />
                                    )}
                                </button>
                                {!sidebarCollapsed ? (
                                    <button
                                        type="button"
                                        className="hc-fs-sidebar__session-delete"
                                        aria-label={`Delete ${sessionTitle(session)}`}
                                        onClick={() => onDeleteSession(session.id)}
                                    >
                                        <MatIcon name="delete" />
                                    </button>
                                ) : null}
                            </div>
                        );
                    })
                ) : (
                    !sidebarCollapsed ? (
                        <p className="hc-fs-sidebar__empty">No saved chats yet.</p>
                    ) : null
                )}
            </div>

            <div className="hc-fs-sidebar__foot">
                <Link to="/talent/job-agent/update-profile" className="hc-fs-sidebar__profile">
                    <span className="hc-fs-sidebar__avatar" aria-hidden>
                        {userInitials(user?.name)}
                    </span>
                    {!sidebarCollapsed ? (
                        <span className="hc-fs-sidebar__profile-copy">
                            <strong>{user?.name?.trim() || 'Talent'}</strong>
                            <small>{user?.email || 'Happpy Agent'}</small>
                        </span>
                    ) : null}
                </Link>
                {!sidebarCollapsed ? (
                    <Link to="/talent/job-agent" className="hc-fs-sidebar__back-agent">
                        Back to Happpy Agent
                    </Link>
                ) : null}
            </div>
        </aside>
    );

    return (
        <div className="hc-fs">
            {mobileSidebarOpen ? (
                <button
                    type="button"
                    className="hc-fs-sidebar-backdrop"
                    aria-label="Close sidebar"
                    onClick={closeMobileSidebar}
                />
            ) : null}
            {sidebar}

            <div className="hc-fs-main">
                <header className="hc-fs-topbar">
                    <div className="hc-fs-topbar__left">
                        <button
                            type="button"
                            className="hc-fs-topbar__menu"
                            aria-label="Open chat history"
                            onClick={() => setMobileSidebarOpen(true)}
                        >
                            <MatIcon name="menu" />
                        </button>
                        <h1 className="hc-fs-topbar__title">{mainTitle}</h1>
                    </div>
                    <div className="hc-fs-topbar__actions">
                        <button
                            type="button"
                            className="hc-fs-topbar__action"
                            onClick={onExport}
                            aria-label="Export chat"
                            title="Export chat"
                        >
                            <MatIcon name="ios_share" />
                        </button>
                        <button
                            type="button"
                            className="hc-fs-topbar__action"
                            onClick={onClose}
                            aria-label="Back to Happpy Agent"
                            title="Back to dashboard"
                        >
                            <MatIcon name="arrow_back" />
                        </button>
                    </div>
                </header>

                <div
                    className={`hc-fs-thread-wrap${isLanding ? ' hc-fs-thread-wrap--landing' : ''}`}
                    ref={threadRef}
                >
                    {isLanding ? (
                        <div className="hc-fs-landing">
                            <h2 className="hc-fs-landing__title">
                                {firstName ? `Hi ${firstName}, where should we begin?` : 'Where should we begin?'}
                            </h2>
                            <p className="hc-fs-landing__subtitle">
                                Ask about jobs, outreach, follow-ups, or paste a job link to run the agent.
                            </p>
                        </div>
                    ) : (
                        <div className="hc-fs-thread">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`hc-fs-msg hc-fs-msg--${msg.role}`}
                                >
                                    {msg.role === 'assistant' ? (
                                        <>
                                            <HapppyAgentIcon className="hc-fs-msg__avatar hc-fs-msg__avatar--happpy" />
                                            <div className="hc-fs-msg__body">
                                                {renderAssistant(msg)}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="hc-fs-msg__body">
                                                <div className="hc-fs-bubble hc-fs-bubble--user">{msg.text}</div>
                                            </div>
                                            <span className="hc-fs-msg__avatar hc-fs-msg__avatar--user" aria-hidden>
                                                <MatIcon name="person" />
                                            </span>
                                        </>
                                    )}
                                </div>
                            ))}
                            {busy || chatLoading ? (
                                <div className="hc-fs-msg hc-fs-msg--assistant">
                                    <HapppyAgentIcon className="hc-fs-msg__avatar hc-fs-msg__avatar--happpy" />
                                    <div className="hc-fs-msg__body">
                                        <div className="hc-fs-bubble hc-fs-bubble--assistant">
                                            <TypingDots />
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>

                <div className="hc-fs-composer-stack">
                    {showLongChatHint ? (
                        <div className="hc-fs-hint" role="status">
                            <MatIcon name="tips_and_updates" />
                            <p>
                                {longChatHintThreshold}+ messages — start a new chat for better replies.
                            </p>
                            <button
                                type="button"
                                className="hc-fs-hint__btn"
                                onClick={onStartNewFromHint}
                                disabled={busy}
                            >
                                New chat
                            </button>
                        </div>
                    ) : null}

                    <form
                        className="hc-fs-composer"
                        onSubmit={onSend}
                    >
                        <button
                            type="button"
                            className="hc-fs-composer__attach"
                            onClick={onOpenPasteJob}
                            aria-label="Paste a job link"
                            title="Paste a job link"
                        >
                            <MatIcon name="add" />
                        </button>
                        <div className="hc-fs-composer__input-wrap">
                            <textarea
                                ref={inputRef}
                                className="hc-fs-composer__input"
                                rows={1}
                                placeholder={
                                    pendingTool === 'run_job_with_link'
                                        ? 'Paste the job URL…'
                                        : 'Ask anything'
                                }
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        onSend(e);
                                    }
                                }}
                            />
                        </div>
                        <button
                            type="submit"
                            className="hc-fs-composer__send"
                            disabled={busy || !draft.trim()}
                            aria-label="Send message"
                        >
                            <MatIcon name="arrow_upward" />
                        </button>
                    </form>
                    <p className="hc-fs-composer__disclaimer">
                        HAPPPY can make mistakes. Double-check important details.
                    </p>
                </div>
            </div>

        </div>
    );
};

export default HapppyChatFullscreenView;
