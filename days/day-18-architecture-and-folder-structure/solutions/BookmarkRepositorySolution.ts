export interface Bookmark {
  readonly id: string;
  readonly title: string;
  readonly url: string;
  readonly tags: readonly string[];
  readonly createdAt: string;
}

export interface CreateBookmarkInput {
  title: string;
  url: string;
  tags?: readonly string[];
}

export interface BookmarkRepository {
  list(): Promise<Bookmark[]>;
  getById(id: string): Promise<Bookmark | null>;
  findByTag(tag: string): Promise<Bookmark[]>;
  create(input: CreateBookmarkInput): Promise<Bookmark>;
  remove(id: string): Promise<boolean>;
}

export class DuplicateBookmarkError extends Error {
  readonly url: string;

  constructor(url: string) {
    super(`Bookmark already exists for URL: ${url}`);
    this.name = 'DuplicateBookmarkError';
    this.url = url;
  }
}

function cloneBookmark(bookmark: Bookmark): Bookmark {
  return {
    ...bookmark,
    tags: [...bookmark.tags],
  };
}

function normalizeUrl(rawUrl: string): string {
  return rawUrl.trim().replace(/\/+$/, '');
}

function normalizeTags(rawTags: readonly string[] = []): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const tag of rawTags) {
    const cleaned = tag.trim().toLowerCase();
    if (cleaned && !seen.has(cleaned)) {
      seen.add(cleaned);
      normalized.push(cleaned);
    }
  }

  return normalized;
}

/**
 * Day 18 Solution: Complete `InMemoryBookmarkRepository` enforcing domain invariants,
 * duplicate detection, case-insensitive tag queries, and defensive immutability.
 */
export class InMemoryBookmarkRepository implements BookmarkRepository {
  private items: Bookmark[];
  private sequence = 1;

  constructor(initialItems: readonly Bookmark[] = []) {
    this.items = initialItems.map(cloneBookmark);
  }

  async list(): Promise<Bookmark[]> {
    return this.items.map(cloneBookmark);
  }

  async getById(id: string): Promise<Bookmark | null> {
    const found = this.items.find((item) => item.id === id);
    return found ? cloneBookmark(found) : null;
  }

  async findByTag(tag: string): Promise<Bookmark[]> {
    const target = tag.trim().toLowerCase();
    if (!target) {
      return [];
    }

    return this.items
      .filter((item) => item.tags.some((itemTag) => itemTag.toLowerCase() === target))
      .map(cloneBookmark);
  }

  async create(input: CreateBookmarkInput): Promise<Bookmark> {
    const title = input.title.trim();
    if (!title) {
      throw new Error('Bookmark title is required.');
    }

    const url = normalizeUrl(input.url);
    if (!/^https?:\/\/.+/i.test(url)) {
      throw new Error('Bookmark URL must start with http:// or https://.');
    }

    const urlKey = url.toLowerCase();
    const alreadyExists = this.items.some((item) => item.url.toLowerCase() === urlKey);
    if (alreadyExists) {
      throw new DuplicateBookmarkError(url);
    }

    const created: Bookmark = {
      id: `bm-${this.sequence}`,
      title,
      url,
      tags: normalizeTags(input.tags),
      createdAt: new Date().toISOString(),
    };

    this.sequence += 1;
    this.items = [created, ...this.items];
    return cloneBookmark(created);
  }

  async remove(id: string): Promise<boolean> {
    const beforeCount = this.items.length;
    this.items = this.items.filter((item) => item.id !== id);
    return this.items.length < beforeCount;
  }
}
