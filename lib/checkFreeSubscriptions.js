module.exports = checkFreeSubscriptions = (userName) => {
    return `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Fin du Freemium</title>
  </head>
  <body style="margin:0;padding:0;background:#1c1c1e;font-family:'Segoe UI',sans-serif;color:#fff;line-height:1.6;">
    <div style="max-width:600px;margin:48px auto;padding:48px 32px;background:linear-gradient(to right,#360033,#0b8793);border-radius:16px;box-shadow:0 8px 25px rgba(11,135,147,0.7);">
      <h1 style="text-align:center;margin-bottom:30px;font-size:28px;color:#f0e9ff;font-weight:900;letter-spacing:0.04em;">
        🕒 Votre offre Freemium est arrivée à terme
      </h1>
      
      <p style="font-size:17px;text-align:center;margin-bottom:24px;">
        Bonjour <strong style="color:#ffd6f7;">${userName}</strong>,
      </p>
      
      <p style="font-size:17px;text-align:center;margin-bottom:24px;max-width:480px;margin-left:auto;margin-right:auto;color:#d0c8ff;">
        Votre période d’essai gratuite touche à sa fin. Pour continuer à profiter pleinement de toutes les fonctionnalités avancées de ProspectPro, et générer des leads hyper-qualifiés sans limite, passez dès maintenant à un abonnement Premium.
      </p>

      <p style="font-size:16px;text-align:center;margin-bottom:30px;color:#c6b9f7;">
        <strong>Pourquoi choisir un plan Premium ?</strong>
      </p>
      <ul style="max-width:440px;margin:0 auto 32px;padding-left:20px;color:#ccc;font-size:15px;list-style:none;">
        <li style="margin-bottom:14px;">✅ Accès illimité à une base B2B de plus de <strong>50 millions d’entreprises</strong></li>
        <li style="margin-bottom:14px;">🤖 IA avancée pour enrichir automatiquement vos leads et affiner votre ciblage</li>
        <li style="margin-bottom:14px;">📊 Suivi de campagne et scoring intégrés pour maximiser vos résultats</li>
        <li style="margin-bottom:14px;">⏰ Support prioritaire 24/7 par nos experts</li>
      </ul>

      <div style="text-align:center;margin:40px 0;">
        <a href="https://prospectpro.com/pricing"
           style="display:inline-block;background:linear-gradient(to right,#FF007F,#A020F0);color:#fff;padding:16px 36px;text-decoration:none;border-radius:30px;box-shadow:0 6px 18px rgba(255,0,127,0.8);font-weight:800;font-size:17px;transition:background 0.3s ease;">
          🌟 Je passe au Premium maintenant
        </a>
      </div>

      <p style="text-align:center;font-size:13px;color:#aaa;letter-spacing:0.03em;">
        Vous avez des questions ? Contactez-nous à <a href="mailto:support@prospectpro.com" style="color:#ff77cc;text-decoration:none;">support@prospectpro.com</a><br />
        ProspectPro &mdash; Votre partenaire de prospection intelligent
      </p>
    </div>
  </body>
</html>
`;
};
