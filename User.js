const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../../config/database');

const User = sequelize.define('User', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:      { type: DataTypes.STRING(100), allowNull: false },
  email:     { type: DataTypes.STRING(150), allowNull: false, unique: true },
  password:  { type: DataTypes.STRING(255), allowNull: false },
  role:      { type: DataTypes.ENUM('admin','user'), defaultValue: 'user' },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (u) => { u.password = await bcrypt.hash(u.password, 10); },
    beforeUpdate: async (u) => { if (u.changed('password')) u.password = await bcrypt.hash(u.password, 10); },
  },
});

User.prototype.validatePassword = function(pw) { return bcrypt.compare(pw, this.password); };
module.exports = User;
