const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const CountryConfig = sequelize.define('CountryConfig', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  country:     { type: DataTypes.ENUM('Saudi Arabia','India','Australia'), allowNull: false },
  param_key:   { type: DataTypes.STRING(100), allowNull: false },
  param_value: { type: DataTypes.STRING(500), allowNull: false },
  param_label: { type: DataTypes.STRING(200) },
  param_type:  { type: DataTypes.ENUM('percentage','number','boolean','string','select'), defaultValue: 'number' },
  param_group: { type: DataTypes.STRING(100) },
  updated_by:  { type: DataTypes.INTEGER, allowNull: true },
}, { tableName: 'country_configs', timestamps: true });

module.exports = CountryConfig;
