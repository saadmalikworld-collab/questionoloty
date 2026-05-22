const User = require('../models/User');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] }, order: [['createdAt','DESC']] });
    res.json(users);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, password required' });
    const exists = await User.findOne({ where: { email: email.toLowerCase() } });
    if (exists) return res.status(409).json({ message: 'Email already in use' });
    const user = await User.create({ name, email: email.toLowerCase(), password, role: role || 'user' });
    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Not found' });
    const { name, email, password, role, is_active } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    if (role) updateData.role = role;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (password) updateData.password = password;
    await user.update(updateData);
    res.json({ message: 'Updated', user: { id: user.id, name: user.name, email: user.email, role: user.role, is_active: user.is_active } });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Not found' });
    if (user.id === req.user.id) return res.status(400).json({ message: 'Cannot delete yourself' });
    await user.update({ is_active: false });
    res.json({ message: 'Deactivated' });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
