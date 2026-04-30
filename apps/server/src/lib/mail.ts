import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
});

type SendUserCreatedEmailParams = {
  name: string;
  email: string;
  password: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getLoginUrl() {
  const webUrl = process.env.WEB_URL ?? "http://localhost:5173";
  return `${webUrl.replace(/\/$/, "")}/login`;
}

export async function sendUserCreatedEmail({ name, email, password }: SendUserCreatedEmailParams) {
  const loginUrl = getLoginUrl();
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safePassword = escapeHtml(password);
  const safeLoginUrl = escapeHtml(loginUrl);

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: email,
    subject: "Вас добавили в QITask",
    text: [
      `Здравствуйте, ${name}!`,
      "",
      "Вас добавили в QITask.",
      "",
      "Данные для входа:",
      `Email: ${email}`,
      `Пароль: ${password}`,
      "",
      `Войти: ${loginUrl}`,
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5;">
        <h2 style="margin: 0 0 16px;">Вас добавили в QITask</h2>
        <p>Здравствуйте, ${safeName}!</p>
        <p>Для вас создали учетную запись. Используйте эти данные для входа:</p>
        <p>
          <strong>Email:</strong> ${safeEmail}<br />
          <strong>Пароль:</strong> ${safePassword}
        </p>
        <p>
          <a href="${safeLoginUrl}" style="display: inline-block; padding: 10px 16px; border-radius: 8px; background: #2563eb; color: #ffffff; text-decoration: none;">
            Войти
          </a>
        </p>
        <p style="color: #475569; font-size: 14px;">Если кнопка не открывается, перейдите по ссылке: ${safeLoginUrl}</p>
      </div>
    `,
  });
}
