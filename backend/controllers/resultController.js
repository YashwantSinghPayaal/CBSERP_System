const Result = require('../models/Result');
const Student = require('../models/Student');

// Admin uploads student exam result
exports.uploadResult = async (req, res) => {
  try {
    const { studentId, sessionId, examName, percentage, grade, remarks, marks } = req.body;

    if (!studentId || !sessionId || !examName) {
      return res.status(400).json({ success: false, message: 'Student ID, Session ID, and Exam Name are required' });
    }

    let pdfUrl = '';
    if (req.file) {
      pdfUrl = `/uploads/${req.file.filename}`;
    }

    let parsedMarks = [];
    if (marks) {
      try {
        parsedMarks = typeof marks === 'string' ? JSON.parse(marks) : marks;
      } catch (e) {
        parsedMarks = [];
      }
    }

    const result = await Result.create({
      student: studentId,
      session: sessionId,
      examName,
      pdfUrl,
      marks: parsedMarks,
      percentage: percentage !== undefined ? Number(percentage) : 0,
      grade: grade || 'A',
      remarks: remarks || '',
      uploadedByAdmin: req.user.id
    });

    const populated = await result.populate('student session uploadedByAdmin', 'name email rollNumber role');

    res.status(201).json({
      success: true,
      message: 'Exam result uploaded successfully',
      result: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Student view own exam results
exports.getStudentResults = async (req, res) => {
  try {
    const studentId = req.user.userType === 'student' ? req.user.id : req.query.studentId;

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student ID is required' });
    }

    const results = await Result.find({ student: studentId })
      .populate('session uploadedByAdmin', 'yearLabel name role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: results.length, results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin view all results for session / class
exports.getResultsForAdmin = async (req, res) => {
  try {
    const { sessionId, classId } = req.query;

    let studentQuery = { institution: req.user.institutionId };
    if (classId) studentQuery.currentClass = classId;

    const students = await Student.find(studentQuery).select('_id name rollNumber email currentClass');
    const studentIds = students.map(s => s._id);

    let query = { student: { $in: studentIds } };
    if (sessionId) query.session = sessionId;

    const results = await Result.find(query)
      .populate('student session uploadedByAdmin', 'name rollNumber yearLabel role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: results.length, results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin delete result record
exports.deleteResult = async (req, res) => {
  try {
    const { id } = req.params;
    await Result.findByIdAndDelete(id);
    res.json({ success: true, message: 'Result record deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
