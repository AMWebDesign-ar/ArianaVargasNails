import { Resend } from "resend";

type BookingEmailParams = {
  serviceName: string;
  start: string;
  end: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes?: string;
  eventId?: string;
  bookingToken?: string;
};

type EmailSendResult = {
  clientEmailId?: string;
  adminEmailId?: string;
  errors: string[];
};

const TIME_ZONE = "America/Argentina/Buenos_Aires";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("Falta RESEND_API_KEY en variables de entorno.");
  }

  return new Resend(apiKey);
}

function getFromEmail() {
  return (
    process.env.RESEND_FROM_EMAIL ||
    "Ariana Vargas Nails <reservas@arianavargasnails.com.ar>"
  );
}

function getAdminEmail() {
  return process.env.BOOKING_ADMIN_EMAIL || "";
}

function getLocation() {
  return process.env.BOOKING_LOCATION || "Córdoba 3980, Mar del Plata";
}

function getPublicSiteUrl() {
  return (
    process.env.PUBLIC_SITE_URL || "https://arianavargasnails.com.ar"
  ).replace(/\/$/, "");
}

function getManageBookingUrl(token?: string) {
  if (!token) return "";

  return `${getPublicSiteUrl()}/reserva/${token}`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value: string) {
  const date = new Date(value);

  return new Intl.DateTimeFormat("es-AR", {
    timeZone: TIME_ZONE,
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatTime(value: string) {
  const date = new Date(value);

  return new Intl.DateTimeFormat("es-AR", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function buildClientHtml(params: BookingEmailParams) {
  const serviceName = escapeHtml(params.serviceName);
  const clientName = escapeHtml(params.clientName);
  const clientPhone = escapeHtml(params.clientPhone);
  const notes = params.notes ? escapeHtml(params.notes) : "";
  const date = formatDate(params.start);
  const startTime = formatTime(params.start);
  const endTime = formatTime(params.end);
  const location = escapeHtml(getLocation());
  const manageUrl = getManageBookingUrl(params.bookingToken);

  return `
  <div style="margin:0;padding:0;background:#fff7fa;font-family:Arial,Helvetica,sans-serif;color:#5f4050;">
    <div style="max-width:620px;margin:0 auto;padding:28px 18px;">
      <div style="background:#ffffff;border:1px solid #f0dfe6;border-radius:24px;padding:28px;box-shadow:0 12px 30px rgba(176,112,112,0.12);">
        <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#b07070;">
          Ariana Vargas Nails
        </p>

        <h1 style="margin:0 0 16px;font-size:26px;line-height:1.25;color:#6f4e5f;">
          // Turno confirmado 💅
          Turno confirmado
        </h1>

        <p style="margin:0 0 22px;font-size:16px;line-height:1.6;color:#7a5a68;">
          Hola ${clientName}, tu turno fue reservado correctamente.
        </p>

        <div style="background:#fff1f6;border:1px solid #f3c8d8;border-radius:18px;padding:18px;margin:22px 0;">
          <p style="margin:0 0 10px;font-size:15px;"><strong>Servicio:</strong> ${serviceName}</p>
          <p style="margin:0 0 10px;font-size:15px;"><strong>Fecha:</strong> ${date}</p>
          <p style="margin:0 0 10px;font-size:15px;"><strong>Horario:</strong> ${startTime} a ${endTime}</p>
          <p style="margin:0 0 10px;font-size:15px;"><strong>Dirección:</strong> ${location}</p>
          <p style="margin:0;font-size:15px;"><strong>Teléfono registrado:</strong> ${clientPhone}</p>
        </div>

        ${
          notes
            ? `<div style="background:#fffafc;border:1px solid #f0dfe6;border-radius:18px;padding:16px;margin:18px 0;">
                <p style="margin:0;font-size:14px;line-height:1.5;"><strong>Notas:</strong> ${notes}</p>
              </div>`
            : ""
        }
        ${
          manageUrl
            ? `<div style="margin:24px 0;">
                <a href="${manageUrl}" style="display:inline-block;background:#B07070;color:#ffffff;text-decoration:none;border-radius:999px;padding:12px 20px;font-size:14px;font-weight:bold;">
                  Ver, modificar o cancelar mi turno
                </a>
              </div>`
            : ""
        }
        <p style="margin:22px 0 0;font-size:14px;line-height:1.6;color:#8f6f7e;">
          Si necesitás modificar o cancelar el turno, respondé este email o escribinos por WhatsApp.
        </p>

        <p style="margin:22px 0 0;font-size:14px;line-height:1.6;color:#8f6f7e;">
          Gracias por elegirnos,<br />
          <strong>Ariana Vargas Nails</strong>
        </p>
      </div>
    </div>
  </div>
  `;
}

function buildClientText(params: BookingEmailParams) {
  return [
    "Ariana Vargas Nails",
    "",
    "Turno confirmado",
    "",
    `Hola ${params.clientName}, tu turno fue reservado correctamente.`,
    "",
    `Servicio: ${params.serviceName}`,
    `Fecha: ${formatDate(params.start)}`,
    `Horario: ${formatTime(params.start)} a ${formatTime(params.end)}`,
    `Dirección: ${getLocation()}`,
    `Teléfono registrado: ${params.clientPhone}`,
    params.notes ? `Notas: ${params.notes}` : "",
    "",
    params.bookingToken
    ? `Gestionar turno: ${getManageBookingUrl(params.bookingToken)}`
    : "",
    "Si necesitás modificar o cancelar el turno, respondé este email o escribinos por WhatsApp.",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildAdminHtml(params: BookingEmailParams) {
  const serviceName = escapeHtml(params.serviceName);
  const clientName = escapeHtml(params.clientName);
  const clientEmail = escapeHtml(params.clientEmail);
  const clientPhone = escapeHtml(params.clientPhone);
  const notes = params.notes ? escapeHtml(params.notes) : "";
  const date = formatDate(params.start);
  const startTime = formatTime(params.start);
  const endTime = formatTime(params.end);

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;color:#333;background:#fafafa;padding:24px;">
    <div style="max-width:620px;margin:0 auto;background:white;border:1px solid #eee;border-radius:18px;padding:24px;">
      <h1 style="margin:0 0 16px;font-size:22px;">Nuevo turno reservado</h1>

      <p><strong>Servicio:</strong> ${serviceName}</p>
      <p><strong>Fecha:</strong> ${date}</p>
      <p><strong>Horario:</strong> ${startTime} a ${endTime}</p>

      <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />

      <p><strong>Cliente:</strong> ${clientName}</p>
      <p><strong>Email:</strong> ${clientEmail}</p>
      <p><strong>Teléfono:</strong> ${clientPhone}</p>
      ${notes ? `<p><strong>Notas:</strong> ${notes}</p>` : ""}

      ${
        params.eventId
          ? `<p style="font-size:12px;color:#777;">Google Event ID: ${escapeHtml(params.eventId)}</p>`
          : ""
      }
    </div>
  </div>
  `;
}

function buildAdminText(params: BookingEmailParams) {
  return [
    "Nuevo turno reservado",
    "",
    `Servicio: ${params.serviceName}`,
    `Fecha: ${formatDate(params.start)}`,
    `Horario: ${formatTime(params.start)} a ${formatTime(params.end)}`,
    "",
    `Cliente: ${params.clientName}`,
    `Email: ${params.clientEmail}`,
    `Teléfono: ${params.clientPhone}`,
    params.notes ? `Notas: ${params.notes}` : "",
    params.eventId ? `Google Event ID: ${params.eventId}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const resend = getResendClient();

  const { data, error } = await resend.emails.send({
  from: getFromEmail(),
  to: [params.to],
  subject: params.subject,
  html: params.html,
  text: params.text,
  replyTo: process.env.BOOKING_ADMIN_EMAIL || undefined,
});

  if (error) {
    throw new Error(JSON.stringify(error));
  }

  return data?.id;
}

export async function sendBookingConfirmationEmails(
  params: BookingEmailParams
): Promise<EmailSendResult> {
  const errors: string[] = [];
  let clientEmailId: string | undefined;
  let adminEmailId: string | undefined;

  try {
    clientEmailId = await sendEmail({
      to: params.clientEmail,
      subject: `Turno confirmado - ${params.serviceName}`,
      html: buildClientHtml(params),
      text: buildClientText(params),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error enviando email al cliente";
    errors.push(`cliente: ${message}`);
  }

  const adminEmail = getAdminEmail();

  if (adminEmail) {
    try {
      adminEmailId = await sendEmail({
        to: adminEmail,
        subject: `Nuevo turno - ${params.serviceName} - ${params.clientName}`,
        html: buildAdminHtml(params),
        text: buildAdminText(params),
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error enviando email interno";
      errors.push(`admin: ${message}`);
    }
  }
  

  return {
    clientEmailId,
    adminEmailId,
    errors,
  };
}
export async function sendBookingCancellationEmails(
  params: BookingEmailParams
): Promise<EmailSendResult> {
  const errors: string[] = [];
  let clientEmailId: string | undefined;
  let adminEmailId: string | undefined;

  try {
    clientEmailId = await sendEmail({
      to: params.clientEmail,
      subject: "Turno cancelado - Ariana Vargas Nails",
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;color:#5f4050;background:#fff7fa;padding:24px;">
          <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #f0dfe6;border-radius:20px;padding:24px;">
            <h1 style="margin:0 0 16px;font-size:22px;color:#6f4e5f;">Turno cancelado</h1>
            <p>Hola ${escapeHtml(params.clientName)}, tu turno fue cancelado correctamente.</p>
            <p><strong>Servicio:</strong> ${escapeHtml(params.serviceName)}</p>
            <p><strong>Fecha:</strong> ${formatDate(params.start)}</p>
            <p><strong>Horario:</strong> ${formatTime(params.start)} a ${formatTime(params.end)}</p>
            <p>Si necesitás reservar nuevamente, podés hacerlo desde la web.</p>
          </div>
        </div>
      `,
      text: [
        "Turno cancelado - Ariana Vargas Nails",
        "",
        `Hola ${params.clientName}, tu turno fue cancelado correctamente.`,
        `Servicio: ${params.serviceName}`,
        `Fecha: ${formatDate(params.start)}`,
        `Horario: ${formatTime(params.start)} a ${formatTime(params.end)}`,
      ].join("\n"),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error enviando email al cliente";
    errors.push(`cliente: ${message}`);
  }

  const adminEmail = getAdminEmail();

  if (adminEmail) {
    try {
      adminEmailId = await sendEmail({
        to: adminEmail,
        subject: `Turno cancelado - ${params.serviceName} - ${params.clientName}`,
        html: `
          <div style="font-family:Arial,Helvetica,sans-serif;color:#333;background:#fafafa;padding:24px;">
            <div style="max-width:620px;margin:0 auto;background:white;border:1px solid #eee;border-radius:18px;padding:24px;">
              <h1 style="margin:0 0 16px;font-size:22px;">Turno cancelado</h1>
              <p><strong>Servicio:</strong> ${escapeHtml(params.serviceName)}</p>
              <p><strong>Cliente:</strong> ${escapeHtml(params.clientName)}</p>
              <p><strong>Email:</strong> ${escapeHtml(params.clientEmail)}</p>
              <p><strong>Teléfono:</strong> ${escapeHtml(params.clientPhone)}</p>
              <p><strong>Fecha:</strong> ${formatDate(params.start)}</p>
              <p><strong>Horario:</strong> ${formatTime(params.start)} a ${formatTime(params.end)}</p>
            </div>
          </div>
        `,
        text: [
          "Turno cancelado",
          "",
          `Servicio: ${params.serviceName}`,
          `Cliente: ${params.clientName}`,
          `Email: ${params.clientEmail}`,
          `Teléfono: ${params.clientPhone}`,
          `Fecha: ${formatDate(params.start)}`,
          `Horario: ${formatTime(params.start)} a ${formatTime(params.end)}`,
        ].join("\n"),
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error enviando email interno";
      errors.push(`admin: ${message}`);
    }
  }

  return {
    clientEmailId,
    adminEmailId,
    errors,
  };
}

export async function sendBookingRescheduledEmails(
  params: BookingEmailParams
): Promise<EmailSendResult> {
  const errors: string[] = [];
  let clientEmailId: string | undefined;
  let adminEmailId: string | undefined;

  try {
    clientEmailId = await sendEmail({
      to: params.clientEmail,
      subject: "Turno modificado - Ariana Vargas Nails",
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;color:#5f4050;background:#fff7fa;padding:24px;">
          <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #f0dfe6;border-radius:20px;padding:24px;">
            <h1 style="margin:0 0 16px;font-size:22px;color:#6f4e5f;">Turno modificado</h1>
            <p>Hola ${escapeHtml(params.clientName)}, tu turno fue modificado correctamente.</p>
            <p><strong>Servicio:</strong> ${escapeHtml(params.serviceName)}</p>
            <p><strong>Fecha:</strong> ${formatDate(params.start)}</p>
            <p><strong>Horario:</strong> ${formatTime(params.start)} a ${formatTime(params.end)}</p>
            <p><strong>Dirección:</strong> ${escapeHtml(getLocation())}</p>
          </div>
        </div>
      `,
      text: [
        "Turno modificado - Ariana Vargas Nails",
        "",
        `Hola ${params.clientName}, tu turno fue modificado correctamente.`,
        `Servicio: ${params.serviceName}`,
        `Fecha: ${formatDate(params.start)}`,
        `Horario: ${formatTime(params.start)} a ${formatTime(params.end)}`,
        `Dirección: ${getLocation()}`,
      ].join("\n"),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error enviando email al cliente";
    errors.push(`cliente: ${message}`);
  }

  const adminEmail = getAdminEmail();

  if (adminEmail) {
    try {
      adminEmailId = await sendEmail({
        to: adminEmail,
        subject: `Turno modificado - ${params.serviceName} - ${params.clientName}`,
        html: `
          <div style="font-family:Arial,Helvetica,sans-serif;color:#333;background:#fafafa;padding:24px;">
            <div style="max-width:620px;margin:0 auto;background:white;border:1px solid #eee;border-radius:18px;padding:24px;">
              <h1 style="margin:0 0 16px;font-size:22px;">Turno modificado</h1>
              <p><strong>Servicio:</strong> ${escapeHtml(params.serviceName)}</p>
              <p><strong>Cliente:</strong> ${escapeHtml(params.clientName)}</p>
              <p><strong>Email:</strong> ${escapeHtml(params.clientEmail)}</p>
              <p><strong>Teléfono:</strong> ${escapeHtml(params.clientPhone)}</p>
              <p><strong>Fecha:</strong> ${formatDate(params.start)}</p>
              <p><strong>Horario:</strong> ${formatTime(params.start)} a ${formatTime(params.end)}</p>
            </div>
          </div>
        `,
        text: [
          "Turno modificado",
          "",
          `Servicio: ${params.serviceName}`,
          `Cliente: ${params.clientName}`,
          `Email: ${params.clientEmail}`,
          `Teléfono: ${params.clientPhone}`,
          `Fecha: ${formatDate(params.start)}`,
          `Horario: ${formatTime(params.start)} a ${formatTime(params.end)}`,
        ].join("\n"),
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error enviando email interno";
      errors.push(`admin: ${message}`);
    }
  }

  return {
    clientEmailId,
    adminEmailId,
    errors,
  };
}

export async function sendClientLoginCodeEmail(params: {
  email: string;
  code: string;
}): Promise<{ emailId?: string; errors: string[] }> {
  const errors: string[] = [];
  let emailId: string | undefined;

  try {
    emailId = await sendEmail({
      to: params.email,
      subject: "Código de acceso - Ariana Vargas Nails",
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;color:#5f4050;background:#fff7fa;padding:24px;">
          <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #f0dfe6;border-radius:20px;padding:24px;">
            <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#b07070;">
              Ariana Vargas Nails
            </p>

            <h1 style="margin:0 0 16px;font-size:22px;color:#6f4e5f;">
              Código de acceso
            </h1>

            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">
              Usá este código para ingresar a tus turnos:
            </p>

            <div style="font-size:30px;font-weight:bold;letter-spacing:0.18em;background:#fff1f6;border:1px solid #f3c8d8;border-radius:16px;padding:16px;text-align:center;color:#6f4e5f;">
              ${escapeHtml(params.code)}
            </div>

            <p style="margin:18px 0 0;font-size:13px;line-height:1.6;color:#8f6f7e;">
              Este código vence en 10 minutos. Si no lo pediste, podés ignorar este email.
            </p>
          </div>
        </div>
      `,
      text: [
        "Ariana Vargas Nails",
        "",
        "Código de acceso",
        "",
        `Tu código es: ${params.code}`,
        "",
        "Este código vence en 10 minutos. Si no lo pediste, podés ignorar este email.",
      ].join("\n"),
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error enviando código de acceso";

    errors.push(message);
  }

  return {
    emailId,
    errors,
  };
}