//node v22.14.0
import { Server } from "socket.io";
import http from "http";
import express from 'express';
import mysql from 'mysql';
import cors from 'cors';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import sendVerificationEmail from './utils/sendEmail.js';
import { promisify } from 'util';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween.js"; // ต้องมี .js
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js';
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter.js';
import cron from "node-cron";
import { NotificationService } from "./servies/noti.service.js";

dayjs.extend(isSameOrAfter);
dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const PORT = 8000;

const JWT_SECRET = process.env.JWT_SECRET;

const app = express()
app.use(cors())
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id);
});

httpServer.listen(8000, () => {
  console.log("🚀 Server & Socket.IO running on http://localhost:8000");
});


// const db = mysql.createConnection({
//     host: "localhost",
//     user: 'root',
//     password: '',
//     database: 'db_jobb'
// })

const db = mysql.createPool({
  host: "localhost",
  user: 'root',
  password: 'root257171',
  database: 'db_jobb',
  connectionLimit: 10,
});

const query = db.query.bind(db);

db.query('SELECT 1', (err, results) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL");
  }
});

db.query("SET time_zone = '+07:00'", (err) => {
  if (err) {
    console.error("❌ Error setting time zone:", err);
  } else {
    console.log("✅ MySQL time_zone set to +07:00 (Asia/Bangkok)");
  }
});


/*app.get('/' , (re , res)=> {
   return res.json("From Backend Side"); 
})*/

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: "Token not found" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token invalid" });

    req.user = user; // ข้อมูลจาก token
    next(); // ไป route ถัดไป
  });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      let subfolder = "other";

      if (req.originalUrl.includes("user_edu_add")) {
        subfolder = "user_file";
      } else if (req.originalUrl.includes("user_edu_update")) {
        subfolder = "user_file"; // ใช้โฟลเดอร์เดิม
      } else if (req.originalUrl.includes("user_workex_add")) {
        subfolder = "user_workfile"; // ใช้โฟลเดอร์เดิม
      } else if (req.originalUrl.includes("user_workex_update")) {
        subfolder = "user_workfile"; // ใช้โฟลเดอร์เดิม
      } else if (req.originalUrl.includes("jobber_up_picture")) {
        subfolder = "user_pic";
      } else if (req.originalUrl.includes("job_posting_add")) {
        subfolder = "emp_pic";
      } else if (req.originalUrl.includes("jobpost_up_picture")) {
        subfolder = "emp_pic";
      } else if (req.originalUrl.includes("volun_posting_add")) {
        subfolder = "emp_pic";
      } else if (req.originalUrl.includes("volunpost_up_picture")) {
        subfolder = "emp_pic";
      } else if (req.originalUrl.includes("emp_up_picture")) {
        subfolder = "emp_pic";
      }

      const uploadPath = path.join(__dirname, 'uploads', subfolder);

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
      cb(null, uniqueName);
    }
  })
});
const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'jobvolun.service@gmail.com',
                        pass: 'fbjyivghplprsvre' // ใช้ App Password จาก Gmail
                    }
                });
                
const notifService = new NotificationService(db, io, transporter);
export default notifService;



// 1) ใกล้หมดอายุ: ทุกชั่วโมง
cron.schedule("0 * * * *", async () => {
  const soonSql = `
    SELECT 
      aj.post_id,
      aj.jobber_id,
      j.emp_id,
      p.position_name,
      e.fullname as efull,
      jb.fullname as jfull,
      e.email as empEmail,
      jb.email as jobberEmail
    FROM apply_job aj
    JOIN job_posting j ON aj.post_id = j.post_id
    JOIN employer e ON j.emp_id = e.emp_id
    JOIN jobber jb ON aj.jobber_id = jb.jobber_id
    JOIN position p ON j.position_code = p.position_id
    WHERE aj.status = 'waitjobber'
      AND aj.expire_time BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 1 DAY)
      AND aj.review_noti_sent = 0
      AND aj.warn_sent = 0
  `;
  db.query(soonSql, async (err, rows) => {
    if (err) return console.error(err);
    // const ids = [];
    for (const r of rows) {
      // ids.push(r.id);
      // ส่งให้นายจ้าง + ผู้สมัคร (เหมือนที่คุณทำอยู่)
      await notifService.add({ 
        receiverRole: "emp", 
        receiverId: r.emp_id, 
        eventKey: "MATCH_EXPIRE_SOON",
        title: "ผู้สมัครไม่มีการตอบกลับ", 
        body: `ผู้สมัคร ${r.jfull} ที่คุณเลือกในตำแหน่ง "${r.position_name}" ใกล้หมดอายุ`, 
        postId: r.post_id, 
        jobberId: r.jobber_id, 
        employerId: r.emp_id, 
        meta: { link: `/Emp_Job_Post?pi=${r.post_id}` }, //ถูกมั้ยใส่ลิ้งค์ไปหน้ารายละเอียดที่มีผู้สมัครและรายละเอียดงาน
        email: r.empEmail });

      await notifService.add({ 
        receiverRole: "jobber", 
        receiverId: r.jobber_id, 
        eventKey: "MATCH_EXPIRE_SOON",
        title: "นายจ้างรอคุณตอบกลับอยู่น้า", 
        body: `งานตำแหน่ง "${r.position_name}" ที่นายจ้าง ${r.efull} เลือกคุณ และรอคุณตอบกลับกำลังจะหมดอายุลง`, 
        postId: r.post_id, 
        jobberId: r.jobber_id, 
        employerId: r.emp_id, 
        meta: {
          "accept": { "label": "ตอบกลับ", "modalId" : "accept_modal" },
          "reject": { "label": "ปฏิเสธ", "modalId" : "reject_modal" } //ใส่ลิงค์เพื่อไปกดmodal ใส่modalId 
        }, 
        email: r.jobberEmail });

        db.query(
          `UPDATE apply_job SET warn_sent = 1 WHERE post_id = ? AND jobber_id = ?`,
          [r.post_id , r.jobber_id],
          (e) => e && console.error("Update flag error:", e)
        );
    }
  });
});

// ┌───────────── นาที (0 - 59)
// │ ┌───────────── ชั่วโมง (0 - 23)
// │ │ ┌───────────── วันที่ (1 - 31)
// │ │ │ ┌───────────── เดือน (1 - 12)
// │ │ │ │ ┌───────────── วันในสัปดาห์ (0 - 7) (0=อาทิตย์, 1=จันทร์,... 7=อาทิตย์)
// │ │ │ │ │
// │ │ │ │ │
// * * * * *

// "0 * * * *"

// นาที = 0

// ชั่วโมง = * (ทุกชั่วโมง)

// ทุกวัน ทุกเดือน ทุกวันในสัปดาห์
// 👉 แปลว่า “ทุก ๆ ชั่วโมงตรงนาทีที่ 0” เช่น 12:00, 13:00, 14:00 …

// "*/15 * * * *"

// นาที = */15 (ทุก 15 นาที)

// ชั่วโมง = * (ทุกชั่วโมง)

// ทุกวัน ทุกเดือน ทุกวันในสัปดาห์
// 👉 แปลว่า “ทุก 15 นาที” เช่น 12:00, 12:15, 12:30, 12:45 …

// "0 9 * * 1"

// นาที = 0

// ชั่วโมง = 9

// วัน = * (ทุกวันของเดือน)

// เดือน = * (ทุกเดือน)

// วันในสัปดาห์ = 1 (จันทร์)
// 👉 แปลว่า “ทุกวันจันทร์ เวลา 9:00 น.”

// 2) หมดอายุแล้ว: ทุก 15 นาที
cron.schedule("*/15 * * * *", async () => {
  const expSql = `
    SELECT 
      aj.post_id,
      aj.jobber_id,
      j.emp_id,
      p.position_name,
      e.fullname as efull,
      jb.fullname as jfull,
      e.email as empEmail,
      jb.email as jobberEmail
    FROM apply_job aj
    JOIN job_posting j ON aj.post_id = j.post_id
    JOIN employer e ON j.emp_id = e.emp_id
    JOIN jobber jb ON aj.jobber_id = jb.jobber_id
    JOIN position p ON j.position_code = p.position_id
    WHERE aj.status = 'waitjobber'
      AND aj.expire_time <= NOW()
  `;
  db.query(expSql, async (err, rows) => {
    if (err) return console.error(err);
    // const ids = [];
    for (const r of rows) {
      // ids.push(r.id);
      await notifService.add({ receiverRole: "emp", receiverId: r.emp_id, eventKey: "MATCH_EXPIRED",
        title: "การเลือกผู้สมัครหมดอายุแล้ว", body: `ตำแหน่ง "${r.position_name}" หมดอายุแล้ว`, 
        postId: r.post_id, jobberId: r.jobber_id, employerId: r.emp_id, meta: { link: `/Emp_Job_Post?pi=${r.post_id}` }, email: r.empEmail });
      await notifService.add({ receiverRole: "jobber", receiverId: r.jobber_id, eventKey: "MATCH_EXPIRED",
        title: "งานที่เลือกคุณหมดอายุแล้ว", body: `ตำแหน่ง "${r.position_name}" หมดอายุแล้ว`, 
        postId: r.post_id, jobberId: r.jobber_id, employerId: r.emp_id, meta: { link: `/Job_Post_de?pi=${r.post_id}` }, email: r.jobberEmail });
    
        db.query(`UPDATE apply_job SET status = 'expired' WHERE post_id = ? AND jobber_id =?`, [r.post_id , r.jobber_id], () => {});
    }
    // if (ids.length) {
      
    // }
  });
});

cron.schedule("*/1 * * * *", async () => {
  const Sql = `
    SELECT 
      aj.post_id,
      aj.jobber_id,
      j.emp_id,
      p.position_name,
      e.fullname as efull,
      jb.fullname as jfull,
      e.email as empEmail,
      jb.email as jobberEmail
    FROM apply_job aj
    JOIN job_posting j ON aj.post_id = j.post_id
    JOIN employer e ON j.emp_id = e.emp_id
    JOIN jobber jb ON aj.jobber_id = jb.jobber_id
    JOIN position p ON j.position_code = p.position_id
    WHERE aj.status = 'accepted'
      AND DATE_ADD(aj.date_time, INTERVAL 1 WEEK) <= NOW()
      AND aj.review_noti_sent = 0
  `;
  db.query(Sql, async (err, rows) => {
    if (err) return console.error(err);
    // const ids = [];
    for (const r of rows) {
      // ids.push(r.id);
      // ส่งให้นายจ้าง + ผู้สมัคร (เหมือนที่คุณทำอยู่)
      await notifService.add({ 
        receiverRole: "emp", 
        receiverId: r.emp_id, 
        eventKey: "REVIEW_JOBBER",
        title: "ให้คะแนนผู้สมัคร", 
        body: `คุณสามารถให้คะแนนและแสดงความคิดเห็นผู้สมัคร ${r.jfull} ที่คุณเลือกในตำแหน่ง "${r.position_name}"`, 
        postId: r.post_id, 
        jobberId: r.jobber_id, 
        employerId: r.emp_id, 
        meta: { "review": { link: `/review_jobber?pi=${r.post_id}&ji=${r.jobber_id}` } }, //ถูกมั้ยใส่ลิ้งค์ไปหน้ารายละเอียดที่มีผู้สมัครและรายละเอียดงาน
        email: r.empEmail });

      await notifService.add({ 
        receiverRole: "jobber", 
        receiverId: r.jobber_id, 
        eventKey: "REVIEW_EMP",
        title: "ให้คะแนนนายจ้าง", 
        body: `คุณสามารถให้คะแนนและแสดงความคิดเห็นงานนายจ้าง ${r.efull} ที่คุณได้รับงานในตำแหน่ง "${r.position_name}"`, 
        postId: r.post_id, 
        jobberId: r.jobber_id, 
        employerId: r.emp_id, 
        meta: {
          "review": { link: `/review_emp?pi=${r.post_id}` }
        }, 
        email: r.jobberEmail });

      db.query(
        `UPDATE apply_job 
        SET review_noti_sent = 1 
        WHERE post_id = ? AND jobber_id = ?`, [r.post_id , r.jobber_id], () => {});

    }
    
    
  });
});


// อัปเดตแจ้งเตือนเป็นอ่านแล้ว
app.put('/api/notifications/:id/read', (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ success: false, message: 'ต้องระบุ id' });
  }
  const sql = `UPDATE notifications SET is_read = 1, read_at = NOW() WHERE id = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('❌ MySQL Error [Update notification read]:', err);
      return res.status(500).json({ success: false, message: 'อัปเดตแจ้งเตือนไม่สำเร็จ', error: err });
    }
    res.json({ success: true, message: 'อัปเดตแจ้งเตือนสำเร็จ', affectedRows: result.affectedRows });
  });
});

app.get("/api/notifications/:role/:id", (req, res) => {
  const { role, id } = req.params;
  const unread = req.query.is_read === "0"; // optional: ดึงเฉพาะยังไม่ได้อ่าน

  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "ต้องระบุ jobberId" });
  }

  let sql = `
    SELECT
      id,
      receiver_role,
      receiver_id,
      event_key,
      title,
      body,
      post_id,
      jobber_id,
      emp_id,
      meta,
      is_read,
      created_at
    FROM notifications
    WHERE receiver_role = ?
      AND receiver_id = ?
    ORDER BY created_at DESC
  `;

  const params = [role , id];

  // ถ้าอยากดึงเฉพาะ unread
  if (unread) {
    sql = sql.replace(
      "ORDER BY",
      "AND (is_read = 0 OR is_read IS NULL) ORDER BY"
    );
  }

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.error("❌ MySQL Error [Select notifications]:", err);
      return res
        .status(500)
        .json({ success: false, message: "ดึงแจ้งเตือนไม่สำเร็จ", error: err });
    }

    res.json({
      success: true,
      count: rows.length,
      data: rows,
    });
  });
});
app.post('/api/jobber_up_picture', upload.single('picture'), (req, res) => {
  const jobber_id = req.body.jobber_id;

  // console.log("ไฟล์ใหม่:", req.file);
  // console.log("jobber_id:", req.body.jobber_id);


  if (!req.file) {
    return res.status(400).json({ error: 'ไม่ได้เลือกรูปภาพ' });
  }

  const newFileName = req.file.filename;
  const newFilePath = path.join(__dirname, 'uploads', newFileName);

  // 1. ดึงรูปเก่าจากฐานข้อมูล
  const sqlFind = 'SELECT picture FROM jobber WHERE jobber_id = ?';
  db.query(sqlFind, [jobber_id], (err, result) => {
    if (err) {
      fs.unlinkSync(newFilePath); // ลบรูปใหม่ถ้ามี error
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการค้นหารูปเก่า' });
    }

    const oldFileName = result[0]?.picture;

    // 2. ลบไฟล์เก่าถ้ามี และไม่ใช่รูป placeholder
    if (oldFileName && oldFileName !== 'nophoto.png') {
      const oldFilePath = path.join(__dirname, 'uploads', oldFileName);
      if (fs.existsSync(oldFilePath)) {
        fs.unlink(oldFilePath, (err) => {
          if (err) console.error("ลบรูปเก่าล้มเหลว:", err);
          else console.log("ลบรูปเก่าแล้ว:", oldFileName);
        });
      }
    }

    // 3. อัปเดตรูปใหม่ในฐานข้อมูล
    const sqlUpdate = 'UPDATE jobber SET picture = ? WHERE jobber_id = ?';
    db.query(sqlUpdate, [newFileName, jobber_id], (err2) => {
      if (err2) {
        fs.unlinkSync(newFilePath); // ลบไฟล์ใหม่หากอัปเดต DB ไม่สำเร็จ
        return res.status(500).json({ error: 'อัปเดตรูปในฐานข้อมูลล้มเหลว' });
      }

      res.json({ message: 'อัปโหลดและอัปเดตรูปสำเร็จ', filename: newFileName });
    });
  });
});

app.post('/api/emp_up_picture', upload.single('picture'), (req, res) => {
  const emp_id = req.body.emp_id;

  if (!req.file) {
    return res.status(400).json({ error: 'ไม่ได้เลือกรูปภาพ' });
  }

  const newFileName = req.file.filename;
  const newFilePath = path.join(__dirname, 'uploads', newFileName);

  // 1. ดึงรูปเก่าจากฐานข้อมูล
  const sqlFind = 'SELECT picture FROM employer WHERE emp_id = ?';
  db.query(sqlFind, [emp_id], (err, result) => {
    if (err) {
      // ลบรูปใหม่ทิ้งถ้า DB query พัง
      if (fs.existsSync(newFilePath)) fs.unlinkSync(newFilePath);
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการค้นหารูปเก่า' });
    }

    const oldFileName = result[0]?.picture;
    console.log("oldFileName:", oldFileName);

    // 2. ลบไฟล์เก่าถ้ามี และไม่ใช่รูป placeholder
    if (oldFileName && oldFileName !== 'nophoto.png') {
      const oldFilePath = path.join(__dirname, 'uploads', oldFileName);
      try {
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
          console.log("ลบรูปเก่าแล้ว:", oldFileName);
        } else {
          console.warn("ไฟล์เก่าไม่พบ, ข้ามการลบ:", oldFilePath);
        }
      } catch (unlinkErr) {
        console.error("ลบรูปเก่าล้มเหลว:", unlinkErr.message);
      }
    }

    // 3. อัปเดตรูปใหม่ในฐานข้อมูล
    const sqlUpdate = 'UPDATE employer SET picture = ? WHERE emp_id = ?';
    db.query(sqlUpdate, [newFileName, emp_id], (err2) => {
      if (err2) {
        if (fs.existsSync(newFilePath)) fs.unlinkSync(newFilePath); // กันไฟล์ใหม่ค้าง
        return res.status(500).json({ error: 'อัปเดตรูปในฐานข้อมูลล้มเหลว' });
      }

      res.json({
        message: 'อัปโหลดและอัปเดตรูปสำเร็จ',
        filename: newFileName
      });
    });
  });
});


app.post('/api/jobpost_up_picture', upload.single('job_pic'), (req, res) => {
  const post_id = req.body.post_id;

  // console.log("ไฟล์ใหม่:", req.file);
  // console.log("post_id:", req.body.post_id);


  if (!req.file) {
    return res.status(400).json({ error: 'ไม่ได้เลือกรูปภาพ' });
  }

  const newFileName = req.file.filename;
  const newFilePath = path.join(__dirname, 'uploads', newFileName);

  // 1. ดึงรูปเก่าจากฐานข้อมูล
  const sqlFind = 'SELECT job_pic FROM job_posting WHERE post_id = ?';
  db.query(sqlFind, [post_id], (err, result) => {
    if (err) {
      fs.unlinkSync(newFilePath); // ลบรูปใหม่ถ้ามี error
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการค้นหารูปเก่า' });
    }

    const oldFileName = result[0]?.job_pic;

    // 2. ลบไฟล์เก่าถ้ามี และไม่ใช่รูป placeholder
    if (oldFileName && oldFileName !== 'nophoto.png') {
      const oldFilePath = path.join(__dirname, 'uploads', oldFileName);
      if (fs.existsSync(oldFilePath)) {
        fs.unlink(oldFilePath, (err) => {
          if (err) console.error("ลบรูปเก่าล้มเหลว:", err);
          else console.log("ลบรูปเก่าแล้ว:", oldFileName);
        });
      }
    }

    // 3. อัปเดตรูปใหม่ในฐานข้อมูล
    const sqlUpdate = 'UPDATE job_posting SET job_pic = ? WHERE post_id = ?';
    db.query(sqlUpdate, [newFileName, post_id], (err2) => {
      if (err2) {
        fs.unlinkSync(newFilePath); // ลบไฟล์ใหม่หากอัปเดต DB ไม่สำเร็จ
        return res.status(500).json({ error: 'อัปเดตรูปในฐานข้อมูลล้มเหลว' });
      }

      res.json({ message: 'อัปโหลดและอัปเดตรูปสำเร็จ', filename: newFileName });
    });
  });
});

app.post('/api/volunpost_up_picture', upload.single('volun_pic'), (req, res) => {
  const post_id = req.body.post_id;

  // console.log("ไฟล์ใหม่:", req.file);
  // console.log("post_id:", req.body.post_id);


  if (!req.file) {
    return res.status(400).json({ error: 'ไม่ได้เลือกรูปภาพ' });
  }

  const newFileName = req.file.filename;
  const newFilePath = path.join(__dirname, 'uploads', newFileName);

  // 1. ดึงรูปเก่าจากฐานข้อมูล
  const sqlFind = 'SELECT volun_pic FROM volunteer_posting WHERE post_id = ?';
  db.query(sqlFind, [post_id], (err, result) => {
    if (err) {
      fs.unlinkSync(newFilePath); // ลบรูปใหม่ถ้ามี error
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการค้นหารูปเก่า' });
    }

    const oldFileName = result[0]?.volun_pic;

    // 2. ลบไฟล์เก่าถ้ามี และไม่ใช่รูป placeholder
    if (oldFileName && oldFileName !== 'nophoto.png') {
      const oldFilePath = path.join(__dirname, 'uploads', oldFileName);
      if (fs.existsSync(oldFilePath)) {
        fs.unlink(oldFilePath, (err) => {
          if (err) console.error("ลบรูปเก่าล้มเหลว:", err);
          else console.log("ลบรูปเก่าแล้ว:", oldFileName);
        });
      }
    }

    // 3. อัปเดตรูปใหม่ในฐานข้อมูล
    const sqlUpdate = 'UPDATE volunteer_posting SET volun_pic = ? WHERE post_id = ?';
    db.query(sqlUpdate, [newFileName, post_id], (err2) => {
      if (err2) {
        fs.unlinkSync(newFilePath); // ลบไฟล์ใหม่หากอัปเดต DB ไม่สำเร็จ
        return res.status(500).json({ error: 'อัปเดตรูปในฐานข้อมูลล้มเหลว' });
      }

      res.json({ message: 'อัปโหลดและอัปเดตรูปสำเร็จ', filename: newFileName });
    });
  });
});

app.get('/hardskill', (req, res)=> {
    const { page = 1, limit = "", keyword = "" } = req.query;

    const offset = (page -1) * limit;
    const sql = `SELECT * FROM hardskill WHERE hardskill_name LIKE ? ORDER BY hardskill_id DESC LIMIT ? OFFSET ?`;
    const totalsql = "SELECT COUNT(*) as total FROM hardskill WHERE hardskill_name LIKE ?";

    try {
      // const [data] = db.query(sql);
      // const [totalResult] =  db.query(totalsql);
      db.query(totalsql, [`%${keyword}%`], (err, totalResult) => {
        if (err) return res.status(500).json({ error: "Error fetching data" });

          const totalRecords = totalResult[0].total;
          const totalPages = Math.ceil(totalRecords / limit);
      
        db.query(sql, [`%${keyword}%` , parseInt(limit) , parseInt(offset)], (err2, data) => {
          if (err2) return res.status(500).json({ error: "Error counting total" });

          res.json({ data, totalPages, totalRecords });
        })
      })

      
    } catch (error) {
      res.status(500).json({ error: "Database error"});
    }
})

app.get('/hs', (req, res)=> {

    const sql = `SELECT * FROM hardskill`;

    try {

        db.query(sql, (err2, data) => {
          if (err2) return res.status(500).json({ error: "Error counting total" });

          res.json({ data });
          //console.log("hsdata",data);
        })

    } catch (error) {
      res.status(500).json({ error: "Database error"});
    }
})

app.get('/ss', (req, res)=> {

    const sql = `SELECT * FROM softskill`;

    try {

        db.query(sql, (err2, data) => {
          if (err2) return res.status(500).json({ error: "Error counting total" });

          res.json({ data });
        })

    } catch (error) {
      res.status(500).json({ error: "Database error"});
    }
})

app.get('/user_hardskill', (req, res)=> {
    const { page = 1, limit = 10, keyword = "", jobber_id = "" } = req.query;

    const offset = (page -1) * limit;
    const sql = ` SELECT jobber_hs.* , hardskill_name FROM jobber_hs LEFT JOIN hardskill ON jobber_hs.hardskill_id = hardskill.hardskill_id WHERE hardskill_name  LIKE ? AND jobber_id = ? ORDER BY hardskill_id DESC LIMIT ? OFFSET ?`;
    const totalsql = "SELECT COUNT(*) as total FROM jobber_hs LEFT JOIN hardskill ON jobber_hs.hardskill_id = hardskill.hardskill_id WHERE hardskill_name LIKE ? AND jobber_id = ?";

    try {
      // const [data] = db.query(sql);
      // const [totalResult] =  db.query(totalsql);
      db.query(totalsql, [`%${keyword}%` ,jobber_id], (err, totalResult) => {
        if (err) return res.status(500).json({ error: "Error fetching data" });

          const totalRecords = totalResult[0].total;
          const totalPages = Math.ceil(totalRecords / limit);
      
        db.query(sql, [`%${keyword}%` ,jobber_id , parseInt(limit) , parseInt(offset)], (err2, data) => {
          if (err2) return res.status(500).json({ error: "Error counting total" });

          res.json({ data, totalPages, totalRecords });
        })
      })

      
    } catch (error) {
      res.status(500).json({ error: "Database error"});
    }
})

app.get('/user_softskill', (req, res)=> {
    const { page = 1, limit = 10, keyword = "", jobber_id = "" } = req.query;

    const offset = (page -1) * limit;
    const sql = ` SELECT jobber_ss.* , softskill_name FROM jobber_ss LEFT JOIN softskill ON jobber_ss.softskill_id = softskill.softskill_id WHERE softskill_name LIKE ? AND jobber_id = ? ORDER BY softskill_id DESC LIMIT ? OFFSET ?`;
    const totalsql = "SELECT COUNT(*) as total FROM jobber_ss LEFT JOIN softskill ON jobber_ss.softskill_id = softskill.softskill_id WHERE softskill_name LIKE ? AND jobber_id = ?";

    try {
      // const [data] = db.query(sql);
      // const [totalResult] =  db.query(totalsql);
      db.query(totalsql, [`%${keyword}%` ,jobber_id], (err, totalResult) => {
        if (err) return res.status(500).json({ error: "Error fetching data" });

          const totalRecords = totalResult[0].total;
          const totalPages = Math.ceil(totalRecords / limit);
      
        db.query(sql, [`%${keyword}%` ,jobber_id , parseInt(limit) , parseInt(offset)], (err2, data) => {
          if (err2) return res.status(500).json({ error: "Error counting total" });

          res.json({ data, totalPages, totalRecords });
        })
      })

      
    } catch (error) {
      res.status(500).json({ error: "Database error"});
    }
})

// อัปเดตข้อมูล Hard Skill
app.put("/hardskill/:id", (req, res) => {
    const { id } = req.params;
    const { hardskill_name } = req.body;
    const sql = "UPDATE hardskill SET hardskill_name = ? WHERE hardskill_id = ?";
    db.query(sql, [hardskill_name, id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "อัปเดตสำเร็จ!" });
    });
  });



app.post("/hardskill/", (req, res) => {
    const { hardskill_name } = req.body;
    // เช็คว่ามีค่าหรือไม่
    if (!hardskill_name || hardskill_name.trim() === "") {
        return res.status(400).json({ error: "กรุณากรอกชื่อทักษะ" });
    }
    const sql = "INSERT INTO hardskill (hardskill_name) VALUES (?)";
    db.query(sql, [hardskill_name], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "เพิ่มข้อมูลสำเร็จ!" });
    });
  });

app.delete("/hardskill/:id", (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM hardskill WHERE hardskill_id = ?";
    db.query(sql, [id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "ลบข้อมูลสำเร็จ!" });
    });
  });

app.get('/softskill', (req, res)=> {
    const { page = 0, limit = 10 , keyword = ""} = req.query;

    const offset = (page -1) * limit;
    const sql = `SELECT * FROM softskill WHERE softskill_name LIKE ? ORDER BY softskill_id DESC LIMIT ? OFFSET ?`;
    const totalsql = "SELECT COUNT(*) as total FROM softskill WHERE softskill_name LIKE ?";

    try {
      // const [data] = db.query(sql);
      // const [totalResult] =  db.query(totalsql);
      db.query(totalsql, [`%${keyword}%`] , (err2, totalResult) => {
        if (err2) return res.status(500).json({ error: "Error counting total" });

        const totalRecords = totalResult[0].total;
        const totalPages = Math.ceil(totalRecords / limit);

        db.query(sql, [`%${keyword}%`,parseInt(limit), parseInt(offset)], (err, data) => {
          if (err) return res.status(500).json({ error: "Error fetching data" });
        
          res.json({ data, totalPages, totalRecords });
        })
      })

      
    } catch (error) {
      res.status(500).json({ error: "Database error"});
    }
})

// อัปเดตข้อมูล Hard Skill
app.put("/softskill/:id", (req, res) => {
    const { id } = req.params;
    const { softskill_name } = req.body;
    const sql = "UPDATE softskill SET softskill_name = ? WHERE softskill_id = ?";
    db.query(sql, [softskill_name, id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "อัปเดตสำเร็จ!" });
    });
  });

app.post("/softskill/", (req, res) => {
    const { softskill_name } = req.body;
    // เช็คว่ามีค่าหรือไม่
    if (!softskill_name || softskill_name.trim() === "") {
        return res.status(400).json({ error: "กรุณากรอกชื่อทักษะ" });
    }
    const sql = "INSERT INTO softskill (softskill_name) VALUES (?)";
    db.query(sql, [softskill_name], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "เพิ่มข้อมูลสำเร็จ!" });
    });
  });

app.delete("/softskill/:id", (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM softskill WHERE softskill_id = ?";
    db.query(sql, [id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "ลบข้อมูลสำเร็จ!" });
    });
  });

  app.get('/jobtype', (req, res)=> {
    const { page = 0, limit = 10 , keyword = ""} = req.query;

    const offset = (page -1) * limit;
    const sql = `SELECT * FROM jobtype WHERE jobtype_name LIKE ? ORDER BY jobtype_id DESC LIMIT ? OFFSET ?`;
    const totalsql = "SELECT COUNT(*) as total FROM jobtype WHERE jobtype_name LIKE ?";

    try {
      // const [data] = db.query(sql);
      // const [totalResult] =  db.query(totalsql);
      db.query(totalsql, [`%${keyword}%`] , (err2, totalResult) => {
        if (err2) return res.status(500).json({ error: "Error counting total" });

        const totalRecords = totalResult[0].total;
        const totalPages = Math.ceil(totalRecords / limit);

        db.query(sql, [`%${keyword}%`,parseInt(limit), parseInt(offset)], (err, data) => {
          if (err) return res.status(500).json({ error: "Error fetching data" });
        
          res.json({ data, totalPages, totalRecords });
        })
      })

      
    } catch (error) {
      res.status(500).json({ error: "Database error"});
    }
})

// อัปเดตข้อมูล 
app.put("/jobtype/:id", (req, res) => {
    const { id } = req.params;
    const { jobtype_name } = req.body;
    const sql = "UPDATE jobtype SET jobtype_name = ? WHERE jobtype_id = ?";
    db.query(sql, [jobtype_name, id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "อัปเดตสำเร็จ!" });
    });
  });

  app.put("/jobtypesta/:id", (req, res) => {
    const { id } = req.params;
    const sql = "UPDATE jobtype SET status = IF(status = 'ON' , 'OFF' , 'ON') WHERE jobtype_id = ?";
    db.query(sql, [id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "อัปเดตสำเร็จ!" });
    });
  });

app.post("/jobtype/", (req, res) => {
    const { jobtype_name } = req.body;
    // เช็คว่ามีค่าหรือไม่
    if (!jobtype_name || jobtype_name.trim() === "") {
        return res.status(400).json({ error: "กรุณากรอกชื่อประเภทงาน" });
    }
    const sql = "INSERT INTO jobtype (jobtype_name) VALUES (?)";
    db.query(sql, [jobtype_name], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "เพิ่มข้อมูลสำเร็จ!" });
    });
  });

app.delete("/jobtype/:id", (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM jobtype WHERE jobtype_id = ?";
    db.query(sql, [id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "ลบข้อมูลสำเร็จ!" });
    });
  });

   app.get('/voluntype', (req, res)=> {
    const { page = 0, limit = 10 , keyword = ""} = req.query;

    const offset = (page -1) * limit;
    const sql = `SELECT * FROM volunteertype WHERE voluntype_name LIKE ? ORDER BY voluntype_id DESC LIMIT ? OFFSET ?`;
    const totalsql = "SELECT COUNT(*) as total FROM volunteertype WHERE voluntype_name LIKE ?";

    try {
      // const [data] = db.query(sql);
      // const [totalResult] =  db.query(totalsql);
      db.query(totalsql, [`%${keyword}%`] , (err2, totalResult) => {
        if (err2) return res.status(500).json({ error: "Error counting total" });

        const totalRecords = totalResult[0].total;
        const totalPages = Math.ceil(totalRecords / limit);

        db.query(sql, [`%${keyword}%`,parseInt(limit), parseInt(offset)], (err, data) => {
          if (err) return res.status(500).json({ error: "Error fetching data" });
        
          res.json({ data, totalPages, totalRecords });
        })
      })

      
    } catch (error) {
      res.status(500).json({ error: "Database error"});
    }
})

// อัปเดตข้อมูล 
app.put("/voluntype/:id", (req, res) => {
    const { id } = req.params;
    const { voluntype_name } = req.body;
    const sql = "UPDATE volunteertype SET voluntype_name = ? WHERE voluntype_id = ?";
    db.query(sql, [voluntype_name, id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "อัปเดตสำเร็จ!" });
    });
  });

  app.put("/voluntypesta/:id", (req, res) => {
    const { id } = req.params;
    const sql = "UPDATE volunteertype SET status = IF(status = 'ON' , 'OFF' , 'ON') WHERE voluntype_id = ?";
    db.query(sql, [id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "อัปเดตสำเร็จ!" });
    });
  });

app.post("/voluntype/", (req, res) => {
    const { voluntype_name } = req.body;
    // เช็คว่ามีค่าหรือไม่
    if (!voluntype_name || voluntype_name.trim() === "") {
        return res.status(400).json({ error: "กรุณากรอกชื่อประเภทกิจกรรมจิตอาสา" });
    }
    const sql = "INSERT INTO volunteertype (voluntype_name) VALUES (?)";
    db.query(sql, [voluntype_name], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "เพิ่มข้อมูลสำเร็จ!" });
    });
  });

app.delete("/voluntype/:id", (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM volunteertype WHERE voluntype_id = ?";
    db.query(sql, [id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "ลบข้อมูลสำเร็จ!" });
    });
  });

 app.get('/position', (req, res)=> {
    const { page = 0, limit = 10 , keyword = ""} = req.query;

    const offset = (page -1) * limit;
    const sql = `SELECT position.* , jobtype.jobtype_name FROM position INNER JOIN jobtype ON position.jobtype_id = jobtype.jobtype_id WHERE position_name LIKE ? ORDER BY position_id DESC LIMIT ? OFFSET ?`;
    const totalsql = "SELECT COUNT(*) as total FROM position WHERE position_name LIKE ?";

    try {
      //const [data] = db.query(sql);
      // const [totalResult] =  db.query(totalsql);
      db.query(totalsql, [`%${keyword}%`] , (err2, totalResult) => {
        if (err2) return res.status(500).json({ error: "Error counting total" });

        const totalRecords = totalResult[0].total;
        const totalPages = Math.ceil(totalRecords / limit);

        db.query(sql, [`%${keyword}%`,parseInt(limit), parseInt(offset)], (err, data) => {
          if (err) return res.status(500).json({ error: "Error fetching data" });
          
          res.json({ data, totalPages, totalRecords });
        })
      })

      
    } catch (error) {
      res.status(500).json({ error: "Database error"});
    }
})

// อัปเดตข้อมูล 
app.put("/position/:id", (req, res) => {
    const { id } = req.params;
    const { position_name, jobtype_id } = req.body;
    
    const sql = "UPDATE position SET position_name = ? , jobtype_id = ? WHERE position_id = ?";
    db.query(sql, [position_name, jobtype_id, id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "อัปเดตสำเร็จ!" });
    });
  });

  app.put("/positionsta/:id", (req, res) => {
    const { id } = req.params;
    
    const sql = "UPDATE position SET status = IF(status = 'ON' , 'OFF' , 'ON') WHERE position_id = ?";
    db.query(sql, [id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "อัปเดตสำเร็จ!" });
      //console.log(id);
    });
  });

app.post("/position/", (req, res) => {
    const { position_name , jobtype_id } = req.body;
    
    // เช็คว่ามีค่าหรือไม่
    if (!position_name || position_name.trim() === "") {
        return res.status(400).json({ error: "กรุณากรอกชื่อตำแหน่งงาน" });
    }
    const sql = "INSERT INTO `position` (`position_name`, `jobtype_id`) VALUES (?, ?);";
    db.query(sql, [position_name, jobtype_id], (err, result) => {
      if (err) {
        console.error("sql insert error",err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "เพิ่มข้อมูลสำเร็จ!" });
    });
  });

app.post("/add_jobber_hs/", async (req, res) => {
    const { hardskill_id ,jobber_id } = req.body;
    
    const sql = "INSERT INTO `jobber_hs` (hardskill_id ,jobber_id ) VALUES (?, ?);";
    await new Promise((resolve, reject) => {
          db.query(sql, [hardskill_id ,jobber_id], (err, result) => {
            if (err) return reject(err);
            resolve(result);
          });
        });

        try {
            // console.log("Start Re-Match for Jobber ID:", jobber_id);
            const rematchResult = await rematchJobber(jobber_id);
            // console.log("Rematch Result:", rematchResult);
            res.json({ success: true, message: "Profile updated and rematched", rematch: rematchResult });
          } catch (matchErr) {
            console.error("Re-Match Error:", matchErr);
            res.status(500).json({ success: false, message: "Profile updated but failed to rematch", error: matchErr.message });
          }
  });

 app.post("/add_jobber_ss/", async (req, res) => {
    const { softskill_id ,jobber_id } = req.body;
    
    const sql = "INSERT INTO `jobber_ss` (softskill_id ,jobber_id ) VALUES (?, ?);";
    await new Promise((resolve, reject) => {
          db.query(sql, [softskill_id ,jobber_id], (err, result) => {
            if (err) return reject(err);
            resolve(result);
          });
        });

        try {
            // console.log("Start Re-Match for Jobber ID:", jobber_id);
            const rematchResult = await rematchJobber(jobber_id);
            // console.log("Rematch Result:", rematchResult);
            res.json({ success: true, message: "Profile updated and rematched", rematch: rematchResult });
          } catch (matchErr) {
            console.error("Re-Match Error:", matchErr);
            res.status(500).json({ success: false, message: "Profile updated but failed to rematch", error: matchErr.message });
          }
  }); 

app.delete("/position/:id", (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM position WHERE position_id = ?";
    db.query(sql, [id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "ลบข้อมูลสำเร็จ!" });
    });
  });

app.get('/jobtypeall', (req, res)=> {
    //console.log("🔍 เรียกใช้ route /jobtype แล้ว"); 
    const sql = `SELECT * FROM jobtype WHERE status = 'ON'`;

    try {
      db.query(sql, (err, data) => {
          if (err) {
            //console.error("SQL Error:", err);
            return res.status(500).json({ error: "Error fetching data" });
          }
          //console.log("jobtype data:", result);
          res.json({ data });
        })
    } catch (error) {
      console.error("❌ Catch error:", error);
      res.status(500).json({ error: "Database error"});
    }
})

app.get('/voluntypeall', (req, res)=> {
    //console.log("🔍 เรียกใช้ route /jobtype แล้ว"); 
    const sql = `SELECT * FROM volunteertype WHERE status = 'ON'`;

    try {
      db.query(sql, (err, data) => {
          if (err) {
            //console.error("SQL Error:", err);
            return res.status(500).json({ error: "Error fetching data" });
          }
          //console.log("jobtype data:", result);
          res.json({ data });
        })
    } catch (error) {
      console.error("❌ Catch error:", error);
      res.status(500).json({ error: "Database error"});
    }
})

app.get('/position_add', (req, res)=> {
    const jobtype_id = req.query.jobtype_id; 
    const sql = `SELECT * FROM position WHERE status = 'ON' AND jobtype_id = ?`;

    try {
      db.query(sql,[jobtype_id], (err, data) => {
          if (err) {
            //console.error("SQL Error:", err);
            return res.status(500).json({ error: "Error fetching data" });
          }
          //console.log("jobtype data:", result);
          res.json({ data });
        })
    } catch (error) {
      console.error("❌ Catch error:", error);
      res.status(500).json({ error: "Database error"});
    }
})

//login jaaa
app.post('/login', (req, res) => {
  const { email , password } = req.body;

  const sql = "SELECT * FROM jobber WHERE email = ? AND status != 'OFF'";
  
  
  db.query(sql, [email], async (err, results) => {
    if(err) {
      //console.error(err);
      res.status(500).json({ message:"Database Error" });
    } 
    if(results.length > 0){

      const user = results[0];

      if (user.status === 'OFF') {
        return res.status(403).json({
          message: "บัญชีของคุณถูกระงับ โปรดติดต่อแอดมินที่ jobvolun.service@gmail.com"
        });
      }
      //console.log("User found:", user.email);
      const match = await bcrypt.compare(password, user.password);
      //console.log("Password match:", match);
      if (!match) {
        return res.status(401).json();
      }
      if (!user.is_verified) {
        return res.status(403).json({ status: 'error', message: 'กรุณายืนยันอีเมลก่อนใช้งาน' });
      }


      const token = jwt.sign(
        {
          jobber_id: user.jobber_id,
          fullname: user.fullname,
          email: user.email,
          role: user.status
        },
        JWT_SECRET,
        { expiresIn: '7h' } //dont forget change this na saina
      );

      return res.status(200).json({
        status: user.status,
        message: "Login successful",
        email: user.email,
        user,
        token
      })
      
    }else {
      return res.status(401).json({ message: "ไม่พบผู้ใช้งาน"});

    }

  })
})

app.post('/login_em', (req, res) => {
  const { email , password } = req.body;

  const sql = "SELECT * FROM employer WHERE email = ? AND status != 'OFF'";
  
  
  db.query(sql, [email], async (err, results) => {
    if(err) {
      //console.error(err);
      res.status(500).json({ message:"Database Error" });
    } 
    if(results.length > 0){

      const user = results[0];

      if (user.status === 'OFF') {
        return res.status(403).json({
          message: "บัญชีของคุณถูกระงับ โปรดติดต่อแอดมินที่ jobvolun.service@gmail.com"
        });
      }
      //console.log("User found:", user.email);
      const match = await bcrypt.compare(password, user.password);
      //console.log("Password match:", match);
      if (!match) {
        return res.status(401).json();
      }
      if (!user.is_verified) {
        return res.status(403).json({ status: 'error', message: 'กรุณายืนยันอีเมลก่อนใช้งาน' });
      }


      const token = jwt.sign(
        {
          emp_id: user.emp_id,
          fullname: user.fullname,
          email: user.email,
          role: user.status
        },
        JWT_SECRET,
        { expiresIn: '7h' } //dont forget change this na saina
      );

      return res.status(200).json({
        status: user.status,
        message: "Login successful",
        email: user.email,
        user,
        token
      })
      
    }else {
      return res.status(401).json({ message: "ไม่พบผู้ใช้งาน"});

    }

  })
})

app.put("/jobbersta/:id", (req, res) => {
    const { id } = req.params;
    
    const sql = "UPDATE jobber SET status = IF(status = 'ON' , 'OFF' , 'ON') WHERE jobber_id = ?";
    db.query(sql, [id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "อัปเดตสำเร็จ!" });
      //console.log(id);
    });
  });

//ลงทะเบียนกรุบกริบ
app.post('/register' , async (req, res) => {
  const queryAsync = promisify(db.query).bind(db);

  const { firstname, lastname, email, password } = req.body;
  // console.log("req.body:", req.body);

  try {
    const hashPassword = await bcrypt.hash(password, 10);
    const verifyToken = crypto.randomBytes(32).toString("hex");

    const checkSql = 'SELECT * FROM jobber WHERE email = ?';
    const checkResult = await queryAsync(checkSql, [email]);

        if (checkResult.length > 0) {
      const user = checkResult[0];

      if (user.is_verified) {
        // ผู้ใช้งานอีเมลนี้สมัครสำเร็จแล้ว
        return res.status(409).json({ status: 'error', message: 'มีผู้ใช้งานนี้อยู่แล้ว' });
      } else {
        // ยังไม่ได้ยืนยัน ให้ส่งอีเมลยืนยันใหม่อีกครั้ง
        const updateTokenSql = 'UPDATE jobber SET verify_token = ? WHERE email = ?';
        await queryAsync(updateTokenSql, [verifyToken, email]);

        await sendVerificationEmail(email, verifyToken);

        return res.status(200).json({
          status: 'pending',
          message: 'เคยสมัครไว้แล้ว แต่ยังไม่ยืนยัน กรุณาตรวจสอบอีเมลอีกครั้ง',
        });
      }
    }

      const sql = 'INSERT INTO jobber (fullname, email, password, status, verify_token, is_verified) VALUES (?, ?, ?, "ON", ?, false)';
      const fullname = `${firstname.trim()} ${lastname.trim()}`;

      await queryAsync(sql, [fullname, email, hashPassword, verifyToken]);

      
        await sendVerificationEmail(email, verifyToken); // ส่งอีเมล

        return res.status(200).json({ status: 'ok', message: 'สมัครสมาชิกสำเร็จ กรุณายืนยันอีเมล' });

    
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

app.get('/verify-email', (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).send("Missing token");

  const sql = 'UPDATE jobber SET is_verified = true, verify_token = NULL WHERE verify_token = ?';
  db.query(sql, [token], (err, result) => {
    if (err) return res.status(500).send("Server error");
    if (result.affectedRows === 0) return res.status(400).send("โทเค็นไม่ถูกต้องหรือใช้ไปแล้ว");
    //ไว้แก้ตอนขึ้นโฮสต์
    //  res.redirect('http://localhost:5173/login');
    res.send(`
      <!DOCTYPE html>
      <html lang="th">
        <head>
          <meta charset="UTF-8" />
          <title>ยืนยันอีเมลสำเร็จ</title>
          <meta http-equiv="refresh" content="3;url=http://localhost:5173/login" />
          <style>
            body {
              font-family: sans-serif;
              text-align: center;
              margin-top: 80px;
              background: #f9f9f9;
              color: #333;
            }
            .box {
              background: #fff;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              display: inline-block;
            }
            h2 { color: #4CAF50; }
            a {
              color: #4CAF50;
              text-decoration: none;
            }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="box">
            <h2>✅ ยืนยันอีเมลสำเร็จ</h2>
            <p>ระบบจะพาคุณไปหน้า <a href="http://localhost:5173/login">เข้าสู่ระบบ</a> ภายใน 3 วินาที...</p>
          </div>
          <script>
            // fallback สำหรับ browser ที่ไม่รองรับ meta refresh
            setTimeout(function(){
              window.location.href = "http://localhost:5173/login";
            }, 3000);
          </script>
        </body>
      </html>
    `);
  });
});


app.get('/check-email', (req, res) => {
  const email = req.query.email;
  db.query('SELECT is_verified FROM jobber WHERE email = ?', [email], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (result.length > 0) {
      res.json({
        exists: true,
        is_verified: result[0].is_verified === 1 // แปลงให้เป็น Boolean
      });
    } else {
      res.json({ exists: false, is_verified: false });
    }
  });
});



app.get('/check-fullname', (req, res) => {
  const fullname = req.query.fullname;
  db.query('SELECT * FROM jobber WHERE fullname = ?', [fullname], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ exists: result.length > 0 });
  });
});

app.get('/jobber', (req, res)=> {
    const { page = 1, limit = 10, keyword = "" } = req.query;

    const offset = (page -1) * limit;
    const sql = `SELECT jobber.jobber_id,fullname,picture,jobber.status,work_status, CASE WHEN interests_volun.jobber_id IS NOT NULL THEN '/' ELSE '-' END as j_volun FROM jobber LEFT JOIN interests_volun ON jobber.jobber_id = interests_volun.jobber_id WHERE fullname LIKE ? AND jobber.status != 'admin' LIMIT ? OFFSET ?`;
    const totalsql = "SELECT COUNT(*) as total FROM jobber WHERE fullname LIKE ? AND status != 'admin'";

    try {
      // const [data] = db.query(sql);
      // const [totalResult] =  db.query(totalsql);
      db.query(totalsql, [`%${keyword}%`], (err, totalResult) => {
        if (err) return res.status(500).json({ error: "Error fetching data" });

          const totalRecords = totalResult[0].total;
          const totalPages = Math.ceil(totalRecords / limit);
      
        db.query(sql, [`%${keyword}%` , parseInt(limit) , parseInt(offset)], (err2, data) => {
          if (err2) return res.status(500).json({ error: "Error counting total" });

          res.json({ data, totalPages, totalRecords });
        })
      })


      
    } catch (error) {
      res.status(500).json({ error: "Database error"});
    }
})

app.get('/emp', (req, res)=> {
    const { page = 1, limit = 10, keyword = "" } = req.query;

    const offset = (page -1) * limit;
    const sql = `SELECT employer.emp_id,fullname,picture,employer.status,COUNT(job_posting.post_id) as job,COUNT(volunteer_posting.post_id) as volun FROM employer LEFT JOIN job_posting ON employer.emp_id = job_posting.emp_id LEFT JOIN volunteer_posting ON employer.emp_id = volunteer_posting.emp_id WHERE fullname LIKE ? GROUP BY employer.emp_id LIMIT ? OFFSET ?`;
    const totalsql = "SELECT COUNT(*) as total FROM employer WHERE fullname LIKE ?";

    try {
      // const [data] = db.query(sql);
      // const [totalResult] =  db.query(totalsql);
      db.query(totalsql, [`%${keyword}%`], (err, totalResult) => {
        if (err) return res.status(500).json({ error: "Error fetching data" });

          const totalRecords = totalResult[0].total;
          const totalPages = Math.ceil(totalRecords / limit);
      
        db.query(sql, [`%${keyword}%` , parseInt(limit) , parseInt(offset)], (err2, data) => {
          if (err2) return res.status(500).json({ error: "Error counting total" });

          res.json({ data, totalPages, totalRecords });
        })
      })


      
    } catch (error) {
      res.status(500).json({ error: "Database error"});
    }
})

app.put("/empsta/:id", (req, res) => {
    const { id } = req.params;
    
    const sql = "UPDATE employer SET status = IF(status = 'ON' , 'OFF' , 'ON') WHERE emp_id = ?";
    db.query(sql, [id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "อัปเดตสำเร็จ!" });
      //console.log(id);
    });
  });

  app.put("/jobsta/:id", (req, res) => {
    const { id } = req.params;
    
    const sql = "UPDATE job_posting SET status = IF(status = 'ON' , 'OFF' , 'ON') WHERE post_id = ?";
    db.query(sql, [id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "อัปเดตสำเร็จ!" });
      //console.log(id);
    });
  });

app.get('/job', (req, res)=> {
    const { page = 1, limit = 10, keyword = "" } = req.query;

    const offset = (page -1) * limit;
    const sql = `SELECT job_posting.post_id,position_name,jobtype_name,employer.fullname as employer,job_pic,job_posting.status , COUNT(apply_job.post_id) as count FROM job_posting LEFT JOIN position ON job_posting.position_code = position.position_id LEFT JOIN employer ON employer.emp_id = job_posting.emp_id LEFT JOIN jobtype ON position.jobtype_id = jobtype.jobtype_id LEFT JOIN apply_job ON job_posting.post_id = apply_job.post_id WHERE position_name LIKE ? GROUP BY job_posting.post_id LIMIT ? OFFSET ?`;
    const totalsql = "SELECT COUNT(*) as total FROM job_posting LEFT JOIN position ON job_posting.position_code = position.position_id WHERE position_name LIKE ?";

    try {
      // const [data] = db.query(sql);
      // const [totalResult] =  db.query(totalsql);
      db.query(totalsql, [`%${keyword}%`], (err, totalResult) => {
        if (err) return res.status(500).json({ error: "Error fetching data" });

          const totalRecords = totalResult[0].total;
          const totalPages = Math.ceil(totalRecords / limit);
      
        db.query(sql, [`%${keyword}%` , parseInt(limit) , parseInt(offset)], (err2, data) => {
          if (err2) return res.status(500).json({ error: "Error counting total" });

          res.json({ data, totalPages, totalRecords });
        })
      })


      
    } catch (error) {
      res.status(500).json({ error: "Database error"});
    }
})

app.get('/volun', (req, res)=> {
    const { page = 1, limit = 10, keyword = "" } = req.query;

    const offset = (page -1) * limit;
    const sql = `SELECT volunteer_posting.post_id,activity_name,voluntype_name,employer.fullname as employer,volun_pic,volunteer_posting.status , COUNT(apply_volun.post_id) as count FROM volunteer_posting LEFT JOIN employer ON employer.emp_id = volunteer_posting.emp_id LEFT JOIN volunteertype ON volunteertype.voluntype_id = volunteer_posting.volunteer_code LEFT JOIN apply_volun ON volunteer_posting.post_id = apply_volun.post_id WHERE activity_name LIKE ? GROUP BY volunteer_posting.post_id LIMIT ? OFFSET ?`;
    const totalsql = "SELECT COUNT(*) as total FROM volunteer_posting WHERE activity_name LIKE ?";

    try {
      // const [data] = db.query(sql);
      // const [totalResult] =  db.query(totalsql);
      db.query(totalsql, [`%${keyword}%`], (err, totalResult) => {
        if (err) return res.status(500).json({ error: "Error fetching data" });

          const totalRecords = totalResult[0].total;
          const totalPages = Math.ceil(totalRecords / limit);
      
        db.query(sql, [`%${keyword}%` , parseInt(limit) , parseInt(offset)], (err2, data) => {
          if (err2) return res.status(500).json({ error: "Error counting total" });

          res.json({ data, totalPages, totalRecords });
        })
      })


      
    } catch (error) {
      res.status(500).json({ error: "Database error"});
    }
})

app.put("/volunsta/:id", (req, res) => {
    const { id } = req.params;
    
    const sql = "UPDATE volunteer_posting SET status = IF(status = 'ON' , 'OFF' , 'ON') WHERE post_id = ?";
    db.query(sql, [id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "อัปเดตสำเร็จ!" });
      //console.log(id);
    });
  });

app.get("/apibelogin", (req, res) => {
  const jobSql = "SELECT COUNT(*) as jobCount FROM job_posting";
  const volunteerSql = "SELECT COUNT(*) as volunteerCount FROM volunteer_posting";
  const jobTypeSql = "SELECT COUNT(*) as jobTypeCount FROM jobtype";
  
  const volunTypeSql = "SELECT COUNT(*) as volunTypeCount FROM volunteertype";
  const jobtypehit = "SELECT jobtype_id , jobtype_name FROM jobtype LIMIT 7";
  const voluntypehit = "SELECT voluntype_id , voluntype_name FROM volunteertype LIMIT 7";
  const lastpost = "SELECT job_posting.post_id , salary , position_name , num_position , SUM(CASE WHEN apply_job.status = 'accepted' THEN 1 ELSE 0 END) as accepted_count , job_posting.age , job_posting.emp_id as emp_id , job_pic , fullname , picture , tambon_name as tb , ampher_name as ap , jangwat_name as jw FROM job_posting LEFT JOIN position ON job_posting.position_code = position.position_id LEFT JOIN apply_job ON job_posting.post_id = apply_job.post_id LEFT JOIN employer ON job_posting.emp_id = employer.emp_id LEFT JOIN tambon ON job_posting.tambon_id = tambon.tambon_id LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id LEFT JOIN jangwat ON LEFT(ampher.ampher_id,2) = jangwat.jangwat_id GROUP BY job_posting.post_id order by post_id DESC LIMIT 4";

  db.query(jobSql, (err1, jobResult) => {
    if (err1) {
      console.error("DB error:", err1);
      return res.status(500).json({ error: "Server error" });
    }

    db.query(volunteerSql, (err2, volunteerResult) => {
      if (err2) {
        console.error("DB error:", err2);
        return res.status(500).json({ error: "Server error" });
      }

      db.query(jobTypeSql, (err3, jobTypeResult) => {
        if (err3) {
          console.error("DB error:", err3);
          return res.status(500).json({ error: "Server error" });
        }
        db.query(jobtypehit, (err4, data) => {
          if (err4) {
            console.error("DB error:", err4);
            return res.status(500).json({ error: "Server error" });
          }
          db.query(volunTypeSql, (err5, volunTypeResult) => {
            if (err5) {
              console.error("DB error:", err5);
              return res.status(500).json({ error: "Server error" });
            }
            db.query(lastpost, (err6, lastpost) => {
              if (err6) {
                console.error("DB error:", err6);
                return res.status(500).json({ error: "Server error" });
              }
              //console.log("📦 lastPost:", lastpost);
              db.query(voluntypehit, (err7, voluntypehit) => {
                if (err7) {
                  console.error("DB error:", err7);
                  return res.status(500).json({ error: "Server error" });
                }
                //console.log("📦 lastPost:", lastpost);
                res.json({
                  jobCount: jobResult[0].jobCount,
                  volunteerCount: volunteerResult[0].volunteerCount,
                  jobTypeCount: jobTypeResult[0].jobTypeCount,
                  data,
                  volunTypeCount: volunTypeResult[0].volunTypeCount,
                  lastpost,
                  voluntypehit
                });
              });
            });
          });
        });
      });
    });
  });
});

app.get("/apidash_job", (req, res) => {
  const jobbSql = "SELECT COUNT(*) as jobbCount FROM jobber";
  const empSql = "SELECT COUNT(*) as empCount FROM employer";
  const jobSql = "SELECT COUNT(*) as jobCount FROM job_posting";
  const numjobSql = "SELECT SUM(num_position) as numjobCount FROM job_posting";
  const jobTypeSql = "SELECT COUNT(*) as jobTypeCount FROM jobtype";
  const labels = "SELECT position_name , COUNT(*) as jobs , COUNT(interests_work.position_id) as interest , COUNT(apply_job.post_id) as hired FROM job_posting INNER JOIN position ON job_posting.position_code = position.position_id LEFT JOIN interests_work ON job_posting.position_code = interests_work.position_id LEFT JOIN apply_job ON job_posting.post_id = apply_job.post_id GROUP BY job_posting.position_code ORDER BY jobs DESC LIMIT 6";
  const gotJob = "SELECT COUNT(*) as gotJob FROM jobber where work_status = 'JOB'";
  const lookingForJob = "SELECT COUNT(*) as lookingForJob FROM jobber where work_status = 'FIND'";


  db.query(jobbSql, (err1, jobbResult) => {
    if (err1) {
      console.error("DB error:", err1);
      return res.status(500).json({ error: "Server error" });
    }

    db.query(empSql, (err2, empResult) => {
      if (err2) {
        console.error("DB error:", err2);
        return res.status(500).json({ error: "Server error" });
      }

      db.query(jobSql, (err3, jobResult) => {
        if (err3) {
          console.error("DB error:", err3);
          return res.status(500).json({ error: "Server error" });
        }
        db.query(jobTypeSql, (err4, jobTypeResult) => {
          if (err4) {
            console.error("DB error:", err4);
            return res.status(500).json({ error: "Server error" });
          }
          db.query(labels, (err5, labels) => {
            if (err5) {
              console.error("DB error:", err5);
              return res.status(500).json({ error: "Server error" });
            }
            db.query(gotJob, (err6, gotJobResult) => {
              if (err6) {
                console.error("DB error:", err6);
                return res.status(500).json({ error: "Server error" });
              }
              db.query(lookingForJob, (err7, lookingForJobResult) => {
                if (err7) {
                  console.error("DB error:", err7);
                  return res.status(500).json({ error: "Server error" });
                }
                db.query(numjobSql, (err8, numJobResult) => {
                  if (err8) {
                    console.error("DB error:", err8);
                    return res.status(500).json({ error: "Server error" });
                  }
                
                    //console.log("📦 lastPost:", lastpost);
                    res.json({
                      jobbCount: jobbResult[0].jobbCount,
                      empCount: empResult[0].empCount,
                      jobCount: jobResult[0].jobCount,
                      jobTypeCount: jobTypeResult[0].jobTypeCount,
                      gotJob: gotJobResult[0].gotJob,
                      lookingForJob: lookingForJobResult[0].lookingForJob,
                      numjobCount: numJobResult[0].numjobCount,
                      labels,
                    });
                });
              });
            });
          });
        });
      });
    });
  });
});

app.get("/apidash_volun", (req, res) => {
  const volunSql = "SELECT COUNT(DISTINCT interests_volun.jobber_id) as volunCount FROM jobber INNER JOIN interests_volun ON jobber.jobber_id = interests_volun.jobber_id";
  const empSql = "SELECT COUNT(DISTINCT volunteer_posting.emp_id) as empCount FROM employer INNER JOIN volunteer_posting ON employer.emp_id = volunteer_posting.emp_id";
  const voluntSql = "SELECT COUNT(*) as voluntCount FROM volunteer_posting";
  const numvolunSql = "SELECT SUM(num_position) as numvolunCount FROM volunteer_posting";
  const volunTypeSql = "SELECT COUNT(*) as volunTypeCount FROM volunteertype";
  const labels = "SELECT voluntype_name , COUNT(*) as volunt , COUNT(interests_volun.voluntype_id) as interested , COUNT(tempVolun.post_id) as matched FROM volunteer_posting INNER JOIN volunteertype ON volunteer_posting.volunteer_code = volunteertype.voluntype_id LEFT JOIN interests_volun ON volunteer_posting.volunteer_code = interests_volun.voluntype_id LEFT JOIN tempVolun ON volunteer_posting.post_id = tempVolun.post_id GROUP BY volunteer_posting.volunteer_code ORDER BY volunt DESC LIMIT 6;";
  const pie_vo = "SELECT COUNT(*) as count , ampher_name as ap FROM `volunteer_posting`  LEFT JOIN tambon ON volunteer_posting.tambon_id = tambon.tambon_id LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id GROUP BY ampher.ampher_id ORDER BY count DESC LIMIT 5";
  // const gotJob = "SELECT COUNT(*) as gotJob FROM jobber where work_status = 'JOB'";
  // const lookingForJob = "SELECT COUNT(*) as lookingForJob FROM jobber where work_status = 'FIND'";


  db.query(volunSql, (err1, volunResult) => {
    if (err1) {
      console.error("DB error:", err1);
      return res.status(500).json({ error: "Server error" });
    }

    db.query(empSql, (err2, empResult) => {
      if (err2) {
        console.error("DB error:", err2);
        return res.status(500).json({ error: "Server error" });
      }

      db.query(voluntSql, (err3, voluntResult) => {
        if (err3) {
          console.error("DB error:", err3);
          return res.status(500).json({ error: "Server error" });
        }
        db.query(numvolunSql, (err4, numvolunResult) => {
          if (err4) {
            console.error("DB error:", err4);
            return res.status(500).json({ error: "Server error" });
          }
          db.query(labels, (err5, labels) => {
            if (err5) {
              console.error("DB error:", err5);
              return res.status(500).json({ error: "Server error" });
            }
            db.query(volunTypeSql, (err6, volunTypeResult) => {
              if (err6) {
                console.error("DB error:", err6);
                return res.status(500).json({ error: "Server error" });
              }
                db.query(pie_vo, (err7, pie_vo) => {
                if (err7) {
                  console.error("DB error:", err7);
                  return res.status(500).json({ error: "Server error" });
                }
                
                  
                      //console.log("📦 lastPost:", lastpost);
                      res.json({
                        volunCount: volunResult[0].volunCount,
                        empCount: empResult[0].empCount,
                        voluntCount: voluntResult[0].voluntCount,
                        volunTypeCount: volunTypeResult[0].volunTypeCount,
                        // gotJob: gotJobResult[0].gotJob,
                        // lookingForJob: lookingForJobResult[0].lookingForJob,
                        numvolunCount: numvolunResult[0].numvolunCount,
                        labels,
                        pie_vo
                      });
                
              });
            });
          });
        });
      });
    });
  });
});

app.get('/emp_rating', (req, res) => {
  
  const emp_id = req.query.emp_id;
  if (!emp_id) return res.status(400).json({ error: 'emp_id is required' });
  db.query('SELECT AVG(score) as stars FROM jobber_review where emp_id = ?', 
    [emp_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (results.length === 0 || !results[0].stars) {
      return res.json({ stars: 0 });
    } 
    res.json({ stars: results[0].stars });
    //console.log(results);
  });
});

app.get('/jobb_rating', (req, res) => {
  
  const jobber_id = req.query.jobber_id;
  if (!jobber_id) return res.status(400).json({ error: 'jobber_id is required' });
  db.query('SELECT AVG(score) as stars FROM emp_review where jobber_id = ?', 
    [jobber_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (results.length === 0 || !results[0].stars) {
      return res.json({ stars: 0 });
    } 
    res.json({ stars: results[0].stars });
    //console.log(results);
  });
});

app.get('/volun_rating', (req, res) => {
  
  const emp_id = req.query.emp_id;
  if (!emp_id) return res.status(400).json({ error: 'emp_id is required' });
  db.query('SELECT AVG(score) as stars FROM volun_review where emp_id = ?', 
    [emp_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (results.length === 0 || !results[0].stars) {
      return res.json({ stars: 0 });
    } 
    res.json({ stars: results[0].stars });
    //console.log(results);
  });
});

app.get("/jobpost", (req, res) => {
  const post_id = req.query.post_id;
  const jobpost = `SELECT 
    job_posting.*,
    picture,
    fullname,
    position_name,
    tambon_name as tb,
    ampher_name as ap,
    jangwat_name as jw,
    edu_name,

    -- นับตามสถานะ
  
    SUM(CASE WHEN apply_job.status = 'waitjobber' THEN 1 ELSE 0 END) as waitjobber_count,
    SUM(CASE WHEN apply_job.status = 'accepted' THEN 1 ELSE 0 END) as accepted_count,
    SUM(CASE WHEN apply_job.status IN ('rejected','expired') THEN 1 ELSE 0 END) as not_success_count


FROM job_posting
INNER JOIN employer 
    ON job_posting.emp_id = employer.emp_id
LEFT JOIN tambon 
    ON job_posting.tambon_id = tambon.tambon_id
LEFT JOIN ampher 
    ON LEFT(tambon.tambon_id,4) = ampher.ampher_id
LEFT JOIN jangwat 
    ON LEFT(ampher.ampher_id,2) = jangwat.jangwat_id
LEFT JOIN position 
    ON job_posting.position_code = position.position_id
LEFT JOIN education_level 
    ON job_posting.education_code = education_level.edu_id
LEFT JOIN apply_job 
    ON job_posting.post_id = apply_job.post_id

WHERE job_posting.post_id = ?`;
  const job_hs = "SELECT hardskill.hardskill_id , hardskill_name FROM `job_need_hs`LEFT JOIN hardskill ON job_need_hs.hardskill_id = hardskill.hardskill_id WHERE post_id = ?";
  const job_ss = "SELECT softskill.softskill_id , softskill_name FROM `job_need_ss`LEFT JOIN softskill ON job_need_ss.softskill_id = softskill.softskill_id WHERE post_id = ?";
  
  db.query(jobpost, [post_id], (err1, jobpost) => {
    if (err1) {
      console.error("DB error:", err1);
      return res.status(500).json({ error: "Server error" });
    }
      db.query(job_hs, [post_id], (err2, job_HS) => {
      if (err2) {
        console.error("DB error:", err2);
        return res.status(500).json({ error: "Server error" });
      }
        db.query(job_ss, [post_id], (err3, job_SS) => {
        if (err3) {
          console.error("DB error:", err3);
          return res.status(500).json({ error: "Server error" });
        }
          res.json({
            jobpost,
            job_HS,
            job_SS
          });
      });
    });
  });
});

app.get("/volunpost", (req, res) => {
  const post_id = req.query.post_id;
  const volunpost = `SELECT 
    volunteer_posting.*,
    picture,
    fullname,
    voluntype_name,
    tambon_name as tb,
    ampher_name as ap,
    jangwat_name as jw,

    -- นับตามสถานะ
  
    SUM(CASE WHEN apply_volun.status = 'waitjobber' THEN 1 ELSE 0 END) as waitjobber_count,
    SUM(CASE WHEN apply_volun.status = 'accepted' THEN 1 ELSE 0 END) as accepted_count,
    SUM(CASE WHEN apply_volun.status IN ('rejected','expired') THEN 1 ELSE 0 END) as not_success_count


FROM volunteer_posting
INNER JOIN employer 
    ON volunteer_posting.emp_id = employer.emp_id
LEFT JOIN tambon 
    ON volunteer_posting.tambon_id = tambon.tambon_id
LEFT JOIN ampher 
    ON LEFT(tambon.tambon_id,4) = ampher.ampher_id
LEFT JOIN jangwat 
    ON LEFT(ampher.ampher_id,2) = jangwat.jangwat_id
LEFT JOIN volunteertype 
    ON volunteer_posting.volunteer_code = volunteertype.voluntype_id
LEFT JOIN apply_volun 
    ON volunteer_posting.post_id = apply_volun.post_id

WHERE volunteer_posting.post_id = ?`;
  const volun_hs = "SELECT hardskill.hardskill_id , hardskill_name FROM `volun_need_hs`LEFT JOIN hardskill ON volun_need_hs.hardskill_id = hardskill.hardskill_id WHERE post_id = ?";
  const volun_ss = "SELECT softskill.softskill_id , softskill_name FROM `volun_need_ss`LEFT JOIN softskill ON volun_need_ss.softskill_id = softskill.softskill_id WHERE post_id = ?";
  
  db.query(volunpost, [post_id], (err1, volunpost) => {
    if (err1) {
      console.error("DB error:", err1);
      return res.status(500).json({ error: "Server error" });
    }
      db.query(volun_hs, [post_id], (err2, volun_HS) => {
      if (err2) {
        console.error("DB error:", err2);
        return res.status(500).json({ error: "Server error" });
      }
        db.query(volun_ss, [post_id], (err3, volun_SS) => {
        if (err3) {
          console.error("DB error:", err3);
          return res.status(500).json({ error: "Server error" });
        }
          res.json({
            volunpost,
            volun_HS,
            volun_SS
          });
      });
    });
  });
});
app.get("/myapply_job", (req, res) => {
  const { page = 1, limit = 10, keyword = "" , jobber_id , type } = req.query;

  const offset = (page -1) * limit;
  const sql = `SELECT 
      apply_job.*,
      age,
      salary,
      job_pic,
      position_id,
      picture,
      num_position,
      position_name,
      job_posting.emp_id AS emp_id,
      fullname,
      tambon_name AS tb,
      ampher_name AS ap,
      jangwat_name AS jw,
      (
        SELECT COUNT(*) 
        FROM apply_job aj2
        WHERE aj2.post_id = apply_job.post_id
          AND aj2.status = 'accepted'
      ) AS accepted_count
    FROM apply_job
    LEFT JOIN job_posting ON apply_job.post_id = job_posting.post_id
    LEFT JOIN position ON job_posting.position_code = position.position_id
    LEFT JOIN jobtype ON position.jobtype_id = jobtype.jobtype_id
    LEFT JOIN employer ON job_posting.emp_id = employer.emp_id
    LEFT JOIN tambon ON job_posting.tambon_id = tambon.tambon_id
    LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id
    LEFT JOIN jangwat ON LEFT(ampher.ampher_id,2) = jangwat.jangwat_id
    WHERE position_name LIKE ?
      AND jobber_id = ?
      AND apply_job.type = ?
    ORDER BY date_time DESC
    LIMIT ? OFFSET ?;
    `;
  const totalsql = "SELECT COUNT(*) as total FROM apply_job LEFT JOIN job_posting ON apply_job.post_id = job_posting.post_id LEFT JOIN position ON job_posting.position_code = position.position_id LEFT JOIN jobtype ON position.jobtype_id = jobtype.jobtype_id LEFT JOIN employer ON job_posting.emp_id = employer.emp_id LEFT JOIN tambon ON job_posting.tambon_id = tambon.tambon_id LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id LEFT JOIN jangwat ON LEFT(ampher.ampher_id,2) = jangwat.jangwat_id WHERE position_name LIKE ? AND jobber_id = ? AND apply_job.type = ?";

    try {
      // const [data] = db.query(sql);
      // const [totalResult] =  db.query(totalsql);
      //console.log("jobtype=", req.query.jobtype);

      db.query(totalsql, [`%${keyword}%` , jobber_id , type], (err, totalResult) => {
        if (err) return res.status(500).json({ error: "Error fetching data" });

          const totalRecords = totalResult[0].total;
          const totalPages = Math.ceil(totalRecords / limit);
      
        db.query(sql, [`%${keyword}%` , jobber_id , type , parseInt(limit) , parseInt(offset)], (err2, data) => {
          if (err2) return res.status(500).json({ error: "Error counting total" });

          res.json({ data, totalPages, totalRecords });
        })
      })
    }  catch (error) {
      res.status(500).json({ error: "Database error"});
    }

});
app.get("/myapply_volun", (req, res) => {
  const { page = 1, limit = 10, keyword = "" , jobber_id , type } = req.query;
  // console.log('jobber_iddddd',jobber_id);
  // console.log('jobber_iddddd',type);
  const offset = (page -1) * limit;
  const sql = `SELECT 
      apply_volun.*,
      age,
      activity_name,
      volun_pic,
      volunteer_code,
      voluntype_name,
      picture,
      num_position,
      volunteer_posting.emp_id AS emp_id,
      fullname,
      tambon_name AS tb,
      ampher_name AS ap,
      jangwat_name AS jw,
      (
        SELECT COUNT(*) 
        FROM apply_volun av2
        WHERE av2.post_id = apply_volun.post_id
          AND av2.status = 'accepted'
      ) AS accepted_count
    FROM apply_volun
    LEFT JOIN volunteer_posting ON apply_volun.post_id = volunteer_posting.post_id
    LEFT JOIN volunteertype ON volunteer_posting.volunteer_code = volunteertype.voluntype_id
    LEFT JOIN employer ON volunteer_posting.emp_id = employer.emp_id
    LEFT JOIN tambon ON volunteer_posting.tambon_id = tambon.tambon_id
    LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id
    LEFT JOIN jangwat ON LEFT(ampher.ampher_id,2) = jangwat.jangwat_id
    WHERE activity_name LIKE ?
      AND jobber_id = ?
      AND apply_volun.type = ?
    ORDER BY date_time DESC
    LIMIT ? OFFSET ?;
    `;
  const totalsql = `
    SELECT COUNT(*) AS total
    FROM apply_volun
    LEFT JOIN volunteer_posting ON apply_volun.post_id = volunteer_posting.post_id
    LEFT JOIN volunteertype ON volunteer_posting.volunteer_code = volunteertype.voluntype_id
    WHERE activity_name LIKE ?
      AND jobber_id = ?
      AND apply_volun.type = ?;
  `;

    try {
      // const [data] = db.query(sql);
      // const [totalResult] =  db.query(totalsql);
      //console.log("jobtype=", req.query.jobtype);

      db.query(totalsql, [`%${keyword}%` , jobber_id , type], (err, totalResult) => {
        if (err) return res.status(500).json({ error: "Error fetching data" });

          const totalRecords = totalResult[0].total;
          const totalPages = Math.ceil(totalRecords / limit);
      
        db.query(sql, [`%${keyword}%` , jobber_id , type , parseInt(limit) , parseInt(offset)], (err2, data) => {
          if (err2) return res.status(500).json({ error: "Error counting total" });

          res.json({ data, totalPages, totalRecords });
        })
      })
    }  catch (error) {
      res.status(500).json({ error: "Database error"});
    }

});
app.get("/my_job", (req, res) => {
  const { page = 1, limit = 3, keyword = "" , emp_id , status } = req.query;

  const offset = (page -1) * limit;
  const sql = `SELECT job_posting.*, 
  position_name, 
  num_position , 
  picture , 
  fullname , 
  tambon_name as tb , 
  ampher_name as ap , 
  jangwat_name as jw ,
  (SELECT COUNT(*) 
        FROM apply_job aj2
        WHERE aj2.post_id = job_posting.post_id
          AND aj2.status = 'accepted'
      ) AS accepted_count ,
  (SELECT COUNT(*) 
        FROM apply_job aj2
        WHERE aj2.post_id = job_posting.post_id
          AND aj2.status = 'rejected'
      ) AS rejected_count ,
  (SELECT COUNT(*) 
        FROM apply_job aj2
        WHERE aj2.post_id = job_posting.post_id
          AND aj2.status = 'expired'
      ) AS expired_count ,
  (SELECT COUNT(*) 
        FROM apply_job aj2
        WHERE aj2.post_id = job_posting.post_id
          AND aj2.status = 'jb_rejected'
      ) AS jb_rejected_count ,
  (SELECT COUNT(*) 
        FROM apply_job aj2
        WHERE aj2.post_id = job_posting.post_id
          AND aj2.status = 'waitemp' AND aj2.type = 'j'
      ) AS waitemp_count ,
  (SELECT COUNT(*) 
        FROM apply_job aj2
        WHERE aj2.post_id = job_posting.post_id
          AND aj2.status = 'waitjobber'
      ) AS waitjobber_count ,
  (SELECT COUNT(*) 
        FROM tempWork
        WHERE tempWork.post_id = job_posting.post_id
          AND tempWork.status = 'MATCHED'
      ) AS matched_count ,
  (SELECT COUNT(*) 
        FROM apply_job aj2
        WHERE aj2.post_id = job_posting.post_id
          AND aj2.type = 'f'
      ) AS fav_count
  FROM job_posting 
  LEFT JOIN position ON job_posting.position_code = position.position_id 
  LEFT JOIN jobtype ON position.jobtype_id = jobtype.jobtype_id 
  LEFT JOIN employer ON job_posting.emp_id = employer.emp_id 
  LEFT JOIN tambon ON job_posting.tambon_id = tambon.tambon_id 
  LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id 
  LEFT JOIN jangwat ON LEFT(ampher.ampher_id,2) = jangwat.jangwat_id 
  WHERE position_name LIKE ? AND job_posting.emp_id = ? AND job_posting.status = ? ORDER BY job_posting.post_id DESC LIMIT ? OFFSET ?`;
  
  const totalsql = "SELECT COUNT(*) as total FROM job_posting LEFT JOIN position ON job_posting.position_code = position.position_id LEFT JOIN jobtype ON position.jobtype_id = jobtype.jobtype_id LEFT JOIN employer ON job_posting.emp_id = employer.emp_id LEFT JOIN tambon ON job_posting.tambon_id = tambon.tambon_id LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id LEFT JOIN jangwat ON LEFT(ampher.ampher_id,2) = jangwat.jangwat_id WHERE position_name LIKE ? AND job_posting.emp_id  = ? AND job_posting.status = ? ";

    try {
      // const [data] = db.query(sql);
      // const [totalResult] =  db.query(totalsql);
      //console.log("jobtype=", req.query.jobtype);
//เดี๋ยวเอาไปแสดงที่หน้าการ์โงานของนายจ้าง************
      db.query(totalsql, [`%${keyword}%` , emp_id , status ], (err, totalResult) => {
        if (err) return res.status(500).json({ error: "Error fetching data" });

          const totalRecords = totalResult[0].total;
          const totalPages = Math.ceil(totalRecords / limit);
      
        db.query(sql, [`%${keyword}%` , emp_id , status , parseInt(limit) , parseInt(offset)], (err2, data) => {
          if (err2) return res.status(500).json({ error: "Error counting total" });

          res.json({ data, totalPages, totalRecords });
        })
      })
    }  catch (error) {
      res.status(500).json({ error: "Database error"});
    }

});
app.get("/my_volun", (req, res) => {
  const { page = 1, limit = 3, keyword = "" , emp_id , status } = req.query;

  const offset = (page -1) * limit;
  const sql = `SELECT volunteer_posting.*, 
  activity_name, 
  voluntype_name,
  num_position , 
  picture , 
  fullname , 
  tambon_name as tb , 
  ampher_name as ap , 
  jangwat_name as jw ,
  (SELECT COUNT(*) 
        FROM apply_volun aj2
        WHERE aj2.post_id = apply_volun.post_id
          AND aj2.status = 'accepted'
      ) AS accepted_count ,
  (SELECT COUNT(*) 
        FROM apply_volun aj2
        WHERE aj2.post_id = apply_volun.post_id
          AND aj2.status = 'rejected'
      ) AS rejected_count ,
  (SELECT COUNT(*) 
        FROM apply_volun aj2
        WHERE aj2.post_id = apply_volun.post_id
          AND aj2.status = 'expired'
      ) AS expired_count ,
  (SELECT COUNT(*) 
        FROM apply_volun aj2
        WHERE aj2.post_id = apply_volun.post_id
          AND aj2.status = 'jb_rejected'
      ) AS jb_rejected_count ,
  (SELECT COUNT(*) 
        FROM apply_volun aj2
        WHERE aj2.post_id = apply_volun.post_id
          AND aj2.status = 'waitemp'
      ) AS waitemp_count ,
  (SELECT COUNT(*) 
        FROM apply_volun aj2
        WHERE aj2.post_id = apply_volun.post_id
          AND aj2.status = 'waitjobber'
      ) AS waitjobber_count ,
  (SELECT COUNT(*) 
        FROM tempVolun
        WHERE tempVolun.post_id = volunteer_posting.post_id
          AND tempVolun.status = 'MATCHED'
      ) AS matched_count ,
  (SELECT COUNT(*) 
        FROM apply_volun aj2
        WHERE aj2.post_id = apply_volun.post_id
          AND aj2.type = 'f'
      ) AS fav_count
  FROM volunteer_posting 
  LEFT JOIN volunteertype ON volunteer_posting.volunteer_code = volunteertype.voluntype_id 
  LEFT JOIN employer ON volunteer_posting.emp_id = employer.emp_id 
  LEFT JOIN tambon ON volunteer_posting.tambon_id = tambon.tambon_id 
  LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id 
  LEFT JOIN jangwat ON LEFT(ampher.ampher_id,2) = jangwat.jangwat_id 

  LEFT JOIN apply_volun ON volunteer_posting.post_id = apply_volun.post_id
  LEFT JOIN tempVolun ON volunteer_posting.post_id = tempVolun.post_id

  WHERE (activity_name LIKE ? OR voluntype_name LIKE ? ) AND volunteer_posting.emp_id = ? AND volunteer_posting.status = ? ORDER BY volunteer_posting.post_id DESC LIMIT ? OFFSET ?`;
  
  const totalsql = `SELECT COUNT(*) as total 
  FROM volunteer_posting 
  LEFT JOIN volunteertype ON volunteer_posting.volunteer_code = volunteertype.voluntype_id 
  LEFT JOIN employer ON volunteer_posting.emp_id = employer.emp_id 
  LEFT JOIN tambon ON volunteer_posting.tambon_id = tambon.tambon_id 
  LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id 
  LEFT JOIN jangwat ON LEFT(ampher.ampher_id,2) = jangwat.jangwat_id 

  LEFT JOIN apply_volun ON volunteer_posting.post_id = apply_volun.post_id
  LEFT JOIN tempVolun ON volunteer_posting.post_id = tempVolun.post_id
  WHERE (activity_name LIKE ? OR voluntype_name LIKE ? ) AND volunteer_posting.emp_id = ? AND volunteer_posting.status = ? `;

    try {
      // const [data] = db.query(sql);
      // const [totalResult] =  db.query(totalsql);
      //console.log("jobtype=", req.query.jobtype);
//เดี๋ยวเอาไปแสดงที่หน้าการ์โงานของนายจ้าง************
      db.query(totalsql, [`%${keyword}%` , `%${keyword}%` , emp_id , status ], (err, totalResult) => {
        if (err) return res.status(500).json({ error: "Error fetching data" });

          const totalRecords = totalResult[0].total;
          const totalPages = Math.ceil(totalRecords / limit);
      
        db.query(sql, [`%${keyword}%` , `%${keyword}%` , emp_id , status , parseInt(limit) , parseInt(offset)], (err2, data) => {
          if (err2) return res.status(500).json({ error: "Error counting total" });

          res.json({ data, totalPages, totalRecords });
        })
      })
    }  catch (error) {
      res.status(500).json({ error: "Database error"});
    }

});
app.get("/my_matchjob", (req, res) => {
  const { page = 1, limit = 10, keyword = "" , emp_id } = req.query;

  const offset = (page -1) * limit;
  const sql = "SELECT DISTINCT job_posting.*, position_name , fullname , tambon_name as tb , ampher_name as ap , jangwat_name as jw FROM job_posting LEFT JOIN position ON job_posting.position_code = position.position_id LEFT JOIN jobtype ON position.jobtype_id = jobtype.jobtype_id LEFT JOIN employer ON job_posting.emp_id = employer.emp_id LEFT JOIN tambon ON job_posting.tambon_id = tambon.tambon_id LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id LEFT JOIN jangwat ON LEFT(ampher.ampher_id,2) = jangwat.jangwat_id INNER JOIN tempWork ON job_posting.post_id = tempWork.post_id WHERE position_name LIKE ? AND job_posting.emp_id = ? LIMIT ? OFFSET ?";
  const totalsql = "SELECT COUNT(DISTINCT job_posting.post_id) as total FROM job_posting LEFT JOIN position ON job_posting.position_code = position.position_id LEFT JOIN jobtype ON position.jobtype_id = jobtype.jobtype_id LEFT JOIN employer ON job_posting.emp_id = employer.emp_id LEFT JOIN tambon ON job_posting.tambon_id = tambon.tambon_id LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id LEFT JOIN jangwat ON LEFT(ampher.ampher_id,2) = jangwat.jangwat_id INNER JOIN tempWork ON job_posting.post_id = tempWork.post_id WHERE position_name LIKE ? AND job_posting.emp_id  = ? ";

    try {
      // const [data] = db.query(sql);
      // const [totalResult] =  db.query(totalsql);
      //console.log("jobtype=", req.query.jobtype);

      db.query(totalsql, [`%${keyword}%` , emp_id ], (err, totalResult) => {
        if (err) return res.status(500).json({ error: "Error fetching data" });

          const totalRecords = totalResult[0].total;
          const totalPages = Math.ceil(totalRecords / limit);
      
        db.query(sql, [`%${keyword}%` , emp_id , parseInt(limit) , parseInt(offset)], (err2, data) => {
          if (err2) return res.status(500).json({ error: "Error counting total" });

          res.json({ data, totalPages, totalRecords });
        })
      })
    }  catch (error) {
      res.status(500).json({ error: "Database error"});
    }

});

app.post("/api/apply-job", (req, res) => {
  const { post_id, jobber_id, type } = req.body;

  // ---------- Validate ----------
  if (!post_id || !jobber_id || !type) {
    return res
      .status(400)
      .json({ success: false, message: "ข้อมูลไม่ครบ" });
  }

  // ---------- 1) Insert apply_job ----------
  const sqlInsert = `
    INSERT INTO apply_job (post_id, jobber_id, date_time, type, status)
    VALUES (?, ?, NOW(), ?, 'waitemp')
  `;

  db.query(sqlInsert, [post_id, jobber_id, type], (err) => {
    if (err) {
      console.error("❌ MySQL Error [Insert]:", err);
      return res
        .status(500)
        .json({ success: false, message: "บันทึกไม่สำเร็จ", error: err });
    }

    // ---------- 2) Query ข้อมูลประกาศ + นายจ้าง + ผู้สมัคร ----------
    const sqlPost = `
      SELECT 
        po.position_name as postTitle,
        e.emp_id,
        e.fullname as empName,
        e.email as empEmail,
        j.fullname as jobberName,
        j.email as jobberEmail
      FROM job_posting p
      JOIN employer e ON p.emp_id = e.emp_id
      LEFT JOIN position po ON po.position_id = p.position_code
      JOIN jobber j ON j.jobber_id = ?      -- << join jobber โดยใช้ jobber_id
      WHERE p.post_id = ?
    `;

    db.query(sqlPost, [jobber_id, post_id], (err2, postRows) => {
      if (err2) {
        console.error("❌ MySQL Error [Select]:", err2);
        return res
          .status(500)
          .json({ success: false, message: "ดึงข้อมูลประกาศไม่สำเร็จ", error: err2 });
      }

      if (!postRows || postRows.length === 0) {
        return res.json({
          success: true,
          message: "บันทึกสำเร็จ (แต่ไม่พบข้อมูลประกาศ)",
        });
      }
      const post = postRows[0];

      // ---------- 3) ยิง Notification ----------
      const eventKey = type === "f" ? "JOBBER_FAVORITED" : "JOBBER_APPLIED";
      const title =
        type === "f" ? "มีผู้สนใจงานของคุณ" : "มีผู้สมัครงานใหม่";
      const empBody =
        type === "f"
          ? `คุณ ${post.jobberName} สนใจตำแหน่ง "${post.postTitle}" ของคุณ`
          : `คุณ ${post.jobberName} สมัครงาน ตำแหน่ง "${post.postTitle}" ของคุณณ`;

      // 3.1 แจ้งนายจ้าง
      notifService
        .add({
          receiverRole: "emp",
          receiverId: post.emp_id,
          eventKey,
          title,
          body: empBody,
          postId: post_id,
          jobberId: jobber_id,
          employerId: post.emp_id,
          meta: { link: `/Emp_Job_Post?pi=${post_id}` },
          email: post.empEmail,
        })
        .catch((e) => console.error("Notif employer error:", e));

      // 3.2 แจ้งผู้สมัคร (optional)
      notifService
        .add({
          receiverRole: "jobber",
          receiverId: jobber_id,
          eventKey: type === "f" ? "FAVORITE_SAVED" : "APPLY_SUBMITTED",
          title: type === "f" ? "บันทึกงานที่สนใจ" : "สมัครงานเรียบร้อย",
          body:
            type === "f"
              ? `คุณได้บันทึกงาน "${post.postTitle}" ของนายจ้าง ${post.empName} ในรายการที่สนใจ ดูในหน้าหลัก`
              : `คุณสมัครงาน "${post.postTitle}" กับนายจ้าง ${post.empName} รอการติดต่อกลับจากนายจ้าง`,
          postId: post_id,
          jobberId: jobber_id,
          employerId: post.emp_id,
          meta: { link: `/Job_Post_de?pi=${post_id}` },
          email: post.jobberEmail, 
        })
        .catch((e) => console.error("Notif jobber error:", e));

      // ---------- 4) ตอบกลับ ----------
      res.json({ success: true, message: "สมัครงานสำเร็จ" });
    });
  });
});

app.post("/api/apply-volun", (req, res) => {
  const { post_id, jobber_id, type } = req.body;

  // ---------- Validate ----------
  if (!post_id || !jobber_id || !type) {
    return res
      .status(400)
      .json({ success: false, message: "ข้อมูลไม่ครบ" });
  }

  // ---------- 1) Insert apply_job ----------
  const sqlInsert = `
    INSERT INTO apply_volun (post_id, jobber_id, date_time, type, status)
    VALUES (?, ?, NOW(), ?, 'waitemp')
  `;

  db.query(sqlInsert, [post_id, jobber_id, type], (err) => {
    if (err) {
      console.error("❌ MySQL Error [Insert]:", err);
      return res
        .status(500)
        .json({ success: false, message: "บันทึกไม่สำเร็จ", error: err });
    }

    // ---------- 2) Query ข้อมูลประกาศ + นายจ้าง + ผู้สมัคร ----------
    const sqlPost = `
      SELECT 
        volunteer_posting.activity_name as activityTitle,
        e.emp_id,
        e.fullname as empName,
        e.email as empEmail,
        j.fullname as jobberName,
        j.email as jobberEmail
      FROM volunteer_posting
      JOIN employer e ON volunteer_posting.emp_id = e.emp_id
      LEFT JOIN volunteertype ON volunteer_posting.volunteer_code = volunteertype.voluntype_id
      JOIN jobber j ON j.jobber_id = ?      -- << join jobber โดยใช้ jobber_id
      WHERE volunteer_posting.post_id = ?
    `;

    db.query(sqlPost, [jobber_id, post_id], (err2, postRows) => {
      if (err2) {
        console.error("❌ MySQL Error [Select]:", err2);
        return res
          .status(500)
          .json({ success: false, message: "ดึงข้อมูลประกาศไม่สำเร็จ", error: err2 });
      }

      if (!postRows || postRows.length === 0) {
        return res.json({
          success: true,
          message: "บันทึกสำเร็จ (แต่ไม่พบข้อมูลประกาศ)",
        });
      }
      const post = postRows[0];

      // ---------- 3) ยิง Notification ----------
      const eventKey = type === "f" ? "VOLUN_FAVORITED" : "VOLUN_APPLIED";
      const title =
        type === "f" ? "มีผู้สนใจกิจกรรมของคุณ" : "มีผู้ลงทะเบียนกิจกรรมใหม่";
      const empBody =
        type === "f"
          ? `คุณ ${post.jobberName} สนใจกิจกรรม "${post.activityTitle}" ของคุณ`
          : `คุณ ${post.jobberName} ลงทะเบียนกิจกรรม "${post.activityTitle}" ของคุณณ`;

      // 3.1 แจ้งนายจ้าง
      notifService
        .add({
          receiverRole: "emp",
          receiverId: post.emp_id,
          eventKey,
          title,
          body: empBody,
          postId: post_id,
          jobberId: jobber_id,
          employerId: post.emp_id,
          meta: { link: `/Emp_Volun_Post?pi=${post_id}` },
          email: post.empEmail,
        })
        .catch((e) => console.error("Notif employer error:", e));

      // 3.2 แจ้งผู้สมัคร (optional)
      notifService
        .add({
          receiverRole: "jobber",
          receiverId: jobber_id,
          eventKey: type === "f" ? "VOLUN_FAVORITE_SAVED" : "VOLUN_APPLY_SUBMITTED",
          title: type === "f" ? "บันทึกกิจกรรมที่สนใจ" : "ลงทะเบียนกิจกรรมเรียบร้อย",
          body:
            type === "f"
              ? `คุณได้บันทึกกิจกรรม "${post.activityTitle}" ของผู้จัดกิจกรรม ${post.empName} ในรายการที่สนใจ ดูในหน้าหลัก`
              : `คุณลงทะเบียนกิจกรรม "${post.activityTitle}" กับผู้จัดกิจกรรม ${post.empName} รอการติดต่อกลับจากผู้จัดกิจกรรม`,
          postId: post_id,
          jobberId: jobber_id,
          employerId: post.emp_id,
          meta: { link: `/Volun_Post_de?pi=${post_id}` },
          email: post.jobberEmail, 
        })
        .catch((e) => console.error("Notif jobber error:", e));

      // ---------- 4) ตอบกลับ ----------
      res.json({ success: true, message: "สมัครงานสำเร็จ" });
    });
  });
});

app.patch("/api/update-status", (req, res) => {
  const { post_id, status } = req.body;

  if (!post_id || !status) {
    return res.status(400).json({ error: "post_id และ status ต้องระบุ" });
  }

  const sql = "UPDATE job_posting SET status = ? WHERE post_id = ?";

  db.query(sql, [status, post_id], (err, result) => {
    if (err) {
      console.error("❌ MySQL Error:", err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "ไม่พบโพสต์นี้" });
    }
    res.json({ message: "อัพเดทสถานะเรียบร้อย", post_id, status });
  });
});

app.patch("/api/volunupdate-status", (req, res) => {
  const { post_id, status } = req.body;

  if (!post_id || !status) {
    return res.status(400).json({ error: "post_id และ status ต้องระบุ" });
  }

  const sql = "UPDATE volunteer_posting SET status = ? WHERE post_id = ?";

  db.query(sql, [status, post_id], (err, result) => {
    if (err) {
      console.error("❌ MySQL Error:", err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "ไม่พบโพสต์นี้" });
    }
    res.json({ message: "อัพเดทสถานะเรียบร้อย", post_id, status });
  });
});

app.get("/api/check-apply", (req, res) => {
  const { jobber_id, post_id, type } = req.query;

  if (!jobber_id || !post_id) {
    return res.status(400).json({ message: "ต้องระบุ jobber_id และ post_id" });
  }

  let sql = `
    SELECT COUNT(*) as count,
           apply_job.status,
           apply_job.message,
           apply_job.expire_time
    FROM apply_job
    WHERE jobber_id = ? AND post_id = ?
  `;
  const params = [jobber_id, post_id];

  if (type) {
    sql += " AND type = ?";
    params.push(type);
  }

  sql += " LIMIT 1";
console.log('SQL:', sql, params);

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("❌ MySQL Error:", err);
      return res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err });
    }

    const applied = results[0].count > 0;
    res.json({ applied, results: results[0] });
  });
});

app.get("/api/check-applyvolun", (req, res) => {
  const { jobber_id, post_id, type } = req.query;

  if (!jobber_id || !post_id) {
    return res.status(400).json({ message: "ต้องระบุ jobber_id และ post_id" });
  }

  let sql = `
    SELECT COUNT(*) as count,
           apply_volun.status,
           apply_volun.message,
           apply_volun.expire_time
    FROM apply_volun
    WHERE jobber_id = ? AND post_id = ?
  `;
  const params = [jobber_id, post_id];

  if (type) {
    sql += " AND type = ?";
    params.push(type);
  }

  sql += " LIMIT 1";
console.log('SQL:', sql, params);

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("❌ MySQL Error:", err);
      return res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err });
    }

    const applied = results[0].count > 0;
    res.json({ applied, results: results[0] });
  });
});

app.get("/api/check-close", (req, res) => {
  const { post_id } = req.query;

  const sql = "SELECT status FROM job_posting WHERE post_id = ?";
  db.query(sql, [post_id], (err, results) => {
    if (err) {
      console.error("❌ MySQL Error:", err);
      return res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err });
    }

    if (!results.length) {
      return res.status(404).json({ message: "ไม่พบโพสต์นี้" });
    }

    const isClosed = results[0].status === "finish"; // หรือ "closed" ตามฐานข้อมูล
    res.json({ isClosed });
  });
});

app.get("/api/voluncheck-close", (req, res) => {
  const { post_id } = req.query;

  const sql = "SELECT status FROM volunteer_posting WHERE post_id = ?";
  db.query(sql, [post_id], (err, results) => {
    if (err) {
      console.error("❌ MySQL Error:", err);
      return res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err });
    }

    if (!results.length) {
      return res.status(404).json({ message: "ไม่พบโพสต์นี้" });
    }

    const isClosed = results[0].status === "finish"; // หรือ "closed" ตามฐานข้อมูล
    res.json({ isClosed });
  });
});

app.delete("/api/apply-job", (req, res) => {
  const { jobber_id, post_id, type } = req.body;

  if (!jobber_id || !post_id) {
    return res.status(400).json({ message: "ต้องระบุ jobber_id และ post_id" });
  }

  // สร้าง SQL และ params ตามว่ามี type หรือไม่
  let sql = "DELETE FROM apply_job WHERE jobber_id = ? AND post_id = ?";
  const params = [jobber_id, post_id];

  if (type) {
    sql += " AND type = ?";
    params.push(type);
  }

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("❌ MySQL Error:", err);
      return res.status(500).json({ message: "ลบไม่สำเร็จ", error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "ไม่พบข้อมูลที่ต้องการลบ" });
    }

    res.json({ message: "ยกเลิกการสมัครสำเร็จ" });
  });
});

app.delete("/api/apply-volun", (req, res) => {
  const { jobber_id, post_id, type } = req.body;

  if (!jobber_id || !post_id) {
    return res.status(400).json({ message: "ต้องระบุ jobber_id และ post_id" });
  }

  // สร้าง SQL และ params ตามว่ามี type หรือไม่
  let sql = "DELETE FROM apply_volun WHERE jobber_id = ? AND post_id = ?";
  const params = [jobber_id, post_id];

  if (type) {
    sql += " AND type = ?";
    params.push(type);
  }

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("❌ MySQL Error:", err);
      return res.status(500).json({ message: "ลบไม่สำเร็จ", error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "ไม่พบข้อมูลที่ต้องการลบ" });
    }

    res.json({ message: "ยกเลิกการสมัครสำเร็จ" });
  });
});

app.get("/emp_pf", (req, res) => {
  const { page = 1, limit = 10, keyword = "", reviewPage = 1, emp_id, status, only } = req.query;
  const offset = (page - 1) * limit;
  const reviewOffset = (reviewPage - 1) * 6;
  const employer = "SELECT emp_id , fullname , gender , latitude , longitude ,  address , phone , picture , percent_match as pc_match , about , benefits , status , tambon_name as tb , ampher_name as ap , jangwat_name as jw FROM `employer` LEFT JOIN tambon ON employer.tambon_id = tambon.tambon_id LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id LEFT JOIN jangwat ON LEFT(ampher.ampher_id,2) = jangwat.jangwat_id WHERE emp_id = ?";

  if (only === 'employer') {
    db.query(employer, [emp_id], (err, Emp_pf) => {
      if (err) {
        console.error("DB error:", err);
        return res.status(500).json({ error: "Server error" });
      }
      return res.json({ Emp_pf });
    });
    return;
  }

  // ...existing code for fetching all info...
  const job_post = "SELECT job_posting.post_id , salary , job_pic , position_name , job_posting.num_position , job_posting.emp_id as emp_id , fullname , picture , tambon_name as tb , ampher_name as ap , jangwat_name as jw ,  (SELECT COUNT(*) FROM apply_job aj2 WHERE aj2.post_id = job_posting.post_id AND aj2.status = 'accepted') AS accepted_count FROM `job_posting` LEFT JOIN position ON job_posting.position_code = position.position_id LEFT JOIN employer ON job_posting.emp_id = employer.emp_id LEFT JOIN tambon ON job_posting.tambon_id = tambon.tambon_id LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id LEFT JOIN jangwat ON LEFT(ampher.ampher_id,2) = jangwat.jangwat_id  WHERE position_name LIKE ? AND job_posting.emp_id = ? AND job_posting.status = ? LIMIT ? OFFSET ?";
  const jobber_review = "SELECT jobber_review.* , fullname , picture FROM `jobber_review` LEFT JOIN jobber ON jobber_review.jobber_id = jobber.jobber_id WHERE emp_id = ? LIMIT 6 OFFSET ?";
  const jreviewcount = "SELECT COUNT(*) as jReviewCount FROM jobber_review LEFT JOIN jobber ON jobber_review.jobber_id = jobber.jobber_id WHERE emp_id = ?";
  const postcount = "SELECT COUNT(*) as postCount FROM job_posting LEFT JOIN position ON job_posting.position_code = position.position_id WHERE position_name LIKE ? AND emp_id = ? AND job_posting.status = ?";
  const findvolun = "SELECT about_volun , vission , mission FROM `employer` WHERE emp_id = ?";
  const volun_post = "SELECT post_id , activity_name , volun_pic , post_day , date_start , date_end , time , num_position , location , tambon_name as tb , ampher_name as ap , jangwat_name as jw FROM `volunteer_posting` INNER JOIN employer ON volunteer_posting.emp_id = employer.emp_id LEFT JOIN tambon ON volunteer_posting.tambon_id = tambon.tambon_id LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id LEFT JOIN jangwat ON LEFT(ampher.ampher_id,2) = jangwat.jangwat_id WHERE activity_name LIKE ? AND volunteer_posting.emp_id = ? AND volunteer_posting.status = ? LIMIT ? OFFSET ?";
  const volun_review = "SELECT volun_review.* , fullname , picture FROM `volun_review`LEFT JOIN jobber ON volun_review.jobber_id = jobber.jobber_id WHERE volun_review.emp_id = ? LIMIT 6 OFFSET ?";
  const vreviewcount = "SELECT COUNT(*) as vReviewCount FROM `volun_review`LEFT JOIN jobber ON volun_review.jobber_id = jobber.jobber_id WHERE volun_review.emp_id = ?";
  const voluncount = "SELECT COUNT(*) as volunCount FROM volunteer_posting WHERE activity_name LIKE ? AND emp_id = ? AND volunteer_posting.status = ?";
  const job_pic = "SELECT pic_name FROM `picture` WHERE emp_id = ? and type = 'j'";
  const volun_pic = "SELECT pic_name FROM `picture` WHERE emp_id = ? and type = 'v'";

  db.query(employer, [emp_id], (err1, Emp_pf) => {
    if (err1) {
      console.error("DB error:", err1);
      return res.status(500).json({ error: "Server error" });
    }
      db.query(job_post, [`%${keyword}%` , emp_id , status , parseInt(limit) , parseInt(offset)], (err2, job_post) => {
        if (err2) {
          console.error("DB error:", err2);
          return res.status(500).json({ error: "Server error" });
        }
          db.query(jobber_review, [emp_id , parseInt(reviewOffset)], (err3, jobber_review) => {
            if (err3) {
              console.error("DB error:", err3);
              return res.status(500).json({ error: "Server error" });
            }
              db.query(postcount, [`%${keyword}%` , emp_id , status], (err4, totalResult) => {
                if (err4) {
                  console.error("DB error:", err4);
                  return res.status(500).json({ error: "Server error" });
                }
                  const postCount = totalResult[0].postCount;
                  const totalPagesJ = Math.ceil(postCount / limit);

                  db.query(findvolun, [emp_id], (err5, findvolun) => {
                    if (err5) {
                      console.error("DB error:", err5);
                      return res.status(500).json({ error: "Server error" });
                    }
                      db.query(volun_post, [`%${keyword}%` , emp_id , status , parseInt(limit) , parseInt(offset)], (err6, volun_post) => {
                        if (err6) {
                          console.error("DB error:", err6);
                          return res.status(500).json({ error: "Server error" });
                        }
                          db.query(volun_review, [emp_id, parseInt(reviewOffset)], (err7, volun_review) => {
                            if (err7) {
                              console.error("DB error:", err7);
                              return res.status(500).json({ error: "Server error" });
                            }
                              db.query(voluncount, [`%${keyword}%` , emp_id , status], (err8, totalResultV) => {
                                if (err8) {
                                  console.error("DB error:", err8);
                                  return res.status(500).json({ error: "Server error" });
                                }
                                  const volunCount = totalResultV[0].volunCount;
                                  const totalPagesV = Math.ceil(volunCount / limit);

                                  db.query(job_pic, [emp_id], (err9, job_pic_results) => {
                                    if (err9) {
                                      console.error("DB error:", err9);
                                      return res.status(500).json({ error: "Server error" });
                                    }
                                        const picArray = job_pic_results.map(row => row.pic_name);
                                      db.query(volun_pic, [emp_id], (err10, volun_pic_results) => {
                                        if (err10) {
                                          console.error("DB error:", err10);
                                          return res.status(500).json({ error: "Server error" });
                                        }
                                          const vpicArray = volun_pic_results.map(row => row.pic_name);

                                          db.query(jreviewcount, [emp_id, parseInt(limit) , parseInt(reviewOffset)], (err11, totalReviewJ) => {
                                            if (err11) {
                                              console.error("DB error:", err11);
                                              return res.status(500).json({ error: "Server error" });
                                            }
                                              const jReviewCount = totalReviewJ[0].jReviewCount;
                                              const totalReviewPageJ = Math.ceil(jReviewCount / 6);
                                                
                                              db.query(vreviewcount, [emp_id, parseInt(limit) , parseInt(reviewOffset)], (err12, totalReviewV) => {
                                                if (err12) {
                                                  console.error("DB error:", err12);
                                                  return res.status(500).json({ error: "Server error" });
                                                }
                                                  const vReviewCount = totalReviewV[0].vReviewCount;
                                                  const totalReviewPageV = Math.ceil(vReviewCount / 6);
                                                                  res.json({
                                                                    Emp_pf,
                                                                    job_post,
                                                                    jobber_review,
                                                                    postCount,
                                                                    totalPagesJ,
                                                                    findvolun,
                                                                    volun_post,
                                                                    volun_review,
                                                                    volunCount,
                                                                    totalPagesV,
                                                                    job_pic: picArray,
                                                                    volun_pic: vpicArray,
                                                                    jReviewCount,
                                                                    vReviewCount,
                                                                    totalReviewPageJ,
                                                                    totalReviewPageV
                                                                  });
                                                              
                                                  
                                              });
                                          });
                                      });
                                  });
                              });
                          });
                      });
                  });
              });
          });
      });
  });
});
app.get("/jobber_pf", (req, res) => {
  const {jobber_id , page , limit} = req.query;

  const offset = (page -1) * limit;

  const jobber = "SELECT jobber.jobber_id , fullname , fullname_eng , phone , email , gender , address , picture , birthday , work_status , jobber.status , tambon_name as tb , ampher_name as ap , jangwat_name as jw FROM `jobber` LEFT JOIN tambon ON jobber.tambon_id = tambon.tambon_id LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id LEFT JOIN jangwat ON LEFT(ampher.ampher_id,2) = jangwat.jangwat_id WHERE jobber.jobber_id = ?";
  const work_exper = "SELECT work_experience.* , position_name FROM work_experience LEFT JOIN position ON work_experience.position_id = position.position_id WHERE jobber_id = ?  LIMIT ? OFFSET ?";
  const interests_work = "SELECT interests_work.* , position_name FROM `interests_work` LEFT JOIN position ON interests_work.position_id = position.position_id WHERE jobber_id = ?  LIMIT ? OFFSET ?";
  const hs = "SELECT hardskill_name FROM `jobber_hs` LEFT JOIN hardskill ON jobber_hs.hardskill_id = hardskill.hardskill_id WHERE jobber_id = ?";
  const ss = "SELECT softskill_name FROM `jobber_ss` LEFT JOIN softskill ON jobber_ss.softskill_id = softskill.softskill_id WHERE jobber_id = ?";
  const match = "SELECT tempWork.* , post_day, fullname , position_name FROM tempWork LEFT JOIN job_posting ON tempWork.post_id = job_posting.post_id LEFT JOIN employer ON job_posting.emp_id = employer.emp_id LEFT JOIN position ON tempWork.position_id = position.position_id WHERE jobber_id = ?";
  const job_hs_ss ="SELECT COUNT(DISTINCT job_need_hs.hardskill_id) as job_hs , COUNT(DISTINCT job_need_ss.softskill_id) as job_ss FROM job_need_hs LEFT JOIN job_need_ss ON job_need_hs.post_id = job_need_ss.post_id WHERE job_need_hs.post_id = ?";
  const postCount = "SELECT count(*) as postCount FROM tempWork WHERE jobber_id = ? AND status = 'MATCHED';";  const interests_volun = "SELECT interests_volun.* , voluntype_name  FROM interests_volun LEFT JOIN volunteertype ON interests_volun.voluntype_id = volunteertype.voluntype_id WHERE jobber_id = ?";
  const volun_matched = "SELECT apply_volun.* , activity_name FROM apply_volun LEFT JOIN volunteer_posting ON apply_volun.post_id = volunteer_posting.post_id WHERE jobber_id = ? and type = 'm'";
  const job_matchedCount = "SELECT COUNT(*) as job_matchedCount FROM `apply_job` WHERE jobber_id = ? and type = 'm'";
  const volun_matchedCount = "SELECT COUNT(*) as volun_matchedCount FROM `apply_volun` WHERE jobber_id = ? and type = 'm'";
  const edu = "SELECT education_history.*, status , edu_name FROM education_history LEFT JOIN education_level ON education_history.edu_id = education_level.edu_id WHERE jobber_id = ? ORDER BY edu_id LIMIT ? OFFSET ?";
  const work_experCount = "SELECT COUNT(*) as total FROM work_experience WHERE jobber_id = ?";
  const interests_workCount = "SELECT COUNT(*) as total FROM interests_work WHERE jobber_id = ?";
  const eduCount = "SELECT COUNT(*) as total FROM education_history WHERE jobber_id = ?";


  db.query(jobber, [jobber_id], (err1, jobber) => {
    if (err1) {
      console.error("DB error:", err1);
      return res.status(500).json({ error: "Server error" });
    }
    // console.log("jobber......",jobber);
      db.query(interests_work, [jobber_id , parseInt(limit) , parseInt(offset)], (err2, interests_work) => {
        if (err2) {
          console.error("DB error:", err2);
          return res.status(500).json({ error: "Server error" });
        }
          db.query(hs, [jobber_id], (err3, hs) => {
            if (err3) {
              console.error("DB error:", err3);
              return res.status(500).json({ error: "Server error" });
            }
              db.query(ss, [jobber_id], (err4, ss) => {
                if (err4) {
                  console.error("DB error:", err4);
                  return res.status(500).json({ error: "Server error" });
                }
                  db.query(match, [jobber_id], (err5, job_matched) => {
                    if (err5) {
                      console.error("DB error:", err5);
                      return res.status(500).json({ error: "Server error" });
                    }
                      const post_id = job_matched[0]?.post_id;

                      db.query(interests_volun, [jobber_id], (err6, interests_volun) => {
                        if (err6) {
                          console.error("DB error:", err6);
                          return res.status(500).json({ error: "Server error" });
                        }
                          db.query(volun_matched, [jobber_id], (err7, volun_matched) => {
                            if (err7) {
                              console.error("DB error:", err7);
                              return res.status(500).json({ error: "Server error" });
                            }
                              db.query(job_matchedCount, [jobber_id], (err8, job_matchedCount) => {
                                if (err8) {
                                  console.error("DB error:", err8);
                                  return res.status(500).json({ error: "Server error" });
                                }
                                  db.query(volun_matchedCount, [jobber_id], (err9, volun_matchedCount) => {
                                    if (err9) {
                                      console.error("DB error:", err9);
                                      return res.status(500).json({ error: "Server error" });
                                    }
                                      db.query(work_exper, [jobber_id , parseInt(limit) , parseInt(offset)], (err10, work_exper) => {
                                        if (err10) {
                                          console.error("DB error:", err10);
                                          return res.status(500).json({ error: "Server error" });
                                        }
                                          
                                          db.query(postCount, [jobber_id], (err11, postCount) => {
                                            if (err11) {
                                              console.error("DB error:", err11);
                                              return res.status(500).json({ error: "Server error" });
                                            }
                                              db.query(job_hs_ss, [post_id], (err12, job_hs_ss) => {
                                                if (err12) {
                                                  console.error("DB error:", err12);
                                                  return res.status(500).json({ error: "Server error" });
                                                }
                                                   const hd = 9 + parseInt(job_hs_ss[0]?.job_hs) + parseInt(job_hs_ss[0]?.job_ss);

                                                  db.query(edu, [jobber_id , 2 , (page-1)*2], (err12, edu) => {
                                                    if (err12) {
                                                      console.error("DB error:", err12);
                                                      return res.status(500).json({ error: "Server error" });
                                                    }
                                                      db.query(work_experCount, [jobber_id], (errCount1, work_experCount) => {
                                                        if (errCount1) return res.status(500).json({ error: "Server error" });
                                                          const workCount = work_experCount[0].total;
                                                          const WCtotalPages = Math.ceil(workCount / limit);
                                                        db.query(interests_workCount, [jobber_id], (errCount2, interests_workCount) => {
                                                          if (errCount2) return res.status(500).json({ error: "Server error" });
                                                            const interestsCount = interests_workCount[0].total;
                                                            const ICtotalPages = Math.ceil(interestsCount / limit);
                                                          db.query(eduCount, [jobber_id], (errCount3, edu_Count) => {
                                                            if (errCount3) return res.status(500).json({ error: "Server error" });
                                                              const eduCount = edu_Count[0].total;
                                                              const ECtotalPages = Math.ceil(eduCount / limit);
                                                            res.json({
                                                              jobber,
                                                              interests_work,
                                                              hs,
                                                              ss,
                                                              hd,
                                                              job_matched,
                                                              interests_volun,
                                                              volun_matched,
                                                              job_matchedCount: job_matchedCount[0].job_matchedCount,
                                                              volun_matchedCount: volun_matchedCount[0].volun_matchedCount,
                                                              work_exper,
                                                              edu,
                                                              // ✅ ส่งจำนวนรวมกลับไปด้วย
                                                              counts: {
                                                                work: work_experCount[0].total,
                                                                interests: interests_workCount[0].total,
                                                                edu: edu_Count[0].total,
                                                              },
                                                              totalPages: {
                                                                work: WCtotalPages,
                                                                interests: ICtotalPages,
                                                                edu: ECtotalPages,
                                                              }
                                                            });
                                                          });
                                                        });
                                                      });

                                                  });
                                              });
                                          });
                                      });
                                  });
                              });
                          });
                      });
                  });
              });
          });
      });
  });
});

app.get("/Adminview_jobber_pf", (req, res) => {
  const {jobber_id ,workPage, eduPage, interestsPage, page , limit} = req.query;

  const offset = (page -1) * 3;
  const workOffset = (workPage - 1) * limit;
  const eduOffset = (eduPage - 1) * limit;
  const interestsOffset = (interestsPage - 1) * limit;

  const jobber = "SELECT jobber.jobber_id , fullname , fullname_eng , phone , email , gender , address , picture , birthday , work_status , jobber.status , tambon_name as tb , ampher_name as ap , jangwat_name as jw FROM `jobber` LEFT JOIN tambon ON jobber.tambon_id = tambon.tambon_id LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id LEFT JOIN jangwat ON LEFT(ampher.ampher_id,2) = jangwat.jangwat_id WHERE jobber.jobber_id = ?";
  const work_exper = "SELECT work_experience.* , position_name FROM work_experience LEFT JOIN position ON work_experience.position_id = position.position_id WHERE jobber_id = ?  LIMIT ? OFFSET ?";
  const interests_work = "SELECT interests_work.* , position_name FROM `interests_work` LEFT JOIN position ON interests_work.position_id = position.position_id WHERE jobber_id = ?  LIMIT ? OFFSET ?";
  const hs = "SELECT hardskill_name FROM `jobber_hs` LEFT JOIN hardskill ON jobber_hs.hardskill_id = hardskill.hardskill_id WHERE jobber_id = ?";
  const ss = "SELECT softskill_name FROM `jobber_ss` LEFT JOIN softskill ON jobber_ss.softskill_id = softskill.softskill_id WHERE jobber_id = ?";
  const match = "SELECT tempWork.* , post_day, fullname , position_name FROM tempWork LEFT JOIN job_posting ON tempWork.post_id = job_posting.post_id LEFT JOIN employer ON job_posting.emp_id = employer.emp_id LEFT JOIN position ON tempWork.position_id = position.position_id WHERE jobber_id = ?  LIMIT ? OFFSET ?";
  const job_hs_ss ="SELECT COUNT(DISTINCT job_need_hs.hardskill_id) as job_hs , COUNT(DISTINCT job_need_ss.softskill_id) as job_ss FROM job_need_hs LEFT JOIN job_need_ss ON job_need_hs.post_id = job_need_ss.post_id WHERE job_need_hs.post_id = ?";
  const postCount = "SELECT count(*) as postCount FROM tempWork WHERE jobber_id = ? AND status = 'MATCHED';";  const interests_volun = "SELECT interests_volun.* , voluntype_name  FROM interests_volun LEFT JOIN volunteertype ON interests_volun.voluntype_id = volunteertype.voluntype_id WHERE jobber_id = ?";
  const volun_matched = "SELECT apply_volun.* , activity_name FROM apply_volun LEFT JOIN volunteer_posting ON apply_volun.post_id = volunteer_posting.post_id WHERE jobber_id = ? and type = 'm'";
  const job_matchedCount = "SELECT COUNT(*) as job_matchedCount FROM `apply_job` WHERE jobber_id = ? and type = 'm'";
  const volun_matchedCount = "SELECT COUNT(*) as volun_matchedCount FROM `apply_volun` WHERE jobber_id = ? and type = 'm'";
  const edu = "SELECT education_history.*, status , edu_name FROM education_history LEFT JOIN education_level ON education_history.edu_id = education_level.edu_id WHERE jobber_id = ? ORDER BY edu_id LIMIT ? OFFSET ?";
  const work_experCount = "SELECT COUNT(*) as total FROM work_experience WHERE jobber_id = ?";
  const interests_workCount = "SELECT COUNT(*) as total FROM interests_work WHERE jobber_id = ?";
  const eduCount = "SELECT COUNT(*) as total FROM education_history WHERE jobber_id = ?";


  db.query(jobber, [jobber_id], (err1, jobber) => {
    if (err1) {
      console.error("DB error:", err1);
      return res.status(500).json({ error: "Server error" });
    }
    // console.log("jobber......",jobber);
      db.query(interests_work, [jobber_id , parseInt(limit) , parseInt(interestsOffset)], (err2, interests_work) => {
        if (err2) {
          console.error("DB error:", err2);
          return res.status(500).json({ error: "Server error" });
        }
          db.query(hs, [jobber_id], (err3, hs) => {
            if (err3) {
              console.error("DB error:", err3);
              return res.status(500).json({ error: "Server error" });
            }
              db.query(ss, [jobber_id], (err4, ss) => {
                if (err4) {
                  console.error("DB error:", err4);
                  return res.status(500).json({ error: "Server error" });
                }
                  db.query(match, [jobber_id , 3 , parseInt(offset)], (err5, job_matched) => {
                    if (err5) {
                      console.error("DB error:", err5);
                      return res.status(500).json({ error: "Server error" });
                    }
                      const post_id = job_matched[0]?.post_id;
                      const matchCount = job_matched[0]?.total;
                      const matchtotalPages = Math.ceil(matchCount / limit);
                      

                      db.query(interests_volun, [jobber_id], (err6, interests_volun) => {
                        if (err6) {
                          console.error("DB error:", err6);
                          return res.status(500).json({ error: "Server error" });
                        }
                          db.query(volun_matched, [jobber_id], (err7, volun_matched) => {
                            if (err7) {
                              console.error("DB error:", err7);
                              return res.status(500).json({ error: "Server error" });
                            }
                              db.query(job_matchedCount, [jobber_id], (err8, job_matchedCount) => {
                                if (err8) {
                                  console.error("DB error:", err8);
                                  return res.status(500).json({ error: "Server error" });
                                }
                                  db.query(volun_matchedCount, [jobber_id], (err9, volun_matchedCount) => {
                                    if (err9) {
                                      console.error("DB error:", err9);
                                      return res.status(500).json({ error: "Server error" });
                                    }
                                      db.query(work_exper, [jobber_id , parseInt(limit) , parseInt(workOffset)], (err10, work_exper) => {
                                        if (err10) {
                                          console.error("DB error:", err10);
                                          return res.status(500).json({ error: "Server error" });
                                        }
                                          
                                          db.query(postCount, [jobber_id], (err11, postCount) => {
                                            if (err11) {
                                              console.error("DB error:", err11);
                                              return res.status(500).json({ error: "Server error" });
                                            }
                                              db.query(job_hs_ss, [post_id], (err12, job_hs_ss) => {
                                                if (err12) {
                                                  console.error("DB error:", err12);
                                                  return res.status(500).json({ error: "Server error" });
                                                }
                                                   const hd = 9 + parseInt(job_hs_ss[0]?.job_hs) + parseInt(job_hs_ss[0]?.job_ss);

                                                  db.query(edu, [jobber_id , parseInt(limit) , parseInt(eduOffset)], (err12, edu) => {
                                                    if (err12) {
                                                      console.error("DB error:", err12);
                                                      return res.status(500).json({ error: "Server error" });
                                                    }
                                                      db.query(work_experCount, [jobber_id], (errCount1, work_experCount) => {
                                                        if (errCount1) return res.status(500).json({ error: "Server error" });
                                                          const workCount = work_experCount[0]?.total;
                                                          const WCtotalPages = Math.ceil(workCount / limit);
                                                        db.query(interests_workCount, [jobber_id], (errCount2, interests_workCount) => {
                                                          if (errCount2) return res.status(500).json({ error: "Server error" });
                                                            const interestsCount = interests_workCount[0]?.total;
                                                            const ICtotalPages = Math.ceil(interestsCount / limit);
                                                          db.query(eduCount, [jobber_id], (errCount3, edu_Count) => {
                                                            if (errCount3) return res.status(500).json({ error: "Server error" });
                                                              const eduCount = edu_Count[0]?.total;
                                                              const ECtotalPages = Math.ceil(eduCount / limit);
                                                            res.json({
                                                              jobber,
                                                              interests_work,
                                                              hs,
                                                              ss,
                                                              hd,
                                                              job_matched,
                                                              interests_volun,
                                                              volun_matched,
                                                              job_matchedCount: job_matchedCount[0].job_matchedCount,
                                                              volun_matchedCount: volun_matchedCount[0].volun_matchedCount,
                                                              work_exper,
                                                              edu,
                                                              // ✅ ส่งจำนวนรวมกลับไปด้วย
                                                              counts: {
                                                                work: work_experCount[0]?.total,
                                                                interests: interests_workCount[0]?.total,
                                                                edu: edu_Count[0]?.total,
                                                                match: matchCount,
                                                              },
                                                              totalPages: {
                                                                work: WCtotalPages,
                                                                interests: ICtotalPages,
                                                                edu: ECtotalPages,
                                                                match: matchtotalPages
                                                              }
                                                            });
                                                          });
                                                        });
                                                      });

                                                  });
                                              });
                                          });
                                      });
                                  });
                              });
                          });
                      });
                  });
              });
          });
      });
  });
});

app.get("/volunpost", (req, res) => {
  const post_id = req.query.post_id;
  const volunpost = "SELECT volunteer_posting.*,picture, fullname , voluntype_name , tambon_name as tb , ampher_name as ap , jangwat_name as jw FROM `volunteer_posting` INNER JOIN employer ON volunteer_posting.emp_id = employer.emp_id LEFT JOIN tambon ON volunteer_posting.tambon_id = tambon.tambon_id LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id LEFT JOIN jangwat ON LEFT(ampher.ampher_id,2) = jangwat.jangwat_id LEFT JOIN volunteertype ON volunteer_posting.volunteer_code = volunteertype.voluntype_id WHERE post_id = ?";
  const volun_hs = "SELECT hardskill_name FROM `volun_need_hs`LEFT JOIN hardskill ON volun_need_hs.hardskill_id = hardskill.hardskill_id WHERE post_id = ?";
  const volun_ss = "SELECT softskill_name FROM `volun_need_ss`LEFT JOIN softskill ON volun_need_ss.softskill_id = softskill.softskill_id WHERE post_id = ?";
  

  db.query(volunpost, [post_id], (err1, volunpost) => {
    if (err1) {
      console.error("DB error:", err1);
      return res.status(500).json({ error: "Server error" });
    }
      db.query(volun_hs, [post_id], (err2, volun_HS) => {
      if (err2) {
        console.error("DB error:", err2);
        return res.status(500).json({ error: "Server error" });
      }
        db.query(volun_ss, [post_id], (err3, volun_SS) => {
        if (err3) {
          console.error("DB error:", err3);
          return res.status(500).json({ error: "Server error" });
        }
          res.json({
            volunpost,
            volun_HS,
            volun_SS
          });
      });
    });
  });
});

app.post('/forgot-password', (req, res) => {
    const { email } = req.body;

    // ตรวจสอบว่ามีอีเมลในระบบไหม
    db.query('SELECT * FROM jobber WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Database error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "Email not found" });
        }

        // สร้าง token
        const token = crypto.randomBytes(32).toString('hex');
        const tokenExpire = new Date(Date.now() + 3600000); // 1 ชั่วโมง=3,600,000

        // อัปเดต token ลงในฐานข้อมูล
        db.query('UPDATE jobber SET reset_token = ?, reset_token_expire = ? WHERE email = ?', 
            [token, tokenExpire, email], 
            (err2, result2) => {
                if (err2) {
                    console.error(err2);
                    return res.status(500).json({ message: "Error saving token" });
                }

                // สร้างลิงก์
                const resetLink = `http://localhost:5173/reset-password?token=${token}&email=${email}`;

                // ส่งอีเมล
                

                const mailOptions = {
                    from: 'jobvolun.service@gmail.com',
                    to: email,
                    subject: 'เปลี่ยนรหัสผ่านของคุณ',
                    html: `<center><p>คลิกปุ่ม "เปลี่ยนรหัสผ่าน" </p>
                            <p>เพื่อแก้ไขรหัสผ่านและเข้าสู่ระบบใหม่</p>
                           <p>
                              <a href="${resetLink}" style="
                                background-color: #7B6ADA;
                                color: white;
                                padding: 12px 24px;
                                text-decoration: none;
                                border-radius: 6px;
                                display: inline-block;
                                font-weight: bold;
                              ">เปลี่ยนรหัสผ่าน</a>
                            </p>
                           <p style="font-size: 10px">ลิงก์นี้จะหมดอายุภายใน 15 นาที อย่าเปิดเผยลิงค์นี้กับผู้อื่น</p></center>`
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error(error);
                        return res.status(500).json({ message: "Error sending email" });
                    } else {
                        res.json({ message: "Email sent successfully" });
                    }
                });
            });
    });
});

