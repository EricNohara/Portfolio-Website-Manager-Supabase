"use client";

import {
    Sparkles,
    PenLine,
    Filter,
    FileCheck,
    Quote,
    Clock,
    Briefcase,
    FileText,
    Pencil,
    TypeOutline,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import styles from "./CoverLetterLoadingPanel.module.css";

type LoadingType = "generation" | "revision";

interface CoverLetterLoadingPanelProps {
    type: LoadingType;
    feedback?: string;
    companyName?: string;
    jobTitle?: string;
}

const content = {
    generation: {
        title: "Creating your cover letter...",
        subtitle: "Building a tailored first draft and preparing a fresh PDF preview.",
        time: "This usually takes 30-90 seconds.",
        detailTitle: "Generation Details",
        quoteTitle: "Job context",
        quoteIcon: Briefcase,
        quoteFallback:
            "Using your profile, resume data, and job description to generate a tailored draft.",
        steps: [
            {
                title: "Reading job details",
                description: "Understanding the role, company, and requirements.",
                icon: Sparkles,
            },
            {
                title: "Matching your profile",
                description: "Finding the strongest skills, projects, and experience.",
                icon: Filter,
            },
            {
                title: "Writing first draft",
                description: "Creating a polished, role-specific cover letter.",
                icon: PenLine,
            },
            {
                title: "Preparing PDF",
                description: "Finalizing the layout and generating your preview.",
                icon: FileCheck,
            },
        ],
    },
    revision: {
        title: "Revising your cover letter...",
        subtitle: "Applying your feedback and preparing a fresh PDF preview.",
        time: "This usually takes 20-60 seconds.",
        detailTitle: "Revision Details",
        quoteTitle: "Your feedback",
        quoteIcon: Quote,
        quoteFallback: "Using your revision instructions to improve the current draft.",
        steps: [
            {
                title: "Analyzing feedback",
                description: "Understanding your goals and preferences.",
                icon: Sparkles,
            },
            {
                title: "Rewriting content",
                description: "Crafting a stronger, clearer narrative.",
                icon: PenLine,
            },
            {
                title: "Optimizing tone & flow",
                description: "Ensuring a professional and engaging tone.",
                icon: Filter,
            },
            {
                title: "Preparing PDF",
                description: "Finalizing the layout and generating your preview.",
                icon: FileCheck,
            },
        ],
    },
};

export default function CoverLetterLoadingPanel({
    type,
    feedback,
    companyName,
    jobTitle
}: CoverLetterLoadingPanelProps) {
    const data = content[type];
    const QuoteIcon = data.quoteIcon;

    const [activeStep, setActiveStep] = useState(0);
    const [isDarkTheme, setIsDarkTheme] = useState(false);

    useEffect(() => {
        const updateTheme = () => {
            setIsDarkTheme(document.documentElement.classList.contains("dark-theme"));
        };

        updateTheme();

        const observer = new MutationObserver(updateTheme);

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        return () => observer.disconnect();
    }, []);

    const documentImageSrc = isDarkTheme
        ? "/images/neon-document-dark.png"
        : "/images/neon-document-light.png";

    useEffect(() => {
        setActiveStep(0);

        const baseDuration = type === "generation" ? 18000 : 12000;
        const randomOffset = Math.floor(Math.random() * 6000);
        const totalDuration = baseDuration + randomOffset;

        const stepCount = data.steps.length;
        const stepDurations = data.steps.map((_, index) => {
            const base = totalDuration / stepCount;
            const random = 0.75 + Math.random() * 0.5;
            return index === stepCount - 1 ? base * 1.25 : base * random;
        });

        let elapsed = 0;
        const timers: number[] = [];

        stepDurations.forEach((duration, index) => {
            elapsed += duration;

            if (index < stepCount - 1) {
                timers.push(
                    window.setTimeout(() => {
                        setActiveStep(index + 1);
                    }, elapsed)
                );
            }
        });

        return () => {
            timers.forEach(window.clearTimeout);
        };
    }, [type, data.steps]);

    const quoteText =
        type === "generation"
            ? jobTitle && companyName
                ? `Using your profile, resume data, and job description to generate a tailored cover letter for the ${jobTitle} role at ${companyName}.`
                : jobTitle
                    ? `Using your profile, resume data, and job description to generate a tailored cover letter for the ${jobTitle} position.`
                    : companyName
                        ? `Using your profile, resume data, and job description to generate a tailored cover letter for opportunities at ${companyName}.`
                        : data.quoteFallback
            : feedback?.trim() || data.quoteFallback;

    return (
        <div className={styles.loadingLayout}>
            <section className={styles.previewPanel}>
                <div className={styles.previewInner}>
                    <div className={styles.documentArt}>
                        <div className={`${styles.orbit} ${styles.orbitOne}`} />
                        <div className={`${styles.orbit} ${styles.orbitTwo}`} />
                        <div className={styles.documentBase} />

                        <Image
                            src={documentImageSrc}
                            alt="Cover Letter"
                            width={315}
                            height={315}
                            className={styles.documentImage}
                            priority
                        />

                        <div className={`${styles.floatIcon} ${styles.floatIconOne}`}>
                            <Sparkles size={22} />
                        </div>

                        <div className={`${styles.floatIcon} ${styles.floatIconTwo}`}>
                            <Pencil size={22} />
                        </div>

                        <div className={`${styles.floatIcon} ${styles.floatIconThree}`}>
                            <FileText size={22} />
                        </div>

                        <div className={`${styles.floatIcon} ${styles.floatIconFour}`}>
                            <TypeOutline size={22} />
                        </div>
                    </div>

                    <h2>{data.title}</h2>
                    <p>{data.subtitle}</p>

                    <div className={styles.loadingBar}>
                        <div className={styles.loadingSegment} />
                    </div>

                    <div className={styles.timeHint}>
                        <Clock size={16} />
                        <span>{data.time}</span>
                    </div>
                </div>
            </section >

            <aside className={styles.detailsPanel}>
                <div className={styles.stepsContainer}>
                    <h3 className={styles.detailTitle}>{data.detailTitle}</h3>

                    <div className={styles.feedbackCard}>
                        <div className={styles.feedbackCardTitleContainer}>
                            <div className={styles.cardIcon}>
                                <QuoteIcon size={18} />
                            </div>
                            <h4>{data.quoteTitle}</h4>
                        </div>

                        <p>{quoteText}</p>
                    </div>
                </div>

                <div className={styles.stepsContainer}>
                    <h3 className={styles.detailTitle}>What we&apos;re doing</h3>

                    <div className={styles.stepsList}>
                        {data.steps.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = index === activeStep;
                            const isDone = index < activeStep;

                            return (
                                <div
                                    className={`${styles.stepItem} ${isActive ? styles.activeStepItem : ""
                                        }`}
                                    key={step.title}
                                >
                                    <div className={styles.timelineColumn}>
                                        {index < data.steps.length - 1 && (
                                            <div
                                                className={`${styles.timelineLine} ${index === activeStep - 1
                                                    ? styles.activeTimelineLine
                                                    : index < activeStep - 1
                                                        ? styles.doneTimelineLine
                                                        : styles.pendingTimelineLine
                                                    }`}
                                            />
                                        )}

                                        <div
                                            className={
                                                isActive
                                                    ? styles.activeStepIcon
                                                    : isDone
                                                        ? styles.doneStepIcon
                                                        : styles.stepIcon
                                            }
                                        >
                                            <Icon size={18} />
                                        </div>
                                    </div>

                                    <div className={styles.stepText}>
                                        <h5>{step.title}</h5>
                                        <p>{step.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </aside>
        </div >
    );
}