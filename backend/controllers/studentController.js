const Student = require('../models/Student');
const ClassModel = require('../models/Class');

// Admin directly creates student
exports.addStudentByAdmin = async (req, res) => {
  try {
    const { name, email, password, rollNumber, classId, status } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existing = await Student.findOne({ email: email.toLowerCase(), institution: req.user.institutionId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Student with this email already exists in institution' });
    }

    const student = await Student.create({
      institution: req.user.institutionId,
      addedByAdmin: req.user.id,
      currentClass: classId || null,
      name,
      email: email.toLowerCase(),
      password,
      rollNumber: rollNumber || '',
      status: status || 'approved'
    });

    res.status(201).json({ success: true, message: 'Student created successfully', student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin list students
exports.getStudents = async (req, res) => {
  try {
    const { status, classId } = req.query;
    let query = { institution: req.user.institutionId };

    if (status) query.status = status;
    if (classId) query.currentClass = classId;

    const students = await Student.find(query)
      .populate('currentClass')
      .populate('addedByAdmin', 'name role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: students.length, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin approve/reject student status
exports.updateStudentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, classId } = req.body;

    if (!['approved', 'pending', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const student = await Student.findOne({ _id: id, institution: req.user.institutionId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found' });
    }

    student.status = status;
    if (classId) student.currentClass = classId;
    if (!student.addedByAdmin) student.addedByAdmin = req.user.id;

    await student.save();

    res.json({ success: true, message: `Student status updated to ${status}`, student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin assign or change student class
exports.updateStudentClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { classId } = req.body;

    const student = await Student.findOne({ _id: id, institution: req.user.institutionId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found' });
    }

    student.currentClass = classId || null;
    await student.save();

    res.json({ success: true, message: 'Student class updated', student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete student
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    await Student.findOneAndDelete({ _id: id, institution: req.user.institutionId });
    res.json({ success: true, message: 'Student removed from ERP system' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
