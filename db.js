const db = require("./src/models");
const { Client } = require("pg");
const config = require("./src/config");
const seedPlans = require("./src/functions/components/seedPlan");
const {
  seedAchievements,
} = require("./src/functions/components/seedAchievements");

(async () => {
  try {
    // Connexion sans spécifier la base de données
    const client = new Client({
      host: config.host,
      user: config.username,
      password: config.password,
      database: "postgres", // base par défaut toujours présente
    });

    await client.connect();

    // Vérifie si la base existe déjà
    const checkDb = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [config.database]
    );

    // Crée la base si elle n'existe pas
    if (checkDb.rowCount === 0) {
      await client.query(`CREATE DATABASE ${config.database}`);
      console.log(`Database "${config.database}" created.`);
    } else {
      console.log(`Database "${config.database}" already exists.`);
    }

    await client.end();

    // Synchronise Sequelize (après que la DB soit assurée)
    await db.sequelize.sync({ force: false });

    await seedPlans();
    await seedAchievements();

    console.log("Sequelize: Models synced to database.");
  } catch (error) {
    console.error("Error during database setup:", error);
  }
})();
