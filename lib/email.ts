import { getResend } from "./resend";

const FROM = "CretanDesk <noreply@cretandesk.gr>";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://cretandesk.gr";

// ── Base layout ──────────────────────────────────────────────────────────────

function layout(body: string): string {
  return `<!DOCTYPE html>
<html lang="el">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F7F8FA;font-family:'DM Sans',Arial,sans-serif;">
  <div style="max-width:600px;margin:32px auto;padding:0 16px;">
    <div style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #E8EBF0;">
      <div style="background:#1B3A5C;padding:24px 32px;">
        <span style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:#ffffff;">
          Cretan<span style="color:#E8A020;">Desk</span>
        </span>
      </div>
      <div style="padding:32px;">
        ${body}
      </div>
      <div style="background:#F7F8FA;padding:16px 32px;border-top:1px solid #E8EBF0;text-align:center;">
        <p style="margin:0;color:#6B7A8D;font-size:12px;">
          CretanDesk · Crete's Experience Marketplace ·
          <a href="${APP_URL}" style="color:#1B3A5C;">cretandesk.gr</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#1B3A5C;">${text}</h1>`;
}

function para(text: string): string {
  return `<p style="margin:0 0 12px;color:#374151;font-size:15px;line-height:1.6;">${text}</p>`;
}

function detailBox(rows: [string, string][]): string {
  const items = rows
    .map(
      ([label, value]) =>
        `<tr>
          <td style="padding:8px 16px;color:#6B7A8D;font-size:13px;white-space:nowrap;">${label}</td>
          <td style="padding:8px 16px;color:#111827;font-size:13px;font-weight:600;">${value}</td>
        </tr>`
    )
    .join("");
  return `<table style="width:100%;border-collapse:collapse;background:#F7F8FA;border-radius:8px;margin:16px 0;">
    <tbody>${items}</tbody>
  </table>`;
}

function ctaButton(href: string, label: string): string {
  return `<div style="margin:24px 0 8px;">
    <a href="${href}" style="display:inline-block;background:#1B3A5C;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:15px;font-weight:600;">
      ${label}
    </a>
  </div>`;
}

// ── Send helper ──────────────────────────────────────────────────────────────

