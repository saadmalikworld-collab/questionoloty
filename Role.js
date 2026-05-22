const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Role = sequelize.define('Role', {
  id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:          { type: DataTypes.STRING(100), allowNull: false },
  rate:          { type: DataTypes.DECIMAL(15,4), allowNull: false },
  currency_code: { type: DataTypes.STRING(10), defaultValue: 'USD' },
  is_active:     { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'roles', timestamps: true });

module.exports = Role;
