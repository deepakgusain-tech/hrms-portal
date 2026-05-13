import net from "net";
import tls from "tls";
import { prisma } from "./prisma";

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  fromName: string;
};

type SendMailInput = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

function encodeAddress(name: string, email: string) {
  const escapedName = name.replace(/"/g, "");
  return `"${escapedName}" <${email}>`;
}

function escapeData(data: string) {
  return data.replace(/\r?\n/g, "\r\n").replace(/^\./gm, "..");
}

function readResponse(socket: net.Socket) {
  return new Promise<string>((resolve, reject) => {
    let buffer = "";

    const onData = (chunk: Buffer) => {
      buffer += chunk.toString("utf8");
      const lines = buffer.split(/\r?\n/).filter(Boolean);
      const lastLine = lines[lines.length - 1];

      if (/^\d{3} /.test(lastLine ?? "")) {
        cleanup();
        resolve(buffer);
      }
    };

    const onError = (error: Error) => {
      cleanup();
      reject(error);
    };

    const cleanup = () => {
      socket.off("data", onData);
      socket.off("error", onError);
    };

    socket.on("data", onData);
    socket.on("error", onError);
  });
}

async function expect(socket: net.Socket, codes: number[]) {
  const response = await readResponse(socket);
  const code = Number(response.slice(0, 3));

  if (!codes.includes(code)) {
    throw new Error(`SMTP command failed: ${response.trim()}`);
  }

  return response;
}

async function command(socket: net.Socket, line: string, codes: number[]) {
  socket.write(`${line}\r\n`);
  return expect(socket, codes);
}

function connect(config: SmtpConfig) {
  return new Promise<net.Socket>((resolve, reject) => {
    const socket = config.secure
      ? tls.connect(config.port, config.host)
      : net.connect(config.port, config.host);

    socket.once(config.secure ? "secureConnect" : "connect", () => resolve(socket));
    socket.once("error", reject);
    socket.setTimeout(20000, () => {
      socket.destroy(new Error("SMTP connection timed out"));
    });
  });
}

function upgradeToTls(socket: net.Socket, host: string) {
  return new Promise<net.Socket>((resolve, reject) => {
    const secureSocket = tls.connect({
      socket,
      host,
      servername: host,
    });

    secureSocket.once("secureConnect", () => resolve(secureSocket));
    secureSocket.once("error", reject);
  });
}

async function getSmtpConfig(): Promise<SmtpConfig> {
  const configuration = await prisma.configuration.findFirst();

  if (
    !configuration?.email ||
    !configuration.password ||
    !configuration.smtpHost
  ) {
    throw new Error("Email service is not configured.");
  }

  return {
    host: configuration.smtpHost,
    port: configuration.smtpPort ?? (configuration.smtpSecure ? 465 : 587),
    secure: configuration.smtpSecure,
    user: configuration.email,
    password: configuration.password,
    fromName: configuration.smtpFromName || configuration.name || "HRMS Portal",
  };
}

export async function sendSystemEmail(input: SendMailInput) {
  const config = await getSmtpConfig();
  let socket = await connect(config);

  try {
    await expect(socket, [220]);
    await command(socket, `EHLO ${config.host}`, [250]);

    if (!config.secure) {
      await command(socket, "STARTTLS", [220]);
      socket = await upgradeToTls(socket, config.host);
      await command(socket, `EHLO ${config.host}`, [250]);
    }

    await command(socket, "AUTH LOGIN", [334]);
    await command(socket, Buffer.from(config.user).toString("base64"), [334]);
    await command(socket, Buffer.from(config.password).toString("base64"), [
      235,
    ]);
    await command(socket, `MAIL FROM:<${config.user}>`, [250]);
    await command(socket, `RCPT TO:<${input.to}>`, [250, 251]);
    await command(socket, "DATA", [354]);

    const from = encodeAddress(config.fromName, config.user);
    const message = [
      `From: ${from}`,
      `To: ${input.to}`,
      `Subject: ${input.subject}`,
      "MIME-Version: 1.0",
      'Content-Type: multipart/alternative; boundary="hrms-reset-boundary"',
      "",
      "--hrms-reset-boundary",
      'Content-Type: text/plain; charset="UTF-8"',
      "",
      input.text,
      "",
      "--hrms-reset-boundary",
      'Content-Type: text/html; charset="UTF-8"',
      "",
      input.html,
      "",
      "--hrms-reset-boundary--",
    ].join("\r\n");

    socket.write(`${escapeData(message)}\r\n.\r\n`);
    await expect(socket, [250]);
    await command(socket, "QUIT", [221]);
  } finally {
    socket.end();
  }
}