async function send({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const resend = getResend();
  if (!resend) return; // not configured yet — silent skip
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch {
    // Email failures must never break the booking flow
  }
}

// ── Email: New booking request → partner ─────────────────────────────────────

export async function sendNewBookingRequestEmail({
  partnerEmail,
  agencyName,
  excursionName,
  date,
  persons,
  notes,
}: {
  partnerEmail: string;
  agencyName: string;
  excursionName: string;
  date: string;
  persons: number;
  notes?: string | null;
}) {
  const html = layout(`
    ${heading("Νέο Αίτημα Κράτησης")}
    ${para(`Το τουριστικό γραφείο <strong>${agencyName}</strong> υπέβαλε αίτημα κράτησης για μία από τις εκδρομές σας.`)}
    ${detailBox([
      ["Εκδρομή", excursionName],
      ["Ημερομηνία", date],
      ["Σύνολο ατόμων", String(persons)],
      ...(notes ? [["Σημειώσεις", notes] as [string, string]] : []),
    ])}
    ${para("Συνδεθείτε στο CretanDesk για να αποδεχτείτε ή να απορρίψετε το αίτημα.")}
    ${ctaButton(`${APP_URL}/partner/bookings`, "Προβολή Κρατήσεων")}
  `);

  await send({
    to: partnerEmail,
    subject: `Νέο αίτημα κράτησης — ${excursionName}`,
    html,
  });
}

// ── Email: Booking accepted → agency ─────────────────────────────────────────

export async function sendBookingAcceptedEmail({
  agencyEmail,
  partnerName,
  excursionName,
  date,
  persons,
}: {
  agencyEmail: string;
  partnerName: string;
  excursionName: string;
  date: string;
  persons: number;
}) {
  const html = layout(`
    ${heading("Η Κράτησή σας Έγινε Αποδεκτή ✓")}
    ${para(`Ο πάροχος <strong>${partnerName}</strong> αποδέχτηκε το αίτημά σας.`)}
    ${detailBox([
      ["Εκδρομή", excursionName],
      ["Ημερομηνία", date],
      ["Σύνολο ατόμων", String(persons)],
      ["Κατάσταση", "Αποδεκτή"],
    ])}
    ${para("Μπορείτε να δείτε όλες τις κρατήσεις σας στο CretanDesk.")}
    ${ctaButton(`${APP_URL}/agency/bookings`, "Οι Κρατήσεις μου")}
  `);

  await send({
    to: agencyEmail,
    subject: `Κράτηση αποδεκτή — ${excursionName} (${date})`,
    html,
  });
}

// ── Email: Booking declined → agency ─────────────────────────────────────────

export async function sendBookingDeclinedEmail({
  agencyEmail,
  partnerName,
  excursionName,
  date,
}: {
  agencyEmail: string;
  partnerName: string;
  excursionName: string;
  date: string;
}) {
  const html = layout(`
    ${heading("Ενημέρωση για την Κράτησή σας")}
    ${para(`Ο πάροχος <strong>${partnerName}</strong> δεν μπόρεσε να αποδεχτεί το αίτημά σας για την παρακάτω εκδρομή.`)}
    ${detailBox([
      ["Εκδρομή", excursionName],
      ["Ημερομηνία", date],
      ["Κατάσταση", "Απορρίφθηκε"],
    ])}
    ${para("Μπορείτε να αναζητήσετε άλλες διαθέσιμες εκδρομές ή να επικοινωνήσετε απευθείας με τον πάροχο.")}
    ${ctaButton(`${APP_URL}/agency/excursions`, "Εκδρομές")}
  `);

  await send({
    to: agencyEmail,
    subject: `Ενημέρωση κράτησης — ${excursionName} (${date})`,
    html,
  });
}

// ── Email: Monthly invoice → partner ─────────────────────────────────────────

export async function sendInvoiceEmail({
  partnerEmail,
  partnerName,
  period,
  amount,
  invoiceUrl,
}: {
  partnerEmail: string;
  partnerName: string;
  period: string;         // "YYYY-MM"
  amount: number;         // euros
  invoiceUrl: string;
}) {
  const [year, month] = period.split("-");
  const periodLabel = new Date(Number(year), Number(month) - 1).toLocaleDateString("el-GR", {
    month: "long",
    year: "numeric",
  });
  const amountStr = new Intl.NumberFormat("el-GR", { style: "currency", currency: "EUR" }).format(amount);

  const html = layout(`
    ${heading(`Τιμολόγιο CretanDesk — ${periodLabel}`)}
    ${para(`Αγαπητέ ${partnerName}, παρακάτω θα βρείτε το τιμολόγιο χρέωσης υπηρεσίας για την περίοδο <strong>${periodLabel}</strong>.`)}
    ${detailBox([
      ["Περίοδος", periodLabel],
      ["Χρέωση", "0,50€ ανά άτομο"],
      ["Σύνολο", amountStr],
    ])}
    ${para("Παρακαλούμε ολοκληρώστε την πληρωμή εντός 30 ημερών.")}
    ${ctaButton(invoiceUrl, "Προβολή & Πληρωμή Τιμολογίου")}
    ${para(`<small style="color:#6B7A8D;">Εάν δεν μπορείτε να κάνετε κλικ στο κουμπί, αντιγράψτε τον παρακάτω σύνδεσμο:<br>${invoiceUrl}</small>`)}
  `);

  await send({
    to: partnerEmail,
    subject: `Τιμολόγιο CretanDesk — ${periodLabel} (${amountStr})`,
    html,
  });
}
