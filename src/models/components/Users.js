const { DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
    throw new Error("JWT_SECRET env var is required");
}

module.exports = (sequelize) => {
    const Users = sequelize.define(
        "Users",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: uuidv4,
                primaryKey: true,
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: { isEmail: true },
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            token: {
                type: DataTypes.STRING,
                allowNull: true,
                unique: true,
            },
            status: {
                type: DataTypes.ENUM(
                    "UNVERIFIED",
                    "VERIFIED",
                    "ARCHIVED",
                    "BLOCKED"
                ),
                allowNull: false,
                defaultValue: "UNVERIFIED",
            },
            role: {
                type: DataTypes.ENUM("USER", "ADMIN", "SUPER_ADMIN"),
                allowNull: false,
                defaultValue: "USER",
            },
            reset_token: {
                type: DataTypes.STRING,
                allowNull: true,
                defaultValue: null,
            },
            reset_token_expires_at: {
                type: DataTypes.DATE,
                allowNull: true,
            },
        },
        {
            hooks: {
                // 1) Ensure an ID and a token exist BEFORE validation
                beforeValidate: (user, options) => {
                    // If no id, generate one (though defaultValue usually does this)
                    if (!user.id) {
                        user.id = uuidv4();
                    }

                    // // If no token yet, generate JWT now
                    // if (!user.token) {
                    //     user.token = jwt.sign(
                    //         {
                    //             id: user.id,
                    //             email: user.email, // note: email may be undefined until after validation, so ensure email is set on create
                    //             role: user.role || "USER",
                    //         },
                    //         SECRET,
                    //         { expiresIn: "30d" }
                    //     );
                    // }
                },

                // 2) Hash password right before saving to DB
                beforeCreate: async (user, options) => {
                    user.password = await bcrypt.hash(user.password, 10);
                },
                // (you could also add beforeUpdate if you want to re-hash on password change)
            },
        }
    );

    Users.associate = (models) => {
        Users.hasOne(models.Roles, {
            foreignKey: "user_id",
            as: "role_data",
            onDelete: "CASCADE",
        });
        Users.hasOne(models.Profiles, {
            foreignKey: "user_id",
            as: "profile",
        });
        Users.hasMany(models.Sessions, {
            foreignKey: "user_id",
            as: "sessions",
        });
        Users.hasMany(models.Subscriptions, {
            foreignKey: "user_id",
            as: "subscriptions",
        });
        Users.hasMany(models.Notifications, {
            foreignKey: "user_id",
            as: "notifications",
        });
        // 👉 Relations pour invitations / parrainages
        Users.hasMany(models.UserRelations, {
            foreignKey: "user_id",
            as: "relations_received",
        });

        Users.hasMany(models.UserRelations, {
            foreignKey: "related_by",
            as: "relations_sent",
        });
    };

    Users.prototype.generateTokens = function () {
        const payload = { id: this.id, email: this.email };

        const accessToken = jwt.sign(payload, SECRET, {
            expiresIn: "2h",
        });

        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
            expiresIn: "7d",
        });

        return { accessToken, refreshToken };
    };

    Users.prototype.generateVerificationToken = function () {
        const expiresIn = "15m";

        const payload = { id: this.id, email: this.email };
        return jwt.sign(payload, SECRET, { expiresIn: expiresIn }); // Plus court et temporaire
    };

    Users.prototype.verifyPassword = function (password) {
        // Verify if the password matches the stored password
        // Use bcrypt to compare the plain text password with the hashed password
        const isMatch = bcrypt.compareSync(password, this.password);

        return isMatch;
    };
    return Users;
};
