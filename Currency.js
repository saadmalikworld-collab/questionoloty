const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Currency = sequelize.define('Currency', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  code:         { type: DataTypes.STRING(10), allowNull: false, unique: true },
  name:         { type: DataTypes.STRING(100), allowNull: false },
  units_per_usd:{ type: DataTypes.DECIMAL(20,10), allowNull: false },
  usd_per_unit: { type: DataTypes.DECIMAL(20,10), allowNull: false },
  updated_by:   { type: DataTypes.INTEGER, allowNull: true },
}, { tableName: 'currencies', timestamps: true });

const CurrencyLog = sequelize.define('CurrencyLog', {
  id:               { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  currency_id:      { type: DataTypes.INTEGER, allowNull: false },
  currency_code:    { type: DataTypes.STRING(10) },
  old_units_per_usd:{ type: DataTypes.DECIMAL(20,10) },
  new_units_per_usd:{ type: DataTypes.DECIMAL(20,10) },
  old_usd_per_unit: { type: DataTypes.DECIMAL(20,10) },
  new_usd_per_unit: { type: DataTypes.DECIMAL(20,10) },
  updated_by:       { type: DataTypes.INTEGER },
  updated_by_name:  { type: DataTypes.STRING(100) },
}, { tableName: 'currency_logs', timestamps: true, updatedAt: false });

module.exports = { Currency, CurrencyLog };
