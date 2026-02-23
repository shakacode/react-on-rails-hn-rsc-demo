import { fetchItem, mapItemToComment, mapItemToStory } from "../../hn/lib";

import { formatAbsoluteDate, pluralize, timeAgo } from "./formatting";
import * as styles from "./ItemPage.module.css";

interface ItemPageProps {
  itemId: number;
}

export default async function ItemPage({ itemId }: ItemPageProps) {
  const item = await fetchItem(itemId);
  const story = mapItemToStory(item);
  const comment = mapItemToComment(item);

  if (!story && !comment) {
    return (
      <article className={styles.item}>
        <h1 className={styles.title}>Item not found</h1>
        <p>The requested item does not exist or is unavailable.</p>
      </article>
    );
  }

  if (story) {
    return (
      <article className={styles.item}>
        <h1 className={styles.title}>
          {story.url ? (
            <a href={story.url} rel="noopener noreferrer nofollow" target="_blank">
              {story.title}
            </a>
          ) : (
            story.title
          )}
        </h1>
        <p className={styles.meta}>
          {story.score} {pluralize(story.score, "point")} by <a href={`/user/${story.userId}`}>{story.userId}</a>{" "}
          <span suppressHydrationWarning>{timeAgo(story.timeMs)} ago</span> ({formatAbsoluteDate(story.timeMs)})
        </p>
        <p className={styles.meta}>
          {story.commentCount} {pluralize(story.commentCount, "comment")}
        </p>
      </article>
    );
  }

  return (
    <article className={styles.item}>
      <h1 className={styles.title}>Comment</h1>
      <p className={styles.meta}>
        by <a href={`/user/${comment?.userId}`}>{comment?.userId}</a>{" "}
        <span suppressHydrationWarning>{timeAgo(comment?.timeMs ?? 0)} ago</span>
      </p>
      <div
        className={styles.comment}
        dangerouslySetInnerHTML={{ __html: comment?.text ?? "" }}
      />
    </article>
  );
}
