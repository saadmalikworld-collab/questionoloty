const Role = require('../models/Role');

exports.getAll = async (req, res) => {
  try { res.json(await Role.findAll({ where: { is_active: true }, order: [['name','ASC']] })); }
  catch (e) { res.status(500).json({ message: e.message }); }
};
exports.create = async (req, res) => {
  try {
    const { name, rate, currency_code } = req.body;
    if (!name || !rate) return res.status(400).json({ message: 'Name and rate required' });
    res.status(201).json(await Role.create({ name, rate, currency_code: currency_code || 'USD' }));
  } catch (e) { res.status(500).json({ message: e.message }); }
};
exports.update = async (req, res) => {
  try {
    const r = await Role.findByPk(req.params.id);
    if (!r) return res.status(404).json({ message: 'Not found' });
    await r.update(req.body); res.json(r);
  } catch (e) { res.status(500).json({ message: e.message }); }
};
exports.remove = async (req, res) => {
  try {
    const r = await Role.findByPk(req.params.id);
    if (!r) return res.status(404).json({ message: 'Not found' });
    await r.update({ is_active: false }); res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
