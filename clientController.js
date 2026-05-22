const Client = require('../models/Client');

exports.getAll = async (req, res) => {
  try { res.json(await Client.findAll({ where: { is_active: true }, order: [['name','ASC']] })); }
  catch (e) { res.status(500).json({ message: e.message }); }
};
exports.create = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name required' });
    res.status(201).json(await Client.create({ name, created_by: req.user.id }));
  } catch (e) { res.status(500).json({ message: e.message }); }
};
exports.update = async (req, res) => {
  try {
    const c = await Client.findByPk(req.params.id);
    if (!c) return res.status(404).json({ message: 'Not found' });
    await c.update(req.body); res.json(c);
  } catch (e) { res.status(500).json({ message: e.message }); }
};
exports.remove = async (req, res) => {
  try {
    const c = await Client.findByPk(req.params.id);
    if (!c) return res.status(404).json({ message: 'Not found' });
    await c.update({ is_active: false }); res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
