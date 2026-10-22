const nodemailer = require('nodemailer');
require('dotenv').config();

function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendContactNotification(contact) {
  const { nom, email, telephone, sujet, message } = contact;

  await transporter.sendMail({
    from: `"Site OliTech" <${process.env.SMTP_USER}>`,
    to: process.env.NOTIFY_EMAIL,
    replyTo: email,
    subject: `Nouveau message de contact${sujet ? ` — ${sujet}` : ''}`,
    text: [
      `Nom: ${nom}`,
      `Email: ${email}`,
      `Telephone: ${telephone || 'Non renseigne'}`,
      `Sujet: ${sujet || 'Non renseigne'}`,
      '',
      'Message:',
      message,
    ].join('\n'),
    html: `
      <h2>Nouveau message depuis le site OliTech</h2>
      <p><strong>Nom :</strong> ${escapeHtml(nom)}</p>
      <p><strong>Email :</strong> ${escapeHtml(email)}</p>
      <p><strong>Telephone :</strong> ${escapeHtml(telephone) || 'Non renseigne'}</p>
      <p><strong>Sujet :</strong> ${escapeHtml(sujet) || 'Non renseigne'}</p>
      <p><strong>Message :</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
    `,
  });
}

async function sendCvOrderPaidEmail(order, downloadUrl) {
  await transporter.sendMail({
    from: `"Site OliTech" <${process.env.SMTP_USER}>`,
    to: order.buyer_email,
    subject: 'Votre CV OliTech est pret a telecharger',
    text: [
      `Bonjour ${order.buyer_name},`,
      '',
      'Votre paiement a bien ete confirme. Votre CV personnalise est pret.',
      `Telechargez-le ici : ${downloadUrl}`,
      '',
      'Merci de votre confiance,',
      "L'equipe OliTech",
    ].join('\n'),
    html: `
      <p>Bonjour ${escapeHtml(order.buyer_name)},</p>
      <p>Votre paiement a bien ete confirme. Votre CV personnalise est pret.</p>
      <p><a href="${escapeHtml(downloadUrl)}">Telecharger mon CV</a></p>
      <p>Merci de votre confiance,<br>L'equipe OliTech</p>
    `,
  });
}

module.exports = { sendContactNotification, sendCvOrderPaidEmail };
