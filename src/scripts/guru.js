/**
 * SIKESAN - Guru Module
 * Mengelola fungsionalitas dashboard guru
 */

// Inisialisasi dashboard guru
function initGuruDashboard(user) {
  // Set nama dan kelas guru
  document.getElementById('guru-nama').textContent = user.name;
  document.getElementById('guru-kelas').textContent = 'Wali Kelas ' + user.kelas;
  document.getElementById('welcome-guru-nama').textContent = user.name;
  document.getElementById('guru-kelas-display').textContent = user.kelas;
  
  // Set filter tanggal ke hari ini
  const filterDateElement = document.getElementById('filter-date');
  if (filterDateElement) {
    const today = new Date();
    filterDateElement.valueAsDate = today;
  }
  
  // Load daftar siswa
  loadStudentsList(user.kelas);
  
  // Inisialisasi event listeners
  initGuruEventListeners(user);
  
  // Inisialisasi navigasi tab
  initGuruTabNavigation();
}

// Memuat daftar siswa berdasarkan kelas
function loadStudentsList(kelas) {
  // Dapatkan semua siswa di kelas yang diampu
  const students = DB.getStudentsByClass(kelas);
  const studentsTable = document.getElementById('students-list');
  
  if (studentsTable) {
    if (students.length > 0) {
      // Dapatkan tanggal dari filter
      const filterDate = document.getElementById('filter-date').value;
      const date = filterDate ? new Date(filterDate) : new Date();
      
      // Dapatkan status filter
      const statusFilter = document.getElementById('filter-status').value;
      
      // Buat HTML untuk daftar siswa
      let html = '';
      students.forEach(student => {
        // Dapatkan data kesehatan terbaru siswa
        const latestHealth = DB.getLatestHealthDataByStudentId(student.id);
        
        // Tentukan apakah data health dari hari yang dipilih
        const isToday = latestHealth ? isSameDay(new Date(latestHealth.createdAt), date) : false;
        
        // Tentukan status kesehatan
        let status = 'Belum Lapor';
        let statusClass = 'status-info';
        let suhu = '-';
        let keluhan = '-';
        
        if (latestHealth && isToday) {
          suhu = latestHealth.suhu;
          keluhan = latestHealth.keluhan;
          
          // Cek status kesehatan berdasarkan suhu
          const suhuValue = parseFloat(suhu);
          if (suhuValue < 36.1) {
            status = 'Hipotermia';
            statusClass = 'status-warning';
          } else if (suhuValue > 37.5) {
            status = 'Demam';
            statusClass = 'status-danger';
          } else {
            status = 'Normal';
            statusClass = 'status-normal';
          }
        }
        
        // Filter berdasarkan status jika dipilih
        if (statusFilter !== 'semua') {
          if ((statusFilter === 'sehat' && status !== 'Normal') || 
              (statusFilter === 'perhatian' && status === 'Normal') ||
              (status === 'Belum Lapor')) {
            return; // Skip siswa ini
          }
        }
        
        html += `
          <tr data-student-id="${student.id}" class="student-row">
            <td>${student.name}</td>
            <td>${suhu} ${suhu !== '-' ? '°C' : ''}</td>
            <td><span class="status-badge ${statusClass}">${status}</span></td>
            <td>${keluhan}</td>
            <td>
              <button class="btn btn-secondary view-detail-btn" data-student-id="${student.id}" data-student-name="${student.name}">
                Lihat Detail
              </button>
            </td>
          </tr>
        `;
      });
      
      if (html === '') {
        html = `
          <tr>
            <td colspan="5" class="text-center">Tidak ada data siswa yang sesuai dengan filter.</td>
          </tr>
        `;
      }
      
      studentsTable.innerHTML = html;
      
      // Tambahkan event listener untuk tombol detail
      const detailButtons = document.querySelectorAll('.view-detail-btn');
      detailButtons.forEach(button => {
        button.addEventListener('click', function() {
          const studentId = this.getAttribute('data-student-id');
          const studentName = this.getAttribute('data-student-name');
          showStudentDetail(studentId, studentName);
        });
      });
      
    } else {
      studentsTable.innerHTML = `
        <tr>
          <td colspan="5" class="text-center">Tidak ada siswa di kelas ini.</td>
        </tr>
      `;
    }
  }
}

// Inisialisasi event listeners untuk dashboard guru
function initGuruEventListeners(user) {
  // Filter tanggal
  const filterDate = document.getElementById('filter-date');
  if (filterDate) {
    filterDate.addEventListener('change', function() {
      loadStudentsList(user.kelas);
    });
  }
  
  // Filter status
  const filterStatus = document.getElementById('filter-status');
  if (filterStatus) {
    filterStatus.addEventListener('change', function() {
      loadStudentsList(user.kelas);
    });
  }
  
  // Tombol refresh data
  const refreshBtn = document.getElementById('refresh-data');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', function() {
      loadStudentsList(user.kelas);
    });
  }
  
  // Form feedback
  const feedbackForm = document.getElementById('feedback-form');
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const studentDetailSection = document.getElementById('student-detail-section');
      const studentId = studentDetailSection.getAttribute('data-student-id');
      
      if (!studentId) {
        showNotification('Siswa tidak valid.', 'error');
        return;
      }
      
      // Kumpulkan data feedback
      const feedbackData = {
        studentId: studentId,
        teacherId: user.id,
        text: document.getElementById('feedback-text').value
      };
      
      // Simpan feedback
      const result = DB.addFeedback(feedbackData);
      
      if (result.success) {
        // Tampilkan notifikasi berhasil
        showNotification('Tanggapan berhasil terkirim!', 'success');
        
        // Perbarui riwayat feedback
        loadTeacherFeedbackHistory(studentId);
        
        // Reset form
        feedbackForm.reset();
      } else {
        showNotification('Gagal mengirim tanggapan.', 'error');
      }
    });
  }
}