app.post('/api/send_contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }

  try {
    // สร้าง transporter ด้วย nodemailer
    const resetLink = `http://localhost:5173/login`;


    const mailOptions = {
      from: email, // ผู้ส่งคือคนกรอกแบบฟอร์ม
      to: 'jobvolun.service@gmail.com',   // ส่งหา email หลักของเว็บ
      subject: `📩 ข้อความจากผู้ใช้งาน: ${name}`,
      html: `<center>
        <p>ชื่อผู้ส่ง: ${name}</p>
        <p>อีเมล: ${email}</p>
        <p>ข้อความ: ${message}</p>
        <p>
                              <a href="${resetLink}" style="
                                background-color: #7B6ADA;
                                color: white;
                                padding: 12px 24px;
                                text-decoration: none;
                                border-radius: 6px;
                                display: inline-block;
                                font-weight: bold;
                              ">เข้าสู่ระบบเพื่อจัดการข้อมูลตามคำขอของผู้ใช้</a>
                            </p></center>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "ส่งข้อความสำเร็จ ขอบคุณที่ติดต่อเรา!" });

  } catch (error) {
    console.error("ส่งอีเมลล้มเหลว:", error);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการส่งอีเมล" });
  }
});


app.post('/reset-password', async (req, res) => {
  const { email, token, password } = req.body;

  if (!email || !token || !password) {
    return res.status(400).json({ message: "ข้อมูลไม่ครบถ้วน" });
  }

  // ตรวจสอบ token และเวลาหมดอายุ
  db.query(
    'SELECT * FROM jobber WHERE email = ? AND reset_token = ? AND reset_token_expire > NOW()',
    [email, token],
    async (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
      }

      if (results.length === 0) {
        return res.status(400).json({ message: "ลิงก์ไม่ถูกต้องหรือหมดอายุแล้ว" });
      }

      try {
        // เข้ารหัสรหัสผ่านใหม่
        const hashedPassword = await bcrypt.hash(password, 10);

        // อัปเดตรหัสผ่าน + ล้าง token
        db.query(
          'UPDATE jobber SET password = ?, reset_token = NULL, reset_token_expire = NULL WHERE email = ?',
          [hashedPassword, email],
          (err2, results2) => {
            if (err2) {
              console.error(err2);
              return res.status(500).json({ message: "อัปเดตรหัสผ่านไม่สำเร็จ" });
            }

            return res.json({ message: "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว" });
          }
        );
      } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "เข้ารหัสรหัสผ่านไม่สำเร็จ" });
      }
    }
  );
});

app.get('/jobber_profile', authenticateToken, (req, res) => {
  const jobber_id = req.user.jobber_id; // ข้อมูลจาก token

  const sql = "SELECT * FROM jobber WHERE jobber_id = ?";

  db.query(sql, [jobber_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (results.length === 0) return res.status(404).json({ message: "User not found" });

    const user = results[0];
    //console.log({ user });
    res.json({ user });
  });
});

app.get('/emp_profile', authenticateToken, (req, res) => {
  const emp_id = req.user.emp_id; // ข้อมูลจาก token

  const sql = "SELECT * , tambon_name as tb , ampher_name as ap , jangwat_name as jw ,  tambon.tambon_id as tb_id , ampher.ampher_id as ap_id , jangwat.jangwat_id as jw_id FROM employer LEFT JOIN tambon ON employer.tambon_id = tambon.tambon_id LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id LEFT JOIN jangwat ON LEFT(ampher.ampher_id,2) = jangwat.jangwat_id WHERE emp_id = ?";

  db.query(sql, [emp_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (results.length === 0) return res.status(404).json({ message: "User not found" });

    const user = results[0];
    //console.log({ user });
    res.json({ user });
  });
});

app.get('/sb_jobtype', (req, res)=> {
    const { type = "" } = req.query;
    let sql, totalsql , countall;
    if (type === "job") {
      sql = `SELECT jobtype.*, COUNT(job_posting.post_id) as count FROM jobtype LEFT JOIN position ON jobtype.jobtype_id = position.jobtype_id LEFT JOIN job_posting ON position.position_id = job_posting.position_code GROUP BY jobtype.jobtype_id HAVING COUNT(job_posting.post_id) != '0' ORDER BY count DESC`;
      totalsql = "SELECT COUNT(*) as total FROM ( SELECT jobtype.jobtype_id FROM jobtype LEFT JOIN position ON jobtype.jobtype_id = position.jobtype_id LEFT JOIN job_posting ON position.position_id = job_posting.position_code GROUP BY jobtype.jobtype_id HAVING COUNT(job_posting.post_id) != 0 ) as valid_jobtypes";
      countall = "SELECT COUNT(*) as countall FROM job_posting";
    }  else if  (type === "volun") {
      sql = `SELECT volunteertype.* , COUNT(volunteer_posting.post_id) as count FROM volunteertype  LEFT JOIN volunteer_posting ON volunteertype.voluntype_id = volunteer_posting.volunteer_code GROUP BY volunteertype.voluntype_id HAVING COUNT(volunteer_posting.post_id) != '0' ORDER BY count DESC`;
      totalsql = "SELECT COUNT(*) as total FROM (SELECT volunteertype.voluntype_id FROM volunteertype LEFT JOIN volunteer_posting ON volunteertype.voluntype_id = volunteer_posting.volunteer_code GROUP BY volunteertype.voluntype_id HAVING COUNT(volunteer_posting.post_id) != 0) as valid_voltypes";
      countall = "SELECT COUNT(*) as countall FROM volunteer_posting";
    }
    

    try {
      // const [data] = db.query(sql);
      // const [totalResult] =  db.query(totalsql);
      

        db.query(sql, (err, data) => {
          if (err) return res.status(500).json({ error: "Error fetching data" });
        
            res.json({ data });
          
        })
      

      
    } catch (error) {
      res.status(500).json({ error: "Database error"});
    }
})

app.get('/alljob_card', (req, res) => {
  try {
    const {
      page = 1, 
      limit = 6,   
      keyword,
      jobtype,
      position,
      ampher,
      tambon,
      salary_min,
      salary_max,
      age,
      weekdays,
      employment_type,
      selectedExper,
      gender,
      jobber_id
    } = req.query;

    const offset = (page - 1) * limit;

    let whereClauses = [];
    let params = [];

    //const sql = "SELECT post_id , salary , job_pic ,picture, position_name , job_posting.emp_id as emp_id , fullname , tambon_name as tb , ampher_name as ap , jangwat_name as jw FROM job_posting LEFT JOIN position ON job_posting.position_code = position.position_id LEFT JOIN employer ON job_posting.emp_id = employer.emp_id LEFT JOIN tambon ON job_posting.tambon_id = tambon.tambon_id LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id LEFT JOIN jangwat ON LEFT(ampher.ampher_id,2) = jangwat.jangwat_id WHERE position_name LIKE ? OR fullname LIKE ? LIMIT ? OFFSET ?";
    //const totalsql = "SELECT COUNT(*) as total FROM job_posting LEFT JOIN position ON job_posting.position_code = position.position_id LEFT JOIN employer ON job_posting.emp_id = employer.emp_id WHERE position_name LIKE ? OR fullname LIKE ?";
    // ค้นหาด้วย keyword
    if (keyword) {
      whereClauses.push(`(
        position_name LIKE ? OR 
        fullname LIKE ? OR 
        details LIKE ? OR 
        experience LIKE ? OR 
        notes LIKE ? OR 
        job_posting.benefits LIKE ?
      )`);
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    // 🔹 Exclude jobs already applied by jobber
    if (jobber_id) {
      whereClauses.push(`job_posting.post_id NOT IN (
        SELECT post_id FROM apply_job WHERE jobber_id = ?
      )`);
      params.push(jobber_id);
    }

    // 🔹 Filters
    if (jobtype) {
      whereClauses.push("position.jobtype_id = ?");
      params.push(jobtype);
    }

    if (position) {
      whereClauses.push("position_id LIKE ?");
      params.push(`%${position}%`);
    }

    if (ampher) {
      whereClauses.push("ampher.ampher_id = ?");
      params.push(ampher);
    }

    if (tambon) {
      whereClauses.push("tambon.tambon_id = ?");
      params.push(tambon);
    }

    if (salary_min && salary_max) {
      whereClauses.push("salary BETWEEN ? AND ?");
      params.push(salary_min, salary_max);
    } else if (salary_min) {
      whereClauses.push("salary >= ?");
      params.push(salary_min);
    } else if (salary_max) {
      whereClauses.push("salary <= ?");
      params.push(salary_max);
    }

    if (age) {
      whereClauses.push(`(
        (CAST(SUBSTRING_INDEX(age, '-', 1) as UNSIGNED) = 0 AND CAST(SUBSTRING_INDEX(age, '-', -1) as UNSIGNED) = 0)
        OR
        (CAST(SUBSTRING_INDEX(age, '-', 1) as UNSIGNED) <= ? AND 
        (CAST(SUBSTRING_INDEX(age, '-', -1) as UNSIGNED) = 0 OR CAST(SUBSTRING_INDEX(age, '-', -1) as UNSIGNED) >= ?))
        OR
        (CAST(SUBSTRING_INDEX(age, '-', 1) as UNSIGNED) <= ? AND CAST(SUBSTRING_INDEX(age, '-', -1) as UNSIGNED) >= ?)
      )`);
      params.push(age, age, age, age);
    }

    if (weekdays && weekdays !== '0000000') {
      whereClauses.push(`job_posting.days = '${weekdays}'`);
    }

    if (employment_type && employment_type !== '0000') {
      const mapType = ['f', 'p', 'c', 'd'];
      const selectedTypes = employment_type
        .split('')
        .map((val, idx) => val === '1' ? mapType[idx] : null)
        .filter(Boolean);
      if (selectedTypes.length > 0) {
        whereClauses.push(`job_posting.type IN (${selectedTypes.map(() => '?').join(', ')})`);
        params.push(...selectedTypes);
      }
    }

    // ✅ ฟิลเตอร์ experience: 0-9
    if (selectedExper && selectedExper === 0) {
      whereClauses.push("year_expe = ?");
      params.push(selectedExper);
    } else if (selectedExper === '>3') {
      whereClauses.push("year_expe >= 3");
    } else if (selectedExper) {
      whereClauses.push("year_expe <= ?");
      params.push(selectedExper);
    }

    // ✅ ฟิลเตอร์ gender: M,F,อื่นๆ
    if (gender && gender !== '000') {
      const genderMap = ['M', 'F', 'A'];
      const selectedGender = gender
        .split('')
        .map((val, idx) => val === '1' ? genderMap[idx] : null)
        .filter(Boolean);
      if (selectedGender.length > 0) {
        whereClauses.push(`job_posting.gender IN (${selectedGender.map(() => '?').join(', ')})`);
        params.push(...selectedGender);
      }
    }


    // คุณสามารถเพิ่ม logic ของ age, weekdays, experience, employment_type ได้ต่อ

    const whereSQL = whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

    const dataSql = `
      SELECT job_posting.* ,position_name , picture, fullname , tambon_name as tb , 
      ampher_id , ampher_name as ap , jangwat_name as jw , position.jobtype_id,
      (
        SELECT COUNT(*) 
        FROM apply_job aj2
        WHERE aj2.post_id = job_posting.post_id
          AND aj2.status = 'accepted'
      ) AS accepted_count
      FROM job_posting 
      LEFT JOIN position ON job_posting.position_code = position.position_id 
      LEFT JOIN jobtype ON position.jobtype_id = jobtype.jobtype_id 
      LEFT JOIN employer ON job_posting.emp_id = employer.emp_id 
      LEFT JOIN tambon ON job_posting.tambon_id = tambon.tambon_id 
      LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id 
      LEFT JOIN jangwat ON LEFT(ampher.ampher_id,2) = jangwat.jangwat_id 
      
      ${whereSQL}
      ORDER BY job_posting.post_id DESC
      LIMIT ? OFFSET ?
    `;

    const totalSql = `
      SELECT COUNT(*) as total
      FROM job_posting
      LEFT JOIN position ON job_posting.position_code = position.position_id
      LEFT JOIN jobtype ON position.jobtype_id = jobtype.jobtype_id
      LEFT JOIN employer ON job_posting.emp_id = employer.emp_id
      LEFT JOIN tambon ON job_posting.tambon_id = tambon.tambon_id
      LEFT JOIN ampher ON LEFT(tambon.tambon_id, 4) = ampher.ampher_id
      LEFT JOIN jangwat ON LEFT(ampher.ampher_id, 2) = jangwat.jangwat_id
      ${whereSQL}
    `;

    // console.log("SQL Query:", dataSql);
    // console.log("Params:", [...params, parseInt(limit), parseInt(offset)]);
      const totalParams = [...params];
      db.query(totalSql, totalParams, (err, totalResult) => {
        if (err) {
          console.error("SQL Error (total):", err);
          return res.status(500).json({ error: "Error counting total" })
        };
    

        const totalRecords = totalResult[0].total;
        const totalPages = Math.ceil(totalRecords / limit);

        const dataParams = [...params, parseInt(limit), parseInt(offset)];

        db.query(dataSql, dataParams, (err2, data) => {
          if (err2) {
            console.error("SQL Error (data):", err2);
            return res.status(500).json({ error: "Error fetching data" })
          };
          //console.log("SQL Query:", res);
          res.json({
            data,
            totalPages,
            totalRecords
          });
        });
      });
    } catch (error) {
      
      console.error("SERVER ERROR:", error);
      res.status(500).json({ error: "Database error" });
    }
})

app.get('/api/jobs', (req, res)=> {
    const { page = 1, limit = 10, keyword = "" } = req.query;
    const jobtype = decodeURIComponent(req.query.jobtype || "");

    const offset = (page -1) * limit;
    const sql = "SELECT post_id , salary , job_pic , position_name , job_posting.emp_id as emp_id , fullname , tambon_name as tb , ampher_name as ap , jangwat_name as jw FROM job_posting LEFT JOIN position ON job_posting.position_code = position.position_id LEFT JOIN jobtype ON position.jobtype_id = jobtype.jobtype_id LEFT JOIN employer ON job_posting.emp_id = employer.emp_id LEFT JOIN tambon ON job_posting.tambon_id = tambon.tambon_id LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id LEFT JOIN jangwat ON LEFT(ampher.ampher_id,2) = jangwat.jangwat_id WHERE ( position_name LIKE ? OR fullname LIKE ? ) AND jobtype_name = ? LIMIT ? OFFSET ?";
    const totalsql = "SELECT COUNT(*) as total FROM job_posting LEFT JOIN position ON job_posting.position_code = position.position_id LEFT JOIN jobtype ON position.jobtype_id = jobtype.jobtype_id LEFT JOIN employer ON job_posting.emp_id = employer.emp_id WHERE ( position_name LIKE ? OR fullname LIKE ? ) AND jobtype_name = ?";

    try {
      // const [data] = db.query(sql);
      // const [totalResult] =  db.query(totalsql);
      //console.log("jobtype=", req.query.jobtype);

      db.query(totalsql, [`%${keyword}%` , `%${keyword}%`, jobtype], (err, totalResult) => {
        if (err) return res.status(500).json({ error: "Error fetching data" });

          const totalRecords = totalResult[0].total;
          const totalPages = Math.ceil(totalRecords / limit);
      
        db.query(sql, [`%${keyword}%` , `%${keyword}%` , jobtype , parseInt(limit) , parseInt(offset)], (err2, data) => {
          if (err2) return res.status(500).json({ error: "Error counting total" });

          res.json({ data, totalPages, totalRecords });
        })
      })


      
    } catch (error) {
      res.status(500).json({ error: "Database error"});
    }
})

app.get('/api/voluns', (req, res)=> {
    const { page = 1, limit = 10, keyword = "" } = req.query;
    const voluntype = decodeURIComponent(req.query.voluntype || "");

    const offset = (page -1) * limit;
    const sql = "SELECT volunteer_posting.*, fullname , voluntype_name , tambon_name as tb , ampher_name as ap , jangwat_name as jw FROM `volunteer_posting` LEFT JOIN employer ON volunteer_posting.emp_id = employer.emp_id LEFT JOIN tambon ON volunteer_posting.tambon_id = tambon.tambon_id LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id LEFT JOIN jangwat ON LEFT(ampher.ampher_id,2) = jangwat.jangwat_id LEFT JOIN volunteertype ON volunteer_posting.volunteer_code = volunteertype.voluntype_id WHERE ( activity_name LIKE ? OR fullname LIKE ? ) AND voluntype_name = ? LIMIT ? OFFSET ?";
    const totalsql = "SELECT COUNT(*) as total FROM volunteer_posting LEFT JOIN volunteertype ON volunteer_posting.volunteer_code = volunteertype.voluntype_id LEFT JOIN employer ON volunteer_posting.emp_id = employer.emp_id WHERE ( activity_name LIKE ? OR fullname LIKE ? ) AND voluntype_name = ?";

    try {
      // const [data] = db.query(sql);
      // const [totalResult] =  db.query(totalsql);
      //console.log("jobtype=", req.query.jobtype);

      db.query(totalsql, [`%${keyword}%` , `%${keyword}%`, voluntype], (err, totalResult) => {
        if (err) return res.status(500).json({ error: "Error fetching data" });

          const totalRecords = totalResult[0].total;
          const totalPages = Math.ceil(totalRecords / limit);
      
        db.query(sql, [`%${keyword}%` , `%${keyword}%` , voluntype , parseInt(limit) , parseInt(offset)], (err2, data) => {
          if (err2) return res.status(500).json({ error: "Error counting total" });

          res.json({ data, totalPages, totalRecords });
        })
      })


      
    } catch (error) {
      res.status(500).json({ error: "Database error"});
    }
})

app.get('/allvolun_card', (req, res)=> {
  try {
    const {
      page = 1, 
      limit = 10, 
      keyword,
      ampher,
      tambon,
      age,
      gender,
      volunType,
      num_position,
      date_start,
      date_end,
      jobber_id
    } = req.query;

    const offset = (page -1) * limit;

    let whereClauses = [];
    let params = [];

    //const sql = "SELECT post_id , salary , job_pic , position_name , job_posting.emp_id as emp_id , fullname , tambon_name as tb , ampher_name as ap , jangwat_name as jw FROM job_posting LEFT JOIN position ON job_posting.position_code = position.position_id LEFT JOIN employer ON job_posting.emp_id = employer.emp_id LEFT JOIN tambon ON job_posting.tambon_id = tambon.tambon_id LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id LEFT JOIN jangwat ON LEFT(ampher.ampher_id,2) = jangwat.jangwat_id WHERE position_name LIKE ? OR fullname LIKE ? LIMIT ? OFFSET ?";
    //const totalsql = "SELECT COUNT(*) as total FROM job_posting LEFT JOIN position ON job_posting.position_code = position.position_id LEFT JOIN employer ON job_posting.emp_id = employer.emp_id WHERE position_name LIKE ? OR fullname LIKE ?";
    // ค้นหาด้วย keyword
    if (keyword) {
      whereClauses.push("(activity_name LIKE ? OR details LIKE ? OR experience LIKE ? OR notes LIKE ? OR how_to_join LIKE ? OR prepare LIKE ?)");
      params.push(`%${keyword}%`, `%${keyword}%` , `%${keyword}%`, `%${keyword}%` , `%${keyword}%`, `%${keyword}%`);
    }

    if (jobber_id) {
      whereClauses.push(`volunteer_posting.post_id NOT IN (
        SELECT post_id FROM apply_volun WHERE jobber_id = ?
      )`);
      params.push(jobber_id);
    }

    // ฟิลเตอร์อื่น ๆ (เพิ่มตามต้องการ)
    if (volunType) {
      whereClauses.push("volunteer_code = ?");
      params.push(volunType);
    }

    if (num_position) {
      whereClauses.push("num_position = ?");
      params.push(num_position);
    }

    if (ampher) {
      whereClauses.push("ampher.ampher_id = ?");
      params.push(ampher);
    }

    if (tambon) {
      whereClauses.push("tambon.tambon_id = ?");
      params.push(tambon);
    }

    if (age) {
      whereClauses.push(`(
        (CAST(SUBSTRING_INDEX(age, '-', 1) as UNSIGNED) = 0 AND CAST(SUBSTRING_INDEX(age, '-', -1) as UNSIGNED) = 0)
        OR
        (CAST(SUBSTRING_INDEX(age, '-', 1) as UNSIGNED) <= ? AND 
        (CAST(SUBSTRING_INDEX(age, '-', -1) as UNSIGNED) = 0 OR CAST(SUBSTRING_INDEX(age, '-', -1) as UNSIGNED) >= ?))
        OR
        (CAST(SUBSTRING_INDEX(age, '-', 1) as UNSIGNED) <= ? AND CAST(SUBSTRING_INDEX(age, '-', -1) as UNSIGNED) >= ?)
      )`);
      params.push(age, age, age, age);
    }

    

    // ✅ ฟิลเตอร์ gender: M,F,อื่นๆ
    if (gender && gender !== '000') {
      const genderMap = ['M', 'F', 'A'];
      const selectedGender = gender
        .split('')
        .map((val, idx) => val === '1' ? genderMap[idx] : null)
        .filter(Boolean);
      if (selectedGender.length > 0) {
        whereClauses.push(`volunteer_posting.gender IN (${selectedGender.map(() => '?').join(', ')})`);
        params.push(...selectedGender);
      }
    }

    if (date_start) {
      whereClauses.push("date_start = ?");
      params.push(date_start);
    }

    if (date_end) {
      whereClauses.push("date_end = ?");
      params.push(date_end);
    }

    // คุณสามารถเพิ่ม logic ของ age, weekdays, experience, employment_type ได้ต่อ

    const whereSQL = whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

    const dataSql = `
      SELECT volunteer_posting.*, fullname , picture , voluntype_name , tambon_name as tb , ampher_name as ap , jangwat_name as jw 
      FROM volunteer_posting 
      LEFT JOIN employer ON volunteer_posting.emp_id = employer.emp_id 
      LEFT JOIN tambon ON volunteer_posting.tambon_id = tambon.tambon_id 
      LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id 
      LEFT JOIN jangwat ON LEFT(ampher.ampher_id,2) = jangwat.jangwat_id 
      LEFT JOIN volunteertype ON volunteer_posting.volunteer_code = volunteertype.voluntype_id
      ${whereSQL}
      ORDER BY volunteer_posting.post_id DESC
      LIMIT ? OFFSET ?
    `;

    const totalSql = `
      SELECT COUNT(*) as total
      FROM volunteer_posting
      LEFT JOIN employer ON volunteer_posting.emp_id = employer.emp_id 
      LEFT JOIN tambon ON volunteer_posting.tambon_id = tambon.tambon_id 
      LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id 
      LEFT JOIN jangwat ON LEFT(ampher.ampher_id,2) = jangwat.jangwat_id 
      LEFT JOIN volunteertype ON volunteer_posting.volunteer_code = volunteertype.voluntype_id
      ${whereSQL}
    `;

    // console.log("SQL Query:", dataSql);
    // console.log("Params:", [...params, parseInt(limit), parseInt(offset)]);
      const totalParams = [...params];
      db.query(totalSql, totalParams, (err, totalResult) => {
        if (err) {
          console.error("SQL Error (total):", err);
          return res.status(500).json({ error: "Error counting total" })
        };
    

        const totalRecords = totalResult[0].total;
        const totalPages = Math.ceil(totalRecords / limit);

        const dataParams = [...params, parseInt(limit), parseInt(offset)];

        db.query(dataSql, dataParams, (err2, data) => {
          if (err2) {
            console.error("SQL Error (data):", err2);
            return res.status(500).json({ error: "Error fetching data" })
          };
          //console.log("SQL Query:", res);
          res.json({
            data,
            totalPages,
            totalRecords
          });
        });
      });
    } catch (error) {
      
      console.error("SERVER ERROR:", error);
      res.status(500).json({ error: "Database error" });
    }
})

app.get('/emp_card', (req, res)=> {
    const { page = 1, limit = 10, keyword = "" } = req.query;

    
    const offset = (page -1) * limit;
    const sql = "SELECT employer.emp_id , picture , fullname ,  AVG(score) as stars  FROM `employer`LEFT JOIN jobber_review ON employer.emp_id = jobber_review.emp_id WHERE fullname LIKE ? GROUP BY employer.emp_id, picture, fullname HAVING stars IS NOT NULL ORDER BY stars DESC LIMIT ? OFFSET ?";
    const totalsql = "SELECT COUNT(*) as total FROM ( SELECT employer.emp_id FROM employer LEFT JOIN jobber_review ON employer.emp_id = jobber_review.emp_id WHERE fullname LIKE ? GROUP BY employer.emp_id HAVING AVG(score) IS NOT NULL) as subquery;";

    try {
      // const [data] = db.query(sql);
      // const [totalResult] =  db.query(totalsql);
      db.query(totalsql, [`%${keyword}%`], (err, totalResult) => {
        if (err) return res.status(500).json({ error: "Error fetching data" });

          const totalRecords = totalResult[0].total;
          const totalPages = Math.ceil(totalRecords / limit);
      
        db.query(sql, [`%${keyword}%` , parseInt(limit) , parseInt(offset)], (err2, data) => {
          if (err2) return res.status(500).json({ error: "Error counting total" });

          res.json({ data, totalPages, totalRecords });
        })
      })
      
    } catch (error) {
      res.status(500).json({ error: "Database error"});
    }
})

app.get('/findvolun_card', (req, res)=> {
    const { page = 1, limit = 10, keyword = "" } = req.query;

    const offset = (page -1) * limit;
    const sql = `SELECT 
          vp.emp_id,
          e.picture,
          e.fullname,
          COUNT(vp.post_id) AS total_posts
      FROM employer e
      JOIN volunteer_posting vp ON e.emp_id = vp.emp_id
      WHERE e.fullname LIKE ?
      GROUP BY 
          vp.emp_id,
          e.picture,
          e.fullname
      ORDER BY 
          total_posts DESC
      LIMIT ? OFFSET ?
      `;
    const totalsql = "SELECT COUNT(*) as total FROM ( SELECT employer.emp_id FROM employer LEFT JOIN volun_review ON employer.emp_id = volun_review.emp_id WHERE fullname LIKE ? GROUP BY employer.emp_id HAVING AVG(score) IS NOT NULL) as subquery";

    try {
      // const [data] = db.query(sql);
      // const [totalResult] =  db.query(totalsql);
      db.query(totalsql, [`%${keyword}%`], (err, totalResult) => {
        if (err) return res.status(500).json({ error: "Error fetching data" });

          const totalRecords = totalResult[0].total;
          const totalPages = Math.ceil(totalRecords / limit);
      
        db.query(sql, [`%${keyword}%` , parseInt(limit) , parseInt(offset)], (err2, data) => {
          if (err2) return res.status(500).json({ error: "Error counting total" });

          res.json({ data, totalPages, totalRecords });
        })
      })
      
    } catch (error) {
      res.status(500).json({ error: "Database error"});
    }
})
app.get("/user_job_match", (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const offset = (page -1) * limit;
  const jobber_id = req.query.jobber_id;
  const match = "SELECT tempWork.* , post_day, fullname , position_name FROM tempWork LEFT JOIN job_posting ON tempWork.post_id = job_posting.post_id LEFT JOIN employer ON job_posting.emp_id = employer.emp_id LEFT JOIN position ON tempWork.position_id = position.position_id WHERE jobber_id = ?  LIMIT ? OFFSET ?";
  const job_hs_ss ="SELECT COUNT(DISTINCT job_need_hs.hardskill_id) as job_hs , COUNT(DISTINCT job_need_ss.softskill_id) as job_ss FROM job_need_hs LEFT JOIN job_need_ss ON job_need_hs.post_id = job_need_ss.post_id WHERE job_need_hs.post_id = ?";
  const postCount = "SELECT count(*) as postCount FROM tempWork WHERE jobber_id = ? AND status = 'MATCHED';";


  db.query(match, [jobber_id , parseInt(limit) , parseInt(offset)], (err1, postMatch) => {
    if (err1) {
      console.error("DB error:", err1);
      return res.status(500).json({ error: "Server error" });
    }
    const postIds = postMatch.map(p => p.post_id);

    // ใช้ Promise.all รัน query hd ของแต่ละ post
    Promise.all(postIds.map(postId => {
      return new Promise((resolve, reject) => {
        db.query(job_hs_ss, [postId], (err, rows) => {
          if (err) return reject(err);
          const hd = 8 + parseInt(rows[0]?.job_hs || 0) + parseInt(rows[0]?.job_ss || 0);
          resolve({ postId, hd });
        });
      });
    }))
    .then(hdResults => {
      // เอาผลลัพธ์ hd ไปใส่ในแต่ละ postMatch
      postMatch.forEach(post => {
        const hdObj = hdResults.find(h => h.postId === post.post_id);
        post.hd = hdObj ? hdObj.hd : 8; // default 8
      });

      db.query(postCount, [jobber_id], (err2, postCount) => {
        if (err2) return res.status(500).json({ error: "Server error" });

        const totalRecords = postCount[0].postCount;
        const totalPages = Math.ceil(totalRecords / limit);
        res.json({
          postMatch,
          totalRecords,
          totalPages
        });
      });
    })
    .catch(err => {
      console.error("DB error:", err);
      res.status(500).json({ error: "Server error" });
    });
  });
});

app.get("/api/tempwork/check", (req, res) => {
  const { post_id, jobber_id } = req.query;

  if (!post_id || !jobber_id) {
    return res.status(400).json({ error: "post_id and jobber_id are required" });
  }

  const baseQuery = `
    SELECT 
      tempWork.*,
      job_posting.post_day,
      employer.fullname,
      position.position_name
    FROM tempWork
    LEFT JOIN job_posting ON tempWork.post_id = job_posting.post_id
    LEFT JOIN employer ON job_posting.emp_id = employer.emp_id
    LEFT JOIN position ON tempWork.position_id = position.position_id
    WHERE tempWork.post_id = ? AND tempWork.jobber_id = ?
    LIMIT 1
  `;

  const job_hs_ss = `
    SELECT 
      COUNT(DISTINCT job_need_hs.hardskill_id) as job_hs,
      COUNT(DISTINCT job_need_ss.softskill_id) as job_ss
    FROM job_need_hs
    LEFT JOIN job_need_ss ON job_need_hs.post_id = job_need_ss.post_id
    WHERE job_need_hs.post_id = ?
  `;

  db.query(baseQuery, [post_id, jobber_id], (err, rows) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Server error" });
    }

    if (rows.length === 0) {
      return res.json({ exists: false, data: null });
    }

    const record = rows[0];

    // หาค่า hd
    db.query(job_hs_ss, [post_id], (err2, hsRows) => {
      if (err2) {
        console.error("DB error:", err2);
        return res.status(500).json({ error: "Server error" });
      }

      const job_hs = parseInt(hsRows[0]?.job_hs || 0);
      const job_ss = parseInt(hsRows[0]?.job_ss || 0);
      record.hd = 8 + job_hs + job_ss; // ค่าพื้นฐาน 8 + hardskill + softskill

      res.json({
        exists: true,
        data: record,
      });
    });
  });
});

app.get("/api/tempvolun/check", (req, res) => {
  const { post_id, jobber_id } = req.query;

  if (!post_id || !jobber_id) {
    return res.status(400).json({ error: "post_id and jobber_id are required" });
  }

  const baseQuery = `
    SELECT 
      tempVolun.*,
      volunteer_posting.post_day,
      employer.fullname,
      volunteertype.voluntype_name
    FROM tempVolun
    LEFT JOIN volunteer_posting ON tempVolun.post_id = volunteer_posting.post_id
    LEFT JOIN employer ON volunteer_posting.emp_id = employer.emp_id
    LEFT JOIN volunteertype ON volunteer_posting.volunteer_code = volunteertype.voluntype_id
    WHERE tempVolun.post_id = ? AND tempVolun.jobber_id = ?
    LIMIT 1
  `;

  const volun_hs_ss = `
    SELECT 
      COUNT(DISTINCT volun_need_hs.hardskill_id) as volun_hs,
      COUNT(DISTINCT volun_need_ss.softskill_id) as volun_ss
    FROM volun_need_hs
    LEFT JOIN volun_need_ss ON volun_need_hs.post_id = volun_need_ss.post_id
    WHERE volun_need_hs.post_id = ?
  `;

  db.query(baseQuery, [post_id, jobber_id], (err, rows) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Server error" });
    }

    if (rows.length === 0) {
      return res.json({ exists: false, data: null });
    }

    const record = rows[0];

    // หาค่า hd
    db.query(volun_hs_ss, [post_id], (err2, hsRows) => {
      if (err2) {
        console.error("DB error:", err2);
        return res.status(500).json({ error: "Server error" });
      }

      const volun_hs = parseInt(hsRows[0]?.volun_hs || 0);
      const volun_ss = parseInt(hsRows[0]?.volun_ss || 0);
      record.hd = 3 + volun_hs + volun_ss; // ค่าพื้นฐาน 8 + hardskill + softskill

      res.json({
        exists: true,
        data: record,
      });
    });
  });
});

app.get("/emp_job_match", (req, res) => {
  const { page = 1, limit = 10, percent } = req.query;
  const offset = (page - 1) * limit;
  const post_id = req.query.post_id;

  const match = `
    SELECT 
      tempWork.*,
      jobber.jobber_id,
      jobber.fullname,
      jobber.picture,
      (
        SELECT GROUP_CONCAT(h.hardskill_name ORDER BY h.hardskill_name SEPARATOR ' , ')
        FROM jobber_hs jh
        LEFT JOIN hardskill h ON jh.hardskill_id = h.hardskill_id
        WHERE jh.jobber_id = tempWork.jobber_id
      ) as hardskills,
      (
        SELECT GROUP_CONCAT(s.softskill_name ORDER BY s.softskill_name SEPARATOR ', ')
        FROM jobber_ss js
        LEFT JOIN softskill s ON js.softskill_id = s.softskill_id
        WHERE js.jobber_id = tempWork.jobber_id
      ) as softskills,
      aj.status as apply_status,
      aj.message as apply_message
    FROM tempWork
    LEFT JOIN job_posting ON tempWork.post_id = job_posting.post_id
    LEFT JOIN jobber ON tempWork.jobber_id = jobber.jobber_id
    LEFT JOIN position ON tempWork.position_id = position.position_id
    LEFT JOIN employer ON job_posting.emp_id = employer.emp_id
    LEFT JOIN apply_job aj
        ON aj.jobber_id = tempWork.jobber_id
        AND aj.post_id = tempWork.post_id
        AND aj.type = 'm'
    WHERE tempWork.post_id = ?
      AND tempWork.status = 'MATCHED'
    LIMIT ? OFFSET ?`;

  const job_hs_ss = `
    SELECT 
      COUNT(DISTINCT job_need_hs.hardskill_id) as job_hs, 
      COUNT(DISTINCT job_need_ss.softskill_id) as job_ss 
    FROM job_need_hs 
    LEFT JOIN job_need_ss ON job_need_hs.post_id = job_need_ss.post_id 
    WHERE job_need_hs.post_id = ?`;

  db.query(match, [post_id, parseInt(limit), parseInt(offset)], (err1, postMatch) => {
    if (err1) return res.status(500).json({ error: "Server error" });

    // คำนวณ hd และ matchPercent
    Promise.all(postMatch.map(post => {
      return new Promise((resolve, reject) => {
        db.query(job_hs_ss, [post.post_id], (err, rows) => {
          if (err) return reject(err);

          const job_hs = parseInt(rows[0]?.job_hs || 0);
          const job_ss = parseInt(rows[0]?.job_ss || 0);
          const hd = 8 + job_hs + job_ss;

          const matchingCount = post.matching.split("").filter(ch => ch === "1").length;
          const hsCount = post.hs ? post.hs.split(",").filter(id => id.trim() !== "").length : 0;
          const ssCount = post.ss ? post.ss.split(",").filter(id => id.trim() !== "").length : 0;
          const totalMatch = matchingCount + hsCount + ssCount;

          const matchPercent = Math.round((totalMatch / hd) * 100);

          post.hd = hd;
          post.matchPercent = matchPercent;

          resolve(post); // ส่ง post ออกมาเลย
        });
      });
    }))
    .then(postsWithPercent => {
      // กรองตาม percent
      const filtered = percent
        ? postsWithPercent.filter(p => p.matchPercent >= Number(percent))
        : postsWithPercent;

      // นับเฉพาะที่กรองแล้ว
      const totalRecords = filtered.length;
      const totalPages = Math.ceil(totalRecords / limit);

      res.json({ postMatch: filtered, totalRecords, totalPages });
    })
    .catch(err => {
      console.error("DB error:", err);
      res.status(500).json({ error: "Server error" });
    });
  });
});

app.get("/emp_volun_match", (req, res) => {
  const { page = 1, limit = 10, percent } = req.query;
  const offset = (page - 1) * limit;
  const post_id = req.query.post_id;

  const match = `
    SELECT 
      tempVolun.*,
      jobber.jobber_id,
      jobber.fullname,
      jobber.picture,
      (
        SELECT GROUP_CONCAT(h.hardskill_name ORDER BY h.hardskill_name SEPARATOR ' , ')
        FROM jobber_hs jh
        LEFT JOIN hardskill h ON jh.hardskill_id = h.hardskill_id
        WHERE jh.jobber_id = tempVolun.jobber_id
      ) as hardskills,
      (
        SELECT GROUP_CONCAT(s.softskill_name ORDER BY s.softskill_name SEPARATOR ', ')
        FROM jobber_ss js
        LEFT JOIN softskill s ON js.softskill_id = s.softskill_id
        WHERE js.jobber_id = tempVolun.jobber_id
      ) as softskills,
      aj.status as apply_status,
      aj.message as apply_message
    FROM tempVolun
    LEFT JOIN volunteer_posting ON tempVolun.post_id = volunteer_posting.post_id
    LEFT JOIN jobber ON tempVolun.jobber_id = jobber.jobber_id
    LEFT JOIN volunteertype ON tempVolun.voluntype_id = volunteertype.voluntype_id
    LEFT JOIN employer ON volunteer_posting.emp_id = employer.emp_id
    LEFT JOIN apply_volun aj
        ON aj.jobber_id = tempVolun.jobber_id
        AND aj.post_id = tempVolun.post_id
        AND aj.type = 'm'
    WHERE tempVolun.post_id = ?
      AND tempVolun.status = 'MATCHED'
    LIMIT ? OFFSET ?`;

  const volun_hs_ss = `
    SELECT 
      COUNT(DISTINCT volun_need_hs.hardskill_id) as volun_hs, 
      COUNT(DISTINCT volun_need_ss.softskill_id) as volun_ss 
    FROM volun_need_hs 
    LEFT JOIN volun_need_ss ON volun_need_hs.post_id = volun_need_ss.post_id 
    WHERE volun_need_hs.post_id = ?`;

  db.query(match, [post_id, parseInt(limit), parseInt(offset)], (err1, postMatch) => {
    if (err1) return res.status(500).json({ error: "Server error" });

    // คำนวณ hd และ matchPercent
    Promise.all(postMatch.map(post => {
      return new Promise((resolve, reject) => {
        db.query(volun_hs_ss, [post.post_id], (err, rows) => {
          if (err) return reject(err);

          const volun_hs = parseInt(rows[0]?.volun_hs || 0);
          const volun_ss = parseInt(rows[0]?.volun_ss || 0);
          const hd = 3 + volun_hs + volun_ss;

          const matchingCount = post.matching.split("").filter(ch => ch === "1").length;
          const hsCount = post.hs ? post.hs.split(",").filter(id => id.trim() !== "").length : 0;
          const ssCount = post.ss ? post.ss.split(",").filter(id => id.trim() !== "").length : 0;
          const totalMatch = matchingCount + hsCount + ssCount;
//ต่อที่นี่*****************
          const matchPercent = Math.round((totalMatch / hd) * 100);

          post.hd = hd;
          post.matchPercent = matchPercent;

          resolve(post); // ส่ง post ออกมาเลย
        });
      });
    }))
    .then(postsWithPercent => {
      // กรองตาม percent
      const filtered = percent
        ? postsWithPercent.filter(p => p.matchPercent >= Number(percent))
        : postsWithPercent;

      // นับเฉพาะที่กรองแล้ว
      const totalRecords = filtered.length;
      const totalPages = Math.ceil(totalRecords / limit);

      res.json({ postMatch: filtered, totalRecords, totalPages });
    })
    .catch(err => {
      console.error("DB error:", err);
      res.status(500).json({ error: "Server error" });
    });
  });
});

app.get("/job_matchlist", (req, res) => {
  //console.log("Request Query:", req.query);

  const { jobber_id , post_id , inter_work_id , position_id} = req.query;
  //console.log(jobber_id , post_id , inter_work_id , position_id);
  const matchlist = "SELECT tempWork.* , interests_work.salary_min , interests_work.salary_max , interests_work.hour , interests_work.end_hour , interests_work.days , tambon_name as tb , ampher_name as ap ,birthday , jobber.gender FROM tempWork LEFT JOIN job_posting on tempWork.post_id = job_posting.post_id LEFT JOIN jobber on tempWork.jobber_id = jobber.jobber_id LEFT JOIN interests_work on tempWork.inter_work_id = interests_work.inter_work_id LEFT JOIN tambon ON interests_work.tambon_id = tambon.tambon_id LEFT JOIN ampher ON interests_work.ampher_id = ampher.ampher_id LEFT JOIN education_history on tempWork.jobber_id = education_history.jobber_id WHERE tempWork.jobber_id = ? AND tempWork.post_id = ? AND tempWork.inter_work_id =?";


  db.query(matchlist, [jobber_id , post_id , inter_work_id], (err1, matchList) => {
    if (err1) {
      
      return res.status(500).json({ error: "Server error" });
    } console.error("DB MLMLML:", matchList);
      if (matchList.length === 0) {
        return res.json({ matchList: [] });
      }
        db.query(`SELECT COALESCE(education_level.edu_name, 'ยังไม่ได้ลงข้อมูลการศึกษา') as edu_name FROM education_history LEFT JOIN education_level ON education_history.edu_id = education_level.edu_id WHERE jobber_id = ? ORDER BY education_history.edu_id DESC LIMIT 1`, [jobber_id], (err, edu) => {
          if (err) return console.error(err);
            //console.log("edu query result =", edu);
            const edu_max = (edu && edu.length > 0) ? edu[0].edu_name : 'ยังไม่ได้ลงข้อมูลการศึกษา';
            //console.log("edu_max=",edu_max);

              db.query(`SELECT * FROM work_experience WHERE jobber_id = ? AND position_id = ?`, [jobber_id, matchList?.position_id], (err3, workExResults) => {
                if (err3) return console.error(err3);
                  let totalMonths = 0;
                  //console.log("workdfjspejp",workExResults);

                    workExResults.forEach(work => {
                      const [startStrRaw, endStrRaw] = work.duration.split(" - ");

                      // แปลงปีพ.ศ.เป็นค.ศ.
                      const convertBEtoAD = (str) => {
                        const [yearBE, month] = str.split("-");
                        const yearAD = parseInt(yearBE) - 543;
                        return `${yearAD}-${month}`;
                      };

                      const startStr = convertBEtoAD(startStrRaw.trim());
                      const endStr = convertBEtoAD(endStrRaw.trim());

                      const start = dayjs(startStr, "YYYY-MM");
                      const end = dayjs(endStr, "YYYY-MM");

                      if (start.isValid() && end.isValid()) {
                        totalMonths += end.diff(start, 'month', true);
                      }
                    });

                  

                  const workYearExpe = parseFloat((totalMonths / 12).toFixed(1));
                  //console.log("รวมประสบการณ์", workYearExpe, "ปี");
                  //console.log(`Work Year Experience (workYearExpe): ${workYearExpe}`);

          const hsIds = matchList[0].hs ? matchList[0].hs.split(',').map(id => parseInt(id.trim())) : [];
          const ssIds = matchList[0].ss ? matchList[0].ss.split(',').map(id => parseInt(id.trim())) : [];
      
          if (hsIds.length === 0 && ssIds.length === 0) {
            return res.json({ matchList, edu_max, workYearExpe, hardskills: [], softskills: [] });
          }

        const hsQuery = hsIds.length > 0 ? `SELECT hardskill_name FROM hardskill WHERE hardskill_id IN (${hsIds.join(',')})` : null;
        const ssQuery = ssIds.length > 0 ? `SELECT softskill_name FROM softskill WHERE softskill_id IN (${ssIds.join(',')})` : null;

        const promises = [];

        if (hsQuery) {
          promises.push(new Promise((resolve, reject) => {
            db.query(hsQuery, (err4, hsResult) => {
              if (err4) return reject(err4);
              resolve(hsResult.map(row => row.hardskill_name));
            });
          }));
        } else {
          promises.push(Promise.resolve([]));
        }

        if (ssQuery) {
          promises.push(new Promise((resolve, reject) => {
            db.query(ssQuery, (err5, ssResult) => {
              if (err5) return reject(err5);
              resolve(ssResult.map(row => row.softskill_name));
            });
          }));
        } else {
          promises.push(Promise.resolve([]));
        }

        Promise.all(promises)
            .then(([hardskills, softskills]) => {
              res.json({
                matchList,
                edu_max, 
                workYearExpe,
                hardskills,
                softskills
              });
            })
            .catch(err6 => {
              console.error("DB error:", err6);
              return res.status(500).json({ error: "Server error" });
            });

        });
      });
    });
  
});

app.get("/volun_matchlist", (req, res) => {
  console.log("📥 [GET] /volun_matchlist เริ่มทำงาน");

  const { jobber_id, post_id, inter_volun_id, position_id } = req.query;

  // ✅ เช็คค่าที่ส่งมาจาก Frontend
  console.log("🔹 Query Params:", { jobber_id, post_id, inter_volun_id, position_id });

  const matchlist = `
    SELECT tempVolun.*, interests_volun.hours, interests_volun.end_hour, 
           tambon_name AS tb, ampher_name AS ap, birthday, jobber.gender
    FROM tempVolun
    LEFT JOIN volunteer_posting ON tempVolun.post_id = volunteer_posting.post_id
    LEFT JOIN jobber ON tempVolun.jobber_id = jobber.jobber_id
    LEFT JOIN interests_volun ON tempVolun.inter_volun_id = interests_volun.inter_volun_id
    LEFT JOIN tambon ON jobber.tambon_id = tambon.tambon_id
    LEFT JOIN ampher ON LEFT(tambon.tambon_id, 4) = ampher.ampher_id
    WHERE tempVolun.jobber_id = ? 
      AND tempVolun.post_id = ? 
      AND tempVolun.inter_volun_id = ?
  `;

  console.log("🟦 SQL:", matchlist);
  console.log("🟨 Params:", [jobber_id, post_id, inter_volun_id]);

  db.query(matchlist, [jobber_id, post_id, inter_volun_id], (err1, matchList) => {
    if (err1) {
      console.error("❌ DB Query Error:", err1);
      return res.status(500).json({ error: "Server error" });
    }

    console.log("✅ DB Result:", matchList);

    if (matchList.length === 0) {
      console.warn("⚠️ ไม่พบข้อมูล matchList");
      return res.json({ matchList: [] });
    }

    const hsIds = matchList[0].hs ? matchList[0].hs.split(',').map(id => parseInt(id.trim())) : [];
    const ssIds = matchList[0].ss ? matchList[0].ss.split(',').map(id => parseInt(id.trim())) : [];

    console.log("🔧 HardSkill IDs:", hsIds);
    console.log("🔧 SoftSkill IDs:", ssIds);

    if (hsIds.length === 0 && ssIds.length === 0) {
      console.log("⚪ ไม่มี hardskill / softskill");
      return res.json({ matchList, hardskills: [], softskills: [] });
    }

    const hsQuery = hsIds.length > 0 ? `SELECT hardskill_name FROM hardskill WHERE hardskill_id IN (${hsIds.join(',')})` : null;
    const ssQuery = ssIds.length > 0 ? `SELECT softskill_name FROM softskill WHERE softskill_id IN (${ssIds.join(',')})` : null;

    const promises = [];

    if (hsQuery) {
      console.log("🟩 HS Query:", hsQuery);
      promises.push(new Promise((resolve, reject) => {
        db.query(hsQuery, (err4, hsResult) => {
          if (err4) return reject(err4);
          console.log("✅ HS Result:", hsResult);
          resolve(hsResult.map(row => row.hardskill_name));
        });
      }));
    } else {
      promises.push(Promise.resolve([]));
    }

    if (ssQuery) {
      console.log("🟦 SS Query:", ssQuery);
      promises.push(new Promise((resolve, reject) => {
        db.query(ssQuery, (err5, ssResult) => {
          if (err5) return reject(err5);
          console.log("✅ SS Result:", ssResult);
          resolve(ssResult.map(row => row.softskill_name));
        });
      }));
    } else {
      promises.push(Promise.resolve([]));
    }

    Promise.all(promises)
      .then(([hardskills, softskills]) => {
        console.log("🎯 ส่งข้อมูลกลับ:", {
          matchListCount: matchList.length,
          hardskills,
          softskills
        });
        res.json({
          matchList,
          hardskills,
          softskills
        });
      })
      .catch(err6 => {
        console.error("❌ DB Error (Promise):", err6);
        return res.status(500).json({ error: "Server error" });
      });
  });
});


app.get("/user_volun_match", (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const offset = (page -1) * limit;
  const jobber_id = req.query.jobber_id; //ดึงไปโชว์ เปอร์เซ้นจาก tempWork
  //SELECT tempWork.* , post_day ,  activity_name , COUNT(DISTINCT job_need_hs.hardskill_id) as job_hs , COUNT(DISTINCT job_need_ss.softskill_id) as job_ss
  // FROM tempWork
  // LEFT JOIN volunteer_posting ON tempWork.post_id = volunteer_posting.post_id  
  // LEFT JOIN job_need_hs ON tempWork.post_id = job_need_hs.post_id  
  // LEFT JOIN job_need_ss ON tempWork.post_id = job_need_ss.post_id  
  // WHERE jobber_id = 3;
  //SELECT tempWork.* , post_day , activity_name FROM tempWork LEFT JOIN volunteer_posting ON tempWork.post_id = volunteer_posting.post_id  WHERE jobber_id = 3;
  const match = "SELECT apply_volun.* , post_day ,  activity_name  , volunteer_posting.time , tambon_name as tb , ampher_name as ap , jangwat_name as jw FROM apply_volun LEFT JOIN volunteer_posting ON apply_volun.post_id = volunteer_posting.post_id LEFT JOIN tambon ON volunteer_posting.tambon_id = tambon.tambon_id LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id LEFT JOIN jangwat ON LEFT(ampher.ampher_id,2) = jangwat.jangwat_id WHERE jobber_id = ?  LIMIT ? OFFSET ?";
  const postCount = "SELECT count(*) as postCount FROM apply_volun WHERE jobber_id = ? AND type = 'm';";

  db.query(match, [jobber_id , parseInt(limit) , parseInt(offset)], (err1, postMatch) => {
    if (err1) {
      console.error("DB error:", err1);
      return res.status(500).json({ error: "Server error" });
    }
      db.query(postCount, [jobber_id], (err2, postCount) => {
        if (err2) {
          console.error("DB error:", err2);
          return res.status(500).json({ error: "Server error" });
        }
          const totalRecords = postCount[0].postCount;
          const totalPages = Math.ceil(totalRecords / limit);
          res.json({
            postMatch,
            totalRecords,
            totalPages
            });
      });
  });
});

app.get("/user_profile", (req, res) => {
  const jobber_id = req.query.jobber_id;
  const data = "SELECT fullname , fullname_eng , gender , birthday , address , phone , email , picture , status , work_status , tambon_name as tb , ampher_name as ap , jangwat_name as jw ,  tambon.tambon_id as tb_id , ampher.ampher_id as ap_id , jangwat.jangwat_id as jw_id FROM jobber  LEFT JOIN tambon ON jobber.tambon_id = tambon.tambon_id LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id LEFT JOIN jangwat ON LEFT(ampher.ampher_id,2) = jangwat.jangwat_id WHERE jobber_id = ?";
  //const postCount = "SELECT count(*) as postCount FROM apply_volun WHERE jobber_id = ? AND type = 'm';";


  db.query(data, [jobber_id], (err1, data) => {
    if (err1) {
      console.error("DB error:", err1);
      return res.status(500).json({ error: "Server error" });
    }
          res.json({
            data
            });
  });
});

app.get("/date_accptedjob", (req, res) => {
  const {jobber_id , post_id} = req.query;
  const data = "SELECT date_time FROM `apply_job` WHERE post_id = ? and jobber_id = ?";
  //const postCount = "SELECT count(*) as postCount FROM apply_volun WHERE jobber_id = ? AND type = 'm';";


  db.query(data, [post_id , jobber_id], (err1, data) => {
    if (err1) {
      console.error("DB error:", err1);
      return res.status(500).json({ error: "Server error" });
    }
          res.json({
            data
            });
  });
});

app.get("/api/emp_profile_check/:type", (req, res) => {
  const type = req.params.type;
  const emp_id = req.query.emp_id;

  let sql = "";
  let params = [emp_id];

  switch (type) {
    case "info":
      sql = "SELECT birthday FROM employer WHERE emp_id = ?";
      break;
    case "work":
      sql = "SELECT about FROM employer WHERE emp_id = ?";
      break;
    case "volun":
      sql = "SELECT about_volun FROM employer WHERE emp_id = ?";
      break;
    
    default:
      return res.status(400).json({ error: "Invalid type" });
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: "DB Error" });

    if (type === "info") {
      const birthday = results[0]?.birthday;
      const exists = birthday !== null && birthday !== '';
      return res.json({ exists });
    } else {
      return res.json({ exists: results[0].count > 0 });
    }
  });
});
app.get("/api/profile_check/:type", (req, res) => {
  const type = req.params.type;
  const jobber_id = req.query.jobber_id;

  let sql = "";
  let params = [jobber_id];

  switch (type) {
    case "info":
      sql = "SELECT birthday FROM jobber WHERE jobber_id = ?";
      break;
    case "edu":
      sql = "SELECT COUNT(*) as count FROM education_history WHERE jobber_id = ?";
      break;
    case "work_ex":
      sql = "SELECT COUNT(*) as count FROM work_experience WHERE jobber_id = ?";
      break;
    case "inter_work":
      sql = "SELECT COUNT(*) as count FROM interests_work WHERE jobber_id = ?";
      break;
    case "inter_volun":
      sql = "SELECT COUNT(*) as count FROM interests_volun WHERE jobber_id = ?";
      break;
    default:
      return res.status(400).json({ error: "Invalid type" });
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: "DB Error" });

    if (type === "info") {
      const birthday = results[0]?.birthday;
      const exists = birthday !== null && birthday !== '';
      return res.json({ exists });
    } else {
      return res.json({ exists: results[0].count > 0 });
    }
  });
});
app.get("/api/profile_check_all", (req, res) => {
  const jobber_id = req.query.jobber_id;
  if (!jobber_id) return res.status(400).json({ error: "Missing jobber_id" });

  const queries = {
    info: "SELECT birthday FROM jobber WHERE jobber_id = ?",
    edu: "SELECT COUNT(*) as count FROM education_history WHERE jobber_id = ?",
    work_ex: "SELECT COUNT(*) as count FROM work_experience WHERE jobber_id = ?",
    inter_work: "SELECT COUNT(*) as count FROM interests_work WHERE jobber_id = ?",
    inter_volun: "SELECT COUNT(*) as count FROM interests_volun WHERE jobber_id = ?",
    hs: "SELECT COUNT(*) as count FROM jobber_hs WHERE jobber_id = ?",
    ss: "SELECT COUNT(*) as count FROM jobber_ss WHERE jobber_id = ?"
  };

  const checkResults = {};

  // ใช้ Promise เพื่อรันคำสั่ง async พร้อมกัน
  const promises = Object.entries(queries).map(([key, sql]) => {
    return new Promise((resolve, reject) => {
      db.query(sql, [jobber_id], (err, results) => {
        if (err) return reject(err);
        if (key === "info") {
          const birthday = results[0]?.birthday;
          checkResults[key] = birthday !== null && birthday !== "";
        } else {
          checkResults[key] = results[0].count > 0;
        }
        resolve();
      });
    });
  });

  Promise.all(promises)
    .then(() => {
      // สร้าง string เช่น "11110"
      const code =
        (checkResults.info ? "1" : "0") +
        (checkResults.edu ? "1" : "0") +
        (checkResults.work_ex ? "1" : "0") +
        (checkResults.inter_work ? "1" : "0") +
        (checkResults.inter_volun ? "1" : "0")+
        (checkResults.hs ? "1" : "0") +
        (checkResults.ss ? "1" : "0");

      res.json({ code, checkResults });
    })
    .catch((err) => {
      res.status(500).json({ error: "DB Error", detail: err });
    });
});

app.get("/api/emp_profile_check_all", (req, res) => {
  const emp_id = req.query.emp_id;
  if (!emp_id) return res.status(400).json({ error: "Missing emp_id" });

  const queries = {
    info: "SELECT birthday FROM employer WHERE emp_id = ?",
    work: "SELECT about FROM employer WHERE emp_id = ?",
    volun: "SELECT about_volun FROM employer WHERE emp_id = ?",
    
  };

  const checkResults = {};

  // ใช้ Promise เพื่อรันคำสั่ง async พร้อมกัน
  const promises = Object.entries(queries).map(([key, sql]) => {
    return new Promise((resolve, reject) => {
      db.query(sql, [emp_id], (err, results) => {
        if (err) return reject(err);
        if (key === "info") {
          const birthday = results[0]?.birthday;
          checkResults[key] = birthday !== null && birthday !== "";
        } else {
          const fieldName = key === "work" ? "about" : "about_volun";
          const value = results[0]?.[fieldName];
          checkResults[key] = value !== null && value !== "";
        }
        resolve();
      });
    });
  });

  Promise.all(promises)
    .then(() => {
      // สร้าง string เช่น "11110"
      const code =
        (checkResults.info ? "1" : "0") +
        (checkResults.work ? "1" : "0") +
        (checkResults.volun ? "1" : "0");
        console.log("check",code);

      res.json({ code, checkResults });
    })
    .catch((err) => {
      res.status(500).json({ error: "DB Error", detail: err });
    });
});

app.get("/api/jangwat", (req, res) => {
  const data = "SELECT * FROM jangwat";

  db.query(data, (err1, data) => {
    if (err1) {
      console.error("DB error:", err1);
      return res.status(500).json({ error: "Server error" });
    }
          res.json({
            data
            });
  });
});

app.get("/api/ampher", (req, res) => {
  const jangwat_id = req.query.jangwat_id;
  const data = "SELECT * FROM ampher LEFT JOIN jangwat ON LEFT(ampher.ampher_id,2) = jangwat.jangwat_id WHERE jangwat_id = ?";


  db.query(data, [jangwat_id], (err1, data) => {
    if (err1) {
      console.error("DB error:", err1);
      return res.status(500).json({ error: "Server error" });
    }
          res.json({
            data
            });
  });
});

app.get("/api/ampherall", (req, res) => {
  const data = "SELECT DISTINCT ampher.ampher_id, ampher.ampher_name FROM ampher INNER JOIN tambon ON LEFT(tambon.tambon_id,4) = ampher.ampher_id";

  db.query(data, (err1, data) => {
    if (err1) {
      console.error("DB error:", err1);
      return res.status(500).json({ error: "Server error" });
    }
          res.json({
            data
            });
  });
});

app.get("/api/tambon", (req, res) => {
  const ampher_id = req.query.ampher_id;
  const data = "SELECT * FROM tambon LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id WHERE ampher_id = ?";


  db.query(data, [ampher_id], (err1, data) => {
    if (err1) {
      console.error("DB error:", err1);
      return res.status(500).json({ error: "Server error" });
    }
          res.json({
            data
            });
  });
});

app.post("/api/save_profile", async (req, res) => {
  const {
    jobber_id,
    firstname,
    lastname,
    firstname_eng,
    lastname_eng,
    gender,
    birthday,
    address,
    phone,
    tambon_id
  } = req.body;

  try {
    const sql = `
      UPDATE jobber
      SET 
        fullname = ?,
        fullname_eng = ?,
        gender = ?,
        birthday = ?,
        address = ?,
        phone = ?,
        tambon_id = ?
      WHERE jobber_id = ?
    `;

    const values = [
      `${firstname} ${lastname}`,
      `${firstname_eng} ${lastname_eng}`,
      gender,
      birthday,
      address,
      phone,
      tambon_id,
      jobber_id
    ];

     await new Promise((resolve, reject) => {
      db.query(sql, values, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    try {
        // console.log("Start Re-Match for Jobber ID:", jobber_id);
        const rematchResult = await rematchJobber(jobber_id);
        // console.log("Rematch Result:", rematchResult);
        res.json({ success: true, message: "Profile updated and rematched", rematch: rematchResult });
      } catch (matchErr) {
        console.error("Re-Match Error:", matchErr);
        res.status(500).json({ success: false, message: "Profile updated but failed to rematch", error: matchErr.message });
      }

  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ success: false, message: "Something went wrong", error: err.message });
  }
});

app.post("/api/emp_save_profile", async (req, res) => {
  const {
    emp_id,
    firstname,
    lastname,
    
    gender,
    birthday,
    address,
    phone,
    tambon_id
  } = req.body;

  try {
    const sql = `
      UPDATE employer
      SET 
        fullname = ?,
        
        gender = ?,
        birthday = ?,
        address = ?,
        phone = ?,
        tambon_id = ?
      WHERE emp_id = ?
    `;

    const values = [
      `${firstname} ${lastname}`,
      
      gender,
      birthday,
      address,
      phone,
      tambon_id,
      emp_id
    ];

     await new Promise((resolve, reject) => {
      db.query(sql, values, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    res.json({
      success: true,
      message: "Profile updated successfully",
      // affectedRows: result.affectedRows
    });

  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ success: false, message: "Something went wrong", error: err.message });
  }
});

app.post("/api/emp_save_about", async (req, res) => {
  const {
    emp_id,
    about,
    benefits,
  } = req.body;

  try {
    const sql = `
      UPDATE employer
      SET 
        about = ?,
        benefits = ?
      WHERE emp_id = ?
    `;

    const values = [
      about,
      benefits,
      emp_id
    ];

     await new Promise((resolve, reject) => {
      db.query(sql, values, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    res.json({
      success: true,
      message: "Profile updated successfully",
      // affectedRows: result.affectedRows
    });

  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ success: false, message: "Something went wrong", error: err.message });
  }
});

app.post("/api/emp_save_aboutvolun", async (req, res) => {
  const {
    emp_id,
    about_volun,
    vission,
    mission
  } = req.body;

  try {
    const sql = `
      UPDATE employer
      SET 
        about_volun = ?,
        vission = ?,
        mission = ?
      WHERE emp_id = ?
    `;

    const values = [
      about_volun,
      vission,
      mission,
      emp_id
    ];

     await new Promise((resolve, reject) => {
      db.query(sql, values, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    res.json({
      success: true,
      message: "Profile updated successfully",
      // affectedRows: result.affectedRows
    });

  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ success: false, message: "Something went wrong", error: err.message });
  }
});

app.get("/user_edu", (req, res) => {
  const jobber_id = req.query.jobber_id;
  const data = "SELECT education_history.* , edu_name FROM education_history LEFT JOIN education_level ON education_history.edu_id = education_level.edu_id WHERE jobber_id = ? ORDER BY edu_id";


  db.query(data, [jobber_id], (err1, data) => {
    if (err1) {
      console.error("DB error:", err1);
      return res.status(500).json({ error: "Server error" });
    }
          res.json({
            data
            });
  });
});

app.get("/user_workex", (req, res) => {
  const jobber_id = req.query.jobber_id;
  const data = "SELECT work_experience.* , position_name , jobtype_name FROM work_experience LEFT JOIN position ON work_experience.position_id = position.position_id LEFT JOIN jobtype ON jobtype.jobtype_id = position.jobtype_id WHERE jobber_id = ? ORDER BY no";


  db.query(data, [jobber_id], (err1, data) => {
    if (err1) {
      console.error("DB error:", err1);
      return res.status(500).json({ error: "Server error" });
    }
          res.json({
            data
            });
  });
});

app.get("/user_interwork", (req, res) => {
  const jobber_id = req.query.jobber_id;
  const data = "SELECT interests_work.* , position_name , jobtype_name ,tambon_name as tb , ampher_name as ap , jangwat_name as jw FROM interests_work LEFT JOIN position ON interests_work.position_id = position.position_id LEFT JOIN jobtype ON jobtype.jobtype_id = position.jobtype_id LEFT JOIN tambon ON interests_work.tambon_id = tambon.tambon_id LEFT JOIN ampher ON interests_work.ampher_id = ampher.ampher_id LEFT JOIN jangwat ON LEFT(ampher.ampher_id,2) = jangwat.jangwat_id WHERE jobber_id = ?";


  db.query(data, [jobber_id], (err1, data) => {
    if (err1) {
      console.error("DB error:", err1);
      return res.status(500).json({ error: "Server error" });
    }
          res.json({
            data
            });
  });
});

app.get("/user_intervolun", (req, res) => {
  const jobber_id = req.query.jobber_id;
  const data = "SELECT interests_volun.* , voluntype_name  FROM interests_volun LEFT JOIN volunteertype ON interests_volun.voluntype_id = volunteertype.voluntype_id WHERE jobber_id =  ?";


  db.query(data, [jobber_id], (err1, data) => {
    if (err1) {
      console.error("DB error:", err1);
      return res.status(500).json({ error: "Server error" });
    }
          res.json({
            data
            });
  });
});

app.get("/api/edu", (req, res) => {
  
  const data = "SELECT * FROM education_level";


  db.query(data, (err1, data) => {
    if (err1) {
      console.error("DB error:", err1);
      return res.status(500).json({ error: "Server error" });
    }
          res.json({
            data
            });
  });
});

app.post("/api/user_edu_add", upload.single("file"), async (req, res) => {
  const {
    jobber_id,
    edu_id,
    institution,
    major,
    year_graduat,
    grade
  } = req.body;

  const filePath = req.file ? req.file.filename : null ;
  //console.log("req.body:", req.body);
  //console.log("req.file:", req.file); // <-- ควรมีข้อมูล ถ้ามีไฟล์


  try {
    const sql = `
      INSERT INTO education_history
      (edu_id, jobber_id, institution, major, year_graduat, grade, edu_cert) 
      VALUES (?, ?, ?, ?, ?, ?, ? )
    `;

    const values = [
      edu_id,
      jobber_id,
      institution,
      major,
      year_graduat,
      grade,
      filePath
    ];

    await new Promise((resolve, reject) => {
      db.query(sql, values, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    try {
        // console.log("Start Re-Match for Jobber ID:", jobber_id);
        const rematchResult = await rematchJobber(jobber_id);
        // console.log("Rematch Result:", rematchResult);
        res.json({ success: true, message: "Profile updated and rematched", rematch: rematchResult });
      } catch (matchErr) {
        console.error("Re-Match Error:", matchErr);
        res.status(500).json({ success: false, message: "Profile updated but failed to rematch", error: matchErr.message });
      }
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ success: false, message: "Something went wrong", error: err.message });
  }
});

app.post("/api/job_posting_add", upload.single("job_pic"), async (req, res) => {
  const {
    num_position,
    salary,
    location,
    tambon_id,
    latitude,
    longitude,
    details,
    min_age,
    max_age,
    gender,
    year_expe,
    experience,
    notes,
    benefits,
    hour,
    end_hour,
    days,
    emp_id,
    position_code,
    education_code,
    type,
    phone,
    email,
  } = req.body;

  // console.log("Raw req.body:", req.body);

  const job_pic = req.file ? req.file.filename : null;
  const age = `${min_age || ""}-${max_age || ""}`;

  const selectedHs = Array.isArray(req.body.selectedHs) ? req.body.selectedHs.filter(v => v) : [];
  const selectedSs = Array.isArray(req.body.selectedSs) ? req.body.selectedSs.filter(v => v) : [];

  try {
    const sql = `
      INSERT INTO job_posting 
      (num_position, salary, location, tambon_id, latitude, longitude, details, age, gender, year_expe, experience, notes, benefits, hour, end_hour, days, contact, emp_id, position_code, education_code, job_pic, status, post_day, type)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'ON',NOW(),?)
    `;

    const values = [
      num_position,
      salary,
      location,
      tambon_id && tambon_id.trim() !== "" ? tambon_id : null,
      latitude,
      longitude,
      details,
      age,
      gender,
      year_expe,
      experience,
      notes,
      benefits,
      hour,
      end_hour,
      days,
      `${phone || ""} / ${email || ""}`,
      emp_id,
      position_code,
      education_code,
      job_pic,
      type,
    ];

    // insert job_posting
    const result = await new Promise((resolve, reject) => {
      db.query(sql, values, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    const post_id = result.insertId;

    // เพิ่มฮาร์ด
    for (const hsId of selectedHs) {
      await new Promise((resolve, reject) => {
        db.query(
          "INSERT INTO job_need_hs (post_id, hardskill_id) VALUES (?, ?)",
          [post_id, hsId],
          (err) => (err ? reject(err) : resolve())
        );
      });
    }

    // เพิ่ม ซอฟ
    for (const ssId of selectedSs) {
      await new Promise((resolve, reject) => {
        db.query(
          "INSERT INTO job_need_ss (post_id, softskill_id) VALUES (?, ?)",
          [post_id, ssId],
          (err) => (err ? reject(err) : resolve())
        );
      });
    }

    // 🔁 Re-match
    let rematchEmpResult = null;
    try {
      // console.log("Start Re-Match for Post ID:", post_id, position_code);
      rematchEmpResult = await rematchEmp(post_id, position_code);
      // console.log("Rematch Result:", rematchEmpResult);
    } catch (matchErr) {
      console.error("Re-Match Error:", matchErr);
      // ไม่ throw error แต่จะส่งกลับไปว่า rematch fail
      return res.status(500).json({
        success: false,
        message: "Profile updated but failed to rematch",
        error: matchErr.message,
      });
    }

    // ✅ ส่ง response กลับแค่ครั้งเดียว
    return res.json({
      success: true,
      message: "Profile updated and rematched",
      post_id,
      rematch: rematchEmpResult,
    });

  } catch (err) {
    console.error("DB Error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err.message,
    });
  }
});

app.put("/api/job_posting_update/:post_id", async (req, res) => {
  const { post_id } = req.params;
  const {
    num_position,
    salary,
    location,
    tambon_id,
    latitude,
    longitude,
    details,
    min_age,
    max_age,
    gender,
    year_expe,
    experience,
    notes,
    benefits,
    hour,
    end_hour,
    days,
    emp_id,
    position_code,
    education_code,
    type,
    phone,
    email,
    selectedHs,
    selectedSs
  } = req.body;

  const age = `${min_age || ""}-${max_age || ""}`;
  const contact = `${phone || ""} / ${email || ""}`;
console.log('Update job post id:', post_id, 'with data:', req.body);

  try {
    // --- อัพเดท job_posting ---
    const sql = `
      UPDATE job_posting 
      SET num_position=?, salary=?, location=?, tambon_id=?, latitude=?, longitude=?, details=?,
          age=?, gender=?, year_expe=?, experience=?, notes=?, benefits=?, hour=?, end_hour=?, 
          days=?, education_code=?, type=?, contact=?
      WHERE post_id=?`;

    const values = [
      num_position, salary, location, tambon_id, latitude, longitude, details,
      age, gender, year_expe, experience, notes, benefits, 
      hour, end_hour, days, education_code, type, 
      contact, post_id
    ];

    

    await new Promise((resolve, reject) => {
      db.query(sql, values, (err, result) => {
        if (err) return reject(err); // แค่ reject error
        resolve(result); // แค่ resolve ไม่ต้อง res.json
      });
    });

    // --- ลบ hardskill เก่า ---
    await new Promise((resolve, reject) => {
      db.query("DELETE FROM job_need_hs WHERE post_id=?", [post_id], (err) => (err ? reject(err) : resolve()));
    });

    // --- ลบ softskill เก่า ---
    await new Promise((resolve, reject) => {
      db.query("DELETE FROM job_need_ss WHERE post_id=?", [post_id], (err) => (err ? reject(err) : resolve()));
    });

    // เพิ่มใหม่
    for (const hsId of selectedHs || []) {
      await new Promise((resolve, reject) =>
        db.query("INSERT INTO job_need_hs (post_id, hardskill_id) VALUES (?, ?)", [post_id, hsId], (err) => (err ? reject(err) : resolve()))
      );
    }

    for (const ssId of selectedSs || []) {
      await new Promise((resolve, reject) =>
        db.query("INSERT INTO job_need_ss (post_id, softskill_id) VALUES (?, ?)", [post_id, ssId], (err) => (err ? reject(err) : resolve()))
      );
    }

    // 🔁 Re-match
    let rematchEmpResult = null;
    let rematchError = null;
    try {
      // console.log("Start Re-Match for Post ID:", post_id, position_code);
      rematchEmpResult = await rematchEmp(post_id, position_code);
      // console.log("Rematch Result:", rematchEmpResult);
    } catch (matchErr) {
      console.error("Re-Match Error:", matchErr);
      rematchError = matchErr.message;
      // ไม่ throw error แต่จะส่งกลับไปว่า rematch fail
      return res.json({
        success: true,
        message: "Profile updated",
        post_id,
        rematch: rematchEmpResult,
        rematchError // null ถ้าสำเร็จ หรือข้อความ error ถ้าล้มเหลว
      });
    }

    // ✅ ส่ง response กลับแค่ครั้งเดียว
    return res.json({
      success: true,
      message: "Profile updated and rematched",
      post_id,
      rematch: rematchEmpResult,
    });
  } catch (error) {
    console.error("❌ Update Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/volun_posting_add", upload.single("volun_pic"), async (req, res) => {
  const {
    num_position,
    volunteer_code,
    activity_name,

    address,
    location,
    tambon_id,
    ampher_id,
    jangwat_id,
    latitude,
    longitude,

    details,
    min_age,
    max_age,

    gender,
    
    experience,
    notes,
    how_to_join,
    prepare,

    time,
    end_time,
    date_start,
    date_end,

    owncontact,
    emp_id,

    phone,
    email,
  } = req.body;

  // console.log("Raw req.body:", req.body);

  const volun_pic = req.file ? req.file.filename : null;
  const age = `${min_age || ""}-${max_age || ""}`;

  const selectedHs = Array.isArray(req.body.selectedHs) ? req.body.selectedHs.filter(v => v) : [];
  const selectedSs = Array.isArray(req.body.selectedSs) ? req.body.selectedSs.filter(v => v) : [];

  try {
    const sql = `
      INSERT INTO volunteer_posting
      (
        activity_name, num_position, location, tambon_id, latitude, longitude,
        details, age, gender, experience, notes, how_to_join, prepare,
        date_start, date_end, time, contact, emp_id, volunteer_code, volun_pic, status, post_day
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ON', NOW())
    `;

    const values = [
      activity_name || "",
      num_position || 1,
      location || "",
      tambon_id || "",
      latitude || "",
      longitude || "",
      details || "",
      age,
      gender || "A",
      experience || "",
      notes || "",
      how_to_join || "",
      prepare || "",
      date_start || "",
      date_end || "",
      `${time || ""}, ${end_time || ""}`,
      `${phone || ""}, ${email || ""}`, // รวมช่องทางติดต่อ
      emp_id || "",
      volunteer_code || "",
      volun_pic
    ];

    // insert job_posting
    const result = await new Promise((resolve, reject) => {
      db.query(sql, values, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    const post_id = result.insertId;

    // เพิ่มฮาร์ด
    for (const hsId of selectedHs) {
      await new Promise((resolve, reject) => {
        db.query(
          "INSERT INTO volun_need_hs (post_id, hardskill_id) VALUES (?, ?)",
          [post_id, hsId],
          (err) => (err ? reject(err) : resolve())
        );
      });
    }

    // เพิ่ม ซอฟ
    for (const ssId of selectedSs) {
      await new Promise((resolve, reject) => {
        db.query(
          "INSERT INTO volun_need_ss (post_id, softskill_id) VALUES (?, ?)",
          [post_id, ssId],
          (err) => (err ? reject(err) : resolve())
        );
      });
    }

    // 🔁 Re-match
    // let rematchEmpResult = null;
    // try {
    //   // console.log("Start Re-Match for Post ID:", post_id, position_code);
    //   rematchEmpResult = await rematchEmp(post_id, position_code);
    //   // console.log("Rematch Result:", rematchEmpResult);
    // } catch (matchErr) {
    //   console.error("Re-Match Error:", matchErr);
    //   // ไม่ throw error แต่จะส่งกลับไปว่า rematch fail
    //   return res.status(500).json({
    //     success: false,
    //     message: "Profile updated but failed to rematch",
    //     error: matchErr.message,
    //   });
    // }

    // ✅ ส่ง response กลับแค่ครั้งเดียว
    return res.json({
      success: true,
      message: "Profile updated and rematched",
      post_id,
      // rematch: rematchEmpResult,
    });

  } catch (err) {
    console.error("DB Error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err.message,
    });
  }
});

app.put("/api/volun_posting_update/:post_id", async (req, res) => {
  const { post_id } = req.params;
  const {
    num_position,
    volunteer_code,
    activity_name,

    address,
    location,
    tambon_id,
    ampher_id,
    jangwat_id,
    latitude,
    longitude,

    details,
    min_age,
    max_age,

    gender,
    
    experience,
    notes,
    how_to_join,
    prepare,

    time,
    end_time,
    date_start,
    date_end,

    owncontact,
    emp_id,

    phone,
    email,
  } = req.body;

  const age = `${min_age || ""}-${max_age || ""}`;

  const selectedHs = Array.isArray(req.body.selectedHs) ? req.body.selectedHs.filter(v => v) : [];
  const selectedSs = Array.isArray(req.body.selectedSs) ? req.body.selectedSs.filter(v => v) : [];

  try {
    // --- อัพเดท job_posting ---
    const sql = `
      UPDATE volunteer_posting 
      SET num_position=?, activity_name=?, location=?, tambon_id=?, latitude=?, longitude=?, details=?,
          age=?, gender=?, experience=?, notes=?, how_to_join=?, prepare=?, date_start=?, date_end=?, 
          time=?, contact=?
      WHERE post_id=?`;

    const values = [
      num_position, activity_name, location, tambon_id, latitude, longitude, details,
      age, gender, experience, notes, how_to_join, prepare,
      date_start, date_end, `${time || ""}, ${end_time || ""}`, `${phone || ""}, ${email || ""}`, 
      post_id
    ];

    

    await new Promise((resolve, reject) => {
      db.query(sql, values, (err, result) => {
        if (err) return reject(err); // แค่ reject error
        resolve(result); // แค่ resolve ไม่ต้อง res.json
      });
    });

    // --- ลบ hardskill เก่า ---
    await new Promise((resolve, reject) => {
      db.query("DELETE FROM volun_need_hs WHERE post_id=?", [post_id], (err) => (err ? reject(err) : resolve()));
    });

    // --- ลบ softskill เก่า ---
    await new Promise((resolve, reject) => {
      db.query("DELETE FROM volun_need_ss WHERE post_id=?", [post_id], (err) => (err ? reject(err) : resolve()));
    });

    // เพิ่มใหม่
    for (const hsId of selectedHs || []) {
      await new Promise((resolve, reject) =>
        db.query("INSERT INTO volun_need_hs (post_id, hardskill_id) VALUES (?, ?)", [post_id, hsId], (err) => (err ? reject(err) : resolve()))
      );
    }

    for (const ssId of selectedSs || []) {
      await new Promise((resolve, reject) =>
        db.query("INSERT INTO volun_need_ss (post_id, softskill_id) VALUES (?, ?)", [post_id, ssId], (err) => (err ? reject(err) : resolve()))
      );
    }

    // // 🔁 Re-match
    // let rematchEmpResult = null;
    // let rematchError = null;
    // try {
    //   // console.log("Start Re-Match for Post ID:", post_id, position_code);
    //   rematchEmpResult = await rematchEmp(post_id, position_code);
    //   // console.log("Rematch Result:", rematchEmpResult);
    // } catch (matchErr) {
    //   console.error("Re-Match Error:", matchErr);
    //   rematchError = matchErr.message;
    //   // ไม่ throw error แต่จะส่งกลับไปว่า rematch fail
    //   return res.json({
    //     success: true,
    //     message: "Profile updated",
    //     post_id,
    //     rematch: rematchEmpResult,
    //     rematchError // null ถ้าสำเร็จ หรือข้อความ error ถ้าล้มเหลว
    //   });
    // }

    // ✅ ส่ง response กลับแค่ครั้งเดียว
    return res.json({
      success: true,
      message: "Profile updated and rematched",
      post_id,
      // rematch: rematchEmpResult,
    });
  } catch (error) {
    console.error("❌ Update Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/user_workex_add", upload.single("file"), async (req, res) => {
  const {
    jobber_id,
    position_id,        // select
    company,
    start,
    end,
    job_description,
            
  } = req.body;

  const filePath = req.file ? req.file.filename : null ;
  //console.log("req.body:", req.body);
  //console.log("req.file:", req.file); // <-- ควรมีข้อมูล ถ้ามีไฟล์


  try {
    const [result] = await new Promise((resolve, reject) => {
      db.query(
        `SELECT MAX(no) as maxNo FROM work_experience WHERE jobber_id = ?`,
        [jobber_id],
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });

    const next_no = (result?.maxNo || 0) + 1;
    const duration = `${start} - ${end}`;

    await new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO work_experience
        (jobber_id, no, position_id, company, duration, job_description, work_certificate) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        jobber_id,
        next_no,
        position_id,
        company,
        duration,
        job_description,
        filePath,
      ];

      db.query(sql, values, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    // ✅ Re-match หลัง insert
    const rematchResult = await rematchJobber(jobber_id);

    res.json({
      success: true,
      message: "บันทึกสำเร็จและจับคู่งานใหม่เรียบร้อย",
      rematch: rematchResult,
    });
  } catch (err) {
    console.error("Error in user_workex_add:", err);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาด",
      error: err.message,
    });
  }
  
  
});

app.post("/api/user_interwork_add", upload.none(), async (req, res) => {
  const {
    jobber_id,
    position_id,
    min,
    max,
    start,
    end,
    days,
    ampher_id,
    tambon_id    
  } = req.body;
  
  const daysString = Array.isArray(days) ? days.join(",") : days;
  const ampherValue = ampher_id && ampher_id !== '' ? parseInt(ampher_id) : null;
  const tambonValue = tambon_id && tambon_id !== '' ? parseInt(tambon_id) : null;

   try {
        const sql = `
          INSERT INTO interests_work
          (jobber_id, position_id, salary_min, salary_max, hour, end_hour, days, ampher_id, tambon_id, status) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ON' )
        `;

        const values = [
          jobber_id,
          position_id,
          min,
          max,
          start,
          end,
          daysString,
          ampherValue,
          tambonValue
        ];

        db.query(sql, values, (err, result) => {
          if (err) {
            console.error("DB Error:", err);
            return res.status(500).json({ success: false, message: "Database error", error: err.message });
          }
          const inter_work_id = result.insertId;
          // console.log("Inserted inter_work_id:", inter_work_id);

          db.query(`SELECT * FROM jobber WHERE jobber_id = ?`, [jobber_id], (err, jobberRows) => {
            if (err) return console.error(err);
            if (!jobberRows || jobberRows.length === 0) {
              return console.error(`ไม่พบ jobber สำหรับ jobber_id=${jobber_id}`);
            }

            const jobber = jobberRows[0];

            db.query(`SELECT hardskill_id FROM jobber_hs WHERE jobber_id = ?`, [jobber_id], (err, jobber_hs) => {
              if (err) return console.error(err);
              const jobber_hs_arr = jobber_hs.map(item => item.hardskill_id);

              db.query(`SELECT softskill_id FROM jobber_ss WHERE jobber_id = ?`, [jobber_id], (err, jobber_ss) => {
                if (err) return console.error(err);
                const jobber_ss_arr = jobber_ss.map(item => item.softskill_id);

                db.query(`SELECT edu_id FROM education_history WHERE jobber_id = ?`, [jobber_id], (err, edu) => {
                  if (err) return console.error(err);
                  const jobber_edu_arr = edu.map(item => parseInt(item.edu_id));

                  db.query(`SELECT * FROM work_experience WHERE jobber_id = ? AND position_id = ?`, [jobber_id, position_id], (err, workExResults) => {
                    if (err) return console.error(err);

                    let totalMonths = 0;

                    workExResults.forEach(work => {
                      const [startStr, endStr] = work.duration.split(" - ");
                      const start = dayjs(startStr, "YYYY-MM");
                      const end = dayjs(endStr, "YYYY-MM");
                      if (start.isValid() && end.isValid()) {
                        const months = end.diff(start, 'month', true);
                        totalMonths += months;
                      }
                    });
                    const workYearExpe = parseFloat((totalMonths / 12).toFixed(1));

                    db.query(`SELECT job_posting.* , position_name , employer.email , ampher_id FROM job_posting LEFT JOIN employer ON job_posting.emp_id = employer.emp_id LEFT JOIN position ON job_posting.position_code = position.position_id LEFT JOIN tambon ON job_posting.tambon_id = tambon.tambon_id LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id WHERE job_posting.status = 'ON' AND position_code = ?`, [position_id], (err, jobs) => {
                      if (err) return console.error(err);

                      const age = dayjs().diff(dayjs(jobber.birthday), "year");
                      let count = 0;
                      let matchResults = [];

                      jobs.forEach(job => {
                        db.query(`SELECT hardskill_id FROM job_need_hs WHERE post_id = ?`, [job.post_id], (err, jobHS) => {
                          if (err) return console.error(err);

                          db.query(`SELECT softskill_id FROM job_need_ss WHERE post_id = ?`, [job.post_id], (err, jobSS) => {
                            if (err) return console.error(err);

                            const job_hs_arr = jobHS.map(item => item.hardskill_id);
                            const job_ss_arr = jobSS.map(item => item.softskill_id);

                            // Matching Skills (only matched IDs)
                            const matched_hs_arr = job_hs_arr.filter(hs => jobber_hs_arr.includes(hs));
                            const matched_ss_arr = job_ss_arr.filter(ss => jobber_ss_arr.includes(ss));

                            let matchStr = "";
                            //1.salary
                            const jobSalary = parseInt(job.salary || 0);
                            matchStr += jobSalary >= parseInt(min) && jobSalary <= parseInt(max) ? "1" : "0";
                            //2.hour 
                            const jobberTimeStart = start;
                            const jobberTimeEnd = end;
                            const jobTimeStart = job.hour;
                            const jobTimeEnd = job.end_hour;
                            if (jobberTimeStart && jobberTimeEnd && jobTimeStart && jobTimeEnd) {
                              const jobberStart = dayjs(jobberTimeStart, 'HH:mm');
                              const jobberEnd = dayjs(jobberTimeEnd, 'HH:mm');
                              const jobStart = dayjs(jobTimeStart, 'HH:mm');
                              const jobEnd = dayjs(jobTimeEnd, 'HH:mm');
                              const isValid =
                                jobberStart.isValid() &&
                                jobberEnd.isValid() &&
                                jobStart.isValid() &&
                                jobEnd.isValid();
                              if (isValid) {
                                const isTimeMatch =
                                  jobberStart.isSameOrBefore(jobStart) &&
                                  jobberEnd.isSameOrAfter(jobEnd);
                                matchStr += isTimeMatch ? "1" : "0";
                              } else {
                                matchStr += "0";
                              }
                            } else {
                              matchStr += "1";
                            }
                            //3.days
                            const jobDaysArr = job.days.split('').map(d => parseInt(d)); 
                            const userDaysArr = daysString.split('').map(d => parseInt(d)); 
                            let isDaysMatch = true;
                            for (let i = 0; i < 7; i++) {
                              if (jobDaysArr[i] === 1 && userDaysArr[i] !== 1) {
                                isDaysMatch = false; 
                                break;
                              }
                            }
                            matchStr += isDaysMatch ? "1" : "0";
                            //4.tambon
                            let locationMatch = "0";
                            if (!ampher_id || ampher_id == 0) {
                                locationMatch = "1";
                            } else {
                                const jobAmpherId = parseInt(job.ampher_id);
                                const jobTambonId = parseInt(job.tambon_id);
                                if (parseInt(ampher_id) === jobAmpherId) {
                                    if (!tambon_id || tambon_id == 0) {
                                        locationMatch = "1";
                                    } else {
                                        if (parseInt(tambon_id) === jobTambonId) {
                                            locationMatch = "1";
                                        }
                                    }
                                }
                            }
                            matchStr += locationMatch;
                            //5.age
                            let age_min = 0;
                            let age_max = 0;
                            if (job.age) {
                                const [minStr, maxStr] = job.age.split('-');
                                age_min = parseInt(minStr) || 0;
                                age_max = parseInt(maxStr) || 0;
                            }
                            if (age_min === 0 && age_max === 0) {
                                matchStr += "1";
                            } else if (age_min === 0) {
                                matchStr += (age <= age_max) ? "1" : "0";
                            } else if (age_max === 0) {
                                matchStr += (age >= age_min) ? "1" : "0";
                            } else {
                                matchStr += (age >= age_min && age <= age_max) ? "1" : "0";
                            }
                            //6.gender
                            let genderMatch = "0";
                            if (job.gender === 0) {
                              genderMatch = "1";
                            } else if (job.gender === jobber.gender) {
                              genderMatch = "1";
                            }
                            matchStr += genderMatch;
                            //7.year
                            matchStr += (parseInt(job.year_expe || 0) <= workYearExpe ? "1" : "0");
                            //8.edu
                            const jobber_edu_arr_int = jobber_edu_arr.map(e => parseInt(e));
                            matchStr += jobber_edu_arr_int.includes(parseInt(job.education_code)) ? "1" : "0";

                            // --- คำนวณเปอร์เซ็นต์ ---
                            const totalConds = matchStr.length + job_hs_arr.length + job_ss_arr.length;
                            const matchCount = matchStr.split('1').length - 1 + matched_hs_arr.length + matched_ss_arr.length;
                            const percent = totalConds > 0 ? Math.round((matchCount / totalConds) * 100) : 0;

                            // Convert matched hs/ss arrays to comma-separated strings
                            const hsStringMatched = matched_hs_arr.join(",");
                            const ssStringMatched = matched_ss_arr.join(",");

                            db.query(
                              `INSERT INTO tempWork (post_id, jobber_id, inter_work_id, position_id, hs, ss, matching, status)
                              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                              ON DUPLICATE KEY UPDATE matching = ?, status = ?`,
                              [
                                job.post_id,
                                jobber_id,
                                inter_work_id,
                                position_id,
                                hsStringMatched,
                                ssStringMatched,
                                matchStr,
                                "MATCHED",
                                matchStr,
                                "MATCHED"
                              ],
                              (err) => {
                                if (err) return console.error(err);
                                matchResults.push({
                                  post_id: job.post_id,
                                  position_name: job.position_name,
                                  percent,
                                  matchStr,
                                  matched_hs: matched_hs_arr,
                                  matched_ss: matched_ss_arr
                                });

                                // เพิ่มแจ้งเตือนเฉพาะ job ที่ match จริง (percent > 0)
                                if (percent => 0) {
                                  notifService.add({
                                    receiverRole: "jobber",
                                    receiverId: jobber_id,
                                    eventKey: "JOB_MATCHED",
                                    title: "มีงานที่ตรงกับคุณ!",
                                    body: `เราเจองาน \"${job.position_name}\" ที่ตรงกับคุณ มีความสอดคล้องอยู่ที่ ${percent}%`,
                                    postId: job.post_id,
                                    jobberId: jobber_id,
                                    employerId: job.emp_id,
                                    meta: { link: `/job_match?i=${job.post_id}&inter_work=${inter_work_id}&posi=${position_id}&percent=${percent}` },
                                    email: jobber.email
                                  }).catch(e => console.error("Notif jobber error:", e));
                                  notifService.add({
                                    receiverRole: "emp",
                                    receiverId: job.emp_id,
                                    eventKey: "CANDIDATE_MATCHED",
                                    title: "พบผู้สมัครที่ตรงกับงานของคุณ",
                                    body: `ผู้สมัคร \"${jobber.fullname}\" ตรงกับงาน \"${job.position_name}\ มีความสอดคล้องอยู่ที่ ${percent}%"`,
                                    postId: job.post_id,
                                    jobberId: jobber_id,
                                    employerId: job.emp_id,
                                    meta: { link: `/Emp_Job_Post?pi=${job.post_id}` },
                                    email: job.email
                                  }).catch(e => console.error("Notif employer error:", e));
                                }
