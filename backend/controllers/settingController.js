const Setting = require('../models/Setting');

// @desc Get support contact details & announcement notice
// @route GET /api/settings/support
const getSupportSettings = async (req, res) => {
  try {
    let setting = await Setting.findOne({ key: 'support_config' });

    if (!setting) {
      setting = await Setting.create({
        key: 'support_config',
        supportManagerName: 'Mr. Amila Perera - Rental Operations Manager',
        whatsappNumber: '+94771234567',
        directPhone: '0112345678',
        announcementNotice: 'We deliver tools within 2 hours across Colombo & Gampaha districts!',
        workingHours: '8:00 AM - 7:00 PM (Mon - Sat)'
      });
    }

    res.status(200).json({
      success: true,
      support: setting
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update support contact details & announcement notice
// @route PUT /api/settings/support
const updateSupportSettings = async (req, res) => {
  try {
    const { supportManagerName, whatsappNumber, directPhone, announcementNotice, workingHours, companyLogoUrl } = req.body;

    let setting = await Setting.findOne({ key: 'support_config' });

    if (!setting) {
      setting = new Setting({ key: 'support_config' });
    }

    if (supportManagerName !== undefined) setting.supportManagerName = supportManagerName;
    if (whatsappNumber !== undefined) setting.whatsappNumber = whatsappNumber;
    if (directPhone !== undefined) setting.directPhone = directPhone;
    if (announcementNotice !== undefined) setting.announcementNotice = announcementNotice;
    if (workingHours !== undefined) setting.workingHours = workingHours;
    if (companyLogoUrl !== undefined) setting.companyLogoUrl = companyLogoUrl;

    const updatedSetting = await setting.save();

    res.status(200).json({
      success: true,
      message: 'Support contact settings updated successfully!',
      support: updatedSetting
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getSupportSettings, updateSupportSettings };
