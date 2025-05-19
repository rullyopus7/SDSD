/**
 * SIKESAN - Siswa Module
 * Mengelola fungsionalitas dashboard siswa
 */

// Inisialisasi dashboard siswa
function initSiswaDashboard(user) {
  // Set nama dan kelas siswa
  document.getElementById('siswa-nama').textContent = user.name;
  document.getElementById('siswa-kelas').textContent = 'Kelas ' + user.kelas;
  document.getElementById('welcome-siswa-nama').textContent = user.name;
  
  // Set tanggal saat ini
  const currentDateElement = document.getElementById('current-date');
  if (currentDateElement) {
    currentDateElement.textContent = formatDate(new Date());
  }
  
  // Inisialisasi form input kesehatan
  initHealthForm(user.id);
  
  // Tampilkan riwayat kesehatan
  loadHealthHistory(user.id);
  
  // Tampilkan feedback dari guru
  loadFeedback(user.id);
  
  // Inisialisasi tab navigation
  initTabNavigation();
}

// Inisialisasi form kesehatan
function initHealthForm(studentId) {
  const healthForm = document.getElementById('health-form');
  
  if (healthForm) {
    healthForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Kumpulkan data kesehatan
      const healthData = {
        studentId: studentId,
        suhu: document.getElementById('suhu').value,
        berat: document.getElementById('berat').value,
        tinggi: document.getElementById('tinggi').value,
        keluhan: document.getElementById('keluhan').value || '-'
      };
      
      // Simpan data kesehatan
      const result = DB.addHealthData(healthData);
      
      if (result.success) {
        // Tampilkan notifikasi berhasil
        showNotification('Data kesehatan berhasil disimpan!', 'success');
        
        // Tampilkan rekomendasi kesehatan
        showHealthRecommendations(result.recommendations);
        
        // Perbarui riwayat kesehatan
        loadHealthHistory(studentId);
        
        // Reset form
        healthForm.reset();
      } else {
        showNotification('Gagal menyimpan data kesehatan.', 'error');
      }
    });
  }
}

// Menampilkan rekomendasi kesehatan
function showHealthRecommendations(recommendations) {
  const recommendationsContainer = document.getElementById('health-recommendations');
  if (!recommendationsContainer) return;
  
  let html = '<div class="recommendations-section">';
  
  recommendations.forEach(rec => {
    html += `
      <div class="recommendation-card ${rec.type}">
        <h4>${rec.message}</h4>
        <ul>
          ${rec.items.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    `;
  });
  
  html += '</div>';
  recommendationsContainer.innerHTML = html;
  recommendationsContainer.style.display = 'block';
}

// Memuat riwayat kesehatan
function loadHealthHistory(studentId) {
  const healthHistory = DB.getHealthDataByStudentId(studentId);
  const healthHistoryTable = document.getElementById('health-history');
  
  if (healthHistoryTable) {
    if (healthHistory.length > 0) {
      // Buat HTML untuk data riwayat
      let html = '';
      healthHistory.forEach(record => {
        const bmiStatus = getBMIStatusClass(record.bmiCategory);
        const suhuStatus = getSuhuStatusClass(parseFloat(record.suhu));
        
        html += `
          <tr>
            <td>${formatDate(new Date(record.createdAt))}</td>
            <td><span class="status-badge ${suhuStatus}">${record.suhu} °C</span></td>
            <td>${record.berat} kg</td>
            <td>${record.tinggi} cm</td>
            <td><span class="status-badge ${bmiStatus}">${record.bmi} (${record.bmiCategory})</span></td>
            <td>${record.keluhan}</td>
          </tr>
        `;
      });
      healthHistoryTable.innerHTML = html;
      
      // Update grafik kesehatan
      updateHealthCharts(healthHistory);
    } else {
      healthHistoryTable.innerHTML = `
        <tr>
          <td colspan="6" class="text-center">Belum ada data kesehatan.</td>
        </tr>
      `;
    }
  }
}

// Update grafik kesehatan
function updateHealthCharts(healthHistory) {
  const chartContainer = document.getElementById('health-charts');
  if (!chartContainer) return;
  
  // Siapkan data untuk grafik
  const labels = healthHistory.map(record => formatDate(new Date(record.createdAt)));
  const suhuData = healthHistory.map(record => record.suhu);
  const beratData = healthHistory.map(record => record.berat);
  const tinggiData = healthHistory.map(record => record.tinggi);
  const bmiData = healthHistory.map(record => record.bmi);
  
  // Tampilkan grafik sederhana (placeholder)
  chartContainer.innerHTML = `
    <div class="chart-card">
      <h4>Perkembangan Suhu Tubuh</h4>
      <div class="simple-chart">
        ${createSimpleChart(suhuData, labels, '°C')}
      </div>
    </div>
    <div class="chart-card">
      <h4>Perkembangan Berat & Tinggi Badan</h4>
      <div class="simple-chart">
        ${createSimpleChart(beratData, labels, 'kg')}
        ${createSimpleChart(tinggiData, labels, 'cm')}
      </div>
    </div>
    <div class="chart-card">
      <h4>Perkembangan BMI</h4>
      <div class="simple-chart">
        ${createSimpleChart(bmiData, labels, '')}
      </div>
    </div>
  `;
}

// Membuat grafik sederhana
function createSimpleChart(data, labels, unit) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;
  
  return `
    <div class="chart-bars">
      ${data.map((value, index) => {
        const height = range === 0 ? 50 : ((value - min) / range * 80 + 20);
        return `
          <div class="chart-bar" style="height: ${height}%;" title="${labels[index]}: ${value}${unit}">
            <span class="chart-value">${value}${unit}</span>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// Memuat feedback dari guru
function loadFeedback(studentId) {
  const feedback = DB.getFeedbackByStudentId(studentId);
  const feedbackContainer = document.getElementById('feedback-container');
  
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
      feedbackContainer.innerHTML = '<p class="empty-state">Belum ada tanggapan dari guru.</p>';
    }
  }
}

// Inisialisasi navigasi tab
function initTabNavigation() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Deaktifkan semua tab
      tabButtons.forEach(btn => btn.classList.remove('active'));
      
      // Sembunyikan semua konten tab
      document.querySelectorAll('.tab-content').forEach(content => {
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

// Helper function untuk mendapatkan kelas status BMI
function getBMIStatusClass(category) {
  switch (category) {
    case 'Berat Badan Kurang':
      return 'status-warning';
    case 'Berat Badan Normal':
      return 'status-normal';
    case 'Berat Badan Lebih':
      return 'status-warning';
    case 'Obesitas':
      return 'status-danger';
    default:
      return 'status-info';
  }
}

// Helper function untuk mendapatkan kelas status suhu
function getSuhuStatusClass(suhu) {
  const standards = DB.getHealthStandards().suhu;
  
  if (suhu < standards.normal.min) {
    return 'status-warning';
  } else if (suhu > standards.normal.max) {
    return 'status-danger';
  }
  return 'status-normal';
}

// Helper function untuk format tanggal
function formatDate(date) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('id-ID', options);
}

// Helper function untuk menampilkan notifikasi
function showNotification(message, type) {
  // Buat elemen notifikasi
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  // Tambahkan ke DOM
  document.body.appendChild(notification);
  
  // Animasi fade in
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Hapus setelah beberapa saat
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}