//พอมีการเพิ่มงานที่สนใจลงไป มันกลายเป็นสมัครงานนั้นอยู่ด้วยทำไมละ
                                count++;
                                if (count === jobs.length) {
                                  console.log("Matching complete.");
                                  // ส่ง percent กลับใน response
                                  res.json({ success: true, message: "บันทึกสำเร็จ", matchResults });
                                }
                              }
                            );
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      } catch (err) {
        console.error("DB Error:", err);
        res.status(500).json({ success: false, message: "Something went wrong", error: err.message });
      }
});

app.post("/api/user_intervolun_add", upload.none(), async (req, res) => {
  const {
    jobber_id,
    voluntype_id,        // select
    start,
    end,
    days,
    ready_travel,
    health_limit,
    experience
            
  } = req.body;

  const daysString = Array.isArray(days) ? days.join(",") : days;

   try {
        const sql = `
          INSERT INTO interests_volun
          (jobber_id, voluntype_id, hours, end_hour, days, ready_travel, health_limit, experience, status) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ON' )
        `;

        


        const values = [
          jobber_id,
          voluntype_id,        // select
          start,
          end,
          days,
          ready_travel,
          health_limit,
          experience
        ];
      
        // console.log("📥 req.body = ", req.body);
        db.query(sql, values, (err, result) => {
          if (err) {
            console.error("DB Error:", err);
            return res.status(500).json({ success: false, message: "Database error", error: err.message });
          }

          //console.log("Insert Result:", result); // Debug
          res.json({ success: true, message: "บันทึกสำเร็จ" });
        });
      } catch (err) {
        console.error("DB Error:", err);
        res.status(500).json({ success: false, message: "Something went wrong", error: err.message });
      }
  
});

