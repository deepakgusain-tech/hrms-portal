"use server";

import bcrypt from "bcrypt";
import crypto from "crypto";
import { prisma } from "../prisma";
import { sendSystemEmail } from "../email";

const RESET_TOKEN_BYTES = 32;
const RESET_TOKEN_TTL_MINUTES = 60;

type AccountType = "user" | "employee" | "employer";

type ResetActionState = {
  success: boolean;
  message: string;
};

type ResetAccount = {
  id: string;
  email: string;
  name: string;
  type: AccountType;
};

function normalizeEmail(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function getString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function createToken() {
  return crypto.randomBytes(RESET_TOKEN_BYTES).toString("base64url");
}

function getBaseUrl() {
  if (process.env.AUTH_URL) return process.env.AUTH_URL;
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  return "http://localhost:3000";
}

function getAccountLabel(type: AccountType) {
  if (type === "employee") return "Employee";
  if (type === "employer") return "Employer";
  return "User";
}

function buildResetEmail(accounts: Array<ResetAccount & { token: string }>) {
  const expiresText = `${RESET_TOKEN_TTL_MINUTES} minutes`;
  const links = accounts.map((account) => {
    const url = new URL("/reset-password", getBaseUrl());
    url.searchParams.set("token", account.token);

    return {
      label: `${getAccountLabel(account.type)} account`,
      url: url.toString(),
    };
  });

  const text = [
    "We received a password reset request for your HRMS Portal account.",
    "",
    ...links.flatMap((link) => [`${link.label}: ${link.url}`, ""]),
    `These links expire in ${expiresText}. If you did not request this, you can ignore this email.`,
  ].join("\n");

  const htmlLinks = links
    .map(
      (link) =>
        `<p><a href="${link.url}" style="display:inline-block;padding:10px 14px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:8px">${link.label}</a></p>`
    )
    .join("");

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
      <h2>Password reset requested</h2>
      <p>We received a password reset request for your HRMS Portal account.</p>
      ${htmlLinks}
      <p>These links expire in ${expiresText}.</p>
      <p>If you did not request this, you can ignore this email.</p>
    </div>
  `;

  return { text, html };
}

async function findAccountsByEmail(email: string): Promise<ResetAccount[]> {
  const [users, employees, employers] = await Promise.all([
    prisma.user.findMany({
      where: {
        email: { equals: email, mode: "insensitive" },
        status: "ACTIVE",
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    }),
    prisma.employeeProfile.findMany({
      where: {
        email: { equals: email, mode: "insensitive" },
        status: "ACTIVE",
      },
      select: {
        id: true,
        email: true,
        employeeName: true,
      },
    }),
    prisma.employer.findMany({
      where: {
        email: { equals: email, mode: "insensitive" },
        status: "ACTIVE",
      },
      select: {
        id: true,
        email: true,
        employerName: true,
      },
    }),
  ]);

  return [
    ...users.map((user) => ({
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`.trim(),
      type: "user" as const,
    })),
    ...employees.map((employee) => ({
      id: employee.id,
      email: employee.email,
      name: employee.employeeName,
      type: "employee" as const,
    })),
    ...employers.map((employer) => ({
      id: employer.id,
      email: employer.email,
      name: employer.employerName,
      type: "employer" as const,
    })),
  ];
}

async function storeResetToken(
  account: ResetAccount,
  tokenHash: string,
  expiresAt: Date
) {
  const data = {
    resetTokenHash: tokenHash,
    resetTokenExpiresAt: expiresAt,
  };

  if (account.type === "employee") {
    await prisma.employeeProfile.update({
      where: { id: account.id },
      data,
    });
    return;
  }

  if (account.type === "employer") {
    await prisma.employer.update({
      where: { id: account.id },
      data,
    });
    return;
  }

  await prisma.user.update({
    where: { id: account.id },
    data,
  });
}

export async function requestPasswordReset(
  _prevState: ResetActionState | null,
  formData: FormData
): Promise<ResetActionState> {
  const email = normalizeEmail(formData.get("email"));

  if (!email) {
    return {
      success: false,
      message: "Email is required.",
    };
  }

  const accounts = await findAccountsByEmail(email);

  if (!accounts.length) {
    return {
      success: true,
      message: "If an account exists for that email, a reset link has been sent.",
    };
  }

  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);
  const tokenizedAccounts = accounts.map((account) => ({
    ...account,
    token: createToken(),
  }));

  try {
    await Promise.all(
      tokenizedAccounts.map((account) =>
        storeResetToken(account, hashToken(account.token), expiresAt)
      )
    );

    const emailContent = buildResetEmail(tokenizedAccounts);

    await sendSystemEmail({
      to: email,
      subject: "Reset your HRMS Portal password",
      text: emailContent.text,
      html: emailContent.html,
    });

    return {
      success: true,
      message: "If an account exists for that email, a reset link has been sent.",
    };
  } catch (error) {
    console.error("Password reset email failed:", error);

    return {
      success: false,
      message: "Unable to send reset email. Check system email configuration.",
    };
  }
}

async function findAccountByResetToken(token: string) {
  const tokenHash = hashToken(token);
  const now = new Date();

  const [user, employee, employer] = await Promise.all([
    prisma.user.findFirst({
      where: {
        resetTokenHash: tokenHash,
        resetTokenExpiresAt: { gt: now },
        status: "ACTIVE",
      },
      select: { id: true },
    }),
    prisma.employeeProfile.findFirst({
      where: {
        resetTokenHash: tokenHash,
        resetTokenExpiresAt: { gt: now },
        status: "ACTIVE",
      },
      select: { id: true },
    }),
    prisma.employer.findFirst({
      where: {
        resetTokenHash: tokenHash,
        resetTokenExpiresAt: { gt: now },
        status: "ACTIVE",
      },
      select: { id: true },
    }),
  ]);

  if (user) return { id: user.id, type: "user" as const };
  if (employee) return { id: employee.id, type: "employee" as const };
  if (employer) return { id: employer.id, type: "employer" as const };

  return null;
}

export async function resetPassword(
  _prevState: ResetActionState | null,
  formData: FormData
): Promise<ResetActionState> {
  const token = getString(formData.get("token"));
  const password = getString(formData.get("password"));
  const confirmPassword = getString(formData.get("confirmPassword"));

  if (!token) {
    return {
      success: false,
      message: "Reset token is missing.",
    };
  }

  if (password.length < 6) {
    return {
      success: false,
      message: "Password should be at least 6 characters long.",
    };
  }

  if (password !== confirmPassword) {
    return {
      success: false,
      message: "Passwords do not match.",
    };
  }

  const account = await findAccountByResetToken(token);

  if (!account) {
    return {
      success: false,
      message: "Reset link is invalid or has expired.",
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const data = {
    password: hashedPassword,
    resetTokenHash: null,
    resetTokenExpiresAt: null,
  };

  if (account.type === "employee") {
    await prisma.employeeProfile.update({
      where: { id: account.id },
      data,
    });
  } else if (account.type === "employer") {
    await prisma.employer.update({
      where: { id: account.id },
      data,
    });
  } else {
    await prisma.user.update({
      where: { id: account.id },
      data,
    });
  }

  return {
    success: true,
    message: "Password reset successfully. You can sign in with your new password.",
  };
}
