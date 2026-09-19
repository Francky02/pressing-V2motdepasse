import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface SendPasswordResetParams {
  to: string;
  userName?: string;
  resetUrl: string;
  expiresInMinutes?: number;
}

export interface MailerResult {
  success: boolean;
  status: 'sent' | 'smtp_not_configured' | 'failed';
  messageId?: string;
  resetUrl?: string;
  error?: string;
}

let cachedTransporter: Transporter | null = null;

/**
 * Vérifie si les variables d'environnement SMTP réelles sont fournies.
 */
export function isSmtpConfigured(): boolean {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASSWORD?.trim();
  return Boolean(host && user && pass);
}

/**
 * Initialise ou retourne le transporteur nodemailer configuré en SMTP réel.
 * Retourne null si aucune configuration SMTP réelle n'est présente.
 */
export async function getTransporter(): Promise<Transporter | null> {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  if (!isSmtpConfigured()) {
    return null;
  }

  const host = process.env.SMTP_HOST!.trim();
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER!.trim();
  const pass = process.env.SMTP_PASSWORD!.trim();
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  });

  console.log(`[Mailer] Transport SMTP réel configuré avec succès (${host}:${port})`);
  return cachedTransporter;
}

/**
 * Envoie un e-mail de réinitialisation si SMTP est configuré,
 * ou gère le cas de développement sans bloquer l'application ni simuler un faux envoi.
 */
export async function sendPasswordResetEmail({
  to,
  userName = 'Utilisateur',
  resetUrl,
  expiresInMinutes = 60,
}: SendPasswordResetParams): Promise<MailerResult> {
  if (!isSmtpConfigured()) {
    console.warn(`[Mailer] ⚠️  Aucun serveur SMTP réel configuré (SMTP_HOST, SMTP_USER, SMTP_PASSWORD non définis).`);
    console.warn(`[Mailer] ℹ️  Aucun e-mail n'a été expédié.`);
    console.info(`[Mailer] 🔗 [DEV] Lien de réinitialisation direct généré :\n       ${resetUrl}\n`);
    return {
      success: false,
      status: 'smtp_not_configured',
      resetUrl,
      error: 'SMTP_NOT_CONFIGURED',
    };
  }

  try {
    const transporter = await getTransporter();
    if (!transporter) {
      throw new Error('Impossible d\'initialiser le transporteur SMTP');
    }
    const fromAddress = process.env.MAIL_FROM?.trim() || '"Relancio Sécurité" <noreply@relancio.com>';

    const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Réinitialisation de votre mot de passe - Relancio</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #0b1120;
      color: #e2e8f0;
    }
    .container {
      max-width: 580px;
      margin: 30px auto;
      background: #111827;
      border: 1px solid #1f2937;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4);
    }
    .header {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      padding: 32px 32px 24px;
      text-align: center;
      border-bottom: 1px solid #1f2937;
    }
    .logo-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #2563eb, #3b82f6);
      border-radius: 12px;
      color: #ffffff;
      font-size: 22px;
      font-weight: bold;
      margin-bottom: 12px;
    }
    .brand-title {
      color: #ffffff;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.025em;
      margin: 0;
    }
    .brand-subtitle {
      color: #94a3b8;
      font-size: 13px;
      margin-top: 4px;
    }
    .body {
      padding: 32px;
      line-height: 1.6;
    }
    .greeting {
      font-size: 17px;
      font-weight: 600;
      color: #f8fafc;
      margin-bottom: 16px;
    }
    .text {
      font-size: 15px;
      color: #cbd5e1;
      margin-bottom: 24px;
    }
    .button-container {
      text-align: center;
      margin: 32px 0;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: #ffffff !important;
      text-decoration: none;
      font-size: 15px;
      font-weight: 600;
      padding: 14px 32px;
      border-radius: 10px;
      box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.4);
    }
    .notice-box {
      background-color: #1e293b;
      border-left: 4px solid #3b82f6;
      border-radius: 6px;
      padding: 14px 16px;
      font-size: 13px;
      color: #94a3b8;
      margin: 24px 0;
    }
    .link-fallback {
      font-size: 12px;
      color: #64748b;
      word-break: break-all;
      margin-top: 20px;
    }
    .footer {
      background-color: #0a0f1d;
      padding: 20px 32px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid #1e293b;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-badge">R</div>
      <h1 class="brand-title">Relancio</h1>
      <p class="brand-subtitle">Sécurité de votre compte</p>
    </div>
    <div class="body">
      <p class="greeting">Bonjour ${userName},</p>
      <p class="text">
        Nous avons reçu une demande de réinitialisation du mot de passe pour votre compte Relancio.
      </p>
      <p class="text">
        Pour choisir un nouveau mot de passe et récupérer l'accès à votre espace, cliquez sur le bouton sécurisé ci-dessous :
      </p>
      <div class="button-container">
        <a href="${resetUrl}" class="button" target="_blank" rel="noopener noreferrer">
          Réinitialiser mon mot de passe
        </a>
      </div>
      <div class="notice-box">
        <strong>Important :</strong> Ce lien est valable pendant <strong>${expiresInMinutes} minutes</strong> et n'est utilisable qu'une seule fois.
      </div>
      <p class="text" style="font-size: 13px; color: #94a3b8;">
        Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sérénité. Votre mot de passe actuel demeure strictement inchangé et votre compte est sécurisé.
      </p>
      <div class="link-fallback">
        Si le bouton ne fonctionne pas, copiez-collez l'adresse suivante dans votre navigateur :<br>
        <a href="${resetUrl}" style="color: #3b82f6;">${resetUrl}</a>
      </div>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Relancio. Tous droits réservés.<br>
      Plateforme de Gestion de Factures & Recouvrement
    </div>
  </div>
</body>
</html>
    `.trim();

    const textContent = `
Bonjour ${userName},

Nous avons reçu une demande de réinitialisation du mot de passe pour votre compte Relancio.

Pour choisir un nouveau mot de passe, ouvrez le lien suivant dans votre navigateur :
${resetUrl}

Ce lien est valable pendant ${expiresInMinutes} minutes et n'est utilisable qu'une seule fois.

Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité. Votre mot de passe actuel reste inchangé.

Cordialement,
L'équipe Relancio
    `.trim();

    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject: 'Réinitialisation de votre mot de passe - Relancio',
      text: textContent,
      html: htmlContent,
    });

    console.log(`[Mailer] E-mail envoyé avec succès à ${to} (MessageId: ${info.messageId})`);

    return {
      success: true,
      status: 'sent',
      messageId: info.messageId,
      resetUrl,
    };
  } catch (error: any) {
    console.error('[Mailer] Erreur lors de l\'envoi de l\'e-mail:', error?.message || error);
    return {
      success: false,
      status: 'failed',
      resetUrl,
      error: error?.message || 'Échec de l\'envoi de l\'e-mail',
    };
  }
}
