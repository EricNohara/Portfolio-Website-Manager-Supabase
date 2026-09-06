"use client";

import { useRouter } from "next/navigation";

import { headerFont } from "@/app/localFonts";

import styles from "./LandingNav.module.css";
import { ButtonOne, ButtonTwo } from "../../Buttons/Buttons";
import DocumentationLink from "../../DocumentationLink/DocumentationLink";
import TitleLogo from "../../TitleLogo/TitleLogo";

export default function LandingNav() {
    const router = useRouter();

    return (
        <nav className={styles.horizontalNav}>
            <TitleLogo />

            <ul className={styles.landingLinks}>
                <li className={headerFont.className}>
                    <DocumentationLink page="product">
                        Product
                    </DocumentationLink>
                </li>

                <li className={headerFont.className}>
                    <DocumentationLink page="pricing">
                        Pricing
                    </DocumentationLink>
                </li>

                <li className={headerFont.className}>
                    <DocumentationLink page="docs">
                        Docs
                    </DocumentationLink>
                </li>

                <li className={headerFont.className}>
                    <DocumentationLink page="contact">
                        Contact
                    </DocumentationLink>
                </li>
            </ul>

            <div className={styles.buttonsContainer}>
                <ButtonTwo
                    onClick={() => router.push("/user/login")}
                >
                    Sign in
                </ButtonTwo>

                <ButtonOne
                    onClick={() => router.push("/user/signup")}
                >
                    Sign up
                </ButtonOne>
            </div>
        </nav>
    );
}