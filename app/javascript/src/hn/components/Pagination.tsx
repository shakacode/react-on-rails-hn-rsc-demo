import React from "react";

import type { HNStoryType } from "../../hn/lib/types";

import * as styles from "./Pagination.module.css";

const STORY_PATHS: Record<HNStoryType, string> = {
  top: "/",
  new: "/new",
  best: "/best",
  ask: "/ask",
  show: "/show",
  job: "/jobs",
};

function pageHref(page: number, storyType: HNStoryType): string {
  const basePath = STORY_PATHS[storyType];

  if (page <= 1) {
    return basePath;
  }

  if (storyType === "top") {
    return `/news/${page}`;
  }

  return `${basePath}/${page}`;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  storyType: HNStoryType;
}

export default function Pagination({ currentPage, totalPages, storyType }: PaginationProps) {
  if (currentPage >= totalPages) {
    return null;
  }

  return (
    <nav className={styles.nav} aria-label="Stories pagination">
      <a className={styles.link} href={pageHref(currentPage + 1, storyType)}>
        More
      </a>
    </nav>
  );
}
