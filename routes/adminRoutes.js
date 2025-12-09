const express = require("express");
const router = express.Router();
const db = require("../config/db"); // PostgreSQL pool

// Get all users
router.get("/users", async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT id, fullName, email, created_at
      FROM users
      ORDER BY created_at DESC
    `);

    console.log("Fetched users:", rows); 
    res.json(rows);
  } catch (err) {
    console.error("Database error fetching users:", err);
    res.status(500).json({ message: "Database error", error: err });
  }
});

// Delete a user
router.delete("/users/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const result = await db.query("DELETE FROM users WHERE id=$1", [userId]);
    if (result.rowCount === 0)
      return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Database error deleting user:", err);
    res.status(500).json({ message: "Database error", error: err });
  }
});

// Get all reports
router.get("/reports", async (req, res) => {
  try {
    const sql = `
      SELECT r.*, u.fullName AS full_name, u.email
      FROM waste_reports r
      LEFT JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `;
    const { rows } = await db.query(sql);
    const reports = rows.map(r => ({
      ...r,
      files: r.files ? JSON.parse(r.files).map(f => `http://localhost:3000${f}`) : []
    }));
    res.json(reports);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ message: "Database error", error: err });
  }
});

// Update report status
router.put("/reports/:id", async (req, res) => {
  const reportId = req.params.id;
  const { status } = req.body;
  try {
    const result = await db.query(
      "UPDATE waste_reports SET status=$1 WHERE id=$2",
      [status, reportId]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: "Report not found" });
    res.json({ message: "Status updated successfully" });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ message: "Database error", error: err });
  }
});

// Delete a report
router.delete("/reports/:id", async (req, res) => {
  const reportId = req.params.id;
  try {
    const result = await db.query(
      "DELETE FROM waste_reports WHERE id=$1",
      [reportId]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: "Report not found" });
    res.json({ message: "Report deleted successfully" });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ message: "Database error", error: err });
  }
});

// Get 5 newest users
router.get("/new-users", async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT id, fullName, email, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 5
    `);
    res.json(rows);
  } catch (err) {
    console.error("Database error fetching new users:", err);
    res.status(500).json({ message: "Database error", error: err });
  }
});

// Get 5 newest reports
router.get("/new-reports", async (req, res) => {
  try {
    const sql = `
      SELECT r.id, r.description, r.created_at, u.fullName AS full_name
      FROM waste_reports r
      LEFT JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
      LIMIT 5
    `;
    const { rows } = await db.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("Database error fetching new reports:", err);
    res.status(500).json({ message: "Database error", error: err });
  }
});

// Get new users count in last 24 hours
router.get("/new-users-count", async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT COUNT(*) AS count
      FROM users
      WHERE created_at >= NOW() - INTERVAL '1 day'
    `);
    res.json(rows[0]);
  } catch (err) {
    console.error("Database error fetching new users count:", err);
    res.status(500).json({ message: "Database error", error: err });
  }
});

module.exports = router;
