const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Institution = require('./models/Institution');
const Admin = require('./models/Admin');
const Session = require('./models/Session');
const ClassModel = require('./models/Class');
const Student = require('./models/Student');
const Attendance = require('./models/Attendance');
const Fee = require('./models/Fee');
const Announcement = require('./models/Announcement');
const Result = require('./models/Result');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cbserp_db';

// Generate a dummy valid PDF file
const ensureSamplePDF = (filename, titleText) => {
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filePath = path.join(uploadsDir, filename);
  const pdfContent = `%PDF-1.4
1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj
2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj
3 0 obj <</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources <</Font <</F1 5 0 R>>>> >> endobj
4 0 obj <</Length 65>> stream
BT /F1 18 Tf 50 700 TD (${titleText}) Tj ET
endstream endobj
5 0 obj <</Type /Font /Subtype /Type1 /BaseFont /Helvetica>> endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000244 00000 n
0000000359 00000 n
trailer <</Size 6 /Root 1 0 R>>
startxref
428
%%EOF`;

  fs.writeFileSync(filePath, pdfContent);
  return `/uploads/${filename}`;
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('🌱 Connected to MongoDB for seeding...');

    // Clear existing collections
    await Institution.deleteMany({});
    await Admin.deleteMany({});
    await Session.deleteMany({});
    await ClassModel.deleteMany({});
    await Student.deleteMany({});
    await Attendance.deleteMany({});
    await Fee.deleteMany({});
    await Announcement.deleteMany({});
    await Result.deleteMany({});

    // 1. Institution
    const institution = await Institution.create({
      name: 'Greenwood International Academy',
      address: '742 Evergreen Terrace, Springfield',
      code: 'GIA-2026'
    });
    console.log('🏫 Created Institution:', institution.name);

    // 2. Admins with roles
    const admin1 = await Admin.create({
      institution: institution._id,
      name: 'Dr. Arthur Pendelton',
      email: 'admin@greenwood.edu',
      password: 'admin123',
      role: 'Principal & Chief Administrator'
    });

    const admin2 = await Admin.create({
      institution: institution._id,
      name: 'Prof. Sarah Jenkins',
      email: 'vp@greenwood.edu',
      password: 'admin123',
      role: 'Head of Academic Affairs'
    });
    console.log('👨‍💼 Created Admins: Principal and Academic Head');

    // 3. Academic Sessions
    const activeSession = await Session.create({
      institution: institution._id,
      yearLabel: '2025-2026',
      isActive: true
    });

    const oldSession = await Session.create({
      institution: institution._id,
      yearLabel: '2024-2025',
      isActive: false
    });
    console.log('📅 Created Sessions: 2025-2026 (Active), 2024-2025');

    // 4. Classes
    const class10A = await ClassModel.create({
      institution: institution._id,
      session: activeSession._id,
      className: 'Class 10',
      section: 'A'
    });

    const class12A = await ClassModel.create({
      institution: institution._id,
      session: activeSession._id,
      className: 'Class 12',
      section: 'A'
    });
    console.log('🏫 Created Classes: Class 10-A, Class 12-A');

    // 5. Students (Approved & Pending)
    const student1 = await Student.create({
      institution: institution._id,
      currentClass: class10A._id,
      addedByAdmin: admin1._id,
      name: 'Alex Smith',
      email: 'alex.smith@student.com',
      password: 'student123',
      rollNumber: '1001',
      status: 'approved'
    });

    const student2 = await Student.create({
      institution: institution._id,
      currentClass: class10A._id,
      addedByAdmin: admin2._id,
      name: 'Emma Watson',
      email: 'emma.watson@student.com',
      password: 'student123',
      rollNumber: '1002',
      status: 'approved'
    });

    const student3 = await Student.create({
      institution: institution._id,
      currentClass: class10A._id,
      addedByAdmin: null,
      name: 'David Miller',
      email: 'david.miller@student.com',
      password: 'student123',
      rollNumber: '1003',
      status: 'pending' // Needs admin approval!
    });
    console.log('👨‍🎓 Created Students: Alex Smith (Approved), Emma Watson (Approved), David Miller (Pending Approval)');

    // 6. Attendance Records
    const today = new Date();
    for (let i = 0; i < 10; i++) {
      const pastDate = new Date(today);
      pastDate.setDate(today.getDate() - i);
      pastDate.setHours(0, 0, 0, 0);

      // Alex: 8 present out of 10
      await Attendance.create({
        student: student1._id,
        session: activeSession._id,
        class: class10A._id,
        date: pastDate,
        status: i % 5 === 0 ? 'Absent' : 'Present',
        remark: i % 5 === 0 ? 'Medical leave requested' : 'Regular Attendance',
        updatedByAdmin: admin1._id
      });

      // Emma: 10 present out of 10
      await Attendance.create({
        student: student2._id,
        session: activeSession._id,
        class: class10A._id,
        date: pastDate,
        status: 'Present',
        remark: 'Punctual & Active',
        updatedByAdmin: admin2._id
      });
    }
    console.log('📊 Generated Attendance history');

    // 7. Fee Records
    await Fee.create({
      student: student1._id,
      session: activeSession._id,
      totalAmount: 5000,
      paidAmount: 3500,
      pendingAmount: 1500,
      remarks: 'First installment paid on Jan 10. Balance due by March 15.',
      updatedByAdmin: admin1._id
    });

    await Fee.create({
      student: student2._id,
      session: activeSession._id,
      totalAmount: 5000,
      paidAmount: 5000,
      pendingAmount: 0,
      remarks: 'Full annual tuition fee settled.',
      updatedByAdmin: admin2._id
    });
    console.log('💳 Generated Fee structures');

    // 8. Announcement with attached PDF
    const annPdfUrl = ensureSamplePDF('announcement_sports_2026.pdf', 'Greenwood Academy Annual Sports Meet 2026 Circular');
    await Announcement.create({
      institution: institution._id,
      uploadedByAdmin: admin1._id,
      title: 'Annual Sports Meet & Cultural Festival 2026',
      description: 'We are pleased to announce that our Annual Sports Meet will take place from March 10 to March 14. Please download the attached PDF circular for the event schedule and registration guidelines.',
      pdfUrl: annPdfUrl
    });

    await Announcement.create({
      institution: institution._id,
      uploadedByAdmin: admin2._id,
      title: 'Final Examination Date Sheet Released',
      description: 'The timetable for the upcoming Mid-Term & Final examinations for Class 10 and 12 has been finalized.',
      pdfUrl: annPdfUrl
    });
    console.log('📢 Created PDF Announcements');

    // 9. Exam Results with sample report card PDF
    const resultPdfUrl = ensureSamplePDF('report_card_alex_smith.pdf', 'Official Report Card - Alex Smith Class 10');
    await Result.create({
      student: student1._id,
      session: activeSession._id,
      examName: 'Mid-Term Examinations 2025-26',
      pdfUrl: resultPdfUrl,
      percentage: 91.6,
      grade: 'A+',
      remarks: 'Outstanding performance in Mathematics and Computer Science.',
      marks: [
        { subject: 'Mathematics', marksObtained: 95, maxMarks: 100, grade: 'A+' },
        { subject: 'Physics', marksObtained: 88, maxMarks: 100, grade: 'A' },
        { subject: 'Chemistry', marksObtained: 92, maxMarks: 100, grade: 'A+' },
        { subject: 'English Literature', marksObtained: 90, maxMarks: 100, grade: 'A+' },
        { subject: 'Computer Science', marksObtained: 93, maxMarks: 100, grade: 'A+' }
      ],
      uploadedByAdmin: admin2._id
    });

    await Result.create({
      student: student2._id,
      session: activeSession._id,
      examName: 'Mid-Term Examinations 2025-26',
      pdfUrl: resultPdfUrl,
      percentage: 94.8,
      grade: 'A+',
      remarks: 'Top scorer in Science and Humanities.',
      marks: [
        { subject: 'Mathematics', marksObtained: 98, maxMarks: 100, grade: 'A+' },
        { subject: 'Physics', marksObtained: 95, maxMarks: 100, grade: 'A+' },
        { subject: 'Chemistry', marksObtained: 94, maxMarks: 100, grade: 'A+' },
        { subject: 'English Literature', marksObtained: 92, maxMarks: 100, grade: 'A+' },
        { subject: 'Computer Science', marksObtained: 95, maxMarks: 100, grade: 'A+' }
      ],
      uploadedByAdmin: admin1._id
    });
    console.log('🎓 Created Exam Results with Report Cards');

    console.log('\n=============================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('=============================================================');
    console.log('🏫 Institution Name: Greenwood International Academy');
    console.log('\n🔑 SAMPLE CREDENTIALS FOR TESTING:');
    console.log('-------------------------------------------------------------');
    console.log('1. Admin Account (Principal):');
    console.log('   Email: admin@greenwood.edu | Password: admin123');
    console.log('\n2. Admin Account (Vice Principal):');
    console.log('   Email: vp@greenwood.edu | Password: admin123');
    console.log('\n3. Approved Student Account (Alex Smith):');
    console.log('   Email: alex.smith@student.com | Password: student123 | Institution: Greenwood International Academy');
    console.log('\n4. Approved Student Account (Emma Watson):');
    console.log('   Email: emma.watson@student.com | Password: student123 | Institution: Greenwood International Academy');
    console.log('\n5. Pending Student Account (David Miller):');
    console.log('   Email: david.miller@student.com | Password: student123 | Institution: Greenwood International Academy');
    console.log('   (Note: Logging in with David Miller will test the Admin-Approval Guard!)');
    console.log('=============================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder Error:', error);
    process.exit(1);
  }
};

seedDatabase();
