const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  institution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: true
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  className: {
    type: String,
    required: [true, 'Class name is required (e.g. Class 10)'],
    trim: true
  },
  section: {
    type: String,
    default: 'A',
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);
