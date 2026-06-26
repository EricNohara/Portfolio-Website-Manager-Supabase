"use client";

import { ArrowRight, Camera, Check, FileText, Flame, HeartHandshake, Info, MessageCircleQuestion, Sparkles, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";

import { ButtonFour, ButtonOne } from "@/app/components/Buttons/Buttons";
import PageContentWrapper from "@/app/components/PageContentWrapper/PageContentWrapper";
import { titleFont } from "@/app/localFonts";

import styles from "./AiAgents.module.css";
import PageContentHeader, { IButton } from "../../components/PageContentHeader/PageContentHeader";

const agents = [
    {
        title: "Cover Letter Agent",
        href: "/user/aiAgents/coverLetter",
        description: "Personalized cover letters tailored to any job",
        icon: FileText,
        color: "blue",
        badge: {
            text: "Most Popular",
            icon: Flame,
        },
        features: [
            "Job & company research analysis",
            "Personalized content generation",
            "ATS-friendly formatting",
            "Tone & style customization",
        ],
    },
    {
        title: "Resume Agent",
        href: "/user/aiAgents/resume",
        description: "Professional and ATS-optimized for any job.",
        icon: UserRound,
        color: "purple",
        features: [
            "ATS optimization",
            "Smart experience highlighting",
            "Multiple template options",
            "Skills & keywords optimization",
        ],
    },
    {
        title: "Professional Headshot Agent",
        href: "/user/aiAgents/professionalHeadshot",
        description: "Professional and personalized AI headshots.",
        icon: Camera,
        color: "green",
        features: [
            "Multiple styles & backgrounds",
            "Professional lighting & retouching",
            "High-resolution output",
            "Fast generation",
        ],
    },
];

export default function AiAgentsPage() {
    const router = useRouter();

    const moreAboutButton: IButton = {
        name: "More About the Agents",
        // change this later to have own doc page
        onClick: () => router.push("/documentation/product"),
        icon: Info,
    }

    return (
        <PageContentWrapper>
            <PageContentHeader title="AI Agents" buttonOne={moreAboutButton} />
            <div className={styles.aiAgentsPageContainer}>
                <div className={styles.agentsGrid}>
                    {agents.map((agent) => {
                        const Icon = agent.icon;

                        return (
                            <div key={agent.title} className={`${styles.agentCard} ${styles[agent.color]}`}>
                                <div className={styles.cardTop}>
                                    <div className={styles.iconOrb}>
                                        <Icon size={30} />
                                    </div>

                                    {agent.badge && (
                                        <div className={styles.badge}>
                                            <agent.badge.icon size={16} />
                                            {agent.badge.text}
                                        </div>
                                    )}
                                </div>

                                <h2 className={titleFont.className}>{agent.title}</h2>

                                <p className={styles.description}>{agent.description}</p>

                                <div className={styles.divider} />

                                <ul className={styles.featureList}>
                                    {agent.features.map((feature) => (
                                        <li key={feature}>
                                            <Check size={17} />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <ButtonOne
                                    className={styles.useButton}
                                    onClick={() => router.push(agent.href)}
                                >
                                    <span className={styles.useButtonText}>
                                        <Sparkles size={18} />
                                        Use Agent
                                    </span>

                                    <ArrowRight size={22} className={styles.useButtonArrow} />
                                </ButtonOne>
                            </div>
                        );
                    })}
                </div>

                <div className={styles.comingSoonCard}>
                    <div className={styles.comingSoonIcon}>
                        <MessageCircleQuestion size={28} />
                    </div>

                    <div>
                        <h2>More agents coming soon</h2>
                        <p>We&apos;re constantly building new AI agents to help you advance your career.</p>
                    </div>

                    <ButtonFour className={styles.requestButton}>
                        Make a Request
                        <HeartHandshake size={22} />
                    </ButtonFour>
                </div>
            </div>
        </PageContentWrapper>
    );
}