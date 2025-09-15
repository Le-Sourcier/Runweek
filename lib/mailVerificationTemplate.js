module.exports = MailVerificationTemplate = ({
  VERIFICATION_LINK,
  user,
  ExpiredIn = "24 heures",
}) => {
  // Déterminer la langue de l'utilisateur
  const userLang = user?.lang || "fr";

  // Textes multilingues
  const translations = {
    en: {
      title: "Email Verification - RunWeek",
      header: "Verify Your Email Address",
      greeting: "Hello",
      message:
        "Thank you for signing up! Please confirm your email address by clicking the button below. This helps us ensure we have the correct contact information for you.",
      expiration: (time) => `This verification link is valid for ${time}.`,
      ignore:
        "If you didn't create an account, you can safely ignore this email.",
      button: "Verify Email",
      alternative:
        "If the button above does not work, copy and paste this link into your browser:",
      securityTitle: "🔒 Security Note:",
      securityText:
        "For your security, please verify your email to complete your account setup.",
      footer: "© 2025 RunWeek. All rights reserved.",
      team: "The RunWeek Team",
    },
    fr: {
      title: "Vérification d'email - RunWeek",
      header: "Vérifiez votre adresse email",
      greeting: "Bonjour",
      message:
        "Merci pour votre inscription ! Veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous. Cela nous aide à nous assurer que nous avons vos bonnes coordonnées.",
      expiration: (time) => `Ce lien de vérification est valable ${time}.`,
      ignore:
        "Si vous n'avez pas créé de compte, vous pouvez ignorer cet email en toute sécurité.",
      button: "Vérifier l'email",
      alternative:
        "Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :",
      securityTitle: "🔒 Note de sécurité :",
      securityText:
        "Pour votre sécurité, veuillez vérifier votre email pour finaliser la création de votre compte.",
      footer: "© 2025 RunWeek. Tous droits réservés.",
      team: "L'équipe RunWeek",
    },
    es: {
      title: "Verificación de email - RunWeek",
      header: "Verifique su dirección de email",
      greeting: "Hola",
      message:
        "¡Gracias por registrarse! Por favor confirme su dirección de email haciendo clic en el botón de abajo. Esto nos ayuda a asegurarnos de que tenemos su información de contacto correcta.",
      expiration: (time) =>
        `Este enlace de verificación es válido por ${time}.`,
      ignore:
        "Si no creó una cuenta, puede ignorar este correo electrónico de forma segura.",
      button: "Verificar email",
      alternative:
        "Si el botón no funciona, copie y pegue este enlace en su navegador:",
      securityTitle: "🔒 Nota de seguridad:",
      securityText:
        "Para su seguridad, por favor verifique su email para completar la configuración de su cuenta.",
      footer: "© 2025 RunWeek. Todos los derechos reservados.",
      team: "El equipo de RunWeek",
    },
    de: {
      title: "E-Mail-Verifizierung - RunWeek",
      header: "Bestätigen Sie Ihre E-Mail-Adresse",
      greeting: "Hallo",
      message:
        "Vielen Dank für Ihre Anmeldung! Bitte bestätigen Sie Ihre E-Mail-Adresse, indem Sie auf die Schaltfläche unten klicken. Dies hilft uns sicherzustellen, dass wir Ihre korrekten Kontaktdaten haben.",
      expiration: (time) => `Dieser Bestätigungslink ist ${time} gültig.`,
      ignore:
        "Wenn Sie kein Konto erstellt haben, können Sie diese E-Mail sicher ignorieren.",
      button: "E-Mail bestätigen",
      alternative:
        "Wenn die Schaltfläche nicht funktioniert, kopieren Sie diesen Link und fügen Sie ihn in Ihren Browser ein:",
      securityTitle: "🔒 Sicherheitshinweis:",
      securityText:
        "Für Ihre Sicherheit bestätigen Sie bitte Ihre E-Mail, um die Einrichtung Ihres Kontos abzuschließen.",
      footer: "© 2025 RunWeek. Alle Rechte vorbehalten.",
      team: "Das RunWeek Team",
    },
  };

  const t = translations[userLang] || translations.en;

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
                <span style="color:white;font-size:24px;font-weight:bold;">✉️</span>
              </div>
              <h1 style="margin:0;font-size:28px;color:#1f2937;font-weight:600;">${
                t.header
              }</h1>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 0 20px 20px 20px; color:#4b5563; font-size:16px; line-height:1.6;">
              <p style="margin:0 0 16px 0;">${t.greeting} ${user.fname},</p>
              <p style="margin:0 0 16px 0;">${t.message}</p>
              <p style="margin:0 0 16px 0;color:#3b82f6;font-weight:500;">⏰ ${t.expiration(
                ExpiredIn
              )}</p>
              <p style="margin:0;color:#6b7280;font-size:14px;">${t.ignore}</p>
            </td>
          </tr>

          <!-- Verify Button -->
          <tr>
            <td align="center" style="padding: 30px 0;">
              <a href="${VERIFICATION_LINK}" style="background-color:#2563eb;color:#ffffff;text-decoration:none;padding:16px 32px;border-radius:8px;display:inline-block;font-weight:600;font-size:16px;transition:background-color 0.2s;box-shadow:0 2px 4px rgba(37, 99, 235, 0.3);">
                ${t.button}
              </a>
            </td>
          </tr>

          <!-- Alternative Link -->
          <tr>
            <td style="padding: 20px; color:#6b7280; font-size:14px; line-height:1.5;background-color:#f9fafb;border-radius:8px;margin:20px;">
              <p style="margin:0 0 12px 0;font-weight:500;">${t.alternative}</p>
              <p style="margin:0;word-break:break-all;background-color:white;padding:12px;border-radius:6px;border:1px solid #e5e7eb;">
                <a href="${VERIFICATION_LINK}" style="color:#2563eb;text-decoration:none;font-family:monospace;font-size:13px;">${VERIFICATION_LINK}</a>
              </p>
            </td>
          </tr>

          <!-- Security Note -->
          <tr>
            <td style="padding: 20px; color:#6b7280; font-size:13px; line-height:1.4;background-color:#dbeafe;border-radius:8px;border-left:4px solid #2563eb;">
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
