const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Client = sequelize.define('Client', {
  id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:       { type: DataTypes.STRING(200), allowNull: false },
  is_active:  { type: DataTypes.BOOLEAN, defaultValue: true },
  created_by: { type: DataTypes.INTEGER, allowNull: true },
}, { tableName: 'clients', timestamps: true });

module.exports = Client;
