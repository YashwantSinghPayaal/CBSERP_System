const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  institution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: true
  },
  uploadedByAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Announcement title is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  pdfUrl: {
    type: String,
    default: ''
  },
  postedOn: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
