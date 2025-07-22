import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'jobvolun.service@gmail.com',
    pass: 'fbjyivghplprsvre' // ใช้ App Password จาก Gmail
  }
});

const sendVerificationEmail = (toEmail, token) => {
  const link = `http://localhost:8000/verify-email?token=${token}`; // ลิงก์ตรงไปยัง backend

  const mailOptions = {
    from: 'jobvolun.service@gmail.com',
    to: toEmail,
    subject: 'ยืนยันอีเมล',
    html: `
      <p>คลิกปุ่มด้านล่างเพื่อยืนยันอีเมลของคุณ:</p>
      <p>
        <a href="${link}" style="
            background-color: #7B6ADA;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            display: inline-block;
            font-weight: bold;
        ">ยืนยันอีเมล</a>
      </p>
    `
  };

  return transporter.sendMail(mailOptions);
};

export default sendVerificationEmail;
