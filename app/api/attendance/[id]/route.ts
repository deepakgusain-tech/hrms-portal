import { deleteAttendance, updateAttendance } from "@/lib/actions/attendance";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const payload = await request.json();
  const result = await updateAttendance(id, payload);

  return Response.json(result, {
    status: result.success ? 200 : 400,
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const result = await deleteAttendance(id);

  return Response.json(result, {
    status: result.success ? 200 : 400,
  });
}