// Menampilkan detail siswa
function showStudentDetail(studentId, studentName) {
  // Set ID siswa ke section
  const detailSection = document.getElementById('student-detail-section');
  detailSection.setAttribute('data-student-id', studentId);
  
  // Set nama siswa
  document.getElementById('detail-siswa-nama').textContent = studentName;
  
  // Tampilkan section detail siswa
  detailSection.style.display = 'block';
  
  // Scroll ke bagian detail
  detailSection.scrollIntoView({ behavior: 'smooth' });
  
  // Load data kesehatan siswa
  loadStudentHealthHistory(studentId);
  
  // Load riwayat feedback
  loadTeacherFeedbackHistory(studentId);
  
  // Aktifkan tab pertama
  const firstTab = detailSection.querySelector('.tab-btn');
  if (firstTab) {
    firstTab.click();
  }
}

// Memuat riwayat kesehatan siswa
function loadStudentHealthHistory(studentId) {
  const healthHistory = DB.getHealthDataByStudentId(studentId);
  const healthHistoryTable = document.getElementById('student-health-history');
  
  if (healthHistoryTable) {
    if (healthHistory.length > 0) {
      // Buat HTML untuk data riwayat
      let html = '';
      healthHistory.forEach(record => {
        html += `
          <tr>
            <td>${formatDate(new Date(record.createdAt))}</td>
            <td>${record.suhu} °C</td>
            <td>${record.berat} kg</td>
            <td>${record.tinggi} cm</td>
            <td>${record.keluhan}</td>
          </tr>
        `;
      });
      healthHistoryTable.innerHTML = html;
      
      // Simulasi rendering grafik (placeholder)
      simulateCharts(healthHistory);
      
    } else {
      healthHistoryTable.innerHTML = `
        <tr>
          <td colspan="5" class="text-center">Belum ada data kesehatan.</td>
        </tr>
      `;
      
      // Kosongkan grafik
      document.getElementById('temp-chart').innerHTML = 'Tidak ada data';
      document.getElementById('growth-chart').innerHTML = 'Tidak ada data';
    }
  }
}

// Memuat riwayat feedback
function loadTeacherFeedbackHistory(studentId) {
  const feedback = DB.getFeedbackByStudentId(studentId);
  const feedbackContainer = document.getElementById('teacher-feedback-history');
  
  if (feedbackContainer) {
    if (feedback.length > 0) {
      // Buat HTML untuk feedback
      let html = '';
      feedback.forEach(item => {
        const teacher = DB.getUserById(item.teacherId);
        const teacherName = teacher ? teacher.name : 'Guru';
        
        html += `
          <div class="feedback-item">
            <div class="feedback-meta">
              <span>${teacherName}</span>
              <span>${formatDate(new Date(item.createdAt))}</span>
            </div>
            <div class="feedback-content">
              <p>${item.text}</p>
            </div>
          </div>
        `;
      });
      feedbackContainer.innerHTML = html;
    } else {
      feedbackContainer.innerHTML = '<p class="empty-state">Belum ada riwayat tanggapan.</p>';
    }
  }
}

// Inisialisasi navigasi tab untuk guru
function initGuruTabNavigation() {
  const tabButtons = document.querySelectorAll('.detail-tabs .tab-btn');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Deaktifkan semua tab
      tabButtons.forEach(btn => btn.classList.remove('active'));
      
      // Sembunyikan semua konten tab
      document.querySelectorAll('#student-detail-section .tab-content').forEach(content => {
        content.style.display = 'none';
      });
      
      // Aktifkan tab yang diklik
      this.classList.add('active');
      
      // Tampilkan konten tab yang sesuai
      const tabId = this.getAttribute('data-tab');
      const tabContent = document.getElementById(`${tabId}-tab`);
      if (tabContent) {
        tabContent.style.display = 'block';
      }
    });
  });
}

// Simulasi rendering chart (placeholder)
function simulateCharts(healthData) {
  if (healthData.length > 0) {
    // Placeholder untuk chart suhu
    const tempChart = document.getElementById('temp-chart');
    if (tempChart) {
      tempChart.innerHTML = 'Grafik Suhu Tubuh akan ditampilkan di sini';
      tempChart.style.display = 'flex';
      tempChart.style.justifyContent = 'center';
      tempChart.style.alignItems = 'center';
    }
    
    // Placeholder untuk chart pertumbuhan
    const growthChart = document.getElementById('growth-chart');
    if (growthChart) {
      growthChart.innerHTML = 'Grafik Berat & Tinggi Badan akan ditampilkan di sini';
      growthChart.style.display = 'flex';
      growthChart.style.justifyContent = 'center';
      growthChart.style.alignItems = 'center';
    }
  }
}

// Helper function untuk mengecek apakah dua tanggal sama
function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}