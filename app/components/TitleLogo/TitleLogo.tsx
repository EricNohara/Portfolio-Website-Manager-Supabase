import Image from "next/image";
import styles from "./TitleLogo.module.css";
import { useRouter } from "next/navigation";

export default function TitleLogo() {
    const router = useRouter();

    const handleClick = () => {
        router.push("/")
    }

    return (
        <div className={styles.container} onClick={handleClick}>
            <Image src="/images/navbar-logo.png" width={50} height={50} alt="Nukleio Logo" />
            <h1>Nukleio</h1>
        </div >
    );
}