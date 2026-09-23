'use client';

import React from "react";

import "./JobsBoard.css";

/** Chunk-load placeholder — mirrors JobsBoard layout so the landing section does not jump. */
export default function JobsBoardSkeleton() {
    return (
        <div className="jobs-board jobs-board--skeleton" aria-busy="true" aria-label="Loading jobs board">
            <header className="jobs-board__header">
                <div className="jobs-board__skeleton-bar jobs-board__skeleton-bar--title" />
                <div className="jobs-board__skeleton-bar jobs-board__skeleton-bar--subtitle" />
            </header>

            <div className="jobs-board__filters-toggle jobs-board__skeleton-toggle" aria-hidden />

            <div className="jobs-board__filters">
                {Array.from({ length: 5 }).map((_, index) => (
                    <div className="jobs-board__filter" key={`filter-skeleton-${index}`}>
                        <div className="jobs-board__skeleton-bar jobs-board__skeleton-bar--label" />
                        <div className="jobs-board__skeleton-bar jobs-board__skeleton-bar--control" />
                    </div>
                ))}
            </div>

            <div className="jobs-board__skeleton-bar jobs-board__skeleton-bar--count" />

            <div className="jobs-board__grid">
                {Array.from({ length: 6 }).map((_, index) => (
                    <div className="jobs-board__card jobs-board__card--skeleton" key={`card-skeleton-${index}`} />
                ))}
            </div>
        </div>
    );
}
