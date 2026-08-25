'use client';

import React, { useLayoutEffect, useRef } from "react";
import { IMAGE_URL } from "../../../components/Constant";
import { HAPPY_TESTIMONIALS_TITLE_UNDERLINE_SRC } from "./happyAgentPageAssets";

const testimonials = [
    {
        testimonialImage: "outreach-interview-01.png",
    },
    {
        testimonialImage: "outreach-interview-1.png",
    },
    {
        testimonialImage: "outreach-interview-2.png",
    },
    {
        testimonialImage: "outreach-interview-3.png",
    },
    {
        testimonialImage: "outreach-interview-4.png",
    },
    {
        testimonialImage: "outreach-interview-5.png",
    },
    {
        testimonialImage: "outreach-interview-6.png",
    },
];

/**
 * Continuous horizontal marquee of interview email/chat screenshots.
 * Loop distance is measured in JS (px) — same Safari-safe approach as the
 * Live Results logo marquee — rather than `translateX(-50%)`.
 * Motion pauses only while the user hovers the track.
 */
export default function TestimonialsSlider({ variant = "default" }) {
    const heroSingle = variant === "heroSingle";
    const trackRef = useRef(null);

    // Duplicate the list so the CSS loop has no seam.
    const loopItems = [...testimonials, ...testimonials];
    const halfLen = testimonials.length;

    useLayoutEffect(() => {
        const track = trackRef.current;
        if (!track || halfLen <= 0) return undefined;

        const measure = () => {
            const children = track.children;
            const first = children[0];
            const firstOfDuplicateHalf = children[halfLen];
            if (!first || !firstOfDuplicateHalf) return;
            const shift =
                firstOfDuplicateHalf.getBoundingClientRect().left -
                first.getBoundingClientRect().left;
            if (shift > 0) {
                track.style.setProperty("--testimonials-marquee-shift", `${shift}px`);
            }
        };

        measure();
        const images = track.querySelectorAll("img");
        images.forEach((img) => {
            if (!img.complete) {
                img.addEventListener("load", measure);
                img.addEventListener("error", measure);
            }
        });

        const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
        if (ro) ro.observe(track);
        window.addEventListener("resize", measure);

        return () => {
            images.forEach((img) => {
                img.removeEventListener("load", measure);
                img.removeEventListener("error", measure);
            });
            if (ro) ro.disconnect();
            window.removeEventListener("resize", measure);
        };
    }, [halfLen]);

    return (
        <div
            className={`testimonials-slider${heroSingle ? " testimonials-slider--hero-single" : ""}`}
        >
            {heroSingle ? (
                <div className="section-header" style={{ marginBottom: "0.75rem" }}>
                    <h6>Candidates got interviews scheduled with Happpy Agent</h6>
                </div>
            ) : (
                <div className="section-header testimonials-slider__header">
                    <h2 className="testimonials-slider__title">
                        See which candidates got interviews{" "}
                        <span className="testimonials-slider__title-word">
                            scheduled
                            <img
                                className="testimonials-slider__title-underline"
                                src={HAPPY_TESTIMONIALS_TITLE_UNDERLINE_SRC}
                                alt=""
                                aria-hidden="true"
                            />
                        </span>
                    </h2>
                </div>
            )}

            <div
                className="testimonials-slider__marquee"
                aria-label="Interview email and chat screenshots from candidates"
            >
                <div className="testimonials-slider__marquee-track" ref={trackRef}>
                    {loopItems.map((item, idx) => {
                        const isDuplicate = idx >= halfLen;
                        return (
                            <div
                                className="tc-wrapper"
                                key={`${item.testimonialImage}-${idx}`}
                                aria-hidden={isDuplicate || undefined}
                            >
                                <div className="testimonial-card">
                                    {(item.companyLogo || item.message) && (
                                        <div className="companyDiv">
                                            {item.companyLogo && (
                                                <img
                                                    className={`companyLogo-${idx % halfLen}`}
                                                    src={`${IMAGE_URL}/${item.companyLogo}`}
                                                    alt=""
                                                />
                                            )}
                                            {item.message && <p>{item.message}</p>}
                                        </div>
                                    )}
                                    <div className="imgDiv">
                                        <img
                                            src={`${IMAGE_URL}${item.testimonialImage}`}
                                            alt={
                                                isDuplicate
                                                    ? ""
                                                    : "Candidate interview email or chat screenshot"
                                            }
                                            loading="lazy"
                                            draggable={false}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
