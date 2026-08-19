const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'support_config',
      unique: true
    },
    supportManagerName: {
      type: String,
      default: 'Mr. Amila Perera - Rental Manager'
    },
    whatsappNumber: {
      type: String,
      default: '+94771234567'
    },
    directPhone: {
      type: String,
      default: '0112345678'
    },
    announcementNotice: {
      type: String,
      default: 'We deliver tools within 2 hours across Colombo & Gampaha districts!'
    },
    workingHours: {
      type: String,
      default: '8:00 AM - 7:00 PM (Mon - Sat)'
    },
    companyLogoUrl: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', settingSchema);