app.post("/api/user_interwork_update", upload.none(), async (req, res) => {
  const {
    inter_work_id,
    jobber_id,
    position_id,        // select
    min,
    max,
    start,
    end,
    days,
    tambon_id,
    ampher_id        
  } = req.body;

  
  const daysString = Array.isArray(days) ? days.join(",") : days;

   try {
        const sql = `
          UPDATE interests_work
          SET position_id= ?,salary_min= ?, salary_max= ?,hour= ?,end_hour= ?,days= ?, tambon_id = ?, ampher_id = ?
          WHERE inter_work_id = ?
        `;

        const values = [
          position_id,
          min,
          max,
          start,
          end,
          daysString,
          tambon_id,
          ampher_id,
          inter_work_id
        ];
        //console.log("📥 req.body = ", req.body);
        await new Promise((resolve, reject) => {
          db.query(sql, values, (err, result) => {
            if (err) return reject(err);
            resolve(result);
          });
        });

        try {
            // console.log("Start Re-Match for Jobber ID:", jobber_id);
            const rematchResult = await rematchJobber(jobber_id);
            // console.log("Rematch Result:", rematchResult);
            res.json({ success: true, message: "Profile updated and rematched", rematch: rematchResult });
          } catch (matchErr) {
            console.error("Re-Match Error:", matchErr);
            res.status(500).json({ success: false, message: "Profile updated but failed to rematch", error: matchErr.message });
          }
      } catch (err) {
        console.error("DB Error:", err);
        res.status(500).json({ success: false, message: "Something went wrong", error: err.message });
      }
  
});

