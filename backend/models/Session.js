const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  institution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: true
  },
  yearLabel: {
    type: String,
    required: [true, 'Academic session year label is required (e.g. 2025-2026)'],
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
