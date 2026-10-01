// Given. Do not edit. An in-memory store that survives the dev server's reloads.
const store = (globalThis.z2dNotes ??= { notes: [], nextId: 1 });

export function listNotes() {
  return store.notes;
}

export function getNote(id) {
  return store.notes.find((note) => note.id === id);
}

export function addNote(text) {
  const note = { id: store.nextId++, text };
  store.notes.push(note);
  return note;
}

export function deleteNote(id) {
  const index = store.notes.findIndex((note) => note.id === id);
  if (index < 0) {
    return false;
  }
  store.notes.splice(index, 1);
  return true;
}
