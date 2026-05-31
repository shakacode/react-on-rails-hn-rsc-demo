import React, { type ReactNode } from "react";

import type { HNStoryType } from "../../hn/lib/types";

import Footer from "./Footer";
import Header from "./Header";
import * as styles from "./Layout.module.css";
import ServerInfo from "./ServerInfo";

interface LayoutProps {
  children: ReactNode;
  storyType?: HNStoryType;
}

export default function Layout({ children, storyType = "top" }: LayoutProps) {
  return (
    <main className={styles.main}>
      <Header storyType={storyType} />
      <section className={styles.page}>
        {children}
        <Footer />
        <ServerInfo />
      </section>
    </main>
  );
}
