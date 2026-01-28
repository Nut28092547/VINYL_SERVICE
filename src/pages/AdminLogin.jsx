import React, { useState } from "react";
import "./AdminLogin.css"; 

function AdminLogin({ onBack, onLoginSuccess }) { 
  const [credentials, setCredentials] = useState({ user: "", pass: "" });
  const [error, setError] = useState(""); 
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); 
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: credentials.user,
          password: credentials.pass
        }),
      });
      
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("isAdminLoggedIn", "true");
        localStorage.setItem("userRole", data.role || "Admin"); 
        localStorage.setItem("fullName", data.fullName || credentials.user); 
        onLoginSuccess(data.role);
      } else {
        setError(data.message || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      }
    } catch (err) {
      setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-page-root">
      <div className="admin-page-wrapper">
        {/* Left Side: Visual Experience */}
        <div className="visual-side">
          <div className="visual-overlay"></div>
          <div className="visual-content">
            <div className="brand-badge">SYSTEM SECURITY</div>
            <h1>Vinyl House <span>Control Center</span></h1>
            <p>ยินดีต้อนรับเข้าสู่ระบบจัดการข้อมูลหลังบ้าน โปรดรักษาความลับของรหัสผ่านเพื่อความปลอดภัยของข้อมูล</p>
            <div className="visual-footer">
              © 2026 Vinyl House Co., Ltd. All Rights Reserved.
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="form-side">
          <div className="login-inner">
            <button className="back-link-btn" onClick={onBack}>
              <span className="arrow">←</span> กลับหน้าหลัก
            </button>
            
            <div className="login-header">
              <h2>Staff Login</h2>
              <p>กรุณาระบุตัวตนเพื่อเข้าใช้งานระบบ</p>
            </div>

            {error && (
              <div className="error-message-box">
                <span className="icon">⚠️</span> {error}
              </div>
            )}

            <form className="admin-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>USERNAME</label>
                <div className="input-with-icon">
                  <input 
                    type="text" 
                    name="user" 
                    placeholder="กรอกชื่อผู้ใช้ของคุณ" 
                    value={credentials.user} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>PASSWORD</label>
                <div className="input-with-icon">
                  <input 
                    type="password" 
                    name="pass" 
                    placeholder="กรอกรหัสผ่าน" 
                    value={credentials.pass} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
              </div>

              <button type="submit" className="login-submit-btn" disabled={isLoading}>
                {isLoading ? (
                  <span className="loader">กำลังตรวจสอบคีย์...</span>
                ) : (
                  "ACCESS SYSTEM"
                )}
              </button>
            </form>
            
            <div className="form-help">
              ลืมรหัสผ่าน? <a href="#">ติดต่อฝ่ายไอที</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;