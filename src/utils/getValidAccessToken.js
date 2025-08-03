const axios = require("axios");
const db = require("../models");

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

async function getValidAccessToken(userId) {
  const tokenData = await db.UserTokens.findOne({
    where: { userId, provider: "google_fit" },
  });

  if (!tokenData) throw new Error("No Google Fit token found for this user.");

  if (new Date() < tokenData.expiresAt) {
    return tokenData.accessToken;
  }

  // Refresh le token
  const response = await axios.post("https://oauth2.googleapis.com/token", {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token: tokenData.refreshToken,
  });

  const { access_token, expires_in } = response.data;

  tokenData.accessToken = access_token;
  tokenData.expiresAt = new Date(Date.now() + expires_in * 1000);
  await tokenData.save();

  return access_token;
}

module.exports = getValidAccessToken;
