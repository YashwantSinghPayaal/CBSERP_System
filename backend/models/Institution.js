const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Institution name is required'],
    trim: true
  },
  address: {
    type: String,
    trim: true,
    default: 'Main Campus'
  },
  code: {
    type: String,
    trim: true,
    uppercase: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Institution', institutionSchema);
