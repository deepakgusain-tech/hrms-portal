import { reviewAttendanceRequest } from "@/lib/actions/attendance-requests";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const payload = await request.json();
  const result = await reviewAttendanceRequest(id, payload);

  return Response.json(result, {
    status: result.success ? 200 : 400,
  });
}
