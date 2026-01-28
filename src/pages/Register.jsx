import React, { useState } from "react";
import "./Register.css";

function Register({ onSwitchToLogin, onBack }) {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    address: ""
  });

  // ฟังก์ชันกลางสำหรับการเปลี่ยนแปลงข้อมูล
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // เตรียมข้อมูลก่อนส่ง (ทำความสะอาดข้อมูล)
    const dataToSend = {
      ...formData,
      phone: formData.phone.trim(), // ตัดช่องว่างออก
      email: formData.email.trim(),
    };

    try {
      const res = await fetch(`${props.apiUrl}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert("สมัครสมาชิกสำเร็จ! กรุณาล็อกอิน");
        onSwitchToLogin();
      } else {
        alert(data.message || "เกิดข้อผิดพลาด");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ (กรุณาเช็คว่าเปิด Backend หรือยัง)");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>สมัครสมาชิกใหม่</h2>
        <p>เพื่อความสะดวกในการจองคิวและติดตามสถานะ</p>
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            name="fullName"
            placeholder="ชื่อ-นามสกุล" 
            required 
            value={formData.fullName}
            onChange={handleChange} 
          />
          <input 
            type="text" 
            name="phone"
            placeholder="เบอร์โทรศัพท์" 
            required 
            value={formData.phone}
            onChange={handleChange} 
          />
          <input 
            type="email" 
            name="email"
            placeholder="อีเมล (ถ้ามี)" 
            value={formData.email}
            onChange={handleChange} 
          />
          <input 
            type="password" 
            name="password"
            placeholder="รหัสผ่าน" 
            required 
            value={formData.password}
            onChange={handleChange} 
          />
          <textarea 
            name="address"
            placeholder="ที่อยู่ปัจจุบัน (สำหรับส่งช่างไปประเมิน)" 
            value={formData.address}
            onChange={handleChange}
          ></textarea>
          
          <button type="submit" className="btn-auth">สมัครสมาชิก</button>
        </form>
        <div className="auth-footer">
          มีบัญชีอยู่แล้ว? <span onClick={onSwitchToLogin}>เข้าสู่ระบบ</span>
        </div>
        <button className="btn-back-text" onClick={onBack}>กลับหน้าหลัก</button>
      </div>
    </div>
  );
}

export default Register;