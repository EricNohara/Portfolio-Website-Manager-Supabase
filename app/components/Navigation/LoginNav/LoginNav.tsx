import { headerFont } from "@/app/localFonts";

import styles from "./LoginNav.module.css";
import DocumentationLink from "../../DocumentationLink/DocumentationLink";
import landingStyles from "../LandingNav/LandingNav.module.css";

export default function LoginNav() {
    return (
        <nav className={styles.loginNav}>
            <ul className={`${landingStyles.landingLinks} ${headerFont.className}`}>
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
        </nav>
    );
}