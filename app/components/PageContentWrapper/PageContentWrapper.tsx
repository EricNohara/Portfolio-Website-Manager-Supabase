import { ReactNode } from "react"

import styles from "./PageContentWrapper.module.css";
import Navigation from "../Navigation/Navigation";
import SearchBar from "./SearchBar/SearchBar";
import UserDropdown from "./UserDropdown/UserDropdown";

interface IPageContentWrapperProps {
    children: ReactNode;
}

export default function PageContentWrapper({ children }: IPageContentWrapperProps) {
    return (
        <div className={styles.pageContainer} >
            <Navigation />
            <div className={styles.pageContentContainer}>
                <div className={styles.pageContentHeader}>
                    <SearchBar />
                    <UserDropdown />
                </div>
                <div className={styles.content}>
                    {children}
                </div>
            </div>
        </div>
    );
}