const MedicalInsurance = require('../models/MedicalInsurance');

exports.getAll = async (req, res) => {
  try { res.json(await MedicalInsurance.findAll({ where: { is_active: true }, order: [['name','ASC']] })); }
  catch (e) { res.status(500).json({ message: e.message }); }
};
exports.create = async (req, res) => {
  try {
    const { name, amount, currency_code, frequency } = req.body;
    if (!name || !amount || !currency_code) return res.status(400).json({ message: 'Name, amount, currency required' });
    res.status(201).json(await MedicalInsurance.create({ name, amount, currency_code, frequency: frequency || 'Per Year' }));
  } catch (e) { res.status(500).json({ message: e.message }); }
};
exports.update = async (req, res) => {
  try {
    const p = await MedicalInsurance.findByPk(req.params.id);
    if (!p) return res.status(404).json({ message: 'Not found' });
    await p.update(req.body); res.json(p);
  } catch (e) { res.status(500).json({ message: e.message }); }
};
exports.remove = async (req, res) => {
  try {
    const p = await MedicalInsurance.findByPk(req.params.id);
    if (!p) return res.status(404).json({ message: 'Not found' });
    await p.update({ is_active: false }); res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
