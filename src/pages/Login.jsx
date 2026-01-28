import React, { useState } from "react";
import "./Auth.css";

function Login({ onLoginSuccess, onSwitchToRegister, onBack }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // ✅ เตรียมข้อมูลให้สะอาดก่อนส่งไป Server
      const loginData = {
        phone: phone.trim(), // ตัดช่องว่างออก เพื่อให้ตรงกับที่บันทึกไว้ใน DB
        password: password
      };

      // ✅ เปลี่ยนเป็น user-login ตาม Endpoint ของคุณ
      const res = await fetch("http://localhost:3000/api/user-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData), // ส่งข้อมูลที่ Clean แล้ว
      });

      const data = await res.json();

      if (res.ok) {
        // เก็บข้อมูลลง LocalStorage
        localStorage.setItem("userData", JSON.stringify(data.user));
        localStorage.setItem("isUserLoggedIn", "true");
        onLoginSuccess(data.user);
      } else {
        // แสดง error message จาก server ถ้ามี (เช่น "ไม่พบเบอร์โทรศัพท์นี้")
        alert(data.message || "เบอร์โทรศัพท์หรือรหัสผ่านไม่ถูกต้อง");
      }
    } catch (err) {
      console.error("Login Error:", err);
      alert("เซิร์ฟเวอร์ขัดข้อง กรุณาลองใหม่ภายหลัง");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">VINYL<span>HOUSE</span></div>
          <h2>ยินดีต้อนรับ</h2>
          <p>เข้าสู่ระบบเพื่อจองคิวและติดตามสถานะงานของคุณ</p>
        </div>

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label>เบอร์โทรศัพท์</label>
            <input 
              type="text" 
              placeholder="08X-XXX-XXXX" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>รหัสผ่าน</label>
            <input 
              type="password" 
              placeholder="กรอกรหัสผ่านของคุณ" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn-auth-submit">เข้าสู่ระบบ</button>
        </form>

        <div className="auth-divider">หรือ</div>

        <div className="auth-footer">
          <p>ยังไม่มีบัญชีใช่ไหม? <span onClick={onSwitchToRegister}>สมัครสมาชิกที่นี่</span></p>
          <button className="btn-back-home" onClick={onBack}>← กลับหน้าหลัก</button>
        </div>
      </div>
    </div>
  );
}

export default Login;