import { cache } from "react";

import { fetchItem } from "./server";
import { mapItemToComment, type CommentViewModel } from "./mappers";

if (typeof window !== "undefined") {
  throw new Error("comments must only run in server-rendered modules.");
}

export interface ThreadedCommentViewModel extends CommentViewModel {
  comments: ThreadedCommentViewModel[];
  collapsedCount: number;
}

const MAX_COMMENT_DEPTH = 6;
const MAX_COMMENTS_PER_ITEM = 250;

interface CommentFetchState {
  renderedCount: number;
  seenIds: Set<number>;
}

async function fetchCommentTree(
  ids: number[],
  depth: number,
  state: CommentFetchState,
): Promise<ThreadedCommentViewModel[]> {
  if (depth >= MAX_COMMENT_DEPTH || state.renderedCount >= MAX_COMMENTS_PER_ITEM) {
    return [];
  }

  const comments: ThreadedCommentViewModel[] = [];
  const remainingSlots = MAX_COMMENTS_PER_ITEM - state.renderedCount;
  const idsToFetch: number[] = [];

  for (const id of ids) {
    if (idsToFetch.length >= remainingSlots) {
      break;
    }

    if (state.seenIds.has(id)) {
      continue;
    }

    state.seenIds.add(id);
    idsToFetch.push(id);
  }

  const fetchedComments = await Promise.all(idsToFetch.map(async (id) => {
    try {
      return mapItemToComment(await fetchItem(id));
    } catch {
      return null;
    }
  }));

  for (const comment of fetchedComments) {
    if (!comment) {
      continue;
    }

    if (state.renderedCount >= MAX_COMMENTS_PER_ITEM) {
      break;
    }

    state.renderedCount += 1;

    const childComments = await fetchCommentTree(comment.childIds, depth + 1, state);
    const collapsedCount = childComments.reduce(
      (count, childComment) => count + childComment.collapsedCount,
      1,
    );

    comments.push({
      ...comment,
      comments: childComments,
      collapsedCount,
    });
  }

  return comments;
}

export const getComments = cache(async (ids: number[] = []): Promise<ThreadedCommentViewModel[]> => {
  // Cap recursive hydration at 6 levels and 250 rendered comments to keep item SSR predictable.
  return fetchCommentTree(ids, 0, {
    renderedCount: 0,
    seenIds: new Set<number>(),
  });
});
