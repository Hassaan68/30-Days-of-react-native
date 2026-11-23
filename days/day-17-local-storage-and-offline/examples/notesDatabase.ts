import * as SQLite from 'expo-sqlite';

export interface NoteRecord {
  id: number;
  title: string;
  body: string;
  updatedAt: string;
  synced: boolean;
}

interface NoteRow {
  id: number;
  title: string;
  body: string;
  updated_at: string;
  synced: number;
}

export interface CreateNoteInput {
  title: string;
  body: string;
}

export interface UpdateNoteInput {
  title?: string;
  body?: string;
  synced?: boolean;
}

const DATABASE_NAME = 'offline_notes.db';
const SCHEMA_VERSION = 1;

function mapRowToNote(row: NoteRow): NoteRecord {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    updatedAt: row.updated_at,
    synced: row.synced === 1,
  };
}

/**
 * Modern `expo-sqlite` async database helper (Expo SDK 58+).
 * Uses parameterized queries, WAL journal mode, schema migrations via `PRAGMA user_version`,
 * and transactional writes.
 */
export class NotesDatabase {
  private dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

  private async getDb(): Promise<SQLite.SQLiteDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = this.initialize();
    }
    return this.dbPromise;
  }

  private async initialize(): Promise<SQLite.SQLiteDatabase> {
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);

    await db.execAsync('PRAGMA journal_mode = WAL;');

    const versionRow = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    const currentVersion = versionRow?.user_version ?? 0;

    if (currentVersion < SCHEMA_VERSION) {
      await db.withTransactionAsync(async () => {
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            body TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            synced INTEGER NOT NULL DEFAULT 0
          );
          CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes (updated_at DESC);
        `);

        await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION};`);
      });
    }

    return db;
  }

  async listNotes(searchQuery?: string): Promise<NoteRecord[]> {
    const db = await this.getDb();
    const trimmed = searchQuery?.trim();

    if (trimmed) {
      const pattern = `%${trimmed}%`;
      const rows = await db.getAllAsync<NoteRow>(
        `SELECT id, title, body, updated_at, synced
         FROM notes
         WHERE title LIKE ? OR body LIKE ?
         ORDER BY updated_at DESC`,
        [pattern, pattern],
      );
      return rows.map(mapRowToNote);
    }

    const rows = await db.getAllAsync<NoteRow>(
      `SELECT id, title, body, updated_at, synced
       FROM notes
       ORDER BY updated_at DESC`,
    );
    return rows.map(mapRowToNote);
  }

  async getNoteById(id: number): Promise<NoteRecord | null> {
    const db = await this.getDb();
    const row = await db.getFirstAsync<NoteRow>(
      `SELECT id, title, body, updated_at, synced
       FROM notes
       WHERE id = ?`,
      [id],
    );
    return row ? mapRowToNote(row) : null;
  }

  async createNote(input: CreateNoteInput): Promise<NoteRecord> {
    const db = await this.getDb();
    const now = new Date().toISOString();

    const result = await db.runAsync(
      `INSERT INTO notes (title, body, updated_at, synced)
       VALUES (?, ?, ?, 0)`,
      [input.title.trim(), input.body, now],
    );

    return {
      id: result.lastInsertRowId,
      title: input.title.trim(),
      body: input.body,
      updatedAt: now,
      synced: false,
    };
  }

  async updateNote(id: number, patch: UpdateNoteInput): Promise<NoteRecord | null> {
    const existing = await this.getNoteById(id);
    if (!existing) {
      return null;
    }

    const db = await this.getDb();
    const nextTitle = patch.title !== undefined ? patch.title.trim() : existing.title;
    const nextBody = patch.body !== undefined ? patch.body : existing.body;
    const nextSynced = patch.synced !== undefined ? patch.synced : false;
    const updatedAt = new Date().toISOString();

    await db.runAsync(
      `UPDATE notes
       SET title = ?, body = ?, updated_at = ?, synced = ?
       WHERE id = ?`,
      [nextTitle, nextBody, updatedAt, nextSynced ? 1 : 0, id],
    );

    return {
      id,
      title: nextTitle,
      body: nextBody,
      updatedAt,
      synced: nextSynced,
    };
  }

  async listUnsyncedNotes(): Promise<NoteRecord[]> {
    const db = await this.getDb();
    const rows = await db.getAllAsync<NoteRow>(
      `SELECT id, title, body, updated_at, synced
       FROM notes
       WHERE synced = 0
       ORDER BY updated_at ASC`,
    );
    return rows.map(mapRowToNote);
  }

  async markNotesSynced(ids: readonly number[]): Promise<void> {
    if (ids.length === 0) {
      return;
    }

    const db = await this.getDb();
    await db.withTransactionAsync(async () => {
      for (const id of ids) {
        await db.runAsync('UPDATE notes SET synced = 1 WHERE id = ?', [id]);
      }
    });
  }

  async deleteNote(id: number): Promise<boolean> {
    const db = await this.getDb();
    const result = await db.runAsync('DELETE FROM notes WHERE id = ?', [id]);
    return result.changes > 0;
  }
}
