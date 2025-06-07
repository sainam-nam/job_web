const express = require('express');
const mysql = require('mysql')
const cors = require('cors')
const bcrypt = require('bcrypt');

const app = express()
app.use(cors())
app.use(express.json());

const db = mysql.createConnection({
    host: "localhost",
    user: 'root',
    password: '',
    database: 'db_jobb'
})

/*app.get('/' , (re , res)=> {
   return res.json("From Backend Side"); 
})*/

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

app.post("/jobtype/", (req, res) => {
    const { jobtype_name } = req.body;
    // เช็คว่ามีค่าหรือไม่
    if (!jobtype_name || jobtype_name.trim() === "") {
        return res.status(400).json({ error: "กรุณากรอกชื่อทักษะ" });
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

//login jaaa
app.post('/login', (req, res) => {
  const { email , password } = req.body;

  const sql = "SELECT * FROM jobber WHERE email = ?";
  
  
  db.query(sql, [email], async (err, results) => {
    if(err) return res.status(500).json({ message:"Database Error" });
    if(results.length > 0){

      const user = results[0];

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ message: "รหัสผ่านไม่ถูกต้อง"});
      }

      return res.status(200).json({
        status: user.status,
        message: "Login successful",
        email: user.email
      })
      
    }else {
      return res.status(401).json({ message: "ไม่พบผู้ใช้งาน"});

    }

  })
})

//ลงทะเบียนกรุบกริบ
app.post('/register' , async (req, res) => {
  const { firstname, lastname, email, password } = req.body;
  //console.log("req.body:", req.body);

  if (!firstname || !email || !password) {
    return res.status(400).json({ message: "ข้อมูลไม่ครบ!" });
  }

  try {
    const hashPassword = await bcrypt.hash(password, 10);

    const checkSql = 'SELECT * FROM jobber WHERE email = ?';
    
    db.query(checkSql, email, (checkErr, checkResult) => {
      
      if (checkErr) return res.status(500).json({ status: 'error', message: 'Database error'});
        if (checkResult.length > 0) {
          
          return res.status(409).json({ status: 'error', message: 'มีผู้ใช้งานนี้อยู่แล้ว'});
        }
      const sql = 'INSERT INTO jobber (fullname , email , password , status) VALUES (?,?,?,"ON")';
      const fullname = firstname + " " + lastname;

      db.query(sql, [fullname, email, hashPassword], (err, result) => {
        
        if (err) {
           console.error("❌ Insert Error:", err);
           return res.status(500).json({ status: 'error', message: 'ไม่สามารถสมัครสมาชิกได้111'});
        }
        return res.json({ status: 'ok', message: 'สมัครสมาชิกสำเร็จ' });
      });
    });
  } catch (error) {
    
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
});


app.listen(8081, ()=> {
    console.log("listening...");
})