import "server-only";

import { cache } from "react";

import type { HNItem, HNStoryPage, HNStoryType, HNUser } from "./types";

const HN_BASE_URL = "https://hacker-news.firebaseio.com/v0";
const DEFAULT_PAGE_SIZE = 30;
const MAX_PAGE_SIZE = 100;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "number");
}

function isHNItem(value: unknown): value is HNItem {
  return isObject(value) && typeof value.id === "number";
}

function isHNUser(value: unknown): value is HNUser {
  return (
    isObject(value) &&
    typeof value.id === "string" &&
    typeof value.created === "number" &&
    typeof value.karma === "number"
  );
}

function normalizePage(rawPage: number): number {
  if (!Number.isFinite(rawPage) || rawPage < 1) {
    return 1;
  }

  return Math.floor(rawPage);
}

function normalizePageSize(rawPageSize: number): number {
  if (!Number.isFinite(rawPageSize) || rawPageSize < 1) {
    return DEFAULT_PAGE_SIZE;
  }

  return Math.min(Math.floor(rawPageSize), MAX_PAGE_SIZE);
}

class HNApiError extends Error {
  public readonly status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "HNApiError";
    this.status = status;
  }
}

const fetchJson = cache(async (path: string): Promise<unknown> => {
  const response = await fetch(`${HN_BASE_URL}/${path}`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new HNApiError(`HN API request failed: ${path}`, response.status);
  }

  return response.json();
});

export const fetchStoryIds = cache(async (storyType: HNStoryType = "top"): Promise<number[]> => {
  const payload = await fetchJson(`${storyType}stories.json`);

  if (!isNumberArray(payload)) {
    throw new HNApiError(`Unexpected stories payload shape for type '${storyType}'`);
  }

  return payload;
});

export const fetchItem = cache(async (itemId: number): Promise<HNItem | null> => {
  const payload = await fetchJson(`item/${itemId}.json`);

  if (payload === null) {
    return null;
  }

  if (!isHNItem(payload)) {
    throw new HNApiError(`Unexpected item payload shape for id '${itemId}'`);
  }

  return payload;
});

export const fetchUser = cache(async (userId: string): Promise<HNUser | null> => {
  const payload = await fetchJson(`user/${userId}.json`);

  if (payload === null) {
    return null;
  }

  if (!isHNUser(payload)) {
    throw new HNApiError(`Unexpected user payload shape for id '${userId}'`);
  }

  return payload;
});

export const fetchStoryPage = cache(async (
  storyType: HNStoryType = "top",
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<HNStoryPage> => {
  const ids = await fetchStoryIds(storyType);
  const normalizedPageSize = normalizePageSize(pageSize);

  const totalIds = ids.length;
  const totalPages = Math.max(1, Math.ceil(totalIds / normalizedPageSize));
  const normalizedPage = Math.min(normalizePage(page), totalPages);

  const start = (normalizedPage - 1) * normalizedPageSize;
  const end = start + normalizedPageSize;

  return {
    storyType,
    page: normalizedPage,
    pageSize: normalizedPageSize,
    totalIds,
    totalPages,
    ids: ids.slice(start, end),
  };
});

export { HNApiError };
