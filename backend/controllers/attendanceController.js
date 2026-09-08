const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Session = require('../models/Session');

// Admin marks bulk attendance for a class on a date
exports.markAttendance = async (req, res) => {
  try {
    const { classId, sessionId, date, records } = req.body;
    // records = [{ studentId, status: 'Present'|'Absent'|'Late', remark }]

    if (!classId || !sessionId || !date || !Array.isArray(records)) {
      return res.status(400).json({ success: false, message: 'Class, Session, Date, and Attendance records array are required' });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const operations = records.map(rec => ({
      updateOne: {
        filter: { student: rec.studentId, date: attendanceDate },
        update: {
          $set: {
            session: sessionId,
            class: classId,
            status: rec.status || 'Present',
            remark: rec.remark || '',
            updatedByAdmin: req.user.id
          }
        },
        upsert: true
      }
    }));

    await Attendance.bulkWrite(operations);

    res.json({ success: true, message: `Attendance marked successfully for ${records.length} students` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin get class attendance overview with auto-calculated student percentage
exports.getClassAttendance = async (req, res) => {
  try {
    const { classId, date } = req.query;

    if (!classId) {
      return res.status(400).json({ success: false, message: 'Class ID is required' });
    }

    let queryDate = date ? new Date(date) : new Date();
    queryDate.setHours(0, 0, 0, 0);

    // Fetch students in class
    const students = await Student.find({ currentClass: classId, status: 'approved' }).sort({ name: 1 });

    // Fetch daily logs for these students
    const todayLogs = await Attendance.find({
      class: classId,
      date: queryDate
    });

    const todayLogMap = {};
    todayLogs.forEach(log => {
      todayLogMap[log.student.toString()] = log;
    });

    // Calculate percentage for each student
    const studentSummaries = await Promise.all(students.map(async (student) => {
      const allLogs = await Attendance.find({ student: student._id });
      const totalDays = allLogs.length;
      const presentCount = allLogs.filter(l => l.status === 'Present' || l.status === 'Late').length;
      const percentage = totalDays > 0 ? ((presentCount / totalDays) * 100).toFixed(1) : '100.0';

      return {
        student: {
          id: student._id,
          name: student.name,
          rollNumber: student.rollNumber,
          email: student.email
        },
        todayStatus: todayLogMap[student._id.toString()] ? todayLogMap[student._id.toString()].status : 'Present',
        todayRemark: todayLogMap[student._id.toString()] ? todayLogMap[student._id.toString()].remark : '',
        totalDays,
        presentCount,
        percentage: parseFloat(percentage)
      };
    }));

    res.json({ success: true, date: queryDate, students: studentSummaries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Student view own attendance records and total percentage
exports.getStudentAttendance = async (req, res) => {
  try {
    const studentId = req.user.userType === 'student' ? req.user.id : req.query.studentId;

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student ID is required' });
    }

    const logs = await Attendance.find({ student: studentId })
      .populate('session class')
      .sort({ date: -1 });

    const totalDays = logs.length;
    const presentCount = logs.filter(l => l.status === 'Present').length;
    const lateCount = logs.filter(l => l.status === 'Late').length;
    const absentCount = logs.filter(l => l.status === 'Absent').length;

    // Treat Late as Present for percentage calculation or give partial weight
    const effectivePresent = presentCount + lateCount;
    const percentage = totalDays > 0 ? ((effectivePresent / totalDays) * 100).toFixed(1) : '100.0';

    res.json({
      success: true,
      summary: {
        totalDays,
        presentCount,
        lateCount,
        absentCount,
        percentage: parseFloat(percentage)
      },
      logs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
