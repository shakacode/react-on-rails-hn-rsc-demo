"use client";

import React from "react";

import type { ThreadedCommentViewModel } from "../lib/comments";

import { timeAgo } from "./formatting";
import * as styles from "./Comment.module.css";

interface CommentProps {
  comment: ThreadedCommentViewModel;
}

export default function Comment({ comment }: CommentProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const toggleLabel = collapsed ? `[+${comment.collapsedCount}]` : "[-]";

  return (
    <article className={styles.comment}>
      <div className={styles.meta}>
        <a href={`/user/${comment.userId}`}>{comment.userId}</a>{" "}
        <span suppressHydrationWarning>{timeAgo(comment.timeMs)} ago</span>{" "}
        <button
          aria-expanded={!collapsed}
          className={styles.toggle}
          onClick={() => setCollapsed((current) => !current)}
          type="button"
        >
          {toggleLabel}
        </button>
      </div>

      {collapsed ? null : (
        <>
          <div
            className={styles.text}
            dangerouslySetInnerHTML={{ __html: comment.text }}
          />
          {comment.comments.length > 0 && (
            <div className={styles.children}>
              {comment.comments.map((childComment) => (
                <Comment comment={childComment} key={childComment.id} />
              ))}
            </div>
          )}
        </>
      )}
    </article>
  );
}
