import { addNote, listNotes } from "../../../lib/notes.js";

export async function GET() {
  return Response.json(listNotes());
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (text === "") {
    return Response.json({ error: "text is required" }, { status: 400 });
  }
  return Response.json(addNote(text), { status: 201 });
}
