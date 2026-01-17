import { Resend } from "resend";
import { env } from "~/env";

// Lazy initialization to avoid build-time errors when RESEND_API_KEY is not set
let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    if (!env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    resendClient = new Resend(env.RESEND_API_KEY);
  }
  return resendClient;
}

// Default sender - can be customized per environment
const DEFAULT_FROM = "Appel Offre SaaS <onboarding@resend.dev>";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(options: SendEmailOptions) {
  const resend = getResendClient();

  const { data, error } = await resend.emails.send({
    from: options.from ?? DEFAULT_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });

  if (error) {
    console.error("Failed to send email:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
}

export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string
): Promise<void> {
  await sendEmail({
    to: email,
    subject: "Réinitialisation de votre mot de passe - Appel Offre SaaS",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 24px;">Réinitialisation de mot de passe</h1>

  <p>Bonjour,</p>

  <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Appel Offre SaaS.</p>

  <p style="margin: 32px 0;">
    <a href="${resetUrl}"
       style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
      Réinitialiser mon mot de passe
    </a>
  </p>

  <p style="color: #666; font-size: 14px;">
    Ce lien expire dans <strong>1 heure</strong>.
  </p>

  <p style="color: #666; font-size: 14px;">
    Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.
    Votre mot de passe restera inchangé.
  </p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">

  <p style="color: #999; font-size: 12px;">
    Cet email a été envoyé automatiquement par Appel Offre SaaS.<br>
    Si vous avez des questions, contactez notre support.
  </p>
</body>
</html>
    `.trim(),
  });
}

export async function sendEmailChangeVerification(
  newEmail: string,
  verifyUrl: string
): Promise<void> {
  await sendEmail({
    to: newEmail,
    subject: "Confirmez votre nouvelle adresse email - Appel Offre SaaS",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 24px;">Confirmation d'adresse email</h1>

  <p>Bonjour,</p>

  <p>Vous avez demandé à changer l'adresse email de votre compte Appel Offre SaaS vers cette adresse.</p>

  <p style="margin: 32px 0;">
    <a href="${verifyUrl}"
       style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
      Confirmer cette adresse email
    </a>
  </p>

  <p style="color: #666; font-size: 14px;">
    Ce lien expire dans <strong>1 heure</strong>.
  </p>

  <p style="color: #666; font-size: 14px;">
    Si vous n'avez pas demandé ce changement, vous pouvez ignorer cet email en toute sécurité.
  </p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">

  <p style="color: #999; font-size: 12px;">
    Cet email a été envoyé automatiquement par Appel Offre SaaS.<br>
    Si vous avez des questions, contactez notre support.
  </p>
</body>
</html>
    `.trim(),
  });
}

export async function sendAccountDeletionConfirmation(
  email: string
): Promise<void> {
  await sendEmail({
    to: email,
    subject: "Confirmation de suppression de compte - Appel Offre SaaS",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 24px;">Compte supprimé</h1>

  <p>Bonjour,</p>

  <p>Nous vous confirmons que votre compte Appel Offre SaaS a été supprimé avec succès.</p>

  <p>Toutes vos données personnelles ont été définitivement effacées conformément au RGPD.</p>

  <p style="color: #666; font-size: 14px; margin-top: 24px;">
    Si vous n'êtes pas à l'origine de cette suppression, veuillez nous contacter immédiatement.
  </p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">

  <p style="color: #999; font-size: 12px;">
    Cet email a été envoyé automatiquement par Appel Offre SaaS.<br>
    Merci d'avoir utilisé notre service.
  </p>
</body>
</html>
    `.trim(),
  });
}
