const getValidAccessToken = require("../utils/getValidAccessToken");

const authorizeGoogleFit = async (req, res, next) => {
  try {
    const accessToken = await getValidAccessToken(req.user.id);
    req.googleFitAccessToken = accessToken;
    next();
  } catch (error) {
    console.error("Google Fit auth error:", error.message);
    res.status(401).json({ error: "Non autorisé à accéder à Google Fit" });
  }
};

module.exports = authorizeGoogleFit;