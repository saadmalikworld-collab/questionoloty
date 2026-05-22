const { Currency, CurrencyLog } = require('../models/Currency');

exports.getCurrencies = async (req, res) => {
  try { res.json(await Currency.findAll({ order: [['code','ASC']] })); }
  catch (e) { res.status(500).json({ message: e.message }); }
};

exports.updateCurrency = async (req, res) => {
  try {
    const c = await Currency.findByPk(req.params.id);
    if (!c) return res.status(404).json({ message: 'Not found' });
    const { units_per_usd, usd_per_unit } = req.body;
    await CurrencyLog.create({
      currency_id: c.id, currency_code: c.code,
      old_units_per_usd: c.units_per_usd, new_units_per_usd: units_per_usd,
      old_usd_per_unit: c.usd_per_unit,   new_usd_per_unit: usd_per_unit,
      updated_by: req.user.id, updated_by_name: req.user.name,
    });
    await c.update({ units_per_usd, usd_per_unit, updated_by: req.user.id });
    res.json(c);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getCurrencyLogs = async (req, res) => {
  try { res.json(await CurrencyLog.findAll({ order: [['createdAt','DESC']], limit: 200 })); }
  catch (e) { res.status(500).json({ message: e.message }); }
};
