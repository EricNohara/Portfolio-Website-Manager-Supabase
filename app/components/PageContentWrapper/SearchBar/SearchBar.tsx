"use client";

import { Search } from "lucide-react";
import { useState } from "react";

import styles from "./SearchBar.module.css";

export default function SearchBar() {
    const [query, setQuery] = useState<string>("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // search logic here
    }

    return (
        <form className={styles.searchBarForm} onSubmit={handleSubmit}>
            <Search />
            <input
                type="text"
                value={query}
                onChange={handleChange}
                placeholder="Search..."
                className={styles.searchBarInput}
            />
        </form>
    );
}