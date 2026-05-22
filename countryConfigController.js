const CountryConfig = require('../models/CountryConfig');

exports.getAllConfigs = async (req, res) => {
  try {
    const all = await CountryConfig.findAll({ order: [['country','ASC'],['param_group','ASC']] });
    const grouped = {};
    all.forEach(c => { if (!grouped[c.country]) grouped[c.country] = []; grouped[c.country].push(c); });
    res.json(grouped);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getByCountry = async (req, res) => {
  try {
    res.json(await CountryConfig.findAll({
      where: { country: req.params.country },
      order: [['param_group','ASC'],['param_label','ASC']],
    }));
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.updateConfig = async (req, res) => {
  try {
    const cfg = await CountryConfig.findByPk(req.params.id);
    if (!cfg) return res.status(404).json({ message: 'Not found' });
    await cfg.update({ param_value: req.body.param_value, updated_by: req.user.id });
    res.json(cfg);
  } catch (e) { res.status(500).json({ message: e.message }); }
};
