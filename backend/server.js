
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const PORT = 8000;

const JWT_SECRET = process.env.JWT_SECRET;

const app = express()
app.use(cors())
app.use(express.json());
app.use('/uploads', express.static('uploads'));



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



db.query('SELECT 1', (err, results) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL");
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
      const uploadPath = path.join(__dirname, 'uploads');
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

app.post('/api/jobber_up_picture', upload.single('picture'), (req, res) => {
  const jobber_id = req.body.jobber_id;

  console.log("ไฟล์ใหม่:", req.file);
  console.log("jobber_id:", req.body.jobber_id);


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


app.get('/hardskill', (req, res)=> {
    const { page = 1, limit = 10, keyword = "" } = req.query;

    const offset = (page -1) * limit;
    const sql = `SELECT * FROM hardskill WHERE hardskill_name LIKE ? ORDER BY hardskill_id DESC LIMIT ? OFFSET ?`;
    const totalsql = "SELECT COUNT(*) AS total FROM hardskill WHERE hardskill_name LIKE ?";

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
    const totalsql = "SELECT COUNT(*) AS total FROM softskill WHERE softskill_name LIKE ?";

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
    const totalsql = "SELECT COUNT(*) AS total FROM jobtype WHERE jobtype_name LIKE ?";

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
    const totalsql = "SELECT COUNT(*) AS total FROM volunteertype WHERE voluntype_name LIKE ?";

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
    const totalsql = "SELECT COUNT(*) AS total FROM position WHERE position_name LIKE ?";

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
      db.query(sql, (err, result) => {
          if (err) {
            //console.error("SQL Error:", err);
            return res.status(500).json({ error: "Error fetching data" });
          }
          //console.log("jobtype data:", result);
          res.json({ jobtypedata: result });
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
  //console.log("req.body:", req.body);

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

    return res.status(204).end(); // ไม่ส่งอะไรกลับเลยก็ได้
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
    const sql = `SELECT jobber.jobber_id,fullname,picture,jobber.status,work_status, CASE WHEN interests_volun.jobber_id IS NOT NULL THEN '/' ELSE '-' END AS j_volun FROM jobber LEFT JOIN interests_volun ON jobber.jobber_id = interests_volun.jobber_id WHERE fullname LIKE ? AND jobber.status != 'admin' LIMIT ? OFFSET ?`;
    const totalsql = "SELECT COUNT(*) AS total FROM jobber WHERE fullname LIKE ? AND status != 'admin'";

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
    const totalsql = "SELECT COUNT(*) AS total FROM employer WHERE fullname LIKE ?";

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
    const totalsql = "SELECT COUNT(*) AS total FROM job_posting LEFT JOIN position ON job_posting.position_code = position.position_id WHERE position_name LIKE ?";

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
    const totalsql = "SELECT COUNT(*) AS total FROM volunteer_posting WHERE activity_name LIKE ?";

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
  const jobtypehit = "SELECT jobtype_id , jobtype_name FROM jobtype LIMIT 9";
  const lastpost = "SELECT post_id , salary , position_name , job_posting.emp_id as emp_id , job_pic , fullname , tambon_name as tb , ampher_name as ap , jangwat_name as jw FROM job_posting LEFT JOIN position ON job_posting.position_code = position.position_id LEFT JOIN employer ON job_posting.emp_id = employer.emp_id LEFT JOIN tambon ON job_posting.tambon_id = tambon.tambon_id LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id LEFT JOIN jangwat ON LEFT(ampher.ampher_id,2) = jangwat.jangwat_id LIMIT 4";

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
              res.json({
                jobCount: jobResult[0].jobCount,
                volunteerCount: volunteerResult[0].volunteerCount,
                jobTypeCount: jobTypeResult[0].jobTypeCount,
                data,
                volunTypeCount: volunTypeResult[0].volunTypeCount,
                lastpost
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
  const volunSql = "SELECT COUNT(DISTINCT interests_volun.jobber_id) AS volunCount FROM jobber INNER JOIN interests_volun ON jobber.jobber_id = interests_volun.jobber_id";
  const empSql = "SELECT COUNT(DISTINCT volunteer_posting.emp_id) AS empCount FROM employer INNER JOIN volunteer_posting ON employer.emp_id = volunteer_posting.emp_id";
  const voluntSql = "SELECT COUNT(*) as voluntCount FROM volunteer_posting";
  const numvolunSql = "SELECT SUM(num_position) as numvolunCount FROM volunteer_posting";
  const volunTypeSql = "SELECT COUNT(*) as volunTypeCount FROM volunteertype";
  const labels = "SELECT voluntype_name , COUNT(*) as volunt , COUNT(interests_volun.voluntype_id) as interested , COUNT(CASE WHEN apply_volun.match > 50 THEN apply_volun.match END) as matched FROM volunteer_posting INNER JOIN volunteertype ON volunteer_posting.volunteer_code = volunteertype.voluntype_id LEFT JOIN interests_volun ON volunteer_posting.volunteer_code = interests_volun.voluntype_id LEFT JOIN apply_volun ON volunteer_posting.post_id = apply_volun.post_id GROUP BY volunteer_posting.volunteer_code ORDER BY volunt DESC LIMIT 6;";
  const pie_vo = "SELECT COUNT(*) AS count , ampher_name as ap FROM `volunteer_posting`  LEFT JOIN tambon ON volunteer_posting.tambon_id = tambon.tambon_id LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id GROUP BY ampher.ampher_id ORDER BY count DESC LIMIT 5";
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
  const jobpost = "SELECT job_posting.*, fullname , position_name , tambon_name as tb , ampher_name as ap , jangwat_name as jw ,edu_name FROM `job_posting` INNER JOIN employer ON job_posting.emp_id = employer.emp_id LEFT JOIN tambon ON job_posting.tambon_id = tambon.tambon_id LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id LEFT JOIN jangwat ON LEFT(ampher.ampher_id,2) = jangwat.jangwat_id LEFT JOIN position ON job_posting.position_code = position.position_id LEFT JOIN education_level ON job_posting.education_code = education_level.edu_id WHERE post_id = ?";
  const job_hs = "SELECT hardskill_name FROM `job_need_hs`LEFT JOIN hardskill ON job_need_hs.hardskill_id = hardskill.hardskill_id WHERE post_id = ?";
  const job_ss = "SELECT softskill_name FROM `job_need_ss`LEFT JOIN softskill ON job_need_ss.softskill_id = softskill.softskill_id WHERE post_id = ?";
  
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

app.get("/emp_pf", (req, res) => {
  const emp_id = req.query.emp_id;
  const employer = "SELECT emp_id , fullname , gender , latitude , longitude ,  address , phone , picture , percent_match as pc_match , about , benefits , status , tambon_name as tb , ampher_name as ap , jangwat_name as jw FROM `employer` LEFT JOIN tambon ON employer.tambon_id = tambon.tambon_id LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id LEFT JOIN jangwat ON LEFT(ampher.ampher_id,2) = jangwat.jangwat_id WHERE emp_id = ?";
  const job_post = "SELECT post_id , job_pic , position_name , post_day , salary , num_position FROM `job_posting` INNER JOIN employer ON job_posting.emp_id = employer.emp_id LEFT JOIN position ON job_posting.position_code = position.position_id WHERE job_posting.emp_id = ?";
  const jobber_review = "SELECT jobber_review.* , fullname , picture FROM `jobber_review`LEFT JOIN jobber ON jobber_review.jobber_id = jobber.jobber_id WHERE emp_id = ?";
  const postcount = "SELECT COUNT(*) as postCount FROM job_posting WHERE emp_id = ?";
  const findvolun = "SELECT about_volun , vission , mission FROM `employer` WHERE emp_id = ?";
  const volun_post = "SELECT post_id , activity_name , volun_pic , post_day , date , time , num_position , location , tambon_name as tb , ampher_name as ap , jangwat_name as jw FROM `volunteer_posting` INNER JOIN employer ON volunteer_posting.emp_id = employer.emp_id LEFT JOIN tambon ON volunteer_posting.tambon_id = tambon.tambon_id LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id LEFT JOIN jangwat ON LEFT(ampher.ampher_id,2) = jangwat.jangwat_id WHERE volunteer_posting.emp_id = ?";
  const volun_review = "SELECT volun_review.* , fullname , picture FROM `volun_review`LEFT JOIN jobber ON volun_review.jobber_id = jobber.jobber_id WHERE volun_review.emp_id = ?";
  const voluncount = "SELECT COUNT(*) as volunCount FROM volunteer_posting WHERE emp_id = ?";
  const job_pic = "SELECT pic_name FROM `picture` WHERE emp_id = ? and type = 'j'";
  const volun_pic = "SELECT pic_name FROM `picture` WHERE emp_id = ? and type = 'v'";


  db.query(employer, [emp_id], (err1, Emp_pf) => {
    if (err1) {
      console.error("DB error:", err1);
      return res.status(500).json({ error: "Server error" });
    }
      db.query(job_post, [emp_id], (err2, job_post) => {
        if (err2) {
          console.error("DB error:", err2);
          return res.status(500).json({ error: "Server error" });
        }
          db.query(jobber_review, [emp_id], (err3, jobber_review) => {
            if (err3) {
              console.error("DB error:", err3);
              return res.status(500).json({ error: "Server error" });
            }
              db.query(postcount, [emp_id], (err4, postCount) => {
                if (err4) {
                  console.error("DB error:", err4);
                  return res.status(500).json({ error: "Server error" });
                }
                  db.query(findvolun, [emp_id], (err5, findvolun) => {
                    if (err5) {
                      console.error("DB error:", err5);
                      return res.status(500).json({ error: "Server error" });
                    }
                      db.query(volun_post, [emp_id], (err6, volun_post) => {
                        if (err6) {
                          console.error("DB error:", err6);
                          return res.status(500).json({ error: "Server error" });
                        }
                          db.query(volun_review, [emp_id], (err7, volun_review) => {
                            if (err7) {
                              console.error("DB error:", err7);
                              return res.status(500).json({ error: "Server error" });
                            }
                              db.query(voluncount, [emp_id], (err8, volunCount) => {
                                if (err8) {
                                  console.error("DB error:", err8);
                                  return res.status(500).json({ error: "Server error" });
                                }
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
                                          res.json({
                                            Emp_pf,
                                            job_post,
                                            jobber_review,
                                            postCount: postCount[0].postCount,
                                            findvolun,
                                            volun_post,
                                            volun_review,
                                            volunCount: volunCount[0].volunCount,
                                            job_pic: picArray,
                                            volun_pic: vpicArray
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
  const jobber_id = req.query.jobber_id;
  const jobber = "SELECT jobber.jobber_id , fullname , gender , LG , address , picture , work_status , jobber.status , tambon_name as tb , ampher_name as ap , jangwat_name as jw , education_history.* , edu_name  FROM `jobber` LEFT JOIN tambon ON jobber.tambon_id = tambon.tambon_id LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id LEFT JOIN jangwat ON LEFT(ampher.ampher_id,2) = jangwat.jangwat_id LEFT JOIN education_history ON jobber.jobber_id = education_history.jobber_id LEFT JOIN education_level ON education_history.edu_id = education_level.edu_id WHERE jobber.jobber_id = ?";
  const work_exper = "SELECT work_experience.* FROM work_experience WHERE jobber_id = ?";
  const interests_work = "SELECT interests_work.* , position_name FROM `interests_work` LEFT JOIN position ON interests_work.position_id = position.position_id WHERE jobber_id = ?";
  const hs = "SELECT hardskill_name FROM `jobber_hs` LEFT JOIN hardskill ON jobber_hs.hardskill_id = hardskill.hardskill_id WHERE jobber_id = ?";
  const ss = "SELECT softskill_name FROM `jobber_ss` LEFT JOIN softskill ON jobber_ss.softskill_id = softskill.softskill_id WHERE jobber_id = ?";
  const job_matched = "SELECT apply_job.* , position_name FROM `apply_job` LEFT JOIN job_posting ON apply_job.post_id = job_posting.post_id LEFT JOIN position ON job_posting.position_code = position.position_id WHERE jobber_id = ? and type = 'm'";
  const interests_volun = "SELECT interests_volun.* , voluntype_name  FROM interests_volun LEFT JOIN volunteertype ON interests_volun.voluntype_id = volunteertype.voluntype_id WHERE jobber_id = ?";
  const volun_matched = "SELECT apply_volun.* , activity_name FROM apply_volun LEFT JOIN volunteer_posting ON apply_volun.post_id = volunteer_posting.post_id WHERE jobber_id = ? and type = 'm'";
  const job_matchedCount = "SELECT COUNT(*) as job_matchedCount FROM `apply_job` WHERE jobber_id = ? and type = 'm'";
  const volun_matchedCount = "SELECT COUNT(*) as volun_matchedCount FROM `apply_volun` WHERE jobber_id = ? and type = 'm'";


  db.query(jobber, [jobber_id], (err1, jobber) => {
    if (err1) {
      console.error("DB error:", err1);
      return res.status(500).json({ error: "Server error" });
    }
      db.query(interests_work, [jobber_id], (err2, interests_work) => {
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
                  db.query(job_matched, [jobber_id], (err5, job_matched) => {
                    if (err5) {
                      console.error("DB error:", err5);
                      return res.status(500).json({ error: "Server error" });
                    }
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
                                      db.query(work_exper, [jobber_id], (err10, work_exper) => {
                                        if (err10) {
                                          console.error("DB error:", err10);
                                          return res.status(500).json({ error: "Server error" });
                                        }
                                          res.json({
                                            jobber,
                                            interests_work,
                                            hs,
                                            ss,
                                            job_matched,
                                            interests_volun,
                                            volun_matched,
                                            job_matchedCount: job_matchedCount[0].job_matchedCount,
                                            volun_matchedCount: volun_matchedCount[0].volun_matchedCount,
                                            work_exper
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
  const volunpost = "SELECT volunteer_posting.*, fullname , voluntype_name , tambon_name as tb , ampher_name as ap , jangwat_name as jw FROM `volunteer_posting` INNER JOIN employer ON volunteer_posting.emp_id = employer.emp_id LEFT JOIN tambon ON volunteer_posting.tambon_id = tambon.tambon_id LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id LEFT JOIN jangwat ON LEFT(ampher.ampher_id,2) = jangwat.jangwat_id LEFT JOIN volunteertype ON volunteer_posting.volunteer_code = volunteertype.voluntype_id WHERE post_id = ?";
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
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'jobvolun.service@gmail.com',
                        pass: 'fbjyivghplprsvre' // ใช้ App Password จาก Gmail
                    }
                });

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

app.get('/sb_jobtype', (req, res)=> {
    const { page = 0, limit = 10 , type = "" } = req.query;
    const offset = (page -1) * limit;
    let sql, totalsql , countall;
    if (type === "job") {
      sql = `SELECT jobtype_name as name , COUNT(job_posting.post_id) as count FROM jobtype LEFT JOIN position ON jobtype.jobtype_id = position.jobtype_id LEFT JOIN job_posting ON position.position_id = job_posting.position_code GROUP BY jobtype.jobtype_id HAVING COUNT(job_posting.post_id) != '0' ORDER BY count DESC LIMIT ? OFFSET ?`;
      totalsql = "SELECT COUNT(*) AS total FROM ( SELECT jobtype.jobtype_id FROM jobtype LEFT JOIN position ON jobtype.jobtype_id = position.jobtype_id LEFT JOIN job_posting ON position.position_id = job_posting.position_code GROUP BY jobtype.jobtype_id HAVING COUNT(job_posting.post_id) != 0 ) AS valid_jobtypes";
      countall = "SELECT COUNT(*) AS countall FROM job_posting";
    }  else if  (type === "volun") {
      sql = `SELECT voluntype_name as name , COUNT(volunteer_posting.post_id) as count FROM volunteertype  LEFT JOIN volunteer_posting ON volunteertype.voluntype_id = volunteer_posting.volunteer_code GROUP BY volunteertype.voluntype_id HAVING COUNT(volunteer_posting.post_id) != '0' ORDER BY count DESC LIMIT ? OFFSET ?`;
      totalsql = "SELECT COUNT(*) AS total FROM (SELECT volunteertype.voluntype_id FROM volunteertype LEFT JOIN volunteer_posting ON volunteertype.voluntype_id = volunteer_posting.volunteer_code GROUP BY volunteertype.voluntype_id HAVING COUNT(volunteer_posting.post_id) != 0) AS valid_voltypes";
      countall = "SELECT COUNT(*) AS countall FROM volunteer_posting";
    }
    

    try {
      // const [data] = db.query(sql);
      // const [totalResult] =  db.query(totalsql);
      db.query(totalsql , (err2, totalResult) => {
        if (err2) return res.status(500).json({ error: "Error counting total" });

        const totalRecords = totalResult[0].total;
        const totalPages = Math.ceil(totalRecords / limit);

        db.query(sql, [parseInt(limit), parseInt(offset)], (err, data) => {
          if (err) return res.status(500).json({ error: "Error fetching data" });
        
          db.query(countall, (err1, countAll) => {
            if (err1) return res.status(500).json({ error: "Error fetching data" });
          

            res.json({ data, totalPages, totalRecords, countAll: countAll[0].countall });
          })
        })
      })

      
    } catch (error) {
      res.status(500).json({ error: "Database error"});
    }
})

app.get('/alljob_card', (req, res)=> {
    const { page = 1, limit = 10, keyword = "" } = req.query;

    const offset = (page -1) * limit;
    const sql = "SELECT post_id , salary , job_pic , position_name , job_posting.emp_id as emp_id , fullname , tambon_name as tb , ampher_name as ap , jangwat_name as jw FROM job_posting LEFT JOIN position ON job_posting.position_code = position.position_id LEFT JOIN employer ON job_posting.emp_id = employer.emp_id LEFT JOIN tambon ON job_posting.tambon_id = tambon.tambon_id LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id LEFT JOIN jangwat ON LEFT(ampher.ampher_id,2) = jangwat.jangwat_id WHERE position_name LIKE ? OR fullname LIKE ? LIMIT ? OFFSET ?";
    const totalsql = "SELECT COUNT(*) AS total FROM job_posting LEFT JOIN position ON job_posting.position_code = position.position_id LEFT JOIN employer ON job_posting.emp_id = employer.emp_id WHERE position_name LIKE ? OR fullname LIKE ?";

    try {
      // const [data] = db.query(sql);
      // const [totalResult] =  db.query(totalsql);
      db.query(totalsql, [`%${keyword}%` , `%${keyword}%`], (err, totalResult) => {
        if (err) return res.status(500).json({ error: "Error fetching data" });

          const totalRecords = totalResult[0].total;
          const totalPages = Math.ceil(totalRecords / limit);
      
        db.query(sql, [`%${keyword}%` , `%${keyword}%` , parseInt(limit) , parseInt(offset)], (err2, data) => {
          if (err2) return res.status(500).json({ error: "Error counting total" });

          res.json({ data, totalPages, totalRecords });
        })
      })
      
    } catch (error) {
      res.status(500).json({ error: "Database error"});
    }
})

app.get('/api/jobs', (req, res)=> {
    const { page = 1, limit = 10, keyword = "" } = req.query;
    const jobtype = decodeURIComponent(req.query.jobtype || "");

    const offset = (page -1) * limit;
    const sql = "SELECT post_id , salary , job_pic , position_name , job_posting.emp_id as emp_id , fullname , tambon_name as tb , ampher_name as ap , jangwat_name as jw FROM job_posting LEFT JOIN position ON job_posting.position_code = position.position_id LEFT JOIN jobtype ON position.jobtype_id = jobtype.jobtype_id LEFT JOIN employer ON job_posting.emp_id = employer.emp_id LEFT JOIN tambon ON job_posting.tambon_id = tambon.tambon_id LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id LEFT JOIN jangwat ON LEFT(ampher.ampher_id,2) = jangwat.jangwat_id WHERE ( position_name LIKE ? OR fullname LIKE ? ) AND jobtype_name = ? LIMIT ? OFFSET ?";
    const totalsql = "SELECT COUNT(*) AS total FROM job_posting LEFT JOIN position ON job_posting.position_code = position.position_id LEFT JOIN jobtype ON position.jobtype_id = jobtype.jobtype_id LEFT JOIN employer ON job_posting.emp_id = employer.emp_id WHERE ( position_name LIKE ? OR fullname LIKE ? ) AND jobtype_name = ?";

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
    const totalsql = "SELECT COUNT(*) AS total FROM volunteer_posting LEFT JOIN volunteertype ON volunteer_posting.volunteer_code = volunteertype.voluntype_id LEFT JOIN employer ON volunteer_posting.emp_id = employer.emp_id WHERE ( activity_name LIKE ? OR fullname LIKE ? ) AND voluntype_name = ?";

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
    const { page = 1, limit = 10, keyword = "" } = req.query;

    const offset = (page -1) * limit;
    const sql = "SELECT volunteer_posting.*, fullname , voluntype_name , tambon_name as tb , ampher_name as ap , jangwat_name as jw FROM `volunteer_posting` LEFT JOIN employer ON volunteer_posting.emp_id = employer.emp_id LEFT JOIN tambon ON volunteer_posting.tambon_id = tambon.tambon_id LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id LEFT JOIN jangwat ON LEFT(ampher.ampher_id,2) = jangwat.jangwat_id LEFT JOIN volunteertype ON volunteer_posting.volunteer_code = volunteertype.voluntype_id WHERE activity_name LIKE ? OR fullname LIKE ? LIMIT ? OFFSET ?";
    const totalsql = "SELECT COUNT(*) AS total FROM volunteer_posting LEFT JOIN employer ON volunteer_posting.emp_id = employer.emp_id LEFT JOIN volunteertype ON volunteer_posting.volunteer_code = volunteertype.voluntype_id  WHERE activity_name LIKE ? OR fullname LIKE ?";

    try {
      // const [data] = db.query(sql);
      // const [totalResult] =  db.query(totalsql);
      db.query(totalsql, [`%${keyword}%` , `%${keyword}%`], (err, totalResult) => {
        if (err) return res.status(500).json({ error: "Error fetching data" });

          const totalRecords = totalResult[0].total;
          const totalPages = Math.ceil(totalRecords / limit);
      
        db.query(sql, [`%${keyword}%` , `%${keyword}%` , parseInt(limit) , parseInt(offset)], (err2, data) => {
          if (err2) return res.status(500).json({ error: "Error counting total" });

          res.json({ data, totalPages, totalRecords });
        })
      })
      
    } catch (error) {
      res.status(500).json({ error: "Database error"});
    }
})

app.get('/emp_card', (req, res)=> {
    const { page = 1, limit = 10, keyword = "" } = req.query;

    const offset = (page -1) * limit;
    const sql = "SELECT employer.emp_id , picture , fullname , COUNT(apply_job.post_id) as hot FROM `employer`LEFT JOIN job_posting ON employer.emp_id = job_posting.emp_id LEFT JOIN apply_job ON job_posting.post_id = apply_job.post_id WHERE fullname LIKE ? GROUP BY employer.emp_id ORDER BY hot DESC LIMIT ? OFFSET ?";
    const totalsql = "SELECT COUNT(*) AS total FROM employer WHERE fullname LIKE ?";

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
    const sql = "SELECT employer.emp_id , picture , fullname , COUNT(apply_volun.post_id) as hot FROM `employer`LEFT JOIN volunteer_posting ON employer.emp_id = volunteer_posting.emp_id LEFT JOIN apply_volun ON volunteer_posting.post_id = apply_volun.post_id WHERE fullname LIKE ? GROUP BY employer.emp_id ORDER BY hot DESC LIMIT ? OFFSET ?";
    const totalsql = "SELECT COUNT(*) AS total FROM employer LEFT JOIN volunteer_posting ON employer.emp_id = volunteer_posting.emp_id WHERE fullname LIKE ?";

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
  const match = "SELECT apply_job.* , position.position_name , post_day , salary , num_position , tambon_name as tb , ampher_name as ap , jangwat_name as jw FROM apply_job LEFT JOIN job_posting ON apply_job.post_id = job_posting.post_id LEFT JOIN position ON job_posting.position_code = position.position_id LEFT JOIN tambon ON job_posting.tambon_id = tambon.tambon_id LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id LEFT JOIN jangwat ON LEFT(ampher.ampher_id,2) = jangwat.jangwat_id WHERE jobber_id = ?  LIMIT ? OFFSET ?";
  const postCount = "SELECT count(*) as postCount FROM apply_job WHERE jobber_id = ? AND type = 'm';";


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

app.get("/user_volun_match", (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const offset = (page -1) * limit;
  const jobber_id = req.query.jobber_id;
  const match = "SELECT apply_volun.* , location , post_day ,  activity_name , date , time , tambon_name as tb , ampher_name as ap , jangwat_name as jw FROM apply_volun LEFT JOIN volunteer_posting ON apply_volun.post_id = volunteer_posting.post_id LEFT JOIN tambon ON volunteer_posting.tambon_id = tambon.tambon_id LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id LEFT JOIN jangwat ON LEFT(ampher.ampher_id,2) = jangwat.jangwat_id WHERE jobber_id = ?  LIMIT ? OFFSET ?";
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
  const data = "SELECT fullname , fullname_eng , gender , LG , birthday , address , phone , email , picture , status , work_status , tambon_name as tb , ampher_name as ap , jangwat_name as jw ,  tambon.tambon_id as tb_id , ampher.ampher_id as ap_id , jangwat.jangwat_id as jw_id FROM jobber  LEFT JOIN tambon ON jobber.tambon_id = tambon.tambon_id LEFT JOIN ampher ON LEFT(tambon.tambon_id,4) = ampher.ampher_id LEFT JOIN jangwat ON LEFT(ampher.ampher_id,2) = jangwat.jangwat_id WHERE jobber_id = ?";
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
      sql = "SELECT COUNT(*) AS count FROM education_history WHERE jobber_id = ?";
      break;
    case "work_ex":
      sql = "SELECT COUNT(*) AS count FROM work_experience WHERE jobber_id = ?";
      break;
    case "inter_work":
      sql = "SELECT COUNT(*) AS count FROM interests_work WHERE jobber_id = ?";
      break;
    case "inter_volun":
      sql = "SELECT COUNT(*) AS count FROM interests_volun WHERE jobber_id = ?";
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
    edu: "SELECT COUNT(*) AS count FROM education_history WHERE jobber_id = ?",
    work_ex: "SELECT COUNT(*) AS count FROM work_experience WHERE jobber_id = ?",
    inter_work: "SELECT COUNT(*) AS count FROM interests_work WHERE jobber_id = ?",
    inter_volun: "SELECT COUNT(*) AS count FROM interests_volun WHERE jobber_id = ?",
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
        (checkResults.inter_volun ? "1" : "0");

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
    LG,
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
        LG = ?,
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
      LG,
      birthday,
      address,
      phone,
      tambon_id,
      jobber_id
    ];

    db.query(sql, values);
    res.json({ success: true, message: "Profile updated" });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ success: false, message: "Something went wrong", error: err.message });
  }
});



app.listen(PORT, ()=> {
    console.log("listening...");
})