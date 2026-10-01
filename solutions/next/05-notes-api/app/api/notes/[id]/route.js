import { deleteNote, getNote } from "../../../../lib/notes.js";

export async function GET(request, { params }) {
  const { id } = await params;
  const note = getNote(Number(id));
  if (!note) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  return Response.json(note);
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  if (!deleteNote(Number(id))) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  return new Response(null, { status: 204 });
}
