"use client";

import {
  Bot,
  GraduationCap,
  Home,
  KeyRound,
  Search,
  Settings,
  UserRound,
  X,
  LucideIcon,
  File,
  Briefcase,
  LibraryBig,
  Rocket,
  Brain,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useMemo } from "react";

import { useUser } from "@/app/context/UserProvider";

import styles from "./SearchBar.module.css";

type SuggestionKind =
  | "home"
  | "user"
  | "document"
  | "experience"
  | "education"
  | "course"
  | "project"
  | "skill"
  | "apiKey"
  | "settings"
  | "agent";

interface ISuggestion {
  label: string;
  path: string;
  kind: SuggestionKind;
}

interface ISearchBarProps {
  onFocusChange?: (active: boolean) => void;
}

const SUGGESTION_META: Record<
  SuggestionKind,
  {
    icon: LucideIcon;
    label: string;
  }
> = {
  home: {
    icon: Home,
    label: "Page",
  },
  user: {
    icon: UserRound,
    label: "User",
  },
  document: {
    icon: File,
    label: "Document",
  },
  experience: {
    icon: Briefcase,
    label: "Experience",
  },
  education: {
    icon: GraduationCap,
    label: "Education",
  },
  course: {
    icon: LibraryBig,
    label: "Course",
  },
  project: {
    icon: Rocket,
    label: "Project",
  },
  skill: {
    icon: Brain,
    label: "Skill",
  },
  apiKey: {
    icon: KeyRound,
    label: "API key",
  },
  settings: {
    icon: Settings,
    label: "Settings",
  },
  agent: {
    icon: Bot,
    label: "AI agent",
  },
};

const DEFAULT_SUGGESTIONS: ISuggestion[] = [
  {
    label: "Home Page",
    path: "/user",
    kind: "home",
  },
  {
    label: "User Info Page",
    path: "/user/userInfo",
    kind: "user",
  },
  {
    label: "Documents Page",
    path: "/user/documents",
    kind: "document",
  },
  {
    label: "Profile Picture",
    path: "/user/documents",
    kind: "document",
  },
  {
    label: "Resume",
    path: "/user/documents",
    kind: "document",
  },
  {
    label: "Transcript",
    path: "/user/documents",
    kind: "document",
  },
  {
    label: "Experience Page",
    path: "/user/experience",
    kind: "experience",
  },
  {
    label: "Education Page",
    path: "/user/education",
    kind: "education",
  },
  {
    label: "Projects Page",
    path: "/user/projects",
    kind: "project",
  },
  {
    label: "Skills Page",
    path: "/user/skills",
    kind: "skill",
  },
  {
    label: "API Keys Page",
    path: "/user/connect",
    kind: "apiKey",
  },
  {
    label: "User Settings Page",
    path: "/user/settings/user",
    kind: "settings",
  },
  {
    label: "App Settings Page",
    path: "/user/settings/app",
    kind: "settings",
  },
  {
    label: "Password Settings Page",
    path: "/user/settings/password",
    kind: "settings",
  },
  {
    label: "Billing Settings Page",
    path: "/user/settings/billing",
    kind: "settings",
  },
  {
    label: "AI Credits Settings Page",
    path: "/user/settings/aiCredits",
    kind: "settings",
  },
  {
    label: "AI Agents Page",
    path: "/user/aiAgents",
    kind: "agent",
  },
  {
    label: "Cover Letter Agent Page",
    path: "/user/aiAgents/coverLetter",
    kind: "agent",
  },
  {
    label: "Resume Agent Page",
    path: "/user/aiAgents/resume",
    kind: "agent",
  },
  {
    label: "Headshot Agent Page",
    path: "/user/aiAgents/headshot",
    kind: "agent",
  },
];

