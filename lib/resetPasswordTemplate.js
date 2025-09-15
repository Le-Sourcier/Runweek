module.exports = resetPasswordTemplate = ({
  resetCode,
  user,
  ExpiredIn = "10 min",
}) => {
  // Déterminer la langue de l'utilisateur
  const userLang = user?.lang || "fr";

  // Textes multilingues
  const translations = {
    fr: {
      title: "Code de vérification - RunWeek",
      header: "Code de vérification",
      subtitle: "Voici votre code à usage unique :",
      expiration: (time) => `Ce code expirera dans ${time}.`,
      warning:
        "Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer ce message.",
      footer: "© 2025 RunWeek. Tous droits réservés.",
    },
    en: {
      title: "Verification Code - RunWeek",
      header: "Verification Code",
      subtitle: "Here is your one-time code:",
      expiration: (time) => `This code will expire in ${time}.`,
      warning: "If you didn't request this, please ignore this message.",
      footer: "© 2025 RunWeek. All rights reserved.",
    },
    es: {
      title: "Código de verificación - RunWeek",
      header: "Código de verificación",
      subtitle: "Aquí está su código de un solo uso:",
      expiration: (time) => `Este código expirará en ${time}.`,
      warning: "Si no solicitó esto, por favor ignore este mensaje.",
      footer: "© 2025 RunWeek. Todos los derechos reservados.",
    },
    de: {
      title: "Bestätigungscode - RunWeek",
      header: "Bestätigungscode",
      subtitle: "Hier ist Ihr Einmal-Code:",
      expiration: (time) => `Dieser Code läuft in ${time} ab.`,
      warning:
        "Wenn Sie dies nicht angefordert haben, ignorieren Sie diese Nachricht bitte.",
      footer: "© 2025 RunWeek. Alle Rechte vorbehalten.",
    },
  };

  const t = translations[userLang] || translations.fr;

  return `<!DOCTYPE html>
<html lang="${userLang}">
  <head>
    <meta charset="UTF-8" />
    <title>${t.title}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f8fafc;
        color: #334155;
        line-height: 1.6;
      }

      .container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
        border: 1px solid #e2e8f0;
      }

      .header {
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
        color: #ffffff;
        padding: 30px 20px;
        text-align: center;
      }

      .header h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 700;
        letter-spacing: 0.5px;
      }

      .header-icon {
        font-size: 48px;
        margin-bottom: 15px;
        display: block;
      }

      .content {
        padding: 40px 30px;
        text-align: center;
      }

      .content h2 {
        font-size: 22px;
        margin: 0 0 20px 0;
        color: #1e293b;
        font-weight: 600;
      }

      .otp-container {
        margin: 35px 0;
      }

      .otp-box {
        font-size: 42px;
        letter-spacing: 15px;
        font-weight: 800;
        color: #2563eb;
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        padding: 25px 35px;
        border-radius: 12px;
        border: 2px dashed #dbeafe;
        display: inline-block;
        margin: 0 auto;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
      }

      .info-text {
        font-size: 16px;
        color: #64748b;
        margin: 25px 0 15px 0;
        line-height: 1.5;
      }

      .warning-text {
        font-size: 14px;
        color: #94a3b8;
        font-style: italic;
        margin: 20px 0 0 0;
      }

      .footer {
        padding: 25px;
        font-size: 13px;
        color: #94a3b8;
        text-align: center;
        background-color: #f8fafc;
        border-top: 1px solid #e2e8f0;
      }

      .security-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background-color: #dbeafe;
        color: #1e40af;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        margin-top: 20px;
      }

      @media (max-width: 620px) {
        .container {
          margin: 20px;
          border-radius: 12px;
        }
        
        .header {
          padding: 25px 15px;
        }
        
        .header h1 {
          font-size: 24px;
        }
        
        .content {
          padding: 30px 20px;
        }
        
        .otp-box {
          font-size: 32px;
          letter-spacing: 12px;
          padding: 20px 25px;
        }
        
        .content h2 {
          font-size: 20px;
        }
      }

      @media (max-width: 480px) {
        .otp-box {
          font-size: 28px;
          letter-spacing: 10px;
          padding: 18px 20px;
        }
        
        .header-icon {
          font-size: 40px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <span class="header-icon">🔐</span>
        <h1>${t.header}</h1>
      </div>
      <div class="content">
        <h2>${t.subtitle}</h2>
        
        <div class="otp-container">
          <div class="otp-box">${resetCode}</div>
        </div>

        <p class="info-text">${t.expiration(ExpiredIn)}</p>
        
        <p class="warning-text">${t.warning}</p>

        <div class="security-badge">
          <span>🛡️</span>
          Code sécurisé à usage unique
        </div>
      </div>
      <div class="footer">
        ${t.footer}
      </div>
    </div>
  </body>
</html>
`;
};
