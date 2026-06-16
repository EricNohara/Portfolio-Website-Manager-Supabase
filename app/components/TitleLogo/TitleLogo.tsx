import Image from "next/image";
import { useRouter } from "next/navigation";

import { useAuth } from "@/app/context/AuthProvider";
import { titleFont } from "@/app/localFonts";

import styles from "./TitleLogo.module.css";

type TitleLogoProps = {
    collapsed?: boolean
}

export default function TitleLogo({ collapsed = false }: TitleLogoProps) {
    const router = useRouter();
    const { isLoggedIn } = useAuth();

    const handleClick = () => {
        if (!isLoggedIn) router.push("/");
        else router.push("/user");
    };

    return (
        <div className={`${styles.container} ${titleFont.className}`} onClick={handleClick}>
            <Image src="/images/navbar-logo.png" width={50} height={50} alt="Nukleio Logo" />
            {!collapsed && <h1>Nukleio</h1>}
        </div >
    );
}