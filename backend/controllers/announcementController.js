const Announcement = require('../models/Announcement');

// Admin posts announcement (with optional PDF file upload)
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Announcement title is required' });
    }

    let pdfUrl = '';
    if (req.file) {
      pdfUrl = `/uploads/${req.file.filename}`;
    }

    const announcement = await Announcement.create({
      institution: req.user.institutionId,
      uploadedByAdmin: req.user.id,
      title,
      description: description || '',
      pdfUrl
    });

    const populated = await announcement.populate('uploadedByAdmin', 'name role');

    res.status(201).json({
      success: true,
      message: 'Announcement published successfully',
      announcement: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get institution announcements (Admin & Student view)
exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ institution: req.user.institutionId })
      .populate('uploadedByAdmin', 'name role')
      .sort({ postedOn: -1 });

    res.json({ success: true, count: announcements.length, announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete announcement
exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    await Announcement.findOneAndDelete({ _id: id, institution: req.user.institutionId });
    res.json({ success: true, message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
