const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: "localhost",
  user: 'root',
  password: '',
  database: 'db_jobb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper function for pagination + search
async function queryWithCount(sql, countSql, params, countParams, page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  const conn = await pool.getConnection();
  try {
    const [countResult] = await conn.query(countSql, countParams);
    const totalRecords = countResult[0].total;
    const totalPages = Math.ceil(totalRecords / limit);

    const [data] = await conn.query(sql, [...params, limit, offset]);
    return { data, totalPages, totalRecords };
  } finally {
    conn.release();
  }
}

// --- Hardskill ---
app.get('/hardskill', async (req, res) => {
  try {
    const { page = 1, limit = 10, keyword = "" } = req.query;
    const sql = `SELECT * FROM hardskill WHERE hardskill_name LIKE ? ORDER BY hardskill_id DESC LIMIT ? OFFSET ?`;
    const countSql = `SELECT COUNT(*) AS total FROM hardskill WHERE hardskill_name LIKE ?`;
    const result = await queryWithCount(sql, countSql, [`%${keyword}%`], [`%${keyword}%`], Number(page), Number(limit));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/hardskill/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { hardskill_name } = req.body;
    const sql = "UPDATE hardskill SET hardskill_name = ? WHERE hardskill_id = ?";
    const [result] = await pool.query(sql, [hardskill_name, id]);
    res.json({ message: "อัปเดตสำเร็จ!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/hardskill", async (req, res) => {
  try {
    const { hardskill_name } = req.body;
    if (!hardskill_name || hardskill_name.trim() === "") {
      return res.status(400).json({ error: "กรุณากรอกชื่อทักษะ" });
    }
    const sql = "INSERT INTO hardskill (hardskill_name) VALUES (?)";
    const [result] = await pool.query(sql, [hardskill_name]);
    res.json({ message: "เพิ่มข้อมูลสำเร็จ!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/hardskill/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const sql = "DELETE FROM hardskill WHERE hardskill_id = ?";
    const [result] = await pool.query(sql, [id]);
    res.json({ message: "ลบข้อมูลสำเร็จ!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Softskill ---
app.get('/softskill', async (req, res) => {
  try {
    const { page = 1, limit = 10, keyword = "" } = req.query;
    const sql = `SELECT * FROM softskill WHERE softskill_name LIKE ? ORDER BY softskill_id DESC LIMIT ? OFFSET ?`;
    const countSql = `SELECT COUNT(*) AS total FROM softskill WHERE softskill_name LIKE ?`;
    const result = await queryWithCount(sql, countSql, [`%${keyword}%`], [`%${keyword}%`], Number(page), Number(limit));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/softskill/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { softskill_name } = req.body;
    const sql = "UPDATE softskill SET softskill_name = ? WHERE softskill_id = ?";
    await pool.query(sql, [softskill_name, id]);
    res.json({ message: "อัปเดตสำเร็จ!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/softskill", async (req, res) => {
  try {
    const { softskill_name } = req.body;
    if (!softskill_name || softskill_name.trim() === "") {
      return res.status(400).json({ error: "กรุณากรอกชื่อทักษะ" });
    }
    const sql = "INSERT INTO softskill (softskill_name) VALUES (?)";
    await pool.query(sql, [softskill_name]);
    res.json({ message: "เพิ่มข้อมูลสำเร็จ!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/softskill/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const sql = "DELETE FROM softskill WHERE softskill_id = ?";
    await pool.query(sql, [id]);
    res.json({ message: "ลบข้อมูลสำเร็จ!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Jobtype ---
app.get('/jobtype', async (req, res) => {
  try {
    const { page = 1, limit = 10, keyword = "" } = req.query;
    const sql = `SELECT * FROM jobtype WHERE jobtype_name LIKE ? ORDER BY jobtype_id DESC LIMIT ? OFFSET ?`;
    const countSql = `SELECT COUNT(*) AS total FROM jobtype WHERE jobtype_name LIKE ?`;
    const result = await queryWithCount(sql, countSql, [`%${keyword}%`], [`%${keyword}%`], Number(page), Number(limit));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/jobtype/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { jobtype_name } = req.body;
    const sql = "UPDATE jobtype SET jobtype_name = ? WHERE jobtype_id = ?";
    await pool.query(sql, [jobtype_name, id]);
    res.json({ message: "อัปเดตสำเร็จ!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/jobtypesta/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const sql = "UPDATE jobtype SET status = IF(status = 'ON', 'OFF', 'ON') WHERE jobtype_id = ?";
    await pool.query(sql, [id]);
    res.json({ message: "อัปเดตสำเร็จ!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/jobtype", async (req, res) => {
  try {
    const { jobtype_name } = req.body;
    if (!jobtype_name || jobtype_name.trim() === "") {
      return res.status(400).json({ error: "กรุณากรอกชื่อประเภทงาน" });
    }
    const sql = "INSERT INTO jobtype (jobtype_name) VALUES (?)";
    await pool.query(sql, [jobtype_name]);
    res.json({ message: "เพิ่มข้อมูลสำเร็จ!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/jobtype/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const sql = "DELETE FROM jobtype WHERE jobtype_id = ?";
    await pool.query(sql, [id]);
    res.json({ message: "ลบข้อมูลสำเร็จ!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Voluntype ---
app.get('/voluntype', async (req, res) => {
  try {
    const { page = 1, limit = 10, keyword = "" } = req.query;
    const sql = `SELECT * FROM volunteertype WHERE voluntype_name LIKE ? ORDER BY voluntype_id DESC LIMIT ? OFFSET ?`;
    const countSql = `SELECT COUNT(*) AS total FROM volunteertype WHERE voluntype_name LIKE ?`;
    const result = await queryWithCount(sql, countSql, [`%${keyword}%`], [`%${keyword}%`], Number(page), Number(limit));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/voluntype/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { voluntype_name } = req.body;
    const sql = "UPDATE volunteertype SET voluntype_name = ? WHERE voluntype_id = ?";
    await pool.query(sql, [voluntype_name, id]);
    res.json({ message: "อัปเดตสำเร็จ!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/voluntypesta/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const sql = "UPDATE volunteertype SET status = IF(status = 'ON', 'OFF', 'ON') WHERE voluntype_id = ?";
    await pool.query(sql, [id]);
    res.json({ message: "อัปเดตสำเร็จ!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/voluntype", async (req, res) => {
  try {
    const { voluntype_name } = req.body;
    if (!voluntype_name || voluntype_name.trim() === "") {
      return res.status(400).json({ error: "กรุณากรอกชื่อประเภทกิจกรรมจิตอาสา" });
    }
    const sql = "INSERT INTO volunteertype (voluntype_name) VALUES (?)";
    await pool.query(sql, [voluntype_name]);
    res.json({ message: "เพิ่มข้อมูลสำเร็จ!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/voluntype/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const sql = "DELETE FROM volunteertype WHERE voluntype_id = ?";
    await pool.query(sql, [id]);
    res.json({ message: "ลบข้อมูลสำเร็จ!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Position ---
app.get('/position', async (req, res) => {
  try {
    const { page = 1, limit = 10, keyword = "" } = req.query;
    const sql = `SELECT position.*, jobtype.jobtype_name FROM position INNER JOIN jobtype ON position.jobtype_id = jobtype.jobtype_id WHERE position_name LIKE ? ORDER BY position_id DESC LIMIT ? OFFSET ?`;
    const countSql = `SELECT COUNT(*) AS total FROM position WHERE position_name LIKE ?`;
    const result = await queryWithCount(sql, countSql, [`%${keyword}%`], [`%${keyword}%`], Number(page), Number(limit));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/position/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { position_name, jobtype_id } = req.body;
    const sql = "UPDATE position SET position_name = ?, jobtype_id = ? WHERE position_id = ?";
    await pool.query(sql, [position_name, jobtype_id, id]);
    res.json({ message: "อัปเดตสำเร็จ!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/positionsta/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const sql = "UPDATE position SET status = IF(status = 'ON', 'OFF', 'ON') WHERE position_id = ?";
    await pool.query(sql, [id]);
    res.json({ message: "อัปเดตสำเร็จ!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/position", async (req, res) => {
  try {
    const { position_name, jobtype_id } = req.body;
    if (!position_name || position_name.trim() === "") {
      return res.status(400).json({ error: "กรุณากรอกชื่อตำแหน่งงาน" });
    }
    const sql = "INSERT INTO position (position_name, jobtype_id) VALUES (?, ?)";
    await pool.query(sql, [position_name, jobtype_id]);
    res.json({ message: "เพิ่มข้อมูลสำเร็จ!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/position/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const sql = "DELETE FROM position WHERE position_id = ?";
    await pool.query(sql, [id]);
    res.json({ message: "ลบข้อมูลสำเร็จ!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- jobtypeall ---
app.get('/jobtypeall', async (req, res) => {
  try {
    const sql = "SELECT * FROM jobtype WHERE status = 'ON'";
    const [result] = await pool.query(sql);
    res.json({ jobtypedata: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Login ---
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const sql = "SELECT * FROM jobber WHERE email = ?";
    const [results] = await pool.query(sql, [email]);

    if (results.length === 0) {
      return res.status(401).json({ message: "ไม่พบผู้ใช้งาน" });
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "รหัสผ่านไม่ถูกต้อง" });
    }

    return res.status(200).json({
      status: user.status,
      message: "Login successful",
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ message: "Database Error" });
  }
});

// --- Update jobber status ---
app.put("/jobbersta/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const sql = "UPDATE jobber SET status = IF(status = 'ON', 'OFF', 'ON') WHERE jobber_id = ?";
    await pool.query(sql, [id]);
    res.json({ message: "อัปเดตสำเร็จ!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Register ---
app.post('/register', async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;
    if (!firstname || !email || !password) {
      return res.status(400).json({ message: "ข้อมูลไม่ครบ!" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const checkSql = "SELECT * FROM jobber WHERE email = ?";
    const [checkResult] = await pool.query(checkSql, [email]);

    if (checkResult.length > 0) {
      return res.status(409).json({ message: "มีผู้ใช้งานนี้อยู่แล้ว" });
    }

    const sql = "INSERT INTO jobber (fullname, email, password, status) VALUES (?, ?, ?, 'ON')";
    const fullname = `${firstname} ${lastname}`;
    await pool.query(sql, [fullname, email, hashPassword]);

    return res.json({ message: "สมัครสมาชิกสำเร็จ" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// --- Jobber List ---
app.get('/jobber', async (req, res) => {
  try {
    const { page = 1, limit = 10, keyword = "" } = req.query;
    const offset = (page - 1) * limit;

    const totalsql = `SELECT COUNT(*) AS total FROM jobber WHERE fullname LIKE ? AND status != 'admin'`;
    const sql = `SELECT jobber.jobber_id, fullname, picture, jobber.status, work_status,
                 CASE WHEN interests_volun.jobber_id IS NOT NULL THEN '/' ELSE '-' END AS j_volun
                 FROM jobber LEFT JOIN interests_volun ON jobber.jobber_id = interests_volun.jobber_id
                 WHERE fullname LIKE ? AND jobber.status != 'admin'
                 LIMIT ? OFFSET ?`;

    const [totalResult] = await pool.query(totalsql, [`%${keyword}%`]);
    const totalRecords = totalResult[0].total;
    const totalPages = Math.ceil(totalRecords / limit);

    const [data] = await pool.query(sql, [`%${keyword}%`, Number(limit), Number(offset)]);
    res.json({ data, totalPages, totalRecords });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Employer list ---
app.get('/emp', async (req, res) => {
  try {
    const { page = 1, limit = 10, keyword = "" } = req.query;
    const offset = (page - 1) * limit;

    const totalsql = `SELECT COUNT(*) AS total FROM employer WHERE employer_name LIKE ? AND status != 'admin'`;
    const sql = `SELECT * FROM employer WHERE employer_name LIKE ? AND status != 'admin' ORDER BY employer_id DESC LIMIT ? OFFSET ?`;

    const [totalResult] = await pool.query(totalsql, [`%${keyword}%`]);
    const totalRecords = totalResult[0].total;
    const totalPages = Math.ceil(totalRecords / limit);

    const [data] = await pool.query(sql, [`%${keyword}%`, Number(limit), Number(offset)]);
    res.json({ data, totalPages, totalRecords });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Update Employer Status ---
app.put("/empsta/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const sql = "UPDATE employer SET status = IF(status = 'ON', 'OFF', 'ON') WHERE employer_id = ?";
    await pool.query(sql, [id]);
    res.json({ message: "อัปเดตสำเร็จ!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
