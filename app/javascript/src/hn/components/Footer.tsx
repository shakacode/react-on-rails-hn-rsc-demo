import React from "react";

import * as styles from "./Footer.module.css";

const REPOSITORY_URL =
  "https://github.com/shakacode/react-on-rails-hn-rsc-demo";

interface FooterProps {
  commitHash?: string;
}

export default function Footer({ commitHash }: FooterProps) {
  const normalizedCommitHash = commitHash?.trim();
  const shortCommitHash = normalizedCommitHash?.slice(0, 7);

  return (
    <footer className={styles.footer}>
      <nav aria-label="Hacker News resources" className={styles.links}>
        <a href="https://news.ycombinator.com/newsguidelines.html">Guidelines</a>
        <a href="https://news.ycombinator.com/newsfaq.html">FAQ</a>
        <a href="https://news.ycombinator.com/lists">Lists</a>
        <a href="https://github.com/HackerNews/API">API</a>
        <a href="https://news.ycombinator.com/security.html">Security</a>
        <a href="https://www.ycombinator.com/legal">Legal</a>
        <a href="https://www.ycombinator.com/apply">Apply to YC</a>
        <a href="mailto:hn@ycombinator.com">Contact</a>
      </nav>
      <p className={styles.branding}>
        Hacker News on Rails, powered by{" "}
        <a href="https://reactonrails.com">React on Rails Pro</a>.{" "}
        Open the source on <a href={REPOSITORY_URL}>GitHub</a> by{" "}
        <a href="https://www.shakacode.com">ShakaCode</a>.
      </p>
      {normalizedCommitHash && shortCommitHash ? (
        <p className={styles.commit}>
          Commit{" "}
          <a
            className={styles.commitHash}
            href={`${REPOSITORY_URL}/commit/${normalizedCommitHash}`}
            title={normalizedCommitHash}
          >
            {shortCommitHash}
          </a>
        </p>
      ) : null}
    </footer>
  );
}