export default function SearchBar({ onFocusChange }: ISearchBarProps) {
  const [query, setQuery] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);
  const { state } = useUser();
  const router = useRouter();

  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
  const keyHoldRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // combine static + dynamic suggestions using useMemo
  const suggestions = useMemo(() => {
    const dynamicSuggestions: ISuggestion[] = [];

    const experiences = state?.experiences ?? [];
    const education = state?.education ?? [];
    const projects = state?.projects ?? [];
    const skills = state?.skills ?? [];
    const apiKeys = state?.api_keys ?? [];

    experiences.forEach((experience, index) => {
      dynamicSuggestions.push({
        label: experience.company,
        kind: "experience",
        path: `/user/experience?index=${index}`,
      });
    });

    education.forEach((educationItem, index) => {
      dynamicSuggestions.push({
        label: educationItem.institution,
        kind: "education",
        path: `/user/education?index=${index}`,
      });

      (educationItem.courses ?? []).forEach((course, courseIndex) => {
        dynamicSuggestions.push({
          label: course.name,
          kind: "course",
          path: `/user/education/${educationItem.id}/course?index=${courseIndex}`,
        });
      });
    });

    projects.forEach((project, index) => {
      dynamicSuggestions.push({
        label: project.name,
        kind: "project",
        path: `/user/projects?index=${index}`,
      });
    });

    skills.forEach((skill, index) => {
      dynamicSuggestions.push({
        label: skill.name,
        kind: "skill",
        path: `/user/skills?index=${index}`,
      });
    });

    apiKeys.forEach((key, index) => {
      dynamicSuggestions.push({
        label: key.description,
        kind: "apiKey",
        path: `/user/connect?index=${index}`,
      });
    });

    const all = [...DEFAULT_SUGGESTIONS, ...dynamicSuggestions];
    const seen = new Set<string>();
    return all.filter((s) => {
      const k = `${s.kind}:${s.label}`.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }, [state]);

  const filtered = suggestions.filter((item) => {
    const normalizedQuery = query.trim().toLowerCase();
    const category = SUGGESTION_META[item.kind].label;

    return [item.label, category].some((value) =>
      value?.toLowerCase().includes(normalizedQuery)
    );
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setActiveIndex(-1);
    setShowDropdown(value.length > 0);
  };

  const handleSelect = (path: string) => {
    setQuery("");
    setShowDropdown(false);
    setActiveIndex(-1);
    router.push(path);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.length == 0) {
      inputRef.current?.blur();
      return;
    }

    if (filtered.length > 0) {
      const target = activeIndex >= 0 ? filtered[activeIndex] : filtered[0];
      handleSelect(target.path);
    } else {
      setShowDropdown(false);
    }
  };

  // helper
  const moveActiveIndex = (key: string) => {
    setActiveIndex((prev) => {
      if (key === "ArrowDown") {
        return (prev + 1) % filtered.length;
      } else {
        return prev <= 0 ? filtered.length - 1 : prev - 1;
      }
    });
  };

  const closeSearch = () => {
    setQuery("");
    setShowDropdown(false);
    setIsSearchActive(false);
    setActiveIndex(-1);
    inputRef.current?.blur();
    onFocusChange?.(false);
  };

  // handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      closeSearch();
      return;
    }

    if (!showDropdown || filtered.length === 0) return;

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();

      if (!keyHoldRef.current) {
        moveActiveIndex(e.key);

        keyHoldRef.current = setInterval(() => {
          moveActiveIndex(e.key);
        }, 150);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();

      const target =
        activeIndex >= 0 && activeIndex < filtered.length
          ? filtered[activeIndex]
          : filtered[0];

      if (target) {
        handleSelect(target.path);
      }
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (keyHoldRef.current) {
        clearInterval(keyHoldRef.current);
        keyHoldRef.current = null;
      }
    }
  };

  // close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // scroll to active item if needed
  useEffect(() => {
    if (activeIndex >= 0 && itemRefs.current[activeIndex]) {
      itemRefs.current[activeIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [activeIndex]);

  const handleFocus = () => {
    setIsSearchActive(true);
    onFocusChange?.(true);
  };

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    const wrapper = event.currentTarget;

    // Delay allows dropdown item clicks to complete first.
    setTimeout(() => {
      if (!wrapper.contains(document.activeElement)) {
        setIsSearchActive(false);
        onFocusChange?.(false);
      }
    }, 100);
  };

  return (
    <div
      className={styles.searchBarWrapper}
      ref={containerRef}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <form
        className={`${styles.searchBarForm} ${showDropdown && filtered.length > 0 ? styles.searchBarFormOpen : ""
          }`}
        onSubmit={handleSubmit}
      >
        <Search />
        <input
          type="text"
          ref={inputRef}
          value={query}
          onChange={handleChange}
          placeholder="Search..."
          className={styles.searchBarInput}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
        />

        {isSearchActive && (
          <div className={styles.searchControls}>
            <button
              type="button"
              className={styles.closeButton}
              aria-label="Close search"
              onMouseDown={(event) => event.preventDefault()}
              onClick={closeSearch}
            >
              <X size={14} />
            </button>

            <kbd className={styles.escapeKey}>ESC</kbd>
          </div>
        )}
      </form>

      {showDropdown && filtered.length > 0 && (
        <ul className={styles.dropdown}>
          <div className={styles.dropdownScroll}>
            {filtered.map((item, index) => {
              const suggestionMeta = SUGGESTION_META[item.kind];
              const SuggestionIcon = suggestionMeta.icon;

              return (
                <li
                  key={`${item.kind}-${item.path}-${item.label}`}
                  ref={(element) => {
                    itemRefs.current[index] = element;
                  }}
                  className={`${styles.dropdownItem} ${index === activeIndex ? styles.activeItem : ""
                    }`}
                  onClick={() => handleSelect(item.path)}
                >
                  <span
                    className={`${styles.suggestionIcon} ${styles[`suggestionIcon_${item.kind}`]
                      }`}
                  >
                    <SuggestionIcon size={20} />
                  </span>

                  <span className={styles.suggestionLabel}>{item.label}</span>
                </li>
              );
            })}
          </div>
        </ul>
      )}
    </div>
  );
}
