import type { HNItem, HNStoryType, HNUser } from "./types";

export interface StoryViewModel {
  id: number;
  title: string;
  url: string;
  domain: string;
  userId: string;
  score: number;
  commentCount: number;
  timeMs: number;
}

export interface CommentViewModel {
  id: number;
  userId: string;
  text: string;
  timeMs: number;
  childIds: number[];
  commentCount: number;
}

export interface UserViewModel {
  id: string;
  createdMs: number;
  karma: number;
  about: string;
  submittedIds: number[];
}

const STORY_TYPES: HNStoryType[] = ["top", "new", "best", "ask", "show", "job"];

export function normalizeStoryType(rawType: string | null | undefined): HNStoryType {
  const normalized = rawType?.toLowerCase();
  return STORY_TYPES.includes(normalized as HNStoryType) ? (normalized as HNStoryType) : "top";
}

export function extractDomain(url: string): string {
  if (!url) {
    return "";
  }

  try {
    const domain = new URL(url).hostname;
    return domain.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function mapItemToStory(item: HNItem | null): StoryViewModel | null {
  if (!item || item.deleted || item.dead || !item.id) {
    return null;
  }

  return {
    id: item.id,
    title: item.title ?? "(untitled story)",
    url: item.url ?? "",
    domain: extractDomain(item.url ?? ""),
    userId: item.by ?? "unknown",
    score: item.score ?? 0,
    commentCount: item.descendants ?? item.kids?.length ?? 0,
    timeMs: (item.time ?? 0) * 1000,
  };
}

export function mapItemToComment(item: HNItem | null): CommentViewModel | null {
  if (!item || item.deleted || item.dead || !item.id) {
    return null;
  }

  return {
    id: item.id,
    userId: item.by ?? "unknown",
    text: item.text ?? "",
    timeMs: (item.time ?? 0) * 1000,
    childIds: item.kids ?? [],
    commentCount: item.descendants ?? item.kids?.length ?? 0,
  };
}

export function mapUserToViewModel(user: HNUser | null): UserViewModel | null {
  if (!user || !user.id) {
    return null;
  }

  return {
    id: user.id,
    createdMs: (user.created ?? 0) * 1000,
    karma: user.karma ?? 0,
    about: user.about ?? "",
    submittedIds: user.submitted ?? [],
  };
}
