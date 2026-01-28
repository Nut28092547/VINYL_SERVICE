import React, { useState, useEffect } from "react";
import "./BookingPage.css";

const BookingPage = ({ onBack }) => {
  const initialFormState = {
    name: "", phone: "", date: "", time: "", service: "",
    address_detail: "", sub_district: "", district: "", province: "", postcode: "", notes: ""
  };
  const [form, setForm] = useState(initialFormState);
  const [allBookings, setAllBookings] = useState([]);
  const [searchPhone, setSearchPhone] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const timeSlots = ["09:00", "12:00", "15:00"];

  const fetchAllBookings = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/all-bookings?t=${Date.now()}`);
      const data = await response.json();
      setAllBookings(data || []);
    } catch (error) { console.error("Error fetching bookings:", error); }
  };

  useEffect(() => { fetchAllBookings(); }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  const getAvailableTimes = (selectedDate) => {
    if (!selectedDate) return timeSlots;
    const bookedTimes = allBookings
      .filter(item => (item.booking_date?.split('T')[0] === selectedDate && item.status !== 'ยกเลิก'))
      .map(item => item.booking_time);
    return timeSlots.filter(time => !bookedTimes.includes(time));
  };

  const handleSearch = () => {
    if (!searchPhone) return alert("กรุณากรอกเบอร์โทรศัพท์");
    const filtered = allBookings.filter(item => item.phone === searchPhone);
    setSearchResults(filtered);
    setIsSearching(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.time) return alert("กรุณาเลือกช่วงเวลาที่ต้องการ");

    try {
      const formData = new FormData();
      
      // ✅ แก้ไขการส่งข้อมูล: ส่งแยกฟิลด์ตามที่ Backend และหน้า Admin รอรับ
      formData.append("customer_name", form.name);
      formData.append("phone", form.phone);
      formData.append("service_type", form.service);
      formData.append("booking_date", form.date);
      formData.append("booking_time", form.time);
      formData.append("address_detail", form.address_detail);
      formData.append("sub_district", form.sub_district);
      formData.append("district", form.district);
      formData.append("province", form.province);
      formData.append("postcode", form.postcode);
      formData.append("notes", form.notes);
      
      if (selectedFile) formData.append("image", selectedFile);

      const response = await fetch("http://localhost:3000/api/booking", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setShowSuccess(true);
        fetchAllBookings(); 
        setForm(initialFormState); 
        setSelectedFile(null); 
        setPreviewUrl(null); 
      } else {
        alert("❌ จองไม่สำเร็จ: ช่วงเวลานี้อาจถูกจองไปแล้ว");
      }
    } catch (error) { alert("❌ ติดต่อ Server ไม่ได้"); }
  };

  if (showSuccess) {
    return (
      <div className="booking-page-root success-overlay">
        <div className="success-card">
          <div className="success-icon">✨</div>
          <h2 className="success-title">การจองคิวสำเร็จ!</h2>
          <p className="success-message">เราได้รับข้อมูลของคุณแล้ว ทีมงานจะติดต่อกลับเพื่อยืนยันนัดหมายเร็วที่สุด</p>
          <button className="btn-primary" onClick={onBack}>กลับสู่หน้าหลัก</button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page-root">
      <div className="gradient-background-overlay"></div> 

      <aside className="left-panel">
        <button onClick={onBack} className="btn-back">← กลับหน้าหลัก</button>
        <div className="branding">
          <h1>Vinyl House</h1>
          <p className="subtitle">บริการจองคิวทีมช่างมืออาชีพ</p>
          <div className="promo-text">
            <p>สัมผัสประสบการณ์การติดตั้งที่ได้มาตรฐานและบริการที่ยอดเยี่ยมจากทีมงานผู้เชี่ยวชาญ</p>
          </div>
        </div>

        <div className="search-module">
          <h3 className="search-title">🔍 ตรวจสอบสถานะคิวของคุณ</h3>
          <div className="search-input-group">
            <input 
              type="text" 
              placeholder="กรอกเบอร์โทรศัพท์..." 
              value={searchPhone} 
              onChange={(e) => setSearchPhone(e.target.value)} 
            />
            <button className="btn-search" onClick={handleSearch}>ค้นหา</button>
          </div>
        </div>
      </aside>

      <main className="right-panel">
        {isSearching ? (
          <div className="search-results-view">
            <div className="results-header">
              <h2>ประวัติการจอง</h2>
              <button className="btn-secondary" onClick={() => setIsSearching(false)}>← กลับไปหน้าจอง</button>
            </div>
            <div className="results-list">
              {searchResults.length > 0 ? searchResults.map((item) => (
                <div key={item.id} className="result-item">
                  <div className="item-details">
                    <p><strong>บริการ:</strong> {item.service_type}</p>
                    <p><strong>วันที่:</strong> {new Date(item.booking_date).toLocaleDateString('th-TH')} | <strong>เวลา:</strong> {item.booking_time} น.</p>
                  </div>
                  <span className={`status-pill status-${item.status === 'เสร็จสิ้น' ? 'done' : item.status === 'ยกเลิก' ? 'cancel' : 'pending'}`}>
                    {item.status || 'รอยืนยัน'}
                  </span>
                </div>
              )) : <p className="no-results-message">ไม่พบข้อมูลการจองสำหรับเบอร์โทรศัพท์นี้</p>}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="booking-form">
            <h2 className="form-title">ลงทะเบียนจองคิว</h2>
            <p className="form-subtitle">กรุณากรอกข้อมูลให้ครบถ้วนเพื่อประสิทธิภาพสูงสุดในการบริการ</p>

            <div className="form-group-grid">
              <div className="form-field">
                <label>ชื่อ-นามสกุล</label>
                <input type="text" placeholder="ระบุชื่อจริง-นามสกุล" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-field">
                <label>เบอร์โทรศัพท์</label>
                <input type="tel" placeholder="08x-xxx-xxxx" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} required />
              </div>
            </div>

            <div className="form-field">
              <label>📍 สถานที่ติดตั้ง / วัดหน้างาน</label>
              <input type="text" placeholder="บ้านเลขที่, หมู่บ้าน, ซอย, ถนน" value={form.address_detail} onChange={(e) => setForm({...form, address_detail: e.target.value})} required />
              <div className="form-group-grid mt-2">
                <input type="text" placeholder="แขวง/ตำบล" value={form.sub_district} onChange={(e) => setForm({...form, sub_district: e.target.value})} required />
                <input type="text" placeholder="เขต/อำเภอ" value={form.district} onChange={(e) => setForm({...form, district: e.target.value})} required />
                <input type="text" placeholder="จังหวัด" value={form.province} onChange={(e) => setForm({...form, province: e.target.value})} required />
                {/* ✅ เพิ่มช่องรหัสไปรษณีย์ */}
                <input type="text" placeholder="รหัสไปรษณีย์" value={form.postcode} onChange={(e) => setForm({...form, postcode: e.target.value})} required />
              </div>
            </div>

            <div className="form-group-grid">
              <div className="form-field">
                <label>วันที่สะดวก</label>
                <input type="date" min={new Date().toISOString().split('T')[0]} value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} required />
              </div>
              <div className="form-field">
                <label>ช่วงเวลา</label>
                <select value={form.time} onChange={(e) => setForm({...form, time: e.target.value})} required disabled={!form.date}>
                  <option value="">-- เลือกเวลา --</option>
                  {getAvailableTimes(form.date).map(t => <option key={t} value={t}>{t} น.</option>)}
                </select>
              </div>
            </div>

            <div className="form-field">
              <label>บริการที่ต้องการ</label>
              <select value={form.service} onChange={(e) => setForm({...form, service: e.target.value})} required>
                <option value="">เลือกประเภทบริการ...</option>
                <option value="ติดตั้งประตู">ติดตั้งประตู (Vinyl Door)</option>
                <option value="ติดตั้งหน้าต่าง">ติดตั้งหน้าต่าง (Vinyl Window)</option>
                <option value="วัดหน้างาน">เช็คคุณภาพ / แก้ไขจุดบกผ่อง</option>
                <option value="วัดหน้างาน">วัดหน้างาน / ประเมินราคา</option>
              </select>
            </div>

            {/* ✅ เพิ่มฟิลด์หมายเหตุ (Notes) */}
            <div className="form-field">
              <label>หมายเหตุ / ข้อมูลเพิ่มเติม</label>
              <input type="text" placeholder="รายละเอียดเพิ่มเติมที่ต้องการแจ้งช่าง" value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} />
            </div>

            <div className="form-field file-upload-section">
              <label>📷 แนบรูปภาพหน้างาน (ถ้ามี)</label>
              <div className={`file-dropzone ${previewUrl ? 'has-image' : ''}`}>
                <input type="file" accept="image/*" onChange={handleFileChange} id="file-upload" hidden />
                <label htmlFor="file-upload" className="dropzone-label">
                  {previewUrl ? <img src={previewUrl} alt="Preview" className="image-preview" /> : "คลิกเพื่ออัปโหลดรูปภาพ"}
                </label>
                {previewUrl && <button type="button" className="clear-image-btn" onClick={() => {setSelectedFile(null); setPreviewUrl(null);}}>X</button>}
              </div>
            </div>

            <button type="submit" className="btn-primary submit-booking">ยืนยันการจองคิว</button>
          </form>
        )}
      </main>
    </div>
  );
};

export default BookingPage;