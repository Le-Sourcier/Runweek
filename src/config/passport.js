// const passport = require("passport");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const { User } = require("../models");

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL:
//         process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         // Vérifier si l'utilisateur existe déjà avec cet email Google
//         let user = await User.findOne({
//           where: { email: profile.emails[0].value },
//         });

//         if (user) {
//           // Mettre à jour les tokens Google si l'utilisateur existe
//           const googleData = {
//             googleId: profile.id,
//             googleAccessToken: accessToken,
//             googleRefreshToken: refreshToken,
//             googleProfile: {
//               id: profile.id,
//               displayName: profile.displayName,
//               emails: profile.emails,
//               photos: profile.photos,
//             },
//           };

//           await user.update({
//             googleAuth: googleData,
//             lastLogin: new Date(),
//           });

//           return done(null, user);
//         } else {
//           // Créer un nouvel utilisateur avec les données Google
//           const newUser = await User.create({
//             fname: profile.name.givenName || profile.displayName.split(" ")[0],
//             lname:
//               profile.name.familyName ||
//               profile.displayName.split(" ")[1] ||
//               "",
//             email: profile.emails[0].value,
//             password: "google_auth_" + Math.random().toString(36), // Mot de passe temporaire
//             profile_image:
//               profile.photos[0]?.value ||
//               "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150",
//             isEmailVerified: true, // Google emails sont déjà vérifiés
//             googleAuth: {
//               googleId: profile.id,
//               googleAccessToken: accessToken,
//               googleRefreshToken: refreshToken,
//               googleProfile: {
//                 id: profile.id,
//                 displayName: profile.displayName,
//                 emails: profile.emails,
//                 photos: profile.photos,
//               },
//             },
//             lastLogin: new Date(),
//           });

//           return done(null, newUser);
//         }
//       } catch (error) {
//         console.error("Erreur lors de l'authentification Google:", error);
//         return done(error, null);
//       }
//     }
//   )
// );

// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await User.findByPk(id);
//     done(null, user);
//   } catch (error) {
//     done(error, null);
//   }
// });

// module.exports = passport;

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { Users, Profiles } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Configuration de Passport
module.exports = (app) => {
  // Initialisation de Passport
  app.use(passport.initialize());

  // Configuration de la stratégie Google
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_REDIRECT_URI,
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          console.log("Google profile received:", profile);

          // Vérifier si l'utilisateur existe déjà
          const existingUser = await Users.findOne({
            where: { email: profile.emails[0].value },
            include: [{ model: Profiles, as: "profile" }],
          });

          if (existingUser) {
            console.log("User exists, logging in:", existingUser.id);

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

            // await existingUser.update({
            //   googleAuth: googleData,
            //   lastLogin: new Date(),
            // });

            return done(null, existingUser);
          }

          // Créer un nouvel utilisateur
          const transaction = await Users.sequelize.transaction();

          try {
            // Générer un mot de passe aléatoire
            const randomPassword =
              Math.random().toString(36).slice(-8) +
              Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            // Créer l'utilisateur
            const newUser = await Users.create(
              {
                email: profile.emails[0].value,
                password: hashedPassword,
                status: "VERIFIED",
                token: jwt.sign(
                  { email: profile.emails[0].value },
                  process.env.JWT_SECRET,
                  { expiresIn: "7d" }
                ),
              },
              { transaction }
            );

            // Créer le profil
            await Profiles.create(
              {
                user_id: newUser.id,
                fname: profile.name.givenName || "",
                lname: profile.name.familyName || "",
                image: profile.photos[0]?.value || null,
              },
              { transaction }
            );

            await transaction.commit();

            // Récupérer l'utilisateur complet avec le profil
            const completeUser = await Users.findOne({
              where: { id: newUser.id },
              include: [{ model: Profiles, as: "profile" }],
            });

            console.log("New user created via Google:", completeUser.id);
            return done(null, completeUser);
          } catch (error) {
            await transaction.rollback();
            console.error("Error creating user in transaction:", error);
            return done(error, null);
          }
        } catch (error) {
          console.error("Error in Google strategy:", error);
          return done(error, null);
        }
      }
    )
  );

  // Sérialisation de l'utilisateur
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Désérialisation de l'utilisateur
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await Users.findOne({
        where: { id },
        include: [{ model: Profiles, as: "profile" }],
      });
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};
