const Admin = require('../models/Admin');
const Student = require('../models/Student');
const Institution = require('../models/Institution');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

// Admin Registration (Creates institution if not present)
exports.adminRegister = async (req, res) => {
  try {
    const { institutionName, name, email, password, role } = req.body;

    if (!institutionName || !name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    let institution = await Institution.findOne({ name: { $regex: new RegExp(`^${institutionName.trim()}$`, 'i') } });
    if (!institution) {
      institution = await Institution.create({ name: institutionName.trim() });
    }

    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: 'An admin account with this email already exists' });
    }

    const admin = await Admin.create({
      institution: institution._id,
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'Administrator'
    });

    const token = generateToken({
      id: admin._id,
      userType: 'admin',
      role: admin.role,
      institutionId: institution._id
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        userType: 'admin',
        institution: {
          id: institution._id,
          name: institution.name
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin Login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() }).populate('institution');
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken({
      id: admin._id,
      userType: 'admin',
      role: admin.role,
      institutionId: admin.institution._id
    });

    res.json({
      success: true,
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        userType: 'admin',
        institution: {
          id: admin.institution._id,
          name: admin.institution.name
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Student Login (Requires Email, Password, and Institution Verification)
exports.studentLogin = async (req, res) => {
  try {
    const { email, password, institutionName } = req.body;

    if (!email || !password || !institutionName) {
      return res.status(400).json({ success: false, message: 'Email, Password, and Institution Name are required' });
    }

    // Step 1: Verify Institution
    const institution = await Institution.findOne({
      name: { $regex: new RegExp(`^${institutionName.trim()}$`, 'i') }
    });

    if (!institution) {
      return res.status(404).json({ success: false, message: 'No institution found matching this name' });
    }

    // Step 2: Find Student within that institution
    const student = await Student.findOne({
      email: email.toLowerCase(),
      institution: institution._id
    }).populate('institution currentClass');

    if (!student) {
      return res.status(401).json({ success: false, message: 'Student account not registered under this institution' });
    }

    // Step 3: Verify Password
    const isMatch = await student.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password credentials' });
    }

    // Step 4: Verify Admin Approval Status
    if (student.status !== 'approved') {
      return res.status(403).json({
        success: false,
        status: student.status,
        message: 'Access denied: Your student account is pending approval from an institution admin. Please contact your admin.'
      });
    }

    const token = generateToken({
      id: student._id,
      userType: 'student',
      role: 'Student',
      institutionId: institution._id
    });

    res.json({
      success: true,
      token,
      user: {
        id: student._id,
        name: student.name,
        email: student.email,
        rollNumber: student.rollNumber,
        status: student.status,
        userType: 'student',
        currentClass: student.currentClass ? {
          id: student.currentClass._id,
          className: student.currentClass.className,
          section: student.currentClass.section
        } : null,
        institution: {
          id: institution._id,
          name: institution.name
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Student Sign-Up Request (Enters system as 'pending' for Admin approval)
exports.studentRegisterRequest = async (req, res) => {
  try {
    const { name, email, password, institutionName, rollNumber } = req.body;

    if (!name || !email || !password || !institutionName) {
      return res.status(400).json({ success: false, message: 'Please fill in all required fields' });
    }

    const institution = await Institution.findOne({
      name: { $regex: new RegExp(`^${institutionName.trim()}$`, 'i') }
    });

    if (!institution) {
      return res.status(404).json({ success: false, message: 'Specified institution does not exist. Contact your school admin.' });
    }

    const existingStudent = await Student.findOne({ email: email.toLowerCase(), institution: institution._id });
    if (existingStudent) {
      return res.status(400).json({ success: false, message: 'Student account already registered under this email' });
    }

    const student = await Student.create({
      institution: institution._id,
      name,
      email: email.toLowerCase(),
      password,
      rollNumber: rollNumber || '',
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Student account registration submitted successfully! An admin must approve your account before you can log in.',
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        status: student.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin updates own role/profile
exports.updateAdminProfile = async (req, res) => {
  try {
    const { name, role } = req.body;
    const admin = await Admin.findById(req.user.id);
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });

    if (name) admin.name = name;
    if (role) admin.role = role;

    await admin.save();

    res.json({
      success: true,
      message: 'Admin profile updated successfully',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        userType: 'admin'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get current user profile
exports.getMe = async (req, res) => {
  try {
    if (req.user.userType === 'admin') {
      const admin = await Admin.findById(req.user.id).populate('institution').select('-password');
      return res.json({ success: true, userType: 'admin', user: admin });
    } else if (req.user.userType === 'student') {
      const student = await Student.findById(req.user.id).populate('institution currentClass').select('-password');
      return res.json({ success: true, userType: 'student', user: student });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// List all admins for institution
exports.getInstitutionAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({ institution: req.user.institutionId }).select('-password');
    res.json({ success: true, admins });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
