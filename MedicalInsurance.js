const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const MedicalInsurance = sequelize.define('MedicalInsurance', {
  id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:          { type: DataTypes.STRING(200), allowNull: false },
  amount:        { type: DataTypes.DECIMAL(15,4), allowNull: false },
  currency_code: { type: DataTypes.STRING(10), allowNull: false },
  frequency:     { type: DataTypes.STRING(50), defaultValue: 'Per Year' },
  is_active:     { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'medical_insurances', timestamps: true });

module.exports = MedicalInsurance;
