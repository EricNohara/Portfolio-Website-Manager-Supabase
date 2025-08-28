import styles from "./LoginNav.module.css";
import landingStyles from "../LandingNav/LandingNav.module.css";

export default function LoginNav() {
    return (
        <nav className={styles.loginNav}>
            <div></div>
            <ul className={landingStyles.landingLinks}>
                <li><a href="">Product</a></li>
                <li><a href="">Docs</a></li>
                <li><a href="">Pricing</a></li>
                <li><a href="">Contact</a></li>
            </ul>
        </nav>
    );
}