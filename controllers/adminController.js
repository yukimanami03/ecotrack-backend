const db = require('../config/db');

const getAllReports = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM waste_reports ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const result = await db.query('SELECT id, full_name, email, role FROM users ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

const updateReport = async (req, res) => {
  const reportId = req.params.id;
  const { status, description, priority, location } = req.body;

  try {
    const result = await db.query(
      `UPDATE waste_reports 
       SET status = $1, description = $2, priority = $3, location = $4 
       WHERE id = $5`,
      [status, description, priority, location, reportId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json({ message: 'Report updated successfully' });
  } catch (err) {
    console.error('Error updating report:', err);
    res.status(500).json({ message: 'Failed to update report' });
  }
};

const deleteReport = async (req, res) => {
  const reportId = req.params.id;

  try {
    const result = await db.query('DELETE FROM waste_reports WHERE id = $1', [reportId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json({ message: 'Report deleted successfully' });
  } catch (err) {
    console.error('Error deleting report:', err);
    res.status(500).json({ message: 'Failed to delete report' });
  }
};

module.exports = { getAllReports, getAllUsers, updateReport, deleteReport };
