const mongoose = require('mongoose');

const subjectMarkSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  marksObtained: { type: Number, required: true },
  maxMarks: { type: Number, default: 100 },
  grade: { type: String, default: 'A' }
});

const resultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  examName: {
    type: String,
    required: [true, 'Exam name is required (e.g. Mid-Term 2025)'],
    trim: true
  },
  pdfUrl: {
    type: String,
    default: ''
  },
  marks: [subjectMarkSchema],
  percentage: {
    type: Number,
    default: 0
  },
  grade: {
    type: String,
    default: 'A'
  },
  remarks: {
    type: String,
    default: ''
  },
  uploadedByAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, { timestamps: true });

module.exports = mongoose.model('Result', resultSchema);
