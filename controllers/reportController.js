const db = require("../config/db");

const createReport = async (req, res) => {
  try {
    const { issue_type, priority, location, description, full_name, phone, email } = req.body;
    const user_id = req.user?.id;
    const files = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const result = await db.query(
      `INSERT INTO waste_reports
        (user_id, issue_type, priority, location, description, files, full_name, phone, email, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING id`,
      [user_id, issue_type, priority, location, description, JSON.stringify(files), full_name || null, phone || null, email || null, "Pending"]
    );

    res.status(201).json({ message: "Report created", reportId: result.rows[0].id, files });
  } catch (err) {
    console.error("Create report error:", err);
    res.status(500).json({ message: "Failed to create report" });
  }
};

const getUserReports = async (req, res) => {
  try {
    const userId = req.user?.id;
    const result = await db.query(
      "SELECT * FROM waste_reports WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );

    const reports = result.rows.map(report => ({ ...report, files: report.files ? JSON.parse(report.files) : [] }));
    res.json(reports);
  } catch (err) {
    console.error("Error fetching user reports:", err);
    res.status(500).json({ message: "Failed to fetch reports" });
  }
};

module.exports = { createReport, getUserReports };
