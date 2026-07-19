const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
});

async function sendMfaCode(email, code) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Votre code de connexion Cartes&Mots",
    html: `<p>Votre code de vérification est : <strong style="font-size:24px;">${code}</strong></p><p>Il expire dans 10 minutes.</p>`,
  });
}

module.exports = { sendMfaCode };