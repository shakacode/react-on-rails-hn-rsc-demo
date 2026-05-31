import React from "react";

import * as styles from "./CommentForm.module.css";

export default function CommentForm() {
  return (
    <div>
      <textarea aria-label="Comment" className={styles.textarea} />
      <button className={styles.button} type="button">
        add comment
      </button>
    </div>
  );
}
