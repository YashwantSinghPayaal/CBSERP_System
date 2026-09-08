const Fee = require('../models/Fee');
const Student = require('../models/Student');

// Admin update or create student fee record
exports.updateFeeRecord = async (req, res) => {
  try {
    const { studentId, sessionId, totalAmount, paidAmount, remarks } = req.body;

    if (!studentId || !sessionId || totalAmount === undefined || paidAmount === undefined) {
      return res.status(400).json({ success: false, message: 'Student ID, Session ID, Total Amount, and Paid Amount are required' });
    }

    const total = Number(totalAmount);
    const paid = Number(paidAmount);
    const pending = Math.max(0, total - paid);

    const fee = await Fee.findOneAndUpdate(
      { student: studentId, session: sessionId },
      {
        student: studentId,
        session: sessionId,
        totalAmount: total,
        paidAmount: paid,
        pendingAmount: pending,
        remarks: remarks || '',
        updatedByAdmin: req.user.id
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, message: 'Fee record updated successfully', fee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin list fees for all students in class/session
exports.getAllFees = async (req, res) => {
  try {
    const { sessionId, classId } = req.query;

    let studentQuery = { institution: req.user.institutionId, status: 'approved' };
    if (classId) studentQuery.currentClass = classId;

    const students = await Student.find(studentQuery).populate('currentClass');
    const studentIds = students.map(s => s._id);

    let feeQuery = { student: { $in: studentIds } };
    if (sessionId) feeQuery.session = sessionId;

    const fees = await Fee.find(feeQuery).populate('student session updatedByAdmin', 'name role');

    // Combine student list with fee data
    const feeMap = {};
    fees.forEach(f => {
      feeMap[f.student._id ? f.student._id.toString() : f.student.toString()] = f;
    });

    const studentFees = students.map(st => {
      const existingFee = feeMap[st._id.toString()];
      return {
        student: st,
        fee: existingFee || {
          totalAmount: 0,
          paidAmount: 0,
          pendingAmount: 0,
          remarks: 'No fee structure assigned yet'
        }
      };
    });

    res.json({ success: true, studentFees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Student get personal fee details
exports.getStudentFee = async (req, res) => {
  try {
    const studentId = req.user.userType === 'student' ? req.user.id : req.query.studentId;

    const fee = await Fee.findOne({ student: studentId })
      .populate('session updatedByAdmin', 'name role')
      .sort({ createdAt: -1 });

    if (!fee) {
      return res.json({
        success: true,
        fee: {
          totalAmount: 0,
          paidAmount: 0,
          pendingAmount: 0,
          remarks: 'No fee record found'
        }
      });
    }

    res.json({ success: true, fee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
