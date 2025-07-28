const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const config = require("../config");

const basename = path.basename(__filename);
const db = {};

const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
);

// Fonction récursive pour charger les modèles
const loadModels = (dir) => {
    fs.readdirSync(dir).forEach((file) => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            loadModels(fullPath); // Appel récursif
        } else if (
            file.endsWith(".js") &&
            file !== basename &&
            !file.startsWith(".")
        ) {
            const model = require(fullPath)(sequelize, Sequelize.DataTypes);
            db[model.name] = model;
        }
    });
};

// Lancer la lecture depuis le dossier courant
loadModels(__dirname);

// Appliquer les associations
Object.keys(db).forEach((modelName) => {
    if (typeof db[modelName].associate === "function") {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
