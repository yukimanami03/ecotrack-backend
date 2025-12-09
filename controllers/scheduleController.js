const db = require('../config/db'); // pg Pool instance

const getSchedules = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM collection_schedules ORDER BY collection_date ASC, start_time ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get schedules error:', err);
    res.status(500).json({ message: 'Failed to fetch schedules' });
  }
};

const createSchedule = async (req, res) => {
  const { day, collection_date, type, start_time, end_time } = req.body;
  if (!day || !collection_date || !type || !start_time || !end_time) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const result = await db.query(
      `INSERT INTO collection_schedules (day, collection_date, type, start_time, end_time)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [day, collection_date, type, start_time, end_time]
    );
    res.status(201).json({ message: 'Schedule created', scheduleId: result.rows[0].id });
  } catch (err) {
    console.error('Create schedule error:', err);
    res.status(500).json({ message: 'Failed to create schedule' });
  }
};

const updateSchedule = async (req, res) => {
  const { id } = req.params;
  const { day, collection_date, type, start_time, end_time } = req.body;

  try {
    const result = await db.query(
      `UPDATE collection_schedules
       SET day=$1, collection_date=$2, type=$3, start_time=$4, end_time=$5
       WHERE id=$6`,
      [day, collection_date, type, start_time, end_time, id]
    );

    if (result.rowCount === 0) return res.status(404).json({ message: 'Schedule not found' });

    res.json({ message: 'Schedule updated' });
  } catch (err) {
    console.error('Update schedule error:', err);
    res.status(500).json({ message: 'Failed to update schedule' });
  }
};

const deleteSchedule = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM collection_schedules WHERE id=$1', [id]);

    if (result.rowCount === 0) return res.status(404).json({ message: 'Schedule not found' });

    res.json({ message: 'Schedule deleted' });
  } catch (err) {
    console.error('Delete schedule error:', err);
    res.status(500).json({ message: 'Failed to delete schedule' });
  }
};

module.exports = { getSchedules, createSchedule, updateSchedule, deleteSchedule };
