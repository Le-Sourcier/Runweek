module.exports = PasswordResetTemplate = ({
  RESET_LINK,
  user,
  ExpiredIn = "15 min",
}) => {
  // Déterminer la langue de l'utilisateur
  const userLang = user.lang || "fr";

  // Textes multilingues
  const translations = {
    fr: {
      title: "Réinitialisation de mot de passe - RunWeek",
      greeting: (name) =>
        `Bonjour <strong style="color:#1f2937;">${name}</strong>,`,
      message:
        "Nous avons reçu une demande de réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour en créer un nouveau.",
      expiration: (time) =>
        `⚠️ Ce lien n'est valable que pour <strong>${time}</strong>.`,
      ignore:
        "Si vous n'avez pas demandé de réinitialisation, vous pouvez ignorer cet email en toute sécurité.",
      button: "Réinitialiser mon mot de passe",
      alternative:
        "Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :",
      securityTitle: "🔒 Note de sécurité :",
      securityText:
        "Pour votre sécurité, ne partagez jamais ce lien et assurez-vous que votre nouveau mot de passe est fort et unique.",
      footer: "© 2025 RunWeek. Tous droits réservés.",
      team: "L'équipe RunWeek",
    },
    en: {
      title: "Password Reset - RunWeek",
      greeting: (name) =>
        `Hello <strong style="color:#1f2937;">${name}</strong>,`,
      message:
        "We received a request to reset your password. Click the button below to create a new one.",
      expiration: (time) =>
        `⚠️ This link is only valid for <strong>${time}</strong>.`,
      ignore:
        "If you didn't request a password reset, you can safely ignore this email.",
      button: "Reset my password",
      alternative:
        "If the button doesn't work, copy and paste this link into your browser:",
      securityTitle: "🔒 Security note:",
      securityText:
        "For your security, never share this link and make sure your new password is strong and unique.",
      footer: "© 2025 RunWeek. All rights reserved.",
      team: "The RunWeek Team",
    },
    es: {
      title: "Restablecimiento de contraseña - RunWeek",
      greeting: (name) =>
        `Hola <strong style="color:#1f2937;">${name}</strong>,`,
      message:
        "Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón de abajo para crear una nueva.",
      expiration: (time) =>
        `⚠️ Este enlace solo es válido por <strong>${time}</strong>.`,
      ignore:
        "Si no solicitaste un restablecimiento de contraseña, puedes ignorar este correo electrónico de forma segura.",
      button: "Restablecer mi contraseña",
      alternative:
        "Si el botón no funciona, copia y pega este enlace en tu navegador:",
      securityTitle: "🔒 Nota de seguridad:",
      securityText:
        "Para tu seguridad, nunca compartas este enlace y asegúrate de que tu nueva contraseña sea fuerte y única.",
      footer: "© 2025 RunWeek. Todos los derechos reservados.",
      team: "El equipo de RunWeek",
    },
    de: {
      title: "Passwort zurücksetzen - RunWeek",
      greeting: (name) =>
        `Hallo <strong style="color:#1f2937;">${name}</strong>,`,
      message:
        "Wir haben eine Anfrage zum Zurücksetzen Ihres Passworts erhalten. Klicken Sie auf die Schaltfläche unten, um ein neues zu erstellen.",
      expiration: (time) =>
        `⚠️ Dieser Link ist nur <strong>${time}</strong> gültig.`,
      ignore:
        "Wenn Sie kein Zurücksetzen des Passworts angefordert haben, können Sie diese E-Mail sicher ignorieren.",
      button: "Mein Passwort zurücksetzen",
      alternative:
        "Wenn die Schaltfläche nicht funktioniert, kopieren Sie diesen Link und fügen Sie ihn in Ihren Browser ein:",
      securityTitle: "🔒 Sicherheitshinweis:",
      securityText:
        "Für Ihre Sicherheit: Teilen Sie diesen Link niemals und stellen Sie sicher, dass Ihr neues Passwort stark und einzigartig ist.",
      footer: "© 2025 RunWeek. Alle Rechte vorbehalten.",
      team: "Das RunWeek Team",
    },
  };

  const t = translations[userLang] || translations.fr;

  return `<!DOCTYPE html>
<html lang="${userLang}" style="margin:0;padding:0;">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${t.title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" bgcolor="#f8fafc" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.05);border:1px solid #e2e8f0;padding:40px;">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom: 30px;">
              <div style="background-color:#2563eb;width:60px;height:60px;border-radius:12px;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;">
                <span style="color:white;font-size:24px;font-weight:bold;">🔒</span>
              </div>
              <h1 style="margin:0;font-size:28px;color:#1f2937;font-weight:600;">${
                t.title.split(" - ")[0]
              }</h1>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 0 20px 20px 20px; color:#4b5563; font-size:16px; line-height:1.6;">
              <p style="margin:0 0 16px 0;">${t.greeting(user.fname)}</p>
              <p style="margin:0 0 16px 0;">${t.message}</p>
              <p style="margin:0 0 16px 0;color:#ef4444;font-weight:500;">${t.expiration(
                ExpiredIn
              )}</p>
              <p style="margin:0;color:#6b7280;font-size:14px;">${t.ignore}</p>
            </td>
          </tr>

          <!-- Reset Button -->
          <tr>
            <td align="center" style="padding: 30px 0;">
              <a href="${RESET_LINK}" style="background-color:#2563eb;color:#ffffff;text-decoration:none;padding:16px 32px;border-radius:8px;display:inline-block;font-weight:600;font-size:16px;transition:background-color 0.2s;box-shadow:0 2px 4px rgba(37, 99, 235, 0.3);">
                ${t.button}
              </a>
            </td>
          </tr>

          <!-- Alternative Link -->
          <tr>
            <td style="padding: 20px; color:#6b7280; font-size:14px; line-height:1.5;background-color:#f9fafb;border-radius:8px;margin:20px;">
              <p style="margin:0 0 12px 0;font-weight:500;">${t.alternative}</p>
              <p style="margin:0;word-break:break-all;background-color:white;padding:12px;border-radius:6px;border:1px solid #e5e7eb;">
                <a href="${RESET_LINK}" style="color:#2563eb;text-decoration:none;font-family:monospace;font-size:13px;">${RESET_LINK}</a>
              </p>
            </td>
          </tr>

          <!-- Security Note -->
          <tr>
            <td style="padding: 20px; color:#6b7280; font-size:13px; line-height:1.4;background-color:#fef3c7;border-radius:8px;border-left:4px solid #f59e0b;">
              <p style="margin:0;font-weight:500;">${t.securityTitle}</p>
              <p style="margin:8px 0 0 0;">${t.securityText}</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 40px;">
              <div style="border-top:1px solid #e5e7eb;padding-top:20px;">
                <p style="margin:0;font-size:12px;color:#9ca3af;">
                  ${t.footer}<br>
                  <span style="font-size:11px;">${t.team}</span>
                </p>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};
