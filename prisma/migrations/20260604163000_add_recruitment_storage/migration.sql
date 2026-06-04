ALTER TYPE "DocumentReviewStatus" ADD VALUE IF NOT EXISTS 'REUPLOAD_REQUESTED';

CREATE TABLE "RecruitmentIntake" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "resumeUrl" TEXT,
    "skills" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "appliedPosition" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "pipelineStatus" TEXT NOT NULL DEFAULT 'APPLIED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecruitmentIntake_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RecruitmentApplication" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sourceInterviewApplicantId" UUID,
    "applicantPortalId" TEXT,
    "applicantUsername" TEXT,
    "applicantPasswordHash" TEXT,
    "applicantPortalEnabled" BOOLEAN NOT NULL DEFAULT false,
    "applicantInvitedAt" TIMESTAMP(3),
    "applicantDocumentsSubmittedAt" TIMESTAMP(3),
    "serialNumber" TEXT,
    "requestId" TEXT,
    "clientProjectName" TEXT,
    "requestReceivedDate" TEXT,
    "requestApprovedBy" TEXT,
    "hrOwnerEmployeeNumber" TEXT,
    "hrOwnerName" TEXT,
    "businessOwnerEmployeeNumber" TEXT,
    "businessOwnerName" TEXT,
    "candidateName" TEXT NOT NULL,
    "gender" TEXT,
    "dateOfBirth" TEXT,
    "mobileNumber" TEXT NOT NULL,
    "email" TEXT,
    "currentLocation" TEXT,
    "preferredLocation" TEXT,
    "noticePeriod" TEXT,
    "qualification" TEXT,
    "skillsLevel" TEXT,
    "profilePost" TEXT NOT NULL,
    "certification" TEXT,
    "totalExperience" TEXT,
    "relevantExperience" TEXT,
    "currentCompany" TEXT,
    "currentCtc" TEXT,
    "expectedCtc" TEXT,
    "offeredCtc" TEXT,
    "profileSource" TEXT,
    "profileReceiveDate" TEXT,
    "internalScreeningDate" TEXT,
    "internalScreeningCleared" TEXT,
    "profileSentToBusinessOwner" TEXT,
    "profileSentToBusinessOwnerDate" TEXT,
    "profileConnectWithClientDate" TEXT,
    "interviewedByClient" TEXT,
    "clientInterviewDate" TEXT,
    "feedbackDate" TEXT,
    "internalStatus" TEXT,
    "clientFinalStatus" TEXT,
    "pipelineStatus" TEXT DEFAULT 'APPLIED',
    "updatedToCandidateDate" TEXT,
    "offeredDate" TEXT,
    "offerAccepted" TEXT,
    "reasonIfOfferNotAccepted" TEXT,
    "agreedJoiningDate" TEXT,
    "joined" TEXT,
    "reasonIfNotJoined" TEXT,
    "actualJoiningDate" TEXT,
    "joiningDetailsShared" TEXT,
    "joiningDetailsSharedDate" TEXT,
    "remarks" TEXT,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecruitmentApplication_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InterviewRecord" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "interviewId" TEXT NOT NULL,
    "applicantId" UUID NOT NULL,
    "applicantName" TEXT NOT NULL,
    "appliedPosition" TEXT NOT NULL,
    "interviewRound" TEXT NOT NULL,
    "interviewerId" TEXT NOT NULL,
    "interviewerName" TEXT NOT NULL,
    "interviewerJobRole" TEXT,
    "scheduledDate" TEXT NOT NULL,
    "scheduledTime" TEXT NOT NULL,
    "interviewMode" TEXT NOT NULL,
    "meetingLinkOrLocation" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "feedback" TEXT,
    "ratingScore" INTEGER,
    "recommendation" TEXT,
    "strengths" TEXT,
    "weaknesses" TEXT,
    "createdBy" TEXT,
    "createdByName" TEXT,
    "updatedBy" TEXT,
    "updatedByName" TEXT,
    "completedAt" TIMESTAMP(3),
    "history" JSONB,
    "statusNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewRecord_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RecruitmentApplication_sourceInterviewApplicantId_key" ON "RecruitmentApplication"("sourceInterviewApplicantId");
CREATE UNIQUE INDEX "RecruitmentApplication_applicantPortalId_key" ON "RecruitmentApplication"("applicantPortalId");
CREATE UNIQUE INDEX "RecruitmentApplication_applicantUsername_key" ON "RecruitmentApplication"("applicantUsername");

CREATE INDEX "RecruitmentIntake_pipelineStatus_idx" ON "RecruitmentIntake"("pipelineStatus");
CREATE INDEX "RecruitmentIntake_updatedAt_idx" ON "RecruitmentIntake"("updatedAt");

CREATE INDEX "RecruitmentApplication_email_idx" ON "RecruitmentApplication"("email");
CREATE INDEX "RecruitmentApplication_pipelineStatus_idx" ON "RecruitmentApplication"("pipelineStatus");
CREATE INDEX "RecruitmentApplication_updatedAt_idx" ON "RecruitmentApplication"("updatedAt");

CREATE INDEX "InterviewRecord_applicantId_idx" ON "InterviewRecord"("applicantId");
CREATE INDEX "InterviewRecord_interviewerId_idx" ON "InterviewRecord"("interviewerId");
CREATE INDEX "InterviewRecord_interviewId_idx" ON "InterviewRecord"("interviewId");
CREATE INDEX "InterviewRecord_recommendation_idx" ON "InterviewRecord"("recommendation");
CREATE INDEX "InterviewRecord_updatedAt_idx" ON "InterviewRecord"("updatedAt");