app.post("/api/user_intervolun_update", upload.none(), async (req, res) => {
  const {
    inter_volun_id,
    jobber_id,
    voluntype_id,        // select
    start,
    end,
    days,
    ready_travel,
    health_limit,
    experience
            
  } = req.body;

  

   try {
        const sql = `
          UPDATE interests_volun
          SET voluntype_id= ?,hours= ?,end_hour= ?,days= ?,ready_travel= ?,health_limit= ?,experience= ?
          WHERE inter_volun_id = ?
        `;

        


        const values = [
          voluntype_id,        // select
          start,
          end,
          days,
          ready_travel,
          health_limit,
          experience,
          inter_volun_id
        ];
        // console.log("📥 req.body = ", req.body);
        db.query(sql, values, (err, result) => {
          if (err) {
            console.error("DB Error:", err);
            return res.status(500).json({ success: false, message: "Database error", error: err.message });
          }

          //console.log("Insert Result:", result); // Debug
          res.json({ success: true, message: "บันทึกสำเร็จ" });
        });
      } catch (err) {
        console.error("DB Error:", err);
        res.status(500).json({ success: false, message: "Something went wrong", error: err.message });
      }
  
});

app.get("/user_edudata", (req, res) => {
  const user_edu_id = req.query.user_edu_id;
  const data = "SELECT education_history.* FROM education_history  WHERE user_edu_id = ?";


  db.query(data, [user_edu_id], (err1, data) => {
    if (err1) {
      console.error("DB error:", err1);
      return res.status(500).json({ error: "Server error" });
    }
          res.json({
            data
            });
  });
});

app.get("/user_workexdata", (req, res) => {
  const no = req.query.no;
  const jobber_id = req.query.jobber_id;
  const data = "SELECT work_experience.* ,SUBSTRING_INDEX(duration, ' - ', 1) as start,SUBSTRING_INDEX(duration, ' - ', -1) as end, jobtype_id FROM work_experience LEFT JOIN position ON work_experience.position_id = position.position_id WHERE no = ? AND jobber_id = ?";


  db.query(data, [no , jobber_id], (err1, data) => {
    if (err1) {
      console.error("DB error:", err1);
      return res.status(500).json({ error: "Server error" });
    }
          res.json({
            data
            });
  });
});

app.get("/user_interworkdata", (req, res) => {
  const inter_work_id = req.query.inter_work_id;
  const data = "SELECT interests_work.* , jobtype_id FROM interests_work  LEFT JOIN position ON interests_work.position_id = position.position_id  WHERE inter_work_id =   ?";


  db.query(data, [inter_work_id], (err1, data) => {
    if (err1) {
      console.error("DB error:", err1);
      return res.status(500).json({ error: "Server error" });
    }
          res.json({
            data
            });
  });
});

app.get("/user_intervolundata", (req, res) => {
  const inter_volun_id = req.query.inter_volun_id;
  const data = "SELECT interests_volun.* FROM interests_volun WHERE inter_volun_id = ?";


  db.query(data, [inter_volun_id], (err1, data) => {
    if (err1) {
      console.error("DB error:", err1);
      return res.status(500).json({ error: "Server error" });
    }
          res.json({
            data
            });
  });
});

app.get("/emp_address", (req, res) => {
  const emp_id = req.query.emp_id;
  const data = "SELECT address , tambon_id , latitude , longitude FROM employer WHERE emp_id = ?";


  db.query(data, [emp_id], (err1, data) => {
    if (err1) {
      console.error("DB error:", err1);
      return res.status(500).json({ error: "Server error" });
    }
          res.json({
            data
            });
  });
});

app.get("/emp_benefit", (req, res) => {
  const emp_id = req.query.emp_id;
  const data = "SELECT benefits FROM employer WHERE emp_id = ?";


  db.query(data, [emp_id], (err1, data) => {
    if (err1) {
      console.error("DB error:", err1);
      return res.status(500).json({ error: "Server error" });
    }
          res.json({
            data
            });
  });
});

app.get("/emp_contact", (req, res) => {
  const emp_id = req.query.emp_id;
  const data = "SELECT phone , email FROM employer WHERE emp_id = ?";


  db.query(data, [emp_id], (err1, data) => {
    if (err1) {
      console.error("DB error:", err1);
      return res.status(500).json({ error: "Server error" });
    }
          res.json({
            data
            });
  });
});

