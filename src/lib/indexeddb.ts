import type { NoteRecord } from "@/lib/types";

const DB_NAME = "campusos-idb";
const STORE_NAME = "notes";
const VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
) {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    const request = action(store);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function getAllNotes() {
  return withStore<NoteRecord[]>("readonly", (store) => store.getAll());
}

export function upsertNote(note: NoteRecord) {
  return withStore<IDBValidKey>("readwrite", (store) => store.put(note));
}

export function deleteNote(noteId: string) {
  return withStore<undefined>("readwrite", (store) => store.delete(noteId));
}
