const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const config = require('../config');

const db = {};

const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
);

const modelsDir = path.join(__dirname, 'components');

// Charger tous les fichiers de modèle du dossier 'components'
fs.readdirSync(modelsDir)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(modelsDir, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Appliquer les associations si elles existent
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;