import React, { useState, useEffect } from "react";
import "./App.css";
import AdminLogin from "./pages/AdminLogin"; 
import BookingPage from "./components/BookingPage";
import CheckQueue from "./pages/CheckQueue";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  const [page, setPage] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false); // สำหรับ Admin
  
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  const [userRole, setUserRole] = useState("");
  const [fullName, setFullName] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const adminLogged = localStorage.getItem("isAdminLoggedIn") === "true";
    if (adminLogged) {
      setIsLoggedIn(true);
      setUserRole(localStorage.getItem("userRole") || "");
      setFullName(localStorage.getItem("fullName") || "ผู้ดูแลระบบ");
    }

    const userLogged = localStorage.getItem("isUserLoggedIn") === "true";
    const savedUser = localStorage.getItem("userData");
    if (userLogged && savedUser) {
      setIsUserLoggedIn(true);
      setUserData(JSON.parse(savedUser));
    }
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchPhone) return alert("กรุณากรอกเบอร์โทรศัพท์");
    setIsSearching(true);
    try {
      const res = await fetch(`http://localhost:3000/api/my-booking/${searchPhone}`);
      const data = await res.json();
      setSearchResult(data); 
    } catch (err) {
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setIsSearching(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("ยืนยันการออกจากระบบ?")) {
      localStorage.clear();
      setIsLoggedIn(false);
      setIsUserLoggedIn(false);
      setUserData(null);
      setPage("home");
    }
  };

  const renderContent = () => {
    if (page === "userLogin") {
      return (
        <Login 
          onLoginSuccess={(user) => {
            setIsUserLoggedIn(true);
            setUserData(user);
            localStorage.setItem("isUserLoggedIn", "true");
            localStorage.setItem("userData", JSON.stringify(user));
            setPage("home");
          }} 
          onSwitchToRegister={() => setPage("userRegister")}
          onBack={() => setPage("home")}
        />
      );
    }
    
    if (page === "userRegister") {
      return (
        <Register 
          onSwitchToLogin={() => setPage("userLogin")} 
          onBack={() => setPage("home")} 
        />
      );
    }

    if (page === "login") return <AdminLogin onBack={() => setPage("home")} onLoginSuccess={() => {setIsLoggedIn(true); setPage("check");}} />;
    
    if (page === "booking") {
      if (!isUserLoggedIn) {
        return <Login onLoginSuccess={(user) => {
          setIsUserLoggedIn(true);
          setUserData(user);
          localStorage.setItem("isUserLoggedIn", "true");
          localStorage.setItem("userData", JSON.stringify(user));
          setPage("booking");
        }} onSwitchToRegister={() => setPage("userRegister")} onBack={() => setPage("home")} />;
      }
      return <BookingPage onBack={() => setPage("home")} user={userData} />;
    }

    if (page === "check") return <CheckQueue onBack={() => setPage("home")} />;

    return (
      <div className="home-full-viewport">
        <section className="hero-split">
          <div className="hero-text-container">
            <div className="hero-inner-content">
              <span className="premium-tag">PREMIUM VINYL SERVICE</span>
              <h1>ยกระดับบ้านคุณด้วย <br/><span>ทีมช่างมืออาชีพ</span></h1>
              <p>ระบบจองคิวออนไลน์ที่ง่ายที่สุด เช็คสถานะได้ทันที พร้อมดูแลทุกรายละเอียดเรื่องงานไวนิล</p>
              
              <div className="search-wrapper-v2">
                <form onSubmit={handleSearch} className="search-form-v2">
                  <input 
                    type="text" 
                    placeholder="ใส่เบอร์โทรศัพท์เพื่อตรวจคิว..." 
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                  />
                  <button type="submit">ค้นหา</button>
                </form>
              </div>

              <div className="main-action-btns">
                <button className="btn-primary-large" onClick={() => setPage("booking")}>นัดหมายช่างตอนนี้</button>
                <button className="btn-outline-large" onClick={() => {
                   const el = document.getElementById('work-preview');
                   el?.scrollIntoView({behavior: 'smooth'});
                }}>ดูผลงานของเรา</button>
              </div>
            </div>
          </div>
          
          <div className="hero-image-container">
             <img src="./assets/image/Win.jpg" alt="Vinyl House" />
          <div className="experience-box">
              <h3>10+</h3>
              <p>Years Experience</p>
            </div>
          </div>
        </section>

        {/* Modal สำหรับผลการค้นหา */}
        {searchResult && (
          <div className="fullscreen-overlay" onClick={() => setSearchResult(null)}>
            <div className="status-modal-v2" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2>คิวการจองของคุณ</h2>
                  <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>รายการจองสำหรับเบอร์: {searchPhone}</p>
                </div>
                <button onClick={() => setSearchResult(null)}>✕</button>
              </div>
              <div className="modal-body">
                {searchResult.length > 0 ? searchResult.map(res => (
                  <div key={res.id} className="status-row-v2" style={{ display: 'block', height: 'auto', marginBottom: '15px', padding: '15px' }}>
                    <div className="row-info" style={{ marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                           <strong style={{ fontSize: '1.1rem', color: '#1a56db' }}>{res.service_type}</strong>
                           <div style={{ fontSize: '0.85rem', color: '#666', margin: '4px 0' }}>ID: #{res.id}</div>
                        </div>
                        <span className={`pill-v2 ${
                          res.status === 'เสร็จสิ้น' ? 'done' : 
                          res.status === 'ยืนยันแล้ว' ? 'confirmed' : 'wait'
                        }`}>
                          {res.status || 'รอรับคิว'}
                        </span>
                      </div>
                    </div>

                    <div className="row-details" style={{ fontSize: '0.9rem', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                      <div style={{ marginBottom: '5px' }}>
                        📅 <strong>วันที่นัด:</strong> {new Date(res.booking_date).toLocaleDateString('th-TH')} 
                        <span style={{ marginLeft: '10px' }}>⏰ <strong>เวลา:</strong> {res.booking_time} น.</span>
                      </div>
                      
                      <div style={{ marginBottom: '5px', lineHeight: '1.4' }}>
                        📍 <strong>ที่อยู่ติดตั้ง:</strong> {res.address_detail}
                        {res.sub_district && ` ต.${res.sub_district}`}
                        {res.district && ` อ.${res.district}`}
                        {res.province && ` จ.${res.province}`}
                        {res.postcode && ` ${res.postcode}`}
                      </div>

                      {res.notes && (
                        <div style={{ color: '#d97706', fontSize: '0.85rem', marginTop: '5px' }}>
                          📝 <strong>หมายเหตุ:</strong> {res.notes}
                        </div>
                      )}
                    </div>
                  </div>
                )) : <p style={{ textAlign: 'center', padding: '20px' }}>ไม่พบข้อมูลการจอง</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="full-width-app">
      <nav className="navbar-v2">
        <div className="nav-left">
          <div className="logo-v2" onClick={() => setPage("home")}>VINYL<span>HOUSE</span></div>
        </div>
        <div className="nav-right">
          <button onClick={() => setPage("home")} className={page === "home" ? "active" : ""}>หน้าหลัก</button>
          <button onClick={() => setPage("booking")} className={page === "booking" ? "active" : ""}>จองคิว</button>
          
          {isLoggedIn || isUserLoggedIn ? (
            <>
              {isLoggedIn && <button onClick={() => setPage("check")} className="admin-link">Dashboard</button>}
              {isUserLoggedIn && <span className="user-name-nav">สวัสดี, {userData?.fullName}</span>}
              <button onClick={handleLogout} className="logout-v2">ออกจากระบบ</button>
            </>
          ) : (
            <div className="auth-nav-group">
                <button onClick={() => setPage("userLogin")} className="login-v2">เข้าสู่ระบบ</button>
                <button onClick={() => setPage("login")} className="admin-login-btn-small">แอดมิน</button>
            </div>
          )}
        </div>
      </nav>
      {renderContent()}
    </div>
  );
}

export default App;