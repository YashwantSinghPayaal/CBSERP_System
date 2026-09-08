const Session = require('../models/Session');
const ClassModel = require('../models/Class');
const Student = require('../models/Student');

// Get all sessions
exports.getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ institution: req.user.institutionId }).sort({ createdAt: -1 });
    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new session
exports.createSession = async (req, res) => {
  try {
    const { yearLabel, makeActive } = req.body;

    if (!yearLabel) {
      return res.status(400).json({ success: false, message: 'Year label is required (e.g., 2025-2026)' });
    }

    if (makeActive) {
      await Session.updateMany({ institution: req.user.institutionId }, { isActive: false });
    }

    const session = await Session.create({
      institution: req.user.institutionId,
      yearLabel,
      isActive: makeActive !== undefined ? makeActive : true
    });

    res.status(201).json({ success: true, message: 'New academic session created', session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Set session as active
exports.setActiveSession = async (req, res) => {
  try {
    const { id } = req.params;
    await Session.updateMany({ institution: req.user.institutionId }, { isActive: false });

    const session = await Session.findOneAndUpdate(
      { _id: id, institution: req.user.institutionId },
      { isActive: true },
      { new: true }
    );

    res.json({ success: true, message: `Session ${session.yearLabel} set to Active`, session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Clear class session data (Reset/unassign students for a class at session end)
exports.clearClassSessionData = async (req, res) => {
  try {
    const { classId } = req.params;

    const classObj = await ClassModel.findOne({ _id: classId, institution: req.user.institutionId });
    if (!classObj) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    // Unassign students belonging to this class so new session roster can be configured
    const updatedResult = await Student.updateMany(
      { currentClass: classId, institution: req.user.institutionId },
      { $set: { currentClass: null } }
    );

    res.json({
      success: true,
      message: `Successfully cleared class roster for ${classObj.className}-${classObj.section} for the new session. Historical records remain preserved.`,
      modifiedCount: updatedResult.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get / Create Classes
exports.getClasses = async (req, res) => {
  try {
    const classes = await ClassModel.find({ institution: req.user.institutionId })
      .populate('session')
      .sort({ className: 1, section: 1 });
    res.json({ success: true, classes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createClass = async (req, res) => {
  try {
    const { className, section, sessionId } = req.body;

    if (!className || !sessionId) {
      return res.status(400).json({ success: false, message: 'Class name and Session ID are required' });
    }

    const newClass = await ClassModel.create({
      institution: req.user.institutionId,
      session: sessionId,
      className,
      section: section || 'A'
    });

    res.status(201).json({ success: true, message: 'Class created successfully', class: newClass });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
