const StoreSettings = require('../models/StoreSettings');

// @desc Get store settings
// @route GET /api/settings
exports.getSettings = async (req, res) => {
  try {
    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = await StoreSettings.create({
        platformName: 'ZYPHOR ZONE',
        storeName: 'Siva Department Store',
        ownerName: 'Sivaji',
        location: 'Somanahalli, Palacode, Dharmapuri, Tamil Nadu',
        phone: '9786414501',
        gstin: '33AAAFS1234F1Z9'
      });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update store settings
// @route PUT /api/settings
exports.updateSettings = async (req, res) => {
  try {
    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = new StoreSettings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
