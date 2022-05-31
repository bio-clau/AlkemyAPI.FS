require("dotenv").config({ path: "../.env" });
const { Sequelize } = require("sequelize");

const DB_URI = process.env.DB_URI;
const sequelize = new Sequelize(`${DB_URI}`,{
    logging: false
});

const db = { sequelize, Sequelize };
module.exports = db;
