const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { User } = require("../models");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Vérifier si l'utilisateur existe déjà avec cet email Google
        let user = await User.findOne({
          where: { email: profile.emails[0].value },
        });

        if (user) {
          // Mettre à jour les tokens Google si l'utilisateur existe
          const googleData = {
            googleId: profile.id,
            googleAccessToken: accessToken,
            googleRefreshToken: refreshToken,
            googleProfile: {
              id: profile.id,
              displayName: profile.displayName,
              emails: profile.emails,
              photos: profile.photos,
            },
          };

          await user.update({
            googleAuth: googleData,
            lastLogin: new Date(),
          });

          return done(null, user);
        } else {
          // Créer un nouvel utilisateur avec les données Google
          const newUser = await User.create({
            fname: profile.name.givenName || profile.displayName.split(" ")[0],
            lname:
              profile.name.familyName ||
              profile.displayName.split(" ")[1] ||
              "",
            email: profile.emails[0].value,
            password: "google_auth_" + Math.random().toString(36), // Mot de passe temporaire
            profileImage:
              profile.photos[0]?.value ||
              "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150",
            isEmailVerified: true, // Google emails sont déjà vérifiés
            googleAuth: {
              googleId: profile.id,
              googleAccessToken: accessToken,
              googleRefreshToken: refreshToken,
              googleProfile: {
                id: profile.id,
                displayName: profile.displayName,
                emails: profile.emails,
                photos: profile.photos,
              },
            },
            lastLogin: new Date(),
          });

          return done(null, newUser);
        }
      } catch (error) {
        console.error("Erreur lors de l'authentification Google:", error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
