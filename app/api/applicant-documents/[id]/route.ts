import { updateEmployeeDocument } from "@/lib/actions/employee-documents";

function summarizeApplicantDocumentPayload(payload: Record<string, unknown>) {
  return {
    applicantId: typeof payload.applicantId === "string" ? payload.applicantId : "",
    applicantCode:
      typeof payload.applicantCode === "string" ? payload.applicantCode : "",
    sourceInterviewApplicantId:
      typeof payload.sourceInterviewApplicantId === "string"
        ? payload.sourceInterviewApplicantId
        : "",
    documentContext:
      typeof payload.documentContext === "string" ? payload.documentContext : "",
    documentOwnerType:
      typeof payload.documentOwnerType === "string"
        ? payload.documentOwnerType
        : "",
    status: typeof payload.status === "string" ? payload.status : "",
    hasAadhaarFileUrl:
      typeof payload.aadhaarFileUrl === "string" && payload.aadhaarFileUrl.length > 0,
    hasPanFileUrl:
      typeof payload.panFileUrl === "string" && payload.panFileUrl.length > 0,
    payloadKeys: Object.keys(payload),
  };
}

export async function PUT(
  request: Request,
  context: RouteContext<"/api/applicant-documents/[id]">,
) {
  try {
    const { id } = await context.params;
    const payload = await request.json();
    console.log("API UPDATE PAYLOAD RECEIVED", { id });
    console.log(payload);
    console.log(
      "API UPDATE PAYLOAD SUMMARY",
      summarizeApplicantDocumentPayload(payload as Record<string, unknown>),
    );
    const result = await updateEmployeeDocument(payload, id);

    return Response.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to update applicant document",
      },
      { status: 400 },
    );
  }
}
