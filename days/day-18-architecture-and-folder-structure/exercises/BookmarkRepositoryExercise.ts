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

/**
 * Day 18 Starter Exercise: Implement `InMemoryBookmarkRepository`.
 *
 * Keep domain validation and immutability encapsulated inside the repository
 * so future AsyncStorage, SQLite, or REST implementations can be swapped in seamlessly.
 */
export class InMemoryBookmarkRepository implements BookmarkRepository {
  private items: Bookmark[];

  constructor(initialItems: readonly Bookmark[] = []) {
    this.items = initialItems.map((item) => ({
      ...item,
      tags: [...item.tags],
    }));
  }

  async list(): Promise<Bookmark[]> {
    // TODO (Exercise 1 & 3): Return cloned copies of all bookmarks (including cloned `tags` arrays).
    return this.items;
  }

  async getById(_id: string): Promise<Bookmark | null> {
    // TODO (Exercise 1): Find bookmark by `_id` and return a cloned copy, or `null` if missing.
    return null;
  }

  async findByTag(_tag: string): Promise<Bookmark[]> {
    // TODO (Exercise 3): Return cloned bookmarks whose `tags` contain `_tag` (case-insensitive).
    return [];
  }

  async create(input: CreateBookmarkInput): Promise<Bookmark> {
    // TODO (Exercise 2):
    // 1. Validate non-empty title and http(s) URL.
    // 2. Normalize tags (trim, lowercase, remove empty & duplicates).
    // 3. Throw DuplicateBookmarkError if the URL already exists (case-insensitive).
    // 4. Store and return a cloned Bookmark.
    const placeholder: Bookmark = {
      id: `bm-${this.items.length + 1}`,
      title: input.title.trim(),
      url: input.url.trim(),
      tags: [...(input.tags ?? [])],
      createdAt: new Date().toISOString(),
    };
    return placeholder;
  }

  async remove(_id: string): Promise<boolean> {
    // TODO (Exercise 1): Delete bookmark with `_id` and return `true` if deleted, else `false`.
    return false;
  }
}
