const nodemailer = require('nodemailer');
require('dotenv').config();

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
      <p><strong>Nom :</strong> ${nom}</p>
      <p><strong>Email :</strong> ${email}</p>
      <p><strong>Telephone :</strong> ${telephone || 'Non renseigne'}</p>
      <p><strong>Sujet :</strong> ${sujet || 'Non renseigne'}</p>
      <p><strong>Message :</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `,
  });
}

module.exports = { sendContactNotification };