app.post("/api/user_edu_update", upload.single("file"), async (req, res) => {
  const { jobber_id, edu_id, user_edu_id, institution, major, year_graduat, grade } = req.body;
  const old_file = req.body.old_file || null;

  let fileNameToUse = old_file;

  if (req.file) {
    // ถ้าอัปโหลดใหม่
    fileNameToUse = req.file.filename;

    // (Optional) ลบไฟล์เก่าออกจาก disk
    
    if (req.body.old_file) {
      const oldPath = `uploads/user_file/${req.body.old_file}`;
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
  }
  let sql, values;

  if (parseInt(edu_id) === 0) {
    // ถ้าเลือก "ไม่มีวุฒิการศึกษา"
    sql = `
      UPDATE education_history
      SET edu_id=?, institution='', major='', year_graduat='', grade='', edu_cert=''
      WHERE user_edu_id=?
    `;
    values = [0, user_edu_id];
  } else {
    // กรอกข้อมูลตามปกติ
    sql = `
      UPDATE education_history
      SET edu_id=?, institution=?, major=?, year_graduat=?, grade=?, edu_cert=?
      WHERE user_edu_id=?
    `;
    values = [edu_id, institution, major, year_graduat, grade, fileNameToUse, user_edu_id];
  }
  await new Promise((resolve, reject) => {
      db.query(sql, values, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    try {
        // console.log("Start Re-Match for Jobber ID:", jobber_id);
        const rematchResult = await rematchJobber(jobber_id);
        // console.log("Rematch Result:", rematchResult);
        res.json({ success: true, message: "Profile updated and rematched", rematch: rematchResult });
      } catch (matchErr) {
        console.error("Re-Match Error:", matchErr);
        res.status(500).json({ success: false, message: "Profile updated but failed to rematch", error: matchErr.message });
      }
});

app.delete("/user_edu/:user_edu_id", (req, res) => {
    const { user_edu_id } = req.params;
    db.query("SELECT jobber_id FROM education_history WHERE user_edu_id = ?", [user_edu_id], (err, rows) => {
      if (err || rows.length === 0) return res.status(500).json({ error: "Error or not found" });

      const jobber_id = rows[0].jobber_id;

      db.query("DELETE FROM education_history WHERE user_edu_id = ?", [user_edu_id], async (err2, result) => {
        if (err2) return res.status(500).json({ error: err2.message });

        try {
          const rematchResult = await rematchJobber(jobber_id);
          res.json({ message: "ลบสำเร็จและ Rematch แล้ว", rematch: rematchResult });
        } catch (e) {
          res.status(500).json({ message: "ลบแล้วแต่ Rematch ล้มเหลว", error: e.message });
        }
      });
    });
  });

app.delete("/user_interwork/:inter_work_id", async  (req, res) => {
    const { inter_work_id } = req.params;
    db.query("SELECT jobber_id FROM interests_work WHERE inter_work_id = ?", [inter_work_id], (err, rows) => {
      if (err || rows.length === 0) return res.status(500).json({ error: "Error or not found" });

      const jobber_id = rows[0].jobber_id;

      db.query("DELETE FROM interests_work WHERE inter_work_id = ?", [inter_work_id], async (err2, result) => {
        if (err2) return res.status(500).json({ error: err2.message });

        try {
          const rematchResult = await rematchJobber(jobber_id);
          res.json({ message: "ลบสำเร็จและ Rematch แล้ว", rematch: rematchResult });
        } catch (e) {
          res.status(500).json({ message: "ลบแล้วแต่ Rematch ล้มเหลว", error: e.message });
        }
      });
    });
  });

app.delete("/user_intervolun/:inter_volun_id", (req, res) => {
    const { inter_volun_id } = req.params;
    const sql = "DELETE FROM interests_volun WHERE inter_volun_id = ?";
    db.query(sql, [inter_volun_id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "ลบข้อมูลสำเร็จ!" });
    });
  });

app.delete("/user_hardskill/", (req, res) => {
    const { hardskill_id ,jobber_id } = req.query;
    db.query("DELETE FROM jobber_hs WHERE hardskill_id = ? AND jobber_id = ?", [hardskill_id ,jobber_id], async (err2, result) => {
        if (err2) return res.status(500).json({ error: err2.message });

        try {
          const rematchResult = await rematchJobber(jobber_id);
          res.json({ message: "ลบสำเร็จและ Rematch แล้ว", rematch: rematchResult });
        } catch (e) {
          res.status(500).json({ message: "ลบแล้วแต่ Rematch ล้มเหลว", error: e.message });
        }
      });
  }); 

app.delete("/user_softskill/", (req, res) => {
    const { softskill_id ,jobber_id } = req.query;
    db.query("DELETE FROM jobber_ss WHERE softskill_id = ? AND jobber_id = ?", [softskill_id ,jobber_id], async (err2, result) => {
        if (err2) return res.status(500).json({ error: err2.message });

        try {
          const rematchResult = await rematchJobber(jobber_id);
          res.json({ message: "ลบสำเร็จและ Rematch แล้ว", rematch: rematchResult });
        } catch (e) {
          res.status(500).json({ message: "ลบแล้วแต่ Rematch ล้มเหลว", error: e.message });
        }
      });
  }); 

app.post("/api/user_workex_update", upload.single("file"), async (req, res) => {
  const { jobber_id,
    no,
    position_id,        // select
    company,
    start,
    end,
    job_description, } = req.body;
  const old_file = req.body.old_file || null;

  let fileNameToUse = old_file;

  if (req.file) {
    // ถ้าอัปโหลดใหม่
    fileNameToUse = req.file.filename;

    // (Optional) ลบไฟล์เก่าออกจาก disk
    
    if (req.body.old_file) {
      const oldPath = `uploads/user_workfile/${req.body.old_file}`;
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
  }

  // บันทึกข้อมูลในฐานข้อมูล รวมถึงชื่อไฟล์ fileNameToUse
  const sql = `
    UPDATE work_experience
    SET position_id= ?,company= ?,duration= ?,job_description= ?,work_certificate= ?
    WHERE no = ? AND jobber_id =?
  `;
  const duration = `${start} - ${end}`;
  const values = [position_id, company, duration, job_description, fileNameToUse, no,  jobber_id];

  db.query(sql, values, async (err, result) => {
    if (err) return res.status(500).json({ error: "DB error" });
    //return res.status(200).json({ message: "อัปเดตสำเร็จ" });
    try {
          const rematchResult = await rematchJobber(jobber_id);
          res.json({ message: "ลบสำเร็จและ Rematch แล้ว", rematch: rematchResult });
        } catch (e) {
          res.status(500).json({ message: "ลบแล้วแต่ Rematch ล้มเหลว", error: e.message });
        }
  });
});

app.delete("/user_workex/:no/:jobber_id", (req, res) => {
    const { no , jobber_id } = req.params;
    //console.log(no , jobber_id);
      db.query("DELETE FROM work_experience WHERE no = ? AND jobber_id =?", [no , jobber_id], async (err2, result) => {
        if (err2) return res.status(500).json({ error: err2.message });

        try {
          const rematchResult = await rematchJobber(jobber_id);
          res.json({ message: "ลบสำเร็จและ Rematch แล้ว", rematch: rematchResult });
        } catch (e) {
          res.status(500).json({ message: "ลบแล้วแต่ Rematch ล้มเหลว", error: e.message });
        }
      });
    
  });

const rematchJobber = (jobber_id) => {
  return new Promise((resolve, reject) => {
    db.query(`SELECT * FROM interests_work WHERE jobber_id = ? AND status = 'ON'`, [jobber_id], (err, interWorkRows) => {
      if (err) return reject({ success: false, message: "Error fetching interests_work", error: err.message });
      if (interWorkRows.length === 0) {
        // ✅ ไม่ถือว่าเป็น error ให้ resolve แทน
        return resolve({
          success: true,
          message: "No active interests_work found. Skipped matching."
        });
      }
      // ไม่ต้องใช้ interWorkRows[0] แล้ว
      // Loop ทุก interWork ไปทำ matching
      processAllInterests(jobber_id, interWorkRows)
        .then(() => resolve({ success: true, message: "Re-Matching complete for all interests" }))
        .catch(err => reject({ success: false, message: "Error during matching", error: err.message }));
    });
  });

};

const processAllInterests  = (jobber_id, interWorkRows) => {
  return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM jobber WHERE jobber_id = ?`, [jobber_id], (err, jobberRows) => {
        if (err) return reject({ success: false, message: "Error fetching jobber", error: err.message });

        const jobber = jobberRows[0];
        if (!jobber) return reject({ success: false, message: "Jobber not found" });

        db.query(`SELECT hardskill_id FROM jobber_hs WHERE jobber_id = ?`, [jobber_id], (err, jobber_hs) => {
          if (err) return reject({ success: false, message: "Error fetching jobber_hs", error: err.message });
          const jobber_hs_arr = jobber_hs.map(item => item.hardskill_id);

          db.query(`SELECT softskill_id FROM jobber_ss WHERE jobber_id = ?`, [jobber_id], (err, jobber_ss) => {
            if (err) return reject({ success: false, message: "Error fetching jobber_ss", error: err.message });
            const jobber_ss_arr = jobber_ss.map(item => item.softskill_id);

            db.query(`SELECT edu_id FROM education_history WHERE jobber_id = ?`, [jobber_id], (err, edu) => {
              if (err) return reject({ success: false, message: "Error fetching education_history", error: err.message });
              const jobber_edu_arr = edu.map(item => parseInt(item.edu_id));

              const processPromises = interWorkRows.map(interWork => {
                return new Promise((resolveInterest, rejectInterest) => {
                  db.query(`SELECT * FROM work_experience WHERE jobber_id = ? AND position_id = ?`, [jobber_id, interWork.position_id], (err, workExResults) => {
                    if (err) return reject({ success: false, message: "Error fetching work_experience", error: err.message });
                    console.log("interWork.position_id:", interWork.position_id);
                    // Check missing data
                    const missingData = {
                      hardskills: jobber_hs_arr.length === 0,
                      softskills: jobber_ss_arr.length === 0,
                      education: jobber_edu_arr.length === 0,
                      work_experience: workExResults.length === 0
                    };

                    if (missingData.hardskills || missingData.softskills || missingData.education || missingData.work_experience) {
                      return resolve({ success: false, message: "กรอกข้อมูลให้ครบเพื่อเริ่มการจับคู่", missing: missingData });
                    }

                    // ลบ tempWork เดิมก่อน
                    db.query(`DELETE FROM tempWork WHERE jobber_id = ?`, [jobber_id], (err) => {
                      console.log("มามั้ยยังไงอ๊ากกกกก",jobber_id);
                      if (err) return reject({ success: false, message: "Error deleting tempWork", error: err.message });

                      // Proceed to Matching
                      performMatching(jobber, interWork, jobber_hs_arr, jobber_ss_arr, jobber_edu_arr, workExResults)
                        .then(() => resolveInterest())
                        .catch(err => rejectInterest(err));
                    });
                  });
                });
              });
               Promise.all(processPromises)
              .then(() => resolve())
              .catch(reject);
          });
        });
      });
    });
  });
};

const performMatching = (jobber, interWork, jobber_hs_arr, jobber_ss_arr, jobber_edu_arr, workExResults) => {
  return new Promise((resolve, reject) => {

    console.log("เข้ามานี่แล้ว",interWork);
    // console.log("Jobber Data:", {
    //   jobber_id: jobber.jobber_id,
    //   birthday: jobber.birthday,
    //   gender: jobber.gender,
    //   LG: jobber.LG
    // });
    // console.log("InterWork Data:", {
    //   inter_work_id: interWork.inter_work_id,
    //   position_id: interWork.position_id,
    //   salary_min: interWork.salary_min,
    //   salary_max: interWork.salary_max,
    //   ampher_id: interWork.ampher_id,
    //   tambon_id: interWork.tambon_id,
    //   hour: interWork.hour,
    //   end_hour: interWork.end_hour,
    //   days: interWork.days
    // });
    
    // console.log("Work Experience Data (Raw):", workExResults);
    
    const age = dayjs().diff(dayjs(jobber.birthday), "year");
    const daysString = interWork.days;
    const ampher_id = interWork.ampher_id;
    const tambon_id = interWork.tambon_id;
    const min = interWork.salary_min;
    const max = interWork.salary_max;
    const start = interWork.hour;
    const end = interWork.end_hour;
    // console.log("Matching Criteria:", {
    //   daysString,
    //   ampher_id,
    //   tambon_id,
    //   salary_min: min,
    //   salary_max: max,
    //   hour_start: start,
    //   hour_end: end
    // });
    let totalMonths = 0;
    workExResults.forEach(work => {
      const [startStr, endStr] = work.duration.split(" - ");
      const start = dayjs(startStr, "YYYY-MM");
      const end = dayjs(endStr, "YYYY-MM");
      if (start.isValid() && end.isValid()) {
        totalMonths += end.diff(start, 'month', true);
      }
    });
    const workYearExpe = parseFloat((totalMonths / 12).toFixed(1));
// console.log("interWork.position_id:", interWork.position_id);

    db.query(`SELECT job_posting.* , position_name , employer.email , ampher_id 
      FROM job_posting LEFT JOIN employer ON job_posting.emp_id = employer.emp_id 
      LEFT JOIN position ON job_posting.position_code = position.position_id 
      LEFT JOIN tambon ON job_posting.tambon_id = tambon.tambon_id 
      LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id 
      WHERE job_posting.status = 'ON' AND position_code = ?`, 
          [interWork.position_id], 
          (err, jobs) => {
            console.log("มาถึง query ตรงนี้แล้ว"); //<-- debug ตรงนี้
            if (err) return reject(err);
            // console.log("Found job_posting:", jobs.length);

      let count = 0;
      if (jobs.length === 0) return resolve();

      const insertPromises = jobs.map(job => {
        return new Promise((resolveJob, rejectJob) => {
          db.query(`SELECT hardskill_id FROM job_need_hs WHERE post_id = ?`, [job.post_id], (err, jobHS) => {
            if (err) return rejectJob(err);

            db.query(`SELECT softskill_id FROM job_need_ss WHERE post_id = ?`, [job.post_id], (err, jobSS) => {
              if (err) return rejectJob(err);

              const job_hs_arr = jobHS.map(item => item.hardskill_id);
              const job_ss_arr = jobSS.map(item => item.softskill_id);

              const matched_hs_arr = job_hs_arr.filter(hs => jobber_hs_arr.includes(hs));
              const matched_ss_arr = job_ss_arr.filter(ss => jobber_ss_arr.includes(ss));

              let matchStr = "";

              // matchStr += (parseInt(job.salary) >= parseInt(min) && parseInt(job.salary) <= parseInt(max)) ? "1" : "0";
              let jobSalaryMin = 0;
              let jobSalaryMax = 0;

              if (job.salary && job.salary.includes("-")) {
                const [minStr, maxStr] = job.salary.split("-");
                jobSalaryMin = parseInt(minStr) || 0;
                jobSalaryMax = parseInt(maxStr) || 0;
              } else {
                // "15000"
                jobSalaryMin = parseInt(job.salary) || 0;
                jobSalaryMax = jobSalaryMin;
              }

              const jobberMin = parseInt(min) || 0;
              const jobberMax = parseInt(max) || 0;

              let salaryMatch = "0";
              if (jobberMin && jobberMax) {
                if (jobSalaryMax >= jobberMin && jobSalaryMin <= jobberMax) {
                  salaryMatch = "1";
                }
              } else if (jobberMin) {
                if (jobSalaryMax >= jobberMin) {
                  salaryMatch = "1";
                }
              } else if (jobberMax) {
                if (jobSalaryMin <= jobberMax) {
                  salaryMatch = "1";
                }
              } else {
                salaryMatch = "1"; // ถ้าjobber ไม่ได้กำหนดเงินเดือน ให้ผ่าน
              }

              matchStr += salaryMatch;
              const jobberTimeStart = interWork.hour;
              const jobberTimeEnd = interWork.end_hour;
              const jobTimeStart = job.hour;
              const jobTimeEnd = job.end_hour;

              if (jobberTimeStart && jobberTimeEnd && jobTimeStart && jobTimeEnd) {
                
                const jobberStart = dayjs(jobberTimeStart, 'HH:mm');
                const jobberEnd = dayjs(jobberTimeEnd, 'HH:mm');
                const jobStart = dayjs(jobTimeStart, 'HH:mm');
                const jobEnd = dayjs(jobTimeEnd, 'HH:mm');

                const isValid =
                  jobberStart.isValid() &&
                  jobberEnd.isValid() &&
                  jobStart.isValid() &&
                  jobEnd.isValid();

                if (isValid) {
                  const isTimeMatch =
                    jobberStart.isSameOrBefore(jobStart) &&
                    jobberEnd.isSameOrAfter(jobEnd);
                  matchStr += isTimeMatch ? "1" : "0";
                } else {
                  matchStr += "0";
                }
              } else {
                matchStr += "1"; // ให้ผ่านเวลาเสมอ
              }

              const jobDaysArr = job.days.split('').map(d => parseInt(d));
              const userDaysArr = daysString.split('').map(d => parseInt(d));

              let isDaysMatch = true;
              for (let i = 0; i < 7; i++) {
                if (jobDaysArr[i] === 1 && userDaysArr[i] !== 1) {
                  isDaysMatch = false;
                  break;
                }
              }
              matchStr += isDaysMatch ? "1" : "0";

              let locationMatch = "0";

                            if (!ampher_id || ampher_id == 0) {
                                locationMatch = "1";
                            } else {
                                const jobAmpherId = parseInt(job.ampher_id);
                                const jobTambonId = parseInt(job.tambon_id);

                                if (parseInt(ampher_id) === jobAmpherId) {
                                    if (!tambon_id || tambon_id == 0) {
                                        locationMatch = "1";
                                    } else {
                                        if (parseInt(tambon_id) === jobTambonId) {
                                            locationMatch = "1";
                                        }
                                    }
                                }
                            }

                            matchStr += locationMatch;

              let age_min = 0;
              let age_max = 0;

              if (job.age) {
                  const [minStr, maxStr] = job.age.split('-');
                  age_min = parseInt(minStr) || 0;
                  age_max = parseInt(maxStr) || 0;
              }

              if (age_min === 0 && age_max === 0) {
                  matchStr += "1";
              } else if (age_min === 0) {
                  matchStr += (age <= age_max) ? "1" : "0";
              } else if (age_max === 0) {
                  matchStr += (age >= age_min) ? "1" : "0";
              } else {
                  matchStr += (age >= age_min && age <= age_max) ? "1" : "0";
              }


              let genderMatch = "0";

              if (job.gender === 0) {
                genderMatch = "1";
              } else if (job.gender === jobber.gender) {
                genderMatch = "1";
              }

              matchStr += genderMatch;

              matchStr += (parseInt(job.year_expe || 0) <= workYearExpe ? "1" : "0");
              matchStr += jobber_edu_arr.includes(parseInt(job.education_code)) ? "1" : "0";

              const hsStringMatched = matched_hs_arr.join(",");
              const ssStringMatched = matched_ss_arr.join(",");
console.log("Matching Job Post:", job.post_id, "Match String:", matchStr, "HS:", matched_hs_arr.length, "SS:", matched_ss_arr.length);

//               console.log("========== Matching Job ==========");
// console.log("โพสต์:", job.post_id);
// console.log("ตำแหน่ง:", job.position_code, "เทียบกับ", interWork.position_id);
// console.log("เงินเดือน:", job.salary, "เทียบกับ ช่วง", min, "-", max);
// console.log("เวลาโพสต์:", job.hour, "-", job.end_hour, "เทียบกับของผู้สมัคร:", start, "-", end);
// console.log("วันที่ทำงาน:", job.days, "เทียบกับ", daysString);
// console.log("ที่ตั้ง:", `อำเภอ ${job.ampher_id}, ตำบล ${job.tambon_id}`, "เทียบกับ", `อำเภอ ${ampher_id}, ตำบล ${tambon_id}`);
// console.log("อายุที่รับ:", job.age || "ไม่ระบุ", "เทียบกับอายุ:", age);
// console.log("เพศที่รับ:", job.gender || "ไม่ระบุ", "เทียบกับเพศผู้สมัคร:", jobber.gender);
// console.log("ปีประสบการณ์ที่ต้องการ:", job.year_expe, "เทียบกับของผู้สมัคร:", workYearExpe);
// console.log("ระดับการศึกษาที่ต้องการ:", job.education_code, "เทียบกับของผู้สมัคร:", jobber_edu_arr);
// console.log("Hard Skills (Job):", jobHS.map(e => e.hardskill_id).join(","));
// console.log("Hard Skills (User):", jobber_hs_arr.join(","));
// console.log("Matched HS:", matched_hs_arr.join(","));
// console.log("Soft Skills (Job):", jobSS.map(e => e.softskill_id).join(","));
// console.log("Soft Skills (User):", jobber_ss_arr.join(","));
// console.log("Matched SS:", matched_ss_arr.join(","));
// console.log("Match Result String:", matchStr);
// console.log("==================================");
                            // --- คำนวณเปอร์เซ็นต์ ---
                            const totalConds = matchStr.length + job_hs_arr.length + job_ss_arr.length;
                            const matchCount = matchStr.split('1').length - 1 + matched_hs_arr.length + matched_ss_arr.length;
                            const percent = totalConds > 0 ? Math.round((matchCount / totalConds) * 100) : 0;

              db.query(
                `INSERT INTO tempWork (post_id, jobber_id, inter_work_id, position_id, hs, ss, matching, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE matching = ?, status = ?`,
                [
                  job.post_id,
                  jobber.jobber_id,
                  interWork.inter_work_id,
                  interWork.position_id,
                  hsStringMatched,
                  ssStringMatched,
                  matchStr,
                  "MATCHED",
                  matchStr,
                  "MATCHED"
                ],
                (err) => {
                  if (err) return rejectJob(err);
                  // เพิ่มแจ้งเตือนหลังจับคู่สำเร็จ (percent >= 0)
                  // หมายเหตุ: ถ้าต้องการเฉพาะ match จริง ให้เปลี่ยนเป็น percent > 0
                  if (percent > 0) {
                    notifService.add({
                      receiverRole: "jobber",
                      receiverId: jobber.jobber_id,
                      eventKey: "JOB_MATCHED",
                      title: "มีงานที่ตรงกับคุณ!",
                      body: `เราเจองาน \"${job.position_name}\" ที่ตรงกับคุณ มีความสอดคล้องอยู่ที่ ${percent}%`,
                      postId: job.post_id,
                      jobberId: jobber.jobber_id,
                      employerId: job.emp_id,
                      meta: { link: `/job_match?i=${job.post_id}&inter_work=${interWork.inter_work_id}&posi=${interWork.position_id}&percent=${percent}` },
                      email: jobber.email
                    }).catch(e => console.error("Notif jobber error:", e));
                    notifService.add({
                      receiverRole: "emp",
                      receiverId: job.emp_id,
                      eventKey: "CANDIDATE_MATCHED",
                      title: "พบผู้สมัครที่ตรงกับงานของคุณ",
                      body: `ผู้สมัคร \"${jobber.fullname}\" ตรงกับงาน \"${job.position_name}\" มีความสอดคล้องอยู่ที่ ${percent}%`,
                      postId: job.post_id,
                      jobberId: jobber.jobber_id,
                      employerId: job.emp_id,
                      meta: { link: `/Emp_Job_Post?pi=${job.post_id}` },
                      email: job.email
                    }).catch(e => console.error("Notif employer error:", e));
                  } else {
                    notifService.add({
                      receiverRole: "jobber",
                      receiverId: jobber.jobber_id,
                      eventKey: "JOB_MATCHED",
                      title: "มีงานที่คุณอยากทำ!",
                      body: `เราเจองาน \"${job.position_name}\" ที่ตรงกับงานที่คุณลงไว้`,
                      postId: job.post_id,
                      jobberId: jobber.jobber_id,
                      employerId: job.emp_id,
                      meta: { link: `/job_match?i=${job.post_id}&inter_work=${interWork.inter_work_id}&posi=${interWork.position_id}&percent=${percent}` },
                      email: jobber.email
                    }).catch(e => console.error("Notif jobber error:", e));
                    notifService.add({
                      receiverRole: "emp",
                      receiverId: job.emp_id,
                      eventKey: "CANDIDATE_MATCHED",
                      title: "พบผู้สมัครที่สมัครงานตำแหน่งตรงกับงานของคุณ",
                      body: `ผู้สมัคร \"${jobber.fullname}\" ตรงกับงาน \"${job.position_name}\" แต่อาจจะมีคุณสมบัติไม่ค่อยตรง`,
                      postId: job.post_id,
                      jobberId: jobber.jobber_id,
                      employerId: job.emp_id,
                      meta: { link: `/Emp_Job_Post?pi=${job.post_id}` },
                      email: job.email
                    }).catch(e => console.error("Notif employer error:", e));
                  }
                  resolveJob(); // <-- Important
                }
              );
            });
          });
        });
      });

      Promise.all(insertPromises)
        .then(() => resolve())
        .catch(reject);
    });
  });
};

const rematchEmp = (post_id , position_code) => {
  return new Promise((resolve, reject) => {
    db.query(`SELECT * FROM interests_work WHERE position_id = ? AND status = 'ON'`,[position_code] , (err, interWorkRows) => {
      if (err) return reject({ success: false, message: "Error fetching interests_work", error: err.message });
      if (interWorkRows.length === 0) {
        // ✅ ไม่ถือว่าเป็น error ให้ resolve แทน
        return resolve({
          success: true,
          message: "No active interests_work found. Skipped matching."
        });
      }
      // ไม่ต้องใช้ interWorkRows[0] แล้ว
      // Loop ทุก interWork ไปทำ matching
      processAllInterestsEmp(post_id , interWorkRows)
        .then(() => resolve({ success: true, message: "Re-Matching complete for all interests" }))
        .catch(err => reject({ success: false, message: "Error during matching", error: err.message }));
    });
  });

};

const processAllInterestsEmp  = (post_id ,interWorkRows) => {
  return new Promise((resolve, reject) => {
    const processPromisesEmp = interWorkRows.map(interWork => {
      return new Promise((resolveInterest, rejectInterest) => {
        const jobber_id = interWork.jobber_id; 
        if (!jobber_id) return resolveInterest({ success: false, message: 'jobber_id missing', interWork });

        db.query(`SELECT * FROM jobber WHERE jobber_id = ?`, [jobber_id], (err, jobberRows) => {
          if (err) return reject({ success: false, message: "Error fetching jobber", error: err.message });

          const jobber = jobberRows[0];
          if (!jobber) return reject({ success: false, message: "Jobber not found" });

          db.query(`SELECT hardskill_id FROM jobber_hs WHERE jobber_id = ?`, [jobber_id], (err, jobber_hs) => {
            if (err) return reject({ success: false, message: "Error fetching jobber_hs", error: err.message });
            const jobber_hs_arr = jobber_hs.map(item => item.hardskill_id);

            db.query(`SELECT softskill_id FROM jobber_ss WHERE jobber_id = ?`, [jobber_id], (err, jobber_ss) => {
              if (err) return reject({ success: false, message: "Error fetching jobber_ss", error: err.message });
              const jobber_ss_arr = jobber_ss.map(item => item.softskill_id);

              db.query(`SELECT edu_id FROM education_history WHERE jobber_id = ?`, [jobber_id], (err, edu) => {
                if (err) return reject({ success: false, message: "Error fetching education_history", error: err.message });
                const jobber_edu_arr = edu.map(item => parseInt(item.edu_id));

                    db.query(`SELECT * FROM work_experience WHERE jobber_id = ? AND position_id = ?`, [jobber_id, interWork.position_id], (err, workExResults) => {
                      if (err) return reject({ success: false, message: "Error fetching work_experience", error: err.message });
                      //console.log("interWork.position_id:", interWork.position_id);
                      // Check missing data
                      const missingData = {
                        hardskills: jobber_hs_arr.length === 0,
                        softskills: jobber_ss_arr.length === 0,
                        education: jobber_edu_arr.length === 0,
                        work_experience: workExResults.length === 0
                      };

                      if (missingData.hardskills || missingData.softskills || missingData.education || missingData.work_experience) {
                        return resolve({ success: false, message: "กรอกข้อมูลให้ครบเพื่อเริ่มการจับคู่", missing: missingData });
                      }

                      // ลบ tempWork เดิมก่อน
                      db.query(`DELETE FROM tempWork WHERE post_id = ?`, [post_id], (err) => {
                        // console.log("ลบการจับคู่ของโพสต์นี้ เอาหน่อยดิ",post_id);
                        if (err) return reject({ success: false, message: "Error deleting tempWork", error: err.message });

                        // Proceed to Matching
                        performMatchingEmp(post_id, jobber, interWork, jobber_hs_arr, jobber_ss_arr, jobber_edu_arr, workExResults)
                          .then(() => resolveInterest())
                          .catch(err => rejectInterest(err));
                      });
                    });
                  });
                });
              });
            });
          });
        });
      Promise.all(processPromisesEmp)
      .then(() => resolve())
      .catch(reject);
  });
};

const performMatchingEmp = (post_id, jobber, interWork, jobber_hs_arr, jobber_ss_arr, jobber_edu_arr, workExResults) => {
  return new Promise((resolve, reject) => {

    // console.log("เข้ามานี่แล้ว",interWork);
    // console.log("Jobber Data:", {
    //   jobber_id: jobber.jobber_id,
    //   birthday: jobber.birthday,
    //   gender: jobber.gender,
    //   LG: jobber.LG
    // });
    // console.log("InterWork Data:", {
    //   inter_work_id: interWork.inter_work_id,
    //   position_id: interWork.position_id,
    //   salary_min: interWork.salary_min,
    //   salary_max: interWork.salary_max,
    //   ampher_id: interWork.ampher_id,
    //   tambon_id: interWork.tambon_id,
    //   hour: interWork.hour,
    //   end_hour: interWork.end_hour,
    //   days: interWork.days
    // });
    
    // console.log("Work Experience Data (Raw):", workExResults);
    
    const age = dayjs().diff(dayjs(jobber.birthday), "year");
    const daysString = interWork.days;
    const ampher_id = interWork.ampher_id;
    const tambon_id = interWork.tambon_id;
    const min = interWork.salary_min;
    const max = interWork.salary_max;
    const start = interWork.hour;
    const end = interWork.end_hour;
    // console.log("Matching Criteria:", {
    //   daysString,
    //   ampher_id,
    //   tambon_id,
    //   salary_min: min,
    //   salary_max: max,
    //   hour_start: start,
    //   hour_end: end
    // });
    let totalMonths = 0;
    workExResults.forEach(work => {
      const [startStr, endStr] = work.duration.split(" - ");
      const start = dayjs(startStr, "YYYY-MM");
      const end = dayjs(endStr, "YYYY-MM");
      if (start.isValid() && end.isValid()) {
        totalMonths += end.diff(start, 'month', true);
      }
    });
    const workYearExpe = parseFloat((totalMonths / 12).toFixed(1));
  // console.log("interWork.position_id:", interWork.position_id);

    db.query(`SELECT job_posting.* , position_name , employer.email , ampher_id 
      FROM job_posting LEFT JOIN employer ON job_posting.emp_id = employer.emp_id 
      LEFT JOIN position ON job_posting.position_code = position.position_id 
      LEFT JOIN tambon ON job_posting.tambon_id = tambon.tambon_id 
      LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id 
      WHERE job_posting.status = 'ON' AND position_code = ? AND post_id = ?`, 
          [interWork.position_id , post_id], 
          (err, jobs) => {
            // console.log("มาถึง query ตรงนี้แล้ว"); //<-- debug ตรงนี้
            if (err) return reject(err);
            // console.log("Found job_posting:", jobs.length);

      let count = 0;
      if (jobs.length === 0) return resolve();
        const job = jobs[0];

          db.query(`SELECT hardskill_id FROM job_need_hs WHERE post_id = ?`, [job.post_id], (err, jobHS) => {
            if (err) return reject(err);

            db.query(`SELECT softskill_id FROM job_need_ss WHERE post_id = ?`, [job.post_id], (err, jobSS) => {
              if (err) return reject(err);

              const job_hs_arr = jobHS.map(item => item.hardskill_id);
              const job_ss_arr = jobSS.map(item => item.softskill_id);

              const matched_hs_arr = job_hs_arr.filter(hs => jobber_hs_arr.includes(hs));
              const matched_ss_arr = job_ss_arr.filter(ss => jobber_ss_arr.includes(ss));

              let matchStr = "";

              // matchStr += (parseInt(job.salary) >= parseInt(min) && parseInt(job.salary) <= parseInt(max)) ? "1" : "0";
              let jobSalaryMin = 0;
              let jobSalaryMax = 0;

              if (job.salary && job.salary.includes("-")) {
                const [minStr, maxStr] = job.salary.split("-");
                jobSalaryMin = parseInt(minStr) || 0;
                jobSalaryMax = parseInt(maxStr) || 0;
              } else {
                // "15000"
                jobSalaryMin = parseInt(job.salary) || 0;
                jobSalaryMax = jobSalaryMin;
              }

              const jobberMin = parseInt(min) || 0;
              const jobberMax = parseInt(max) || 0;

              let salaryMatch = "0";
              if (jobberMin && jobberMax) {
                if (jobSalaryMax >= jobberMin && jobSalaryMin <= jobberMax) {
                  salaryMatch = "1";
                }
              } else if (jobberMin) {
                if (jobSalaryMax >= jobberMin) {
                  salaryMatch = "1";
                }
              } else if (jobberMax) {
                if (jobSalaryMin <= jobberMax) {
                  salaryMatch = "1";
                }
              } else {
                salaryMatch = "1"; // ถ้าjobber ไม่ได้กำหนดเงินเดือน ให้ผ่าน
              }

              matchStr += salaryMatch;

              //แก้การแมทด้วย เรื่องเงินเดือน ไปแก้ฝั่งผู้สมัครงานด้วย 
              const jobberTimeStart = interWork.hour;
              const jobberTimeEnd = interWork.end_hour;
              const jobTimeStart = job.hour;
              const jobTimeEnd = job.end_hour;

              if (jobberTimeStart && jobberTimeEnd && jobTimeStart && jobTimeEnd) {
                
                const jobberStart = dayjs(jobberTimeStart, 'HH:mm');
                const jobberEnd = dayjs(jobberTimeEnd, 'HH:mm');
                const jobStart = dayjs(jobTimeStart, 'HH:mm');
                const jobEnd = dayjs(jobTimeEnd, 'HH:mm');

                const isValid =
                  jobberStart.isValid() &&
                  jobberEnd.isValid() &&
                  jobStart.isValid() &&
                  jobEnd.isValid();

                if (isValid) {
                  const isTimeMatch =
                    jobberStart.isSameOrBefore(jobStart) &&
                    jobberEnd.isSameOrAfter(jobEnd);
                  matchStr += isTimeMatch ? "1" : "0";
                } else {
                  matchStr += "0";
                }
              } else {
                matchStr += "1"; // ให้ผ่านเวลาเสมอ
              }

              const jobDaysArr = job.days.split('').map(d => parseInt(d));
              const userDaysArr = daysString.split('').map(d => parseInt(d));

              let isDaysMatch = true;
              for (let i = 0; i < 7; i++) {
                if (jobDaysArr[i] === 1 && userDaysArr[i] !== 1) {
                  isDaysMatch = false;
                  break;
                }
              }
              matchStr += isDaysMatch ? "1" : "0";

              let locationMatch = "0";

                            if (!ampher_id || ampher_id == 0) {
                                locationMatch = "1";
                            } else {
                                const jobAmpherId = parseInt(job.ampher_id);
                                const jobTambonId = parseInt(job.tambon_id);

                                if (parseInt(ampher_id) === jobAmpherId) {
                                    if (!tambon_id || tambon_id == 0) {
                                        locationMatch = "1";
                                    } else {
                                        if (parseInt(tambon_id) === jobTambonId) {
                                            locationMatch = "1";
                                        }
                                    }
                                }
                            }

                            matchStr += locationMatch;

              let age_min = 0;
              let age_max = 0;

              if (job.age) {
                  const [minStr, maxStr] = job.age.split('-');
                  age_min = parseInt(minStr) || 0;
                  age_max = parseInt(maxStr) || 0;
              }

              if (age_min === 0 && age_max === 0) {
                  matchStr += "1";
              } else if (age_min === 0) {
                  matchStr += (age <= age_max) ? "1" : "0";
              } else if (age_max === 0) {
                  matchStr += (age >= age_min) ? "1" : "0";
              } else {
                  matchStr += (age >= age_min && age <= age_max) ? "1" : "0";
              }


              let genderMatch = "0";

              if (job.gender === 0) {
                genderMatch = "1";
              } else if (job.gender === jobber.gender) {
                genderMatch = "1";
              }

              matchStr += genderMatch;

              matchStr += (parseInt(job.year_expe || 0) <= workYearExpe ? "1" : "0");
              matchStr += jobber_edu_arr.includes(parseInt(job.education_code)) ? "1" : "0";

              const hsStringMatched = matched_hs_arr.join(",");
              const ssStringMatched = matched_ss_arr.join(",");
// console.log("Matching Job Post:", job.post_id, "Match String:", matchStr, "HS:", matched_hs_arr.length, "SS:", matched_ss_arr.length);

//               console.log("========== Matching Job ==========");
// console.log("โพสต์:", job.post_id);
// console.log("ตำแหน่ง:", job.position_code, "เทียบกับ", interWork.position_id);
// console.log("เงินเดือน:", job.salary, "เทียบกับ ช่วง", min, "-", max);
// console.log("เวลาโพสต์:", job.hour, "-", job.end_hour, "เทียบกับของผู้สมัคร:", start, "-", end);
// console.log("วันที่ทำงาน:", job.days, "เทียบกับ", daysString);
// console.log("ที่ตั้ง:", `อำเภอ ${job.ampher_id}, ตำบล ${job.tambon_id}`, "เทียบกับ", `อำเภอ ${ampher_id}, ตำบล ${tambon_id}`);
// console.log("อายุที่รับ:", job.age || "ไม่ระบุ", "เทียบกับอายุ:", age);
// console.log("เพศที่รับ:", job.gender || "ไม่ระบุ", "เทียบกับเพศผู้สมัคร:", jobber.gender);
// console.log("ปีประสบการณ์ที่ต้องการ:", job.year_expe, "เทียบกับของผู้สมัคร:", workYearExpe);
// console.log("ระดับการศึกษาที่ต้องการ:", job.education_code, "เทียบกับของผู้สมัคร:", jobber_edu_arr);
// console.log("Hard Skills (Job):", jobHS.map(e => e.hardskill_id).join(","));
// console.log("Hard Skills (User):", jobber_hs_arr.join(","));
// console.log("Matched HS:", matched_hs_arr.join(","));
// console.log("Soft Skills (Job):", jobSS.map(e => e.softskill_id).join(","));
// console.log("Soft Skills (User):", jobber_ss_arr.join(","));
// console.log("Matched SS:", matched_ss_arr.join(","));
// console.log("Match Result String:", matchStr);
// console.log("==================================");
                            // --- คำนวณเปอร์เซ็นต์ ---
                            const totalConds = matchStr.length + job_hs_arr.length + job_ss_arr.length;
                            const matchCount = matchStr.split('1').length - 1 + matched_hs_arr.length + matched_ss_arr.length;
                            const percent = totalConds > 0 ? Math.round((matchCount / totalConds) * 100) : 0;


              db.query(
                `INSERT INTO tempWork (post_id, jobber_id, inter_work_id, position_id, hs, ss, matching, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE matching = ?, status = ?`,
                [
                  job.post_id,
                  jobber.jobber_id,
                  interWork.inter_work_id,
                  interWork.position_id,
                  hsStringMatched,
                  ssStringMatched,
                  matchStr,
                  "MATCHED",
                  matchStr,
                  "MATCHED"
                ],
                (err) => {
                  if (err) return reject(err);
                  // เพิ่มแจ้งเตือนหลังจับคู่สำเร็จ (percent >= 0)
                  // หมายเหตุ: ถ้าต้องการเฉพาะ match จริง ให้เปลี่ยนเป็น percent > 0
                  if (percent > 0) {
                    notifService.add({
                      receiverRole: "jobber",
                      receiverId: jobber.jobber_id,
                      eventKey: "JOB_MATCHED",
                      title: "มีงานที่ตรงกับคุณ!",
                      body: `เราเจองาน \"${job.position_name}\" ที่ตรงกับคุณ มีความสอดคล้องอยู่ที่ ${percent}%`,
                      postId: job.post_id,
                      jobberId: jobber.jobber_id,
                      employerId: job.emp_id,
                      meta: { link: `/job_match?i=${job.post_id}&inter_work=${interWork.inter_work_id}&posi=${interWork.position_id}&percent=${percent}` },
                      email: jobber.email
                    }).catch(e => console.error("Notif jobber error:", e));
                    notifService.add({
                      receiverRole: "emp",
                      receiverId: job.emp_id,
                      eventKey: "CANDIDATE_MATCHED",
                      title: "พบผู้สมัครที่ตรงกับงานของคุณ",
                      body: `ผู้สมัคร \"${jobber.fullname}\" ตรงกับงาน \"${job.position_name}\" มีความสอดคล้องอยู่ที่ ${percent}%`,
                      postId: job.post_id,
                      jobberId: jobber.jobber_id,
                      employerId: job.emp_id,
                      meta: { link: `/Emp_Job_Post?pi=${job.post_id}` },
                      email: job.email
                    }).catch(e => console.error("Notif employer error:", e));
                  } else {
                    notifService.add({
                      receiverRole: "jobber",
                      receiverId: jobber.jobber_id,
                      eventKey: "JOB_MATCHED",
                      title: "มีงานที่คุณอยากทำ!",
                      body: `เราเจองาน \"${job.position_name}\" ที่ตรงกับงานที่คุณลงไว้`,
                      postId: job.post_id,
                      jobberId: jobber.jobber_id,
                      employerId: job.emp_id,
                      meta: { link: `/job_match?i=${job.post_id}&inter_work=${interWork.inter_work_id}&posi=${interWork.position_id}&percent=${percent}` },
                      email: jobber.email
                    }).catch(e => console.error("Notif jobber error:", e));
                    notifService.add({
                      receiverRole: "emp",
                      receiverId: job.emp_id,
                      eventKey: "CANDIDATE_MATCHED",
                      title: "พบผู้สมัครที่สมัครงานตำแหน่งตรงกับงานของคุณ",
                      body: `ผู้สมัคร \"${jobber.fullname}\" ตรงกับงาน \"${job.position_name}\" แต่อาจจะมีคุณสมบัติไม่ค่อยตรง`,
                      postId: job.post_id,
                      jobberId: jobber.jobber_id,
                      employerId: job.emp_id,
                      meta: { link: `/Emp_Job_Post?pi=${job.post_id}` },
                      email: job.email
                    }).catch(e => console.error("Notif employer error:", e));
                  }
                  resolve(); 
                }
              );
            });
          });

      // Promise.all(insertPromises)
      //   .then(() => resolve())
      //   .catch(reject);
    });
  });
};

