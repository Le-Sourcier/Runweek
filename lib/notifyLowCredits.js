module.exports = notifyLowCredits = ({ userName, currentCredits }) => {
    return `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Crédits Faibles</title>
  </head>
  <body style="margin:0;padding:0;background:#0f0c29;font-family:'Segoe UI',sans-serif;color:#fff;line-height:1.6;">
    <div style="max-width:600px;margin:48px auto;padding:48px 32px;background:linear-gradient(to right,#0f0c29,#302b63,#24243e);border-radius:16px;box-shadow:0 6px 22px rgba(0, 43, 80, 0.8);">
      <h1 style="text-align:center;margin-bottom:30px;font-size:28px;color:#d0eaff;font-weight:900;letter-spacing:0.04em;">
        🚀 Restez dans la course !
      </h1>
      
      <p style="font-size:17px;text-align:center;margin-bottom:24px;">
        Bonjour <strong style="color:#00bfff;">${userName}</strong>,
      </p>
      
      <p style="font-size:17px;text-align:center;margin-bottom:24px;max-width:480px;margin-left:auto;margin-right:auto;color:#a3c6ff;">
        Il ne vous reste plus que <strong style="color:#00bfff;">${currentCredits} crédits</strong>. Ne laissez pas votre prospection s’interrompre et continuez à générer des leads ultra-qualifiés sans aucune interruption.
      </p>

      <p style="font-size:16px;text-align:center;margin-bottom:28px;color:#80aaff;">
        <strong>Voici pourquoi recharger ou passer au Premium est essentiel :</strong>
      </p>
      <ul style="max-width:460px;margin:0 auto 32px;padding-left:20px;color:#b0d4ff;font-size:15px;list-style:none;">
        <li style="margin-bottom:14px;">🔍 Accès à plus de <strong>50 millions d’entreprises B2B enrichies</strong></li>
        <li style="margin-bottom:14px;">⚡ Exportez vos listes en CSV, XLS, PDF… en un clic</li>
        <li style="margin-bottom:14px;">🤖 Bénéficiez des outils IA pour améliorer vos ciblages</li>
        <li style="margin-bottom:14px;">💬 Support réactif et disponible à tout moment</li>
      </ul>

      <div style="text-align:center;margin:40px 0;">
        <a href="https://propsectpro.com/pricing"
           style="display:inline-block;background:linear-gradient(to right,#00BFFF,#A020F0);color:#fff;padding:16px 36px;text-decoration:none;border-radius:30px;box-shadow:0 6px 18px rgba(0,191,255,0.9);font-weight:800;font-size:17px;transition:background 0.3s ease;">
          🔋 Recharger mes crédits ou passer au Premium
        </a>
      </div>

      <p style="text-align:center;font-size:13px;color:#99bfff;letter-spacing:0.03em;">
        Besoin d’aide ? Écrivez-nous à <a href="mailto:support@propsectpro.com" style="color:#00bfff;text-decoration:none;">support@prospectpro.com</a><br />
        ProspectPro — Votre copilote B2B intelligent
      </p>
    </div>
  </body>
</html>
`;
};
