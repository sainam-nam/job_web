export class NotificationService {
  constructor(db, io, mailer) {
    this.db = db;
    this.io = io;
    this.mailer = mailer;
  }

  async add({
    receiverRole,
    receiverId,
    eventKey,
    title,
    body,
    postId = null,
    jobberId = null,
    employerId = null,
    meta = null,
    email = null,
    emailSubject = null,
  }) {
    const metaStr = meta ? JSON.stringify(meta) : null;

    // ---------- 1) เช็คว่ามี record เดิมหรือไม่ ----------
    const selectSql = `
      SELECT id FROM notifications
      WHERE receiver_role = ?
        AND receiver_id = ?
        AND event_key = ?
        AND (post_id <=> ?)   -- <=> ใช้เปรียบเทียบ NULL ได้
        AND (jobber_id <=> ?)
    `;

    const existing = await new Promise((resolve, reject) => {
      this.db.query(
        selectSql,
        [receiverRole, receiverId, eventKey, postId, jobberId],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });

    let payload;
    if (existing.length > 0) {
      // ---------- 2) UPDATE ----------
      if (eventKey === 'EMP_CHOOSE_CANDIDATE' || eventKey === 'EMP_CHOOSE_YOU') {
        const updateSql = `
          UPDATE notifications
            SET meta = ?
          WHERE id = ?
        `;//เปลี่ยนแค่ลิงค์ใน meta อย่างเดียว
        
        await new Promise((resolve, reject) => {
          this.db.query(
            updateSql,
            [metaStr, existing[0].id],
            (err, res) => (err ? reject(err) : resolve(res))
          );
        });

        
      } else {
        const updateSql = `
          UPDATE notifications
            SET title = ?, body = ?, meta = ?, created_at = NOW() , is_read = 0 , read_at = NULL
          WHERE id = ?
        `;//เหมือนเวลาพออัพเดทแล้วมันยังค้างอันเก่าอยู่ ต้องไปแก้ใน sql set global time_zone = '+07:00'; ด้วย ค่อยหาวิธีอื่น
        // เพิ่มคำว่า (อัพเดท) ต่อท้าย title ตอน update แจ้งเตือน
        const updatedTitle = title + ' (อัพเดท)';
        await new Promise((resolve, reject) => {
          this.db.query(
            updateSql,
            [updatedTitle, body, metaStr, existing[0].id],
            (err, res) => (err ? reject(err) : resolve(res))
          );
        });

        payload = {
          id: existing[0].id,
          receiverRole,
          receiverId,
          eventKey,
          title: updatedTitle,
          body,
          postId,
          jobberId,
          employerId,
          meta,
          created_at: new Date().toISOString(),
        };
      }
        

    } else {
      // ---------- 3) INSERT ----------
      const insertSql = `
        INSERT INTO notifications
          (receiver_role, receiver_id, post_id, jobber_id, emp_id,
           event_key, title, body, meta)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        receiverRole,
        receiverId,
        postId,
        jobberId,
        employerId,
        eventKey,
        title,
        body,
        metaStr,
      ];

      const result = await new Promise((resolve, reject) => {
        this.db.query(insertSql, params, (err, res) =>
          err ? reject(err) : resolve(res)
        );
      });

      payload = {
        id: result.insertId,
        receiverRole,
        receiverId,
        eventKey,
        title,
        body,
        postId,
        jobberId,
        employerId,
        meta,
        created_at: new Date().toISOString(),
      };
    }

    // ---------- 4) Push ผ่าน socket ----------
    if (this.io) {
      this.io.to(`${receiverRole}:${receiverId}`).emit("notification:new", payload);
    }

    // ---------- 5) ส่งอีเมล ----------
    // console.log("emaillllllllllll",email);
    // console.log("mailer",this.mailer);
    if (email && this.mailer) {
      // console.log("เข้ายัง");
      try {
        await this.mailer.sendMail({
          to: email,
          subject: emailSubject || title,
          html: `<p>${body}</p>`,
        });
      } catch (mailErr) {
        console.error("ส่งอีเมลแจ้งเตือนล้มเหลว:", mailErr);
      }
    }

    return payload;
  }
}
