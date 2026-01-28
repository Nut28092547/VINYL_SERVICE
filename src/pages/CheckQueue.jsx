import React, { useState, useEffect } from "react";
import "./CheckQueue.css";

// ✅ รับ apiUrl มาจาก props (ที่ส่งมาจาก App.js)
const CheckQueue = ({ onBack, apiUrl }) => {
  const [queueList, setQueueList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list"); 
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    id: "", customer_name: "", phone: "", booking_date: "", booking_time: "",
    service_type: "", address_detail: "", sub_district: "", district: "",
    province: "", postcode: "", notes: ""
  });

  // ✅ เปลี่ยนเป็นใช้ apiUrl จาก Props
  const fetchQueues = async () => {
    try {
      const response = await fetch(`${apiUrl}/all-bookings`);
      const data = await response.json();
      setQueueList(data);
    } catch (error) { 
      console.error("Error fetching queues:", error); 
    }
  };

  useEffect(() => { 
    fetchQueues(); 
  }, []);

  const stats = {
    total: queueList.length,
    pending: queueList.filter(q => q.status === 'รอยืนยัน' || !q.status).length,
    confirmed: queueList.filter(q => q.status === 'ยืนยันแล้ว').length,
    finished: queueList.filter(q => q.status === 'เสร็จสิ้น').length,
    canceled: queueList.filter(q => q.status === 'ยกเลิก').length,
  };

  const serviceStats = queueList.reduce((acc, curr) => {
    acc[curr.service_type] = (acc[curr.service_type] || 0) + 1;
    return acc;
  }, {});

  const successRate = stats.total > 0 ? ((stats.finished / stats.total) * 100).toFixed(1) : 0;

  const filteredQueues = queueList.filter(item => 
    item.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.phone?.includes(searchTerm) ||
    item._id?.toString().includes(searchTerm) // เปลี่ยนจาก item.id เป็น item._id ตามมาตรฐาน MongoDB
  );

  // ✅ แก้ไขฟังก์ชัน Update Status ให้ใช้ apiUrl
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const response = await fetch(`${apiUrl}/booking/${id}/status`, {
        method: "PATCH", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchQueues();
      } else {
        const err = await response.json();
        alert(`ไม่สามารถเปลี่ยนสถานะได้: ${err.message || "เกิดข้อผิดพลาด"}`);
      }
    } catch (error) { 
      console.error("Update Error:", error);
      alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    }
  };

  // ✅ แก้ไขฟังก์ชัน Delete ให้ใช้ apiUrl
  const handleDelete = async (id) => {
    if (window.confirm("คุณแน่ใจหรือไม่ที่จะลบรายการนี้?")) {
      try {
        const response = await fetch(`${apiUrl}/booking/${id}`, { method: "DELETE" });
        if (response.ok) fetchQueues();
      } catch (error) { 
        alert("ลบไม่สำเร็จ"); 
      }
    }
  };

  const handleEditClick = (item) => {
    setEditData({ ...item, booking_date: item.booking_date?.split('T')[0] });
    setIsEditing(true);
  };

  // ✅ แก้ไขฟังก์ชัน Update ข้อมูล ให้ใช้ apiUrl
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/booking/${editData._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (response.ok) { 
        setIsEditing(false); 
        fetchQueues(); 
      }
    } catch (error) { 
      alert("แก้ไขไม่สำเร็จ"); 
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'ยืนยันแล้ว': return { color: '#166534', background: '#dcfce7' };
      case 'เสร็จสิ้น': return { color: '#1e40af', background: '#dbeafe' };
      case 'ยกเลิก': return { color: '#991b1b', background: '#fee2e2' };
      default: return { color: '#854d0e', background: '#fef9c3' }; 
    }
  };

  return (
    <div className="admin-wrapper">
      <div className="admin-sidebar">
        <div className="sidebar-brand">
          <h1>Vinyl Admin</h1>
          <p>Management System</p>
        </div>
        <nav className="sidebar-nav">
          <div 
            className={`nav-item ${viewMode === 'list' ? 'active' : ''}`} 
            onClick={() => setViewMode('list')}
            style={{ cursor: 'pointer' }}
          >
            📋 รายการคิวทั้งหมด
          </div>
          <div 
            className={`nav-item ${viewMode === 'report' ? 'active' : ''}`} 
            onClick={() => setViewMode('report')}
            style={{ cursor: 'pointer' }}
          >
            📊 สรุปรายงาน
          </div>
        </nav>
        <button onClick={onBack} className="logout-btn">ออกจากระบบ</button>
      </div>

      <div className="admin-main">
        <header className="main-header">
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="ค้นหาลูกค้า, เบอร์โทร..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="admin-profile">
            <span>Admin Control Panel</span>
          </div>
        </header>

        <div className="scroll-content">
          {viewMode === "list" ? (
            <>
              <div className="stats-row">
                <div className="stat-card">
                  <label>คิวทั้งหมด</label>
                  <h2>{stats.total}</h2>
                </div>
                <div className="stat-card yellow">
                  <label>รอยืนยัน</label>
                  <h2>{stats.pending}</h2>
                </div>
                <div className="stat-card green">
                  <label>ยืนยันแล้ว</label>
                  <h2>{stats.confirmed}</h2>
                </div>
                <div className="stat-card blue">
                  <label>เสร็จสิ้น</label>
                  <h2>{stats.finished}</h2>
                </div>
              </div>

              <div className="table-container">
                <h3>รายการคิวล่าสุด</h3>
                <div className="queue-grid-list">
                  {filteredQueues.map((item) => (
                    <div key={item._id} className="modern-q-card">
                      <div className="q-image">
                        {item.image_url ? (
                          /* ✅ แก้ไขการดึงรูปภาพให้ใช้ apiUrl ลบส่วนเกิน /api ออกถ้าจำเป็น */
                          <img src={`${apiUrl.replace('/api', '')}${item.image_url}`} alt="work" />
                        ) : (
                          <div className="no-image-placeholder">No Image</div>
                        )}
                      </div>
                      <div className="q-info">
                        <div className="q-top">
                          <span className="q-tag">#{item._id?.slice(-6)}</span>
                          <h4 className="q-service-type">{item.service_type}</h4>
                        </div>
                        <p className="q-name"><strong>ลูกค้า:</strong> {item.customer_name}</p>
                        <p className="q-phone"><strong>เบอร์:</strong> {item.phone}</p>
                        <div className="q-loc">
                          <strong>📍 ที่อยู่:</strong> {item.address_detail} 
                          {item.sub_district && ` ต.${item.sub_district}`}
                          {item.district && ` อ.${item.district}`}
                          {item.province && ` จ.${item.province}`}
                          {item.postcode && ` ${item.postcode}`}
                        </div>
                        {item.notes && <p className="q-notes">📝 <strong>โน้ต:</strong> {item.notes}</p>}
                      </div>
                      <div className="q-date-status">
                        <div className="q-time-box">
                          <span>📅 {new Date(item.booking_date).toLocaleDateString('th-TH')}</span>
                          <span>⏰ {item.booking_time} น.</span>
                        </div>
                        <select
                          className="status-dropdown"
                          value={item.status || "รอยืนยัน"}
                          onChange={(e) => handleStatusUpdate(item._id, e.target.value)}
                          style={getStatusStyle(item.status || "รอยืนยัน")}
                        >
                          <option value="รอยืนยัน">รอยืนยัน</option>
                          <option value="ยืนยันแล้ว">ยืนยันแล้ว</option>
                          <option value="เสร็จสิ้น">เสร็จสิ้น</option>
                          <option value="ยกเลิก">ยกเลิก</option>
                        </select>
                        <div className="q-actions">
                          <button onClick={() => handleEditClick(item)} className="edit-mini">แก้ไข</button>
                          <button onClick={() => handleDelete(item._id)} className="del-mini">ลบ</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="report-container" style={{ padding: '20px' }}>
               {/* ส่วน Report เหมือนเดิม */}
               <div className="report-header">
                <h2>📊 สรุปรายงานภาพรวม</h2>
                <p>ข้อมูลอัปเดตล่าสุด {new Date().toLocaleDateString('th-TH')}</p>
              </div>
              <div className="report-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
                <div className="report-card" style={{ background: '#2563eb', color: 'white', padding: '30px', borderRadius: '15px' }}>
                  <h4>อัตรางานที่เสร็จสิ้น</h4>
                  <h1 style={{ fontSize: '3rem', margin: '10px 0' }}>{successRate}%</h1>
                  <p>จากทั้งหมด {stats.total} รายการ</p>
                </div>
                {/* ... (ส่วนอื่นๆ ของ Report เหมือนเดิม) ... */}
              </div>
            </div>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="modal-header-container">
                <h3>แก้ไขข้อมูลคิว #{editData._id}</h3>
                <button className="close-x" onClick={() => setIsEditing(false)}>✕</button>
            </div>
            <form onSubmit={handleUpdate} className="modal-form-grid">
              <div className="form-input"><label>ชื่อลูกค้า</label><input type="text" value={editData.customer_name} onChange={(e) => setEditData({...editData, customer_name: e.target.value})} /></div>
              <div className="form-input"><label>เบอร์โทร</label><input type="text" value={editData.phone} onChange={(e) => setEditData({...editData, phone: e.target.value})} /></div>
              <div className="form-input full"><label>ที่อยู่</label><textarea value={editData.address_detail} onChange={(e) => setEditData({...editData, address_detail: e.target.value})} /></div>
              {/* ส่วน Input อื่นๆ เหมือนเดิม */}
              <div className="modal-buttons">
                <button type="submit" className="save-btn">บันทึกข้อมูล</button>
                <button type="button" onClick={() => setIsEditing(false)} className="close-btn">ปิดหน้าต่าง</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckQueue;