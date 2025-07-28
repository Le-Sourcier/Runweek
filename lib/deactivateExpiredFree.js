module.exports = deactivateExpiredFree = (userName) => {
    return `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Compte Désactivé</title>
  </head>
  <body style="margin:0;padding:0;background:#0f0c29;font-family:'Segoe UI',sans-serif;color:#fff;line-height:1.6;">
    <div style="max-width:600px;margin:48px auto;padding:48px 32px;background:linear-gradient(to right,#0f0c29,#302b63,#24243e);border-radius:16px;box-shadow:0 6px 22px rgba(0, 43, 80, 0.8);">
      <h1 style="text-align:center;margin-bottom:30px;font-size:28px;color:#ff8a8a;font-weight:900;letter-spacing:0.04em;">
        ❌ Fin de votre période d’essai
      </h1>
      
      <p style="font-size:17px;text-align:center;margin-bottom:24px;">
        Bonjour <strong style="color:#ffdada;">${userName}</strong>,
      </p>

      <p style="font-size:17px;text-align:center;margin-bottom:24px;max-width:480px;margin-left:auto;margin-right:auto;color:#ffbdbd;">
        Votre période d’essai gratuite de 14 jours est arrivée à son terme et vos <strong>crédits ont été épuisés</strong>. Par conséquent, votre compte a été temporairement désactivé.
      </p>

      <p style="font-size:16px;text-align:center;margin-bottom:28px;color:#ffabab;">
        Voici comment réactiver votre accès en quelques clics :
      </p>
      <ul style="max-width:460px;margin:0 auto 32px;padding-left:20px;color:#ffcfcf;font-size:15px;list-style:none;">
        <li style="margin-bottom:14px;">⚡ Passez à un plan <strong>STARTER</strong>, <strong>PRO</strong> ou <strong>EXPERT</strong> pour débloquer toutes les fonctionnalités</li>
        <li style="margin-bottom:14px;">🔓 Obtenez plus de crédits pour continuer vos recherches</li>
        <li style="margin-bottom:14px;">🤖 Accédez aux outils IA et exports professionnels</li>
        <li style="margin-bottom:14px;">💼 Suivi et assistance dédiés pour booster vos performances</li>
      </ul>

      <div style="text-align:center;margin:40px 0;">
        <a href="https://prospectpro/pricing"
           style="display:inline-block;background:linear-gradient(to right,#FF416C,#FF4B2B);color:#fff;padding:16px 36px;text-decoration:none;border-radius:30px;box-shadow:0 6px 18px rgba(255, 65, 108, 0.9);font-weight:800;font-size:17px;transition:background 0.3s ease;">
          🚀 Choisir un plan payant
        </a>
      </div>

      <p style="text-align:center;font-size:13px;color:#ffb3b3;letter-spacing:0.03em;">
        Une question ? Contactez notre équipe à <a href="mailto:support@prospectpro.com" style="color:#ffdada;text-decoration:none;">support@prospectpro.com</a><br />
        ProspectPro — Votre copilote B2B intelligent
      </p>
    </div>
  </body>
</html>
`;
};
