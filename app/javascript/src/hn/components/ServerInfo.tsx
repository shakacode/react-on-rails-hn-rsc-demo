import React from "react";

import * as styles from "./ServerInfo.module.css";

export default function ServerInfo() {
  const renderedAt = new Date().toTimeString();

  return (
    <div className={styles.serverInfo} suppressHydrationWarning>
      Rendered at {renderedAt} with Rails + React on Rails RSC.
    </div>
  );
}
