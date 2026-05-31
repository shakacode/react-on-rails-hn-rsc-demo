import React from "react";

import { getComments } from "../lib/comments";

import Comment from "./Comment.client";
import * as styles from "./ItemComments.module.css";

interface ItemCommentsProps {
  commentIds: number[];
}

export default async function ItemComments({ commentIds }: ItemCommentsProps) {
  const comments = await getComments(commentIds);

  return (
    <section className={styles.comments}>
      {comments.map((comment) => (
        <Comment comment={comment} key={comment.id} />
      ))}
    </section>
  );
}
