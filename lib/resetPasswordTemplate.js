module.exports = resetPasswordTemplate = (resetCode) => {
    return `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <title>Votre code de vérification</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f4f4f7;
        color: #333333;
      }

      .container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
      }

      .header {
        background-color: #e53e3e;
        color: #ffffff;
        padding: 20px;
        text-align: center;
      }

      .header h1 {
        margin: 0;
        font-size: 22px;
        font-weight: 600;
      }

      .content {
        padding: 30px;
        text-align: center;
      }

      .content h2 {
        font-size: 20px;
        margin-bottom: 10px;
      }

      .otp-box {
        font-size: 32px;
        letter-spacing: 12px;
        font-weight: bold;
        margin: 30px 0;
        color: #e53e3e;
      }

      .footer {
        padding: 20px;
        font-size: 13px;
        color: #777;
        text-align: center;
        background-color: #f9fafb;
      }

      @media (max-width: 600px) {
        .otp-box {
          font-size: 26px;
          letter-spacing: 10px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Code de vérification</h1>
      </div>
      <div class="content">
        <h2>Voici votre code à usage unique :</h2>
        <div class="otp-box">${resetCode}</div>
        <p>
          Ce code expirera dans 10 minutes.<br />
          Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer ce message.
        </p>
      </div>
      <div class="footer">
        &copy; 2025 malettreimmo.fr. Tous droits réservés.
      </div>
    </div>
  </body>
</html>
`;
};
