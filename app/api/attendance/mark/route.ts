import { markAttendance } from "@/lib/actions/attendance";

export async function POST(request: Request) {
  const payload = await request.json();
  const result = await markAttendance(payload);

  return Response.json(result, {
    status: result.success ? 200 : 400,
  });
}