// Backend (Node.js + Express)
app.get("/api/job_history", (req, res) => {
  const { post_id, page = 1, limit = 10 } = req.query;

  const offset = (page - 1) * limit;

  let apply_jobCount = "SELECT COUNT(*) as totalCount FROM apply_job WHERE post_id = ? AND type = 'j'";
  let apply_job = `
      SELECT 
      aj.*, 
      j.fullname, 
      j.fullname_eng, 
      j.birthday,
      j.picture,
      eh_max.max_edu_id,
      COALESCE(el.edu_name, 'ยังไม่ได้ลงข้อมูลการศึกษา') as edu_name,
      jp.position_code
  FROM apply_job aj
  LEFT JOIN jobber j ON aj.jobber_id = j.jobber_id
  LEFT JOIN job_posting jp ON aj.post_id = jp.post_id
  LEFT JOIN (
      SELECT jobber_id, MAX(edu_id) as max_edu_id
      FROM education_history
      GROUP BY jobber_id
  ) eh_max ON aj.jobber_id = eh_max.jobber_id
  LEFT JOIN education_level el ON eh_max.max_edu_id = el.edu_id
  WHERE aj.post_id = ? AND aj.type = 'j'
  ORDER BY aj.date_time DESC LIMIT ? OFFSET ?
  `;
  let favCount = "SELECT COUNT(*) as totalCount FROM apply_job WHERE post_id = ? AND type = 'f'";
  let fav = `
      SELECT 
      aj.*, 
      j.fullname, 
      j.fullname_eng, 
      j.birthday,
      j.picture,
      eh_max.max_edu_id,
      COALESCE(el.edu_name, 'ยังไม่ได้ลงข้อมูลการศึกษา') as edu_name,
      jp.position_code
  FROM apply_job aj
  LEFT JOIN jobber j ON aj.jobber_id = j.jobber_id
  LEFT JOIN job_posting jp ON aj.post_id = jp.post_id
  LEFT JOIN (
      SELECT jobber_id, MAX(edu_id) as max_edu_id
      FROM education_history
      GROUP BY jobber_id
  ) eh_max ON aj.jobber_id = eh_max.jobber_id
  LEFT JOIN education_level el ON eh_max.max_edu_id = el.edu_id
  WHERE aj.post_id = ? AND aj.type = 'f'
  ORDER BY aj.date_time DESC LIMIT ? OFFSET ?
  `;
  

  // ดึงจำนวนทั้งหมดก่อน
  db.query(apply_jobCount, [post_id], (err, ajcountResult) => {
    if (err) return res.status(500).json({ error: err.message });

    const ajtotalCount = ajcountResult[0].totalCount;

    // ดึงรายการตาม page
    db.query(apply_job, [post_id , parseInt(limit), parseInt(offset)], (err, ajresults) => {
      if (err) return res.status(500).json({ error: err.message });

      db.query(favCount, [post_id], (err, fcountResult) => {
        if (err) return res.status(500).json({ error: err.message });

        const ftotalCount = fcountResult[0].totalCount;

        // ดึงรายการตาม page
        db.query(fav, [post_id , parseInt(limit), parseInt(offset)], (err, fresults) => {
          if (err) return res.status(500).json({ error: err.message });

          res.json({
            apply_job: ajresults,
            ajtotalCount,
            ajtotalPages: Math.ceil(ajtotalCount / limit),
            favorite: fresults,
            ftotalCount,
            ftotalPages: Math.ceil(ftotalCount / limit),
          });
        });
      });
    });
  });

});

app.get("/api/volun_history", (req, res) => {
  const { post_id, page = 1, limit = 10 } = req.query;

  const offset = (page - 1) * limit;

  let apply_volunCount = "SELECT COUNT(*) as totalCount FROM apply_volun WHERE post_id = ? AND type = 'j'";
  let apply_volun = `
      SELECT 
      av.*, 
      j.fullname, 
      j.fullname_eng, 
      j.birthday,
      j.picture,
      vp.volunteer_code
  FROM apply_volun av
  LEFT JOIN jobber j ON av.jobber_id = j.jobber_id
  LEFT JOIN volunteer_posting vp ON av.post_id = vp.post_id
  WHERE av.post_id = ? AND av.type = 'j'
  ORDER BY av.date_time DESC LIMIT ? OFFSET ?
  `;
  let favCount = "SELECT COUNT(*) as totalCount FROM apply_volun WHERE post_id = ? AND type = 'f'";
  let fav = `
      SELECT 
      av.*, 
      j.fullname, 
      j.fullname_eng, 
      j.birthday,
      j.picture,
      vp.volunteer_code
  FROM apply_volun av
  LEFT JOIN jobber j ON av.jobber_id = j.jobber_id
  LEFT JOIN volunteer_posting vp ON av.post_id = vp.post_id
  WHERE av.post_id = ? AND av.type = 'f'
  ORDER BY av.date_time DESC LIMIT ? OFFSET ?
  `;
  

  // ดึงจำนวนทั้งหมดก่อน
  db.query(apply_volunCount, [post_id], (err, avcountResult) => {
    if (err) return res.status(500).json({ error: err.message });

    const avtotalCount = avcountResult[0].totalCount;

    // ดึงรายการตาม page
    db.query(apply_volun, [post_id , parseInt(limit), parseInt(offset)], (err, avresults) => {
      if (err) return res.status(500).json({ error: err.message });

      db.query(favCount, [post_id], (err, fcountResult) => {
        if (err) return res.status(500).json({ error: err.message });

        const ftotalCount = fcountResult[0].totalCount;

        // ดึงรายการตาม page
        db.query(fav, [post_id , parseInt(limit), parseInt(offset)], (err, fresults) => {
          if (err) return res.status(500).json({ error: err.message });

          res.json({
            apply_volun: avresults,
            avtotalCount,
            avtotalPages: Math.ceil(avtotalCount / limit),
            favorite: fresults,
            ftotalCount,
            ftotalPages: Math.ceil(ftotalCount / limit),
          });
        });
      });
    });
  });

});

app.post("/api/send_message", (req, res) => {
  const { post_id, jobber_id, message, status, type , close } = req.body;

  if (!post_id || !jobber_id || !status) {
    return res.status(400).json({ success: false, error: "ข้อมูลไม่ครบ" });
  }

  // ดึงข้อมูลประกอบสำหรับ notification
  const infoSql = `
    SELECT 
      aj.post_id,
      aj.jobber_id,
      j.emp_id,
      p.position_name,
      e.fullname as efull,
      jb.fullname as jfull,
      e.email as empEmail,
      jb.email as jobberEmail
    FROM apply_job aj
    JOIN job_posting j ON aj.post_id = j.post_id
    JOIN employer e ON j.emp_id = e.emp_id
    JOIN jobber jb ON aj.jobber_id = jb.jobber_id
    JOIN position p ON j.position_code = p.position_id
    WHERE aj.post_id = ? AND aj.jobber_id = ?
    LIMIT 1
  `;

  db.query(infoSql, [post_id, jobber_id], (err, infoRows) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ success: false, error: "Server error" });
    }

    // จะได้ข้อมูลสำหรับ notification อยู่ใน info
    const r = infoRows[0] || {};

    // แล้วค่อยเช็ค apply_job ว่ามีอยู่แล้วหรือไม่
    const checkSql = "SELECT * FROM apply_job WHERE post_id = ? AND jobber_id = ?";
    db.query(checkSql, [post_id, jobber_id], (err, rows) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ success: false, error: "Server error" });
      }

      if (rows.length > 0) {
        // Update
        let updateSql = `
          UPDATE apply_job
          SET  status = ?, date_time = NOW()
        `;
        const params = [status];

        if (status === "waitjobber") {
          updateSql += `, message = ?, expire_time = NOW() + INTERVAL 3 DAY`;
          params.push(message);
        }
        if (status === "waitemp") {
          updateSql += `, expire_time = NULL`;
        }
        if (status === "accepted") {
          updateSql += `, expire_time = NULL`;
        }

        if (type) {
          updateSql += `, type = ?`;
          params.push(type);
        }

        updateSql += ` WHERE post_id = ? AND jobber_id = ?`;
        params.push(post_id, jobber_id);

        db.query(updateSql, params, async (err) => {
          if (err) {
            console.error("DB Error:", err);
            return res.status(500).json({ success: false, error: "Server error" });
          }

          // === ส่ง Notification ตรงนี้ใช้ r ได้แล้ว ===
          if (status === "waitjobber") {
            await notifService.add({
              receiverRole: "emp",
              receiverId: r.emp_id,
              eventKey: "EMP_CHOOSE_CANDIDATE",
              title: "คุณได้เลือกผู้สมัครแล้ว",
              body: `ผู้สมัคร ${r.jfull} ที่คุณเลือกในตำแหน่ง "${r.position_name}" จะต้องตอบกลับภายใน 3 วัน หากเกินกำหนดจะถือเป็นการปฏิเสธงาน`,
              postId: r.post_id,
              jobberId: r.jobber_id,
              employerId: r.emp_id,
              meta: { link: `/Emp_Job_Post?pi=${r.post_id}` },
              email: r.empEmail
            });

            await notifService.add({
              receiverRole: "jobber",
              receiverId: r.jobber_id,
              eventKey: "EMP_CHOOSE_YOU",
              title: "นายจ้างได้เลือกคุณแล้ว",
              body: `นายจ้าง ${r.efull} เลือกคุณในตำแหน่งงาน "${r.position_name}" คุณมีเวลา 3 วันในการตอบรับหรือปฏิเสธงานนี้ หากเกินกำหนดจะถือเป็นการปฏิเสธงาน`,
              postId: r.post_id,
              jobberId: r.jobber_id,
              employerId: r.emp_id,
              meta: {
                "accept": { "label": "ตอบกลับ", "modalId": "accept_modal" },
                "reject": { "label": "ปฏิเสธ", "modalId": "reject_modal" }
              },
              email: r.jobberEmail
            });
          }


          if (status === "waitemp") {
            await notifService.add({
              receiverRole: "emp",
              receiverId: r.emp_id,
              eventKey: "EMP_CANCELCHOOSE_CANDIDATE",
              title: "คุณได้ยกเลิกการเลือกผู้สมัครแล้ว",
              body: `คุณได้ยกเลิกการเลือกผู้สมัคร ${r.jfull} ในตำแหน่ง "${r.position_name}" คุณสามารถเลือกผู้สมัครคนนี้ได้ใหม่หากยังไม่ได้ปิดรับสมัคร`,
              postId: r.post_id,
              jobberId: r.jobber_id,
              employerId: r.emp_id,
              meta: { link: `/Emp_Job_Post?pi=${r.post_id}` },
              email: r.empEmail
            });

            await notifService.add({
              receiverRole: "jobber",
              receiverId: r.jobber_id,
              eventKey: "EMP_CANCELCHOOSE_YOU",
              title: "นายจ้างมีการยกเลิกการเลือกคุณ",
              body: `งานตำแหน่ง "${r.position_name}" ที่นายจ้าง ${r.efull} เลือกคุณ ถูกยกเลิกจากนายจ้าง คุณยังสามารถสมัครงานนี้ใหม่ได้หากยังไม่ได้ปิดรับสมัคร และนายจ้างยังสามารถเลือกคุณได้ใหม่อีกครั้ง`,
              postId: r.post_id,
              jobberId: r.jobber_id,
              employerId: r.emp_id,
              meta: { link: `/Job_Post_de?pi=${r.post_id}` },
              email: r.jobberEmail
            });
          }

          if (status === "rejected") {
            await notifService.add({
              receiverRole: "emp",
              receiverId: r.emp_id,
              eventKey: "EMP_REJECT_CANDIDATE",
              title: "คุณได้ปฏิเสธผู้สมัครแล้ว",
              body: `คุณได้ปฏิเสธผู้สมัคร ${r.jfull} ในตำแหน่ง "${r.position_name}" แล้ว `,
              postId: r.post_id,
              jobberId: r.jobber_id,
              employerId: r.emp_id,
              meta: { link: `/Emp_Job_Post?pi=${r.post_id}` },
              email: r.empEmail
            });


            await notifService.add({
              receiverRole: "jobber",
              receiverId: r.jobber_id,
              eventKey: "EMP_REJECT_YOU",
              title: "คุณไม่ได้รับการคัดเลือกในตำแหน่งนี้",
              body: `ขออภัย คุณไม่ได้รับการคัดเลือกจากนายจ้าง ${r.efull} สำหรับตำแหน่ง "${r.position_name}" คุณยังสามารถสมัครงานอื่น ๆ ได้ตามต้องการ`,
              postId: r.post_id,
              jobberId: r.jobber_id,
              employerId: r.emp_id,
              meta: { link: `/Job_Post_de?pi=${r.post_id}` },
              email: r.jobberEmail
            });

          }
          if (status === "accepted") {
            // แจ้งนายจ้าง
            await notifService.add({
              receiverRole: "emp",
              receiverId: r.emp_id,
              eventKey: "EMP_CHOOSE_CANDIDATE",
              title: "ผู้สมัครตอบรับงานแล้ว",
              body: `ผู้สมัคร ${r.jfull} ที่คุณเลือกในตำแหน่ง "${r.position_name}" ได้ตอบรับงานแล้ว`,
              postId: r.post_id,
              jobberId: r.jobber_id,
              employerId: r.emp_id,
              meta: { link: `/Emp_Job_Post?pi=${r.post_id}` },
              email: r.empEmail
            });

            // แจ้งผู้สมัคร
            await notifService.add({
              receiverRole: "jobber",
              receiverId: r.jobber_id,
              eventKey: "EMP_CHOOSE_YOU",
              title: "คุณได้ตอบรับงานเรียบร้อยแล้ว",
              body: `คุณได้ตอบรับงานตำแหน่ง "${r.position_name}" ของนายจ้าง ${r.efull} เรียบร้อยแล้ว `,
              postId: r.post_id,
              jobberId: r.jobber_id,
              employerId: r.emp_id,
              meta: { link: `/Job_Post_de?pi=${r.post_id}` },
              email: r.jobberEmail
            });

            if (close === "close_all") {
              const closeSql = `UPDATE jobber SET work_status = 'JOB' WHERE jobber_id = ?`; 
              const rejectSql = `
                UPDATE apply_job 
                SET status = 'jb_rejected', date_time = NOW() 
                WHERE jobber_id = ? AND post_id != ?
              `;
              db.query(closeSql, [jobber_id], (err) => {
                if (err) console.error("DB Error (close_all):", err);

                db.query(rejectSql, [jobber_id, post_id], (err) => {
                    if (err) {
                      console.error("DB Error:", err);
                      return res.status(500).json({ success: false, error: "Server error" });
                    }
                    console.log("ปิดงานอื่นทั้งหมดของ jobber_id:", jobber_id);
                  });
              });
            }
          }
          if (close === "close_all") {
            await notifService.add({
              receiverRole: "jobber",
              receiverId: jobber_id,
              eventKey: "CLOSE_ALL_JOB",
              title: "คุณได้ปิดการรับงานทั้งหมดแล้ว",
              body: "ระบบจะไม่หางานใหม่ให้คุณ และปฏิเสธงานที่ค้างอยู่ทั้งหมด",
              postId: post_id,
              jobberId: jobber_id,
              employerId: r.emp_id,
              email: r.jobberEmail
            });

            // แจ้งนายจ้างของงานอื่น ๆ ตรงนี้ (ต้อง query หา emp_id จาก apply_job ทุก post_id ที่โดน reject)
          }





          return res.json({ success: true, action: "updated" });
        });
      } else {
      // Insert
      let insertSql = `
        INSERT INTO apply_job (post_id, jobber_id, message, date_time, status
      `;
      const placeholders = ["?", "?", "?", "NOW()", "?"];
      const params = [post_id, jobber_id, message, status];

      // ใส่ expire_time เฉพาะ status === 'waitjobber'
      if (status === "waitjobber") {
        insertSql += `, expire_time`;
        placeholders.push("NOW() + INTERVAL 3 DAY");
      }

      if (type) {
        insertSql += `, type`;
        placeholders.push("?");
        params.push(type);
      }

      insertSql += `) VALUES (${placeholders.join(", ")})`;

      db.query(insertSql, params, async (err, result) => {
        if (err) {
          console.error("DB Error:", err);
          return res.status(500).json({ success: false, error: "Server error" });
        }
        if (status === "waitjobber") {
          await notifService.add({ 
            receiverRole: "emp", 
            receiverId: r.emp_id, 
            eventKey: "EMP_CHOOSE_CANDIDATE",
            title: "คุณได้เลือกผู้สมัครแล้ว", 
            body: `ผู้สมัคร ${r.jfull} ที่คุณเลือกในตำแหน่ง "${r.position_name}" จะต้องตอบกลับภายใน 3 วัน หากเกินกำหนดจะถือเป็นการปฏิเสธงาน`, 
            postId: r.post_id, 
            jobberId: r.jobber_id, 
            employerId: r.emp_id, 
            meta: { link: `/Emp_Job_Post?pi=${r.post_id}` }, //ถูกมั้ยใส่ลิ้งค์ไปหน้ารายละเอียดที่มีผู้สมัครและรายละเอียดงาน
            email: r.empEmail });

        await notifService.add({ 
          receiverRole: "jobber", 
          receiverId: r.jobber_id, 
          eventKey: "EMP_CHOOSE_YOU",
          title: "นายจ้างได้เลือกคุณแล้ว", 
          body: `นายจ้าง ${r.efull} เลือกคุณในตำแหน่งงาน "${r.position_name}" คุณมีเวลา 3 วันในการตอบรับหรือปฏิเสธงานนี้ หากเกินกำหนดจะถือเป็นการปฏิเสธงาน`, 
          postId: r.post_id, 
          jobberId: r.jobber_id, 
          employerId: r.emp_id, 
          meta: {
            "accept": { "label": "ตอบกลับ", "modalId" : "accept_modal" },
            "reject": { "label": "ปฏิเสธ", "modalId" : "reject_modal" } //ใส่ลิงค์เพื่อไปกดmodal ใส่modalId 
          }, 
          email: r.jobberEmail });
        }
        return res.json({ success: true, action: "inserted", id: result.insertId });
      });

    }
    });
  });
});

// อัปเดตสถานะการทำงานของ jobber
app.post("/api/update_work_status", (req, res) => {
  const { jobber_id, work_status } = req.body;

  if (!jobber_id || !work_status) {
    return res.status(400).json({ success: false, error: "ข้อมูลไม่ครบ" });
  }

  if (work_status === "JOB") {
    // 1) อัปเดต jobber
     // ดึงข้อมูล jobber ก่อน
    const getJobberSql = `SELECT email as jobberEmail FROM jobber WHERE jobber_id = ?`;
    db.query(getJobberSql, [jobber_id], (err, rows) => {
      if (err) {
        console.error("DB Error (getJobber):", err);
        return res.status(500).json({ success: false, error: "Server error" });
      }
      if (rows.length === 0) {
        return res.status(404).json({ success: false, error: "ไม่พบ jobber" });
      }

      const { jobberEmail, emp_id } = rows[0];
      const closeSql = `UPDATE jobber SET work_status = 'JOB' WHERE jobber_id = ?`;
      db.query(closeSql, [jobber_id], (err) => {
        if (err) {
          console.error("DB Error (closeSql):", err);
          return res.status(500).json({ success: false, error: "Server error" });
        }

        // 2) Reject งานอื่น ๆ 
        const rejectSql = `
          UPDATE apply_job 
          SET status = 'waitemp', date_time = NOW() 
          WHERE jobber_id = ? AND status != 'accepted'
        `;
        db.query(rejectSql, [jobber_id], async (err) => {
          if (err) {
            console.error("DB Error (rejectSql):", err);
            return res.status(500).json({ success: false, error: "Server error" });
          }

          console.log("ปิดงานอื่นทั้งหมดของ jobber_id:", jobber_id);

          // 3) Notification
          try {
            await notifService.add({
              receiverRole: "jobber",
              receiverId: jobber_id,
              eventKey: "CLOSE_ALL_JOB",
              title: "คุณได้ปิดการรับงานทั้งหมดแล้ว",
              body: "ระบบจะไม่หางานใหม่ให้คุณ และปฏิเสธงานที่ค้างอยู่ทั้งหมด",
              postId: null,
              jobberId: jobber_id,
              employerId: null, // ถ้าต้องใช้ r.emp_id ต้องดึงมาก่อน
              email: jobberEmail, // ถ้าต้องใช้ r.jobberEmail ต้องดึงมาก่อน
            });
          } catch (notifErr) {
            console.error("Notification Error:", notifErr);
          }

          return res.json({ success: true, message: "อัปเดตสถานะเรียบร้อย (ปิดงานทั้งหมด)" });
        });
      });
    });
  } else if (work_status === "FIND") {
    // แค่อัปเดตสถานะเป็น FIND
    const sql = `UPDATE jobber SET work_status = 'FIND' WHERE jobber_id = ?`;
    db.query(sql, [jobber_id], async (err) => {
      if (err) {
        console.error("DB Error (FIND):", err);
        return res.status(500).json({ success: false, error: "Server error" });
      }

      try {
            await notifService.add({
              receiverRole: "jobber",
              receiverId: jobber_id,
              eventKey: "FIND",
              title: "คุณได้เปิดรับงานแล้ว",
              body: "ระบบจะหางานใหม่ให้คุณ และคุณสามารถหางานได้แล้วในหน้าหลัก",
              postId: null,
              jobberId: jobber_id,
              employerId: null, // ถ้าต้องใช้ r.emp_id ต้องดึงมาก่อน
              email: jobberEmail, // ถ้าต้องใช้ r.jobberEmail ต้องดึงมาก่อน
            });
          } catch (notifErr) {
            console.error("Notification Error:", notifErr);
          }


      return res.json({ success: true, message: "อัปเดตสถานะเรียบร้อย (เปิดหางาน)" });
    });
  } else {
    return res.status(400).json({ success: false, error: "work_status ไม่ถูกต้อง" });
  }
});



// POST: Add jobber review for employer
app.post("/api/jobber_review", async (req, res) => {
  const { jobber_id, emp_id, message, score , post_id } = req.body;
  // Use current date/time in MySQL format
  const date = dayjs().format("YYYY-MM-DD");
  if (!jobber_id || !emp_id || typeof score === 'undefined') {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }
  try {
    const sql = `INSERT INTO jobber_review (jobber_id, emp_id, message, score, date) VALUES (?, ?, ?, ?, ?)`;
    const values = [jobber_id, emp_id, message || '', score, date];
    db.query(sql, values, async (err, result) => {
      if (err) {
        console.error("DB Error (jobber_review insert):", err);
        return res.status(500).json({ success: false, message: "Database error", error: err.message });
      }
      res.json({ success: true, message: "Review submitted successfully" });

      const Sql = `
        SELECT 
          p.position_name,
          e.fullname as efull,
          jb.fullname as jfull,
          e.email as empEmail,
          jb.email as jobberEmail
        FROM apply_job aj
        JOIN job_posting j ON aj.post_id = j.post_id
        JOIN employer e ON j.emp_id = e.emp_id
        JOIN jobber jb ON aj.jobber_id = jb.jobber_id
        JOIN position p ON j.position_code = p.position_id
        WHERE aj.post_id = ? AND aj.jobber_id = ? LIMIT 1
      `;
      db.query(Sql, [post_id , jobber_id] ,async (err, rows) => {
        if (err) return console.error(err);
        // const ids = [];
        for (const r of rows) {
          // ids.push(r.id);
          // ส่งให้นายจ้าง + ผู้สมัคร (เหมือนที่คุณทำอยู่)
          await notifService.add({ 
            receiverRole: "emp", 
            receiverId: emp_id, 
            eventKey: "JOBBER_REVIEW_EMP",
            title: "ผู้สมัครให้คะแนนคุณแล้ว", 
            body: `คุณสามารถดูคะแนนและความคิดเห็นผู้สมัคร ${r.jfull} ที่ทำงานในตำแหน่ง "${r.position_name} ได้จากโปรไฟล์ของคุณ"`, 
            postId: post_id, 
            jobberId: jobber_id, 
            employerId: emp_id, 
            meta: { link: `/Profile` }, //ถูกมั้ยใส่ลิ้งค์ไปหน้ารายละเอียดที่มีผู้สมัครและรายละเอียดงาน
            email: r.empEmail });

          await notifService.add({ 
            receiverRole: "jobber", 
            receiverId: jobber_id, 
            eventKey: "REVIEW_EMP",
            title: "คุณให้คะแนนนายจ้างแล้ว", 
            body: `คุณได้ให้คะแนน "${score}" ${message ? `และแสดงความคิดเห็น "${message}" ` : ''} ให้กับนายจ้าง ${r.efull} ที่คุณได้ทำงานในตำแหน่ง "${r.position_name}"`, 
            postId: post_id, 
            jobberId: jobber_id, 
            employerId: emp_id, 
            meta: {
              "empty":"ให้คะแนนไปแล้ว"
            }, 
            email: r.jobberEmail });
        
        }
        
        
      });

       
        
    });
  } catch (err) {
    console.error("Error in /api/jobber_review POST:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});
app.post("/api/emp_review", async (req, res) => {
  const { jobber_id, emp_id, message, score , post_id } = req.body;
  // Use current date/time in MySQL format
  const date = dayjs().format("YYYY-MM-DD");
  if (!jobber_id || !emp_id || typeof score === 'undefined') {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }
  try {
    const sql = `INSERT INTO emp_review (jobber_id, emp_id, message, score, date) VALUES (?, ?, ?, ?, ?)`;
    const values = [jobber_id, emp_id, message || '', score, date];
    db.query(sql, values, async (err, result) => {
      if (err) {
        console.error("DB Error (emp_review insert):", err);
        return res.status(500).json({ success: false, message: "Database error", error: err.message });
      }
      res.json({ success: true, message: "Review submitted successfully" });

      const Sql = `
        SELECT 
          p.position_name,
          e.fullname as efull,
          jb.fullname as jfull,
          e.email as empEmail,
          jb.email as jobberEmail
        FROM apply_job aj
        JOIN job_posting j ON aj.post_id = j.post_id
        JOIN employer e ON j.emp_id = e.emp_id
        JOIN jobber jb ON aj.jobber_id = jb.jobber_id
        JOIN position p ON j.position_code = p.position_id
        WHERE aj.post_id = ? AND aj.jobber_id = ? LIMIT 1
      `;
      db.query(Sql, [post_id , jobber_id] ,async (err, rows) => {
        if (err) return console.error(err);
        // const ids = [];
        for (const r of rows) {
          // ids.push(r.id);
          // ส่งให้นายจ้าง + ผู้สมัคร (เหมือนที่คุณทำอยู่)
          await notifService.add({ 
            receiverRole: "emp", 
            receiverId: emp_id, 
            eventKey: "REVIEW_JOBBER",
            title: "คุณให้คะแนนผู้สมัครแล้ว", 
            body: `คุณได้ให้คะแนน "${score}" ${message ? `และแสดงความคิดเห็น "${message}" ` : ''} ให้กับผู้สมัคร ${r.efull} ที่คุณได้ทำงานในตำแหน่ง "${r.position_name}"`, 
            postId: post_id, 
            jobberId: jobber_id, 
            employerId: emp_id, 
            meta: {
              "empty":"ให้คะแนนไปแล้ว"
            }, //ถูกมั้ยใส่ลิ้งค์ไปหน้ารายละเอียดที่มีผู้สมัครและรายละเอียดงาน
            email: r.empEmail });

          await notifService.add({ 
            receiverRole: "jobber", 
            receiverId: jobber_id, 
            eventKey: "EMP_REVIEW_JOBBER",
            title: "นายจ้างได้ให้คะแนนการทำงานของคุณแล้ว", 
            body: `คุณสามารถดูคะแนนและความคิดเห็นของนายจ้าง ${r.jfull} ที่คุณทำงานในตำแหน่ง "${r.position_name} ได้จากโปรไฟล์ของคุณ"`, 
            postId: post_id, 
            jobberId: jobber_id, 
            employerId: emp_id, 
            meta: { link: `/Profile` }, 
            email: r.jobberEmail });
        
        }
        
        
      });

       
        
    });
  } catch (err) {
    console.error("Error in /api/jobber_review POST:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});
// app.post("/api/send_message", (req, res) => {
//   const { post_id, jobber_id, message, status, type } = req.body;
//   //console.log("pjmt", req.body);

//   if (!post_id || !jobber_id || !status) {
//     return res.status(400).json({ success: false, error: "ข้อมูลไม่ครบ" });
//   }



//   const checkSql = "SELECT * FROM apply_job WHERE post_id = ? AND jobber_id = ?";
//   db.query(checkSql, [post_id, jobber_id], (err, rows) => {
//     if (err) {
//       console.error("DB Error:", err);
//       return res.status(500).json({ success: false, error: "Server error" });
//     }

//     if (rows.length > 0) {
//       // Update
//       let updateSql = `
//         UPDATE apply_job
//         SET message = ?, status = ?, date_time = NOW()
//       `;
//       const params = [message, status];

//       // ใส่ expire_time เฉพาะ status === 'waitjobber'
//       if (status === "waitjobber") {
//         updateSql += `, expire_time = NOW() + INTERVAL 3 DAY`;
//       }
//       if (status === "waitemp") {
//         updateSql += `, expire_time = NULL`;
//       }

//       if (type) {
//         updateSql += `, type = ?`;
//         params.push(type);
//       }

//       updateSql += ` WHERE post_id = ? AND jobber_id = ?`;
//       params.push(post_id, jobber_id);

//       db.query(updateSql, params, async (err, result) => {
//         if (err) {
//           console.error("DB Error:", err);
//           return res.status(500).json({ success: false, error: "Server error" });
//         }
//         if (status === "waitjobber") {
//           await notifService.add({ 
//             receiverRole: "emp", 
//             receiverId: r.emp_id, 
//             eventKey: "EMP_CHOOSE_CANDIDATE",
//             title: "คุณได้เลือกผู้สมัครแล้ว", 
//             body: `ผู้สมัคร ${r.jfull} ที่คุณเลือกในตำแหน่ง "${r.position_name}" จะต้องตอบกลับภายใน 3 วัน หากเกินกำหนดจะถือเป็นการปฏิเสธงาน`, 
//             postId: r.post_id, 
//             jobberId: r.jobber_id, 
//             employerId: r.emp_id, 
//             meta: { link: `/Emp_Job_Post?pi=${r.post_id}` }, //ถูกมั้ยใส่ลิ้งค์ไปหน้ารายละเอียดที่มีผู้สมัครและรายละเอียดงาน
//             email: r.empEmail });

//         await notifService.add({ 
//           receiverRole: "jobber", 
//           receiverId: r.jobber_id, 
//           eventKey: "EMP_CHOOSE_YOU",
//           title: "นายจ้างได้เลือกคุณแล้ว", 
//           body: `นายจ้าง ${r.efull} เลือกคุณในตำแหน่งงาน "${r.position_name}" คุณมีเวลา 3 วันในการตอบรับหรือปฏิเสธงานนี้ หากเกินกำหนดจะถือเป็นการปฏิเสธงาน`, 
//           postId: r.post_id, 
//           jobberId: r.jobber_id, 
//           employerId: r.emp_id, 
//           meta: {
//             "accept": { "label": "ตอบกลับ", "modalId" : "accept_modal" },
//             "reject": { "label": "ปฏิเสธ", "modalId" : "reject_modal" } //ใส่ลิงค์เพื่อไปกดmodal ใส่modalId 
//           }, 
//           email: r.jobberEmail });
//         }
//         if (status === "waitemp") {
//           await notifService.add({ 
//             receiverRole: "emp", 
//             receiverId: r.emp_id, 
//             eventKey: "EMP_CANCELCHOOSE_CANDIDATE",
//             title: "คุณได้ยกเลิกการเลือกผู้สมัครแล้ว", 
//             body: `คุณได้ยกเลิกการเลือกผู้สมัคร ${r.jfull} ที่ในตำแหน่ง "${r.position_name}" คุณสามารถเลือกผู้สมัครคนนี้ได้ใหม่หากยังไม่ได้ปิดรับสมัคร`, 
//             postId: r.post_id, 
//             jobberId: r.jobber_id, 
//             employerId: r.emp_id, 
//             meta: { link: `/Emp_Job_Post?pi=${r.post_id}` }, //ถูกมั้ยใส่ลิ้งค์ไปหน้ารายละเอียดที่มีผู้สมัครและรายละเอียดงาน
//             email: r.empEmail });

//         await notifService.add({ 
//           receiverRole: "jobber", 
//           receiverId: r.jobber_id, 
//           eventKey: "EMP_CANCELCHOOSE_YOU",
//           title: "นายจ้างมีการยกเลิกการเลือกคุณ", //ต่อ
//           body: `งานตำแหน่ง "${r.position_name}" ที่นายจ้าง ${r.efull} เลือกคุณ ถูกยกเลิกจากนายจ้าง คุณยังสามารถสมัครงานนี้ใหม่ได้หากยังไม่ได้ปิดรับสมัคร และนายจ้างยังสามารถเลือกคุณได้ใหม่อีกครั้ง`, 
//           postId: r.post_id, 
//           jobberId: r.jobber_id, 
//           employerId: r.emp_id, 
//           meta: { link: `/Job_Post_de?pi=${r.post_id}`}, 
//           email: r.jobberEmail });
//         }

//         return res.json({ success: true, action: "updated" });
//       });

//     } else {
//       // Insert
//       let insertSql = `
//         INSERT INTO apply_job (post_id, jobber_id, message, date_time, status
//       `;
//       const placeholders = ["?", "?", "?", "NOW()", "?"];
//       const params = [post_id, jobber_id, message, status];

//       // ใส่ expire_time เฉพาะ status === 'waitjobber'
//       if (status === "waitjobber") {
//         insertSql += `, expire_time`;
//         placeholders.push("NOW() + INTERVAL 3 DAY");
//       }

//       if (type) {
//         insertSql += `, type`;
//         placeholders.push("?");
//         params.push(type);
//       }

//       insertSql += `) VALUES (${placeholders.join(", ")})`;

//       db.query(insertSql, params, async (err, result) => {
//         if (err) {
//           console.error("DB Error:", err);
//           return res.status(500).json({ success: false, error: "Server error" });
//         }
//         if (status === "waitjobber") {
//           await notifService.add({ 
//             receiverRole: "emp", 
//             receiverId: r.emp_id, 
//             eventKey: "EMP_CHOOSE_CANDIDATE",
//             title: "คุณได้เลือกผู้สมัครแล้ว", 
//             body: `ผู้สมัคร ${r.jfull} ที่คุณเลือกในตำแหน่ง "${r.position_name}" จะต้องตอบกลับภายใน 3 วัน หากเกินกำหนดจะถือเป็นการปฏิเสธงาน`, 
//             postId: r.post_id, 
//             jobberId: r.jobber_id, 
//             employerId: r.emp_id, 
//             meta: { link: `/Emp_Job_Post?pi=${r.post_id}` }, //ถูกมั้ยใส่ลิ้งค์ไปหน้ารายละเอียดที่มีผู้สมัครและรายละเอียดงาน
//             email: r.empEmail });

//         await notifService.add({ 
//           receiverRole: "jobber", 
//           receiverId: r.jobber_id, 
//           eventKey: "EMP_CHOOSE_YOU",
//           title: "นายจ้างได้เลือกคุณแล้ว", 
//           body: `นายจ้าง ${r.efull} เลือกคุณในตำแหน่งงาน "${r.position_name}" คุณมีเวลา 3 วันในการตอบรับหรือปฏิเสธงานนี้ หากเกินกำหนดจะถือเป็นการปฏิเสธงาน`, 
//           postId: r.post_id, 
//           jobberId: r.jobber_id, 
//           employerId: r.emp_id, 
//           meta: {
//             "accept": { "label": "ตอบกลับ", "modalId" : "accept_modal" },
//             "reject": { "label": "ปฏิเสธ", "modalId" : "reject_modal" } //ใส่ลิงค์เพื่อไปกดmodal ใส่modalId 
//           }, 
//           email: r.jobberEmail });
//         }
//         return res.json({ success: true, action: "inserted", id: result.insertId });
//       });

//     }
//   });
// });






// app.listen(PORT, ()=> {
//     console.log("listening...");
// })