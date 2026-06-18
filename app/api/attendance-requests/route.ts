import { createAttendanceRequest } from "@/lib/actions/attendance-requests";

export async function POST(request: Request) {
  const payload = await request.json();
  const result = await createAttendanceRequest(payload);

  return Response.json(result, {
    status: result.success ? 200 : 400,
  });
}
