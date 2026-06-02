import React from "react";

import type { HNStoryType } from "../../hn/lib/types";

import * as styles from "./Header.module.css";

interface StoryNavItem {
  key: HNStoryType;
  label: string;
}

const STORY_NAV: StoryNavItem[] = [
  { key: "top", label: "top" },
  { key: "new", label: "new" },
  { key: "best", label: "best" },
  { key: "ask", label: "ask" },
  { key: "show", label: "show" },
  { key: "job", label: "jobs" },
];

const STORY_PATHS: Record<HNStoryType, string> = {
  top: "/",
  new: "/new",
  best: "/best",
  ask: "/ask",
  show: "/show",
  job: "/jobs",
};

interface HeaderProps {
  storyType: HNStoryType;
}

export default function Header({ storyType }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <a className={styles.brand} href="/">
          <span className={styles.logo} aria-hidden="true">
            <span className={styles.logoLetter}>N</span>
          </span>
          <span className={styles.title}>Hacker Next on Rails</span>
        </a>
        <nav className={styles.nav}>
          <ul className={styles.list}>
            {STORY_NAV.map((item) => {
              const isActive = item.key === storyType;
              return (
                <li key={item.key}>
                  <a
                    className={isActive ? `${styles.link} ${styles.active}` : styles.link}
                    href={STORY_PATHS[item.key]}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      <div className={styles.right}>
        <span className={styles.login}>login</span>
      </div>
    </header>
  );
}
