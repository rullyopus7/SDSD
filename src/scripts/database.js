/**
 * SIKESAN - Database Service
 * Menggunakan localStorage untuk menyimpan data
 */

const DB = {
  // Struktur data
  TABLES: {
    USERS: 'sikesan_users',
    HEALTH_DATA: 'sikesan_health_data',
    FEEDBACK: 'sikesan_feedback',
    CLASSES: 'sikesan_classes',
    HEALTH_STANDARDS: 'sikesan_health_standards'
  },
  
  // Inisialisasi database
  init() {
    // Cek jika database sudah ada
    if (!localStorage.getItem(this.TABLES.USERS)) {
      console.log('Inisialisasi database...');
      
      // Inisialisasi data kelas
      const defaultClasses = [
        '1A', '1B', '1C',
        '2A', '2B', '2C',
        '3A', '3B', '3C',
        '4A', '4B', '4C',
        '5A', '5B', '5C',
        '6A', '6B', '6C'
      ];
      
      // Simpan data kelas
      localStorage.setItem(this.TABLES.CLASSES, JSON.stringify(defaultClasses));
      
      // Inisialisasi standar kesehatan
      const healthStandards = {
        bmi: {
          underweight: 18.5,
          normal: {
            min: 18.5,
            max: 24.9
          },
          overweight: {
            min: 25,
            max: 29.9
          },
          obese: 30
        },
        suhu: {
          normal: {
            min: 36.1,
            max: 37.5
          }
        },
        tinggi: {
          // Standar tinggi badan berdasarkan usia (dalam cm)
          usia_7: { min: 115, max: 135 },
          usia_8: { min: 120, max: 140 },
          usia_9: { min: 125, max: 145 },
          usia_10: { min: 130, max: 150 },
          usia_11: { min: 135, max: 155 },
          usia_12: { min: 140, max: 160 }
        }
      };
      
      localStorage.setItem(this.TABLES.HEALTH_STANDARDS, JSON.stringify(healthStandards));
      
      // Buat akun admin default
      const adminUser = {
        id: this.generateId(),
        name: 'Administrator',
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        kelas: null,
        status: 'active',
        createdAt: new Date().toISOString()
      };
      
      // Buat akun guru default
      const teacherUser = {
        id: this.generateId(),
        name: 'Budi Santoso',
        username: 'budi',
        password: 'guru123',
        role: 'guru',
        kelas: '6A',
        status: 'active',
        createdAt: new Date().toISOString()
      };
      
      // Buat beberapa akun siswa default
      const studentUsers = [
        {
          id: this.generateId(),
          name: 'Ani Rahayu',
          username: 'ani',
          password: 'siswa123',
          role: 'siswa',
          kelas: '6A',
          tanggalLahir: '2013-05-15',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: this.generateId(),
          name: 'Deni Pratama',
          username: 'deni',
          password: 'siswa123',
          role: 'siswa',
          kelas: '6A',
          tanggalLahir: '2013-03-20',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: this.generateId(),
          name: 'Fitri Rahmawati',
          username: 'fitri',
          password: 'siswa123',
          role: 'siswa',
          kelas: '6A',
          tanggalLahir: '2013-08-10',
          status: 'active',
          createdAt: new Date().toISOString()
        }
      ];
      
      // Simpan data pengguna
      localStorage.setItem(this.TABLES.USERS, JSON.stringify([adminUser, teacherUser, ...studentUsers]));
      
      // Inisialisasi tabel lainnya
      localStorage.setItem(this.TABLES.HEALTH_DATA, JSON.stringify([]));
      localStorage.setItem(this.TABLES.FEEDBACK, JSON.stringify([]));
      
      console.log('Database berhasil diinisialisasi!');
    }
  },
  
  // Helper untuk generate ID unik
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  },
  
  // Mengambil data dari localStorage
  getTable(tableName) {
    const data = localStorage.getItem(tableName);
    return data ? JSON.parse(data) : [];
  },
  
  // Menyimpan data ke localStorage
  saveTable(tableName, data) {
    localStorage.setItem(tableName, JSON.stringify(data));
  },
  
  // Mendapatkan standar kesehatan
  getHealthStandards() {
    return JSON.parse(localStorage.getItem(this.TABLES.HEALTH_STANDARDS));
  },
  
  // Menghitung BMI
  calculateBMI(weight, height) {
    // Konversi tinggi dari cm ke m
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  },
  
  // Mendapatkan kategori BMI
  getBMICategory(bmi) {
    const standards = this.getHealthStandards().bmi;
    
    if (bmi < standards.underweight) return 'Berat Badan Kurang';
    if (bmi >= standards.normal.min && bmi <= standards.normal.max) return 'Berat Badan Normal';
    if (bmi >= standards.overweight.min && bmi <= standards.overweight.max) return 'Berat Badan Lebih';
    return 'Obesitas';
  },
  
  // Mendapatkan rekomendasi kesehatan berdasarkan BMI
  getHealthRecommendations(bmi, suhu) {
    const recommendations = [];
    const standards = this.getHealthStandards();
    
    // Rekomendasi berdasarkan BMI
    if (bmi < standards.bmi.underweight) {
      recommendations.push({
        type: 'warning',
        message: 'Berat badan Anda kurang. Rekomendasi:',
        items: [
          'Konsumsi makanan bergizi seimbang',
          'Tingkatkan porsi makan',
          'Konsumsi camilan sehat seperti kacang-kacangan',
          'Lakukan olahraga ringan secara teratur'
        ]
      });
    } else if (bmi > standards.bmi.overweight.min) {
      recommendations.push({
        type: 'warning',
        message: 'Berat badan Anda berlebih. Rekomendasi:',
        items: [
          'Kurangi makanan tinggi gula dan lemak',
          'Perbanyak konsumsi sayur dan buah',
          'Lakukan olahraga minimal 30 menit setiap hari',
          'Hindari makanan cepat saji'
        ]
      });
    } else {
      recommendations.push({
        type: 'success',
        message: 'Berat badan Anda ideal. Pertahankan dengan:',
        items: [
          'Tetap konsumsi makanan bergizi seimbang',
          'Jaga pola makan teratur',
          'Tetap aktif berolahraga',
          'Istirahat yang cukup'
        ]
      });
    }
    
    // Rekomendasi berdasarkan suhu tubuh
    if (suhu < standards.suhu.normal.min) {
      recommendations.push({
        type: 'warning',
        message: 'Suhu tubuh Anda rendah. Rekomendasi:',
        items: [
          'Gunakan pakaian yang hangat',
          'Minum minuman hangat',
          'Hindari ruangan yang terlalu dingin',
          'Jika berlanjut, segera hubungi guru atau orang tua'
        ]
      });
    } else if (suhu > standards.suhu.normal.max) {
      recommendations.push({
        type: 'danger',
        message: 'Suhu tubuh Anda tinggi. Rekomendasi:',
        items: [
          'Istirahat yang cukup',
          'Perbanyak minum air putih',
          'Kompres dengan air hangat',
          'Segera hubungi guru atau orang tua'
        ]
      });
    }
    
    return recommendations;
  },
  
  // Fungsi autentikasi
  authenticate(username, password, role) {
    const users = this.getTable(this.TABLES.USERS);
    const user = users.find(user => 
      user.username === username && 
      user.password === password && 
      user.role === role &&
      user.status === 'active'
    );
    
    return user || null;
  },
  
  // Fungsi untuk mendapatkan daftar kelas
  getClasses() {
    return this.getTable(this.TABLES.CLASSES);
  },
  
  // Manajemen pengguna
  
  // Mendapatkan semua pengguna
  getAllUsers() {
    return this.getTable(this.TABLES.USERS);
  },
  
  // Mendapatkan pengguna berdasarkan peran
  getUsersByRole(role) {
    const users = this.getTable(this.TABLES.USERS);
    return users.filter(user => user.role === role);
  },
  
  // Mendapatkan pengguna berdasarkan ID
  getUserById(id) {
    const users = this.getTable(this.TABLES.USERS);
    return users.find(user => user.id === id) || null;
  },
  
  // Mendapatkan siswa berdasarkan kelas
  getStudentsByClass(kelas) {
    const users = this.getTable(this.TABLES.USERS);
    return users.filter(user => user.role === 'siswa' && user.kelas === kelas);
  },
  
  // Menambahkan pengguna baru
  addUser(userData) {
    const users = this.getTable(this.TABLES.USERS);
    
    // Cek username sudah ada atau belum
    const existingUser = users.find(user => user.username === userData.username);
    if (existingUser) {
      return { success: false, message: 'Username sudah digunakan' };
    }
    
    const newUser = {
      id: this.generateId(),
      ...userData,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    this.saveTable(this.TABLES.USERS, users);
    
    return { success: true, user: newUser };
  },
  
  // Memperbarui data pengguna
  updateUser(id, userData) {
    const users = this.getTable(this.TABLES.USERS);
    const index = users.findIndex(user => user.id === id);
    
    if (index === -1) {
      return { success: false, message: 'Pengguna tidak ditemukan' };
    }
    
    // Cek username jika diubah
    if (userData.username !== users[index].username) {
      const existingUser = users.find(user => user.username === userData.username);
      if (existingUser) {
        return { success: false, message: 'Username sudah digunakan' };
      }
    }
    
    users[index] = { ...users[index], ...userData };
    this.saveTable(this.TABLES.USERS, users);
    
    return { success: true, user: users[index] };
  },
  
  // Menghapus pengguna
  deleteUser(id) {
    const users = this.getTable(this.TABLES.USERS);
    const filteredUsers = users.filter(user => user.id !== id);
    
    if (filteredUsers.length === users.length) {
      return { success: false, message: 'Pengguna tidak ditemukan' };
    }
    
    this.saveTable(this.TABLES.USERS, filteredUsers);
    return { success: true };
  },
  
  // Manajemen data kesehatan
  
  // Menambahkan data kesehatan baru
  addHealthData(healthData) {
    const healthRecords = this.getTable(this.TABLES.HEALTH_DATA);
    
    // Hitung BMI
    const bmi = this.calculateBMI(parseFloat(healthData.berat), parseFloat(healthData.tinggi));
    
    const newHealthData = {
      id: this.generateId(),
      ...healthData,
      bmi: bmi.toFixed(1),
      bmiCategory: this.getBMICategory(bmi),
      createdAt: new Date().toISOString()
    };
    
    healthRecords.push(newHealthData);
    this.saveTable(this.TABLES.HEALTH_DATA, healthRecords);
    
    // Dapatkan rekomendasi kesehatan
    const recommendations = this.getHealthRecommendations(bmi, parseFloat(healthData.suhu));
    
    return { 
      success: true, 
      data: newHealthData,
      recommendations: recommendations
    };
  },
  
  // Mendapatkan data kesehatan berdasarkan ID siswa
  getHealthDataByStudentId(studentId) {
    const healthRecords = this.getTable(this.TABLES.HEALTH_DATA);
    return healthRecords.filter(record => record.studentId === studentId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  
  // Mendapatkan data kesehatan terbaru berdasarkan ID siswa
  getLatestHealthDataByStudentId(studentId) {
    const healthRecords = this.getTable(this.TABLES.HEALTH_DATA);
    const studentRecords = healthRecords.filter(record => record.studentId === studentId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return studentRecords.length > 0 ? studentRecords[0] : null;
  },
  
  // Mendapatkan data kesehatan berdasarkan tanggal
  getHealthDataByDate(date) {
    const healthRecords = this.getTable(this.TABLES.HEALTH_DATA);
    const targetDate = new Date(date);
    
    // Format tanggal menjadi YYYY-MM-DD untuk perbandingan
    const formattedTargetDate = targetDate.toISOString().split('T')[0];
    
    return healthRecords.filter(record => {
      const recordDate = new Date(record.createdAt).toISOString().split('T')[0];
      return recordDate === formattedTargetDate;
    });
  },
  
  // Mendapatkan data kesehatan berdasarkan kelas dan tanggal
  getHealthDataByClassAndDate(kelas, date) {
    // Dapatkan semua siswa di kelas tersebut
    const students = this.getStudentsByClass(kelas);
    const studentIds = students.map(student => student.id);
    
    // Dapatkan data kesehatan berdasarkan tanggal
    const healthRecordsByDate = this.getHealthDataByDate(date);
    
    // Filter data kesehatan berdasarkan ID siswa
    return healthRecordsByDate.filter(record => studentIds.includes(record.studentId));
  },
  
  // Manajemen feedback
  
  // Menambahkan feedback baru
  addFeedback(feedbackData) {
    const feedbacks = this.getTable(this.TABLES.FEEDBACK);
    
    const newFeedback = {
      id: this.generateId(),
      ...feedbackData,
      createdAt: new Date().toISOString()
    };
    
    feedbacks.push(newFeedback);
    this.saveTable(this.TABLES.FEEDBACK, feedbacks);
    
    return { success: true, feedback: newFeedback };
  },
  
  // Mendapatkan feedback berdasarkan ID siswa
  getFeedbackByStudentId(studentId) {
    const feedbacks = this.getTable(this.TABLES.FEEDBACK);
    return feedbacks.filter(feedback => feedback.studentId === studentId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  
  // Fungsi pelaporan
  
  // Mendapatkan rangkuman data kesehatan
  getHealthSummary(kelas = null, period = 'hari-ini') {
    const healthRecords = this.getTable(this.TABLES.HEALTH_DATA);
    const users = this.getTable(this.TABLES.USERS);
    
    // Filter siswa berdasarkan kelas jika ada
    let students;
    if (kelas && kelas !== 'semua') {
      students = users.filter(user => user.role === 'siswa' && user.kelas === kelas);
    } else {
      students = users.filter(user => user.role === 'siswa');
    }
    
    const studentIds = students.map(student => student.id);
    
    // Tentukan rentang tanggal berdasarkan periode
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let startDate = new Date(today);
    
    if (period === 'minggu-ini') {
      // Dapatkan hari Senin dari minggu ini
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      startDate = new Date(today.setDate(diff));
    } else if (period === 'bulan-ini') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    }
    
    // Filter data kesehatan berdasarkan periode dan siswa
    const filteredRecords = healthRecords.filter(record => {
      const recordDate = new Date(record.createdAt);
      return recordDate >= startDate && studentIds.includes(record.studentId);
    });
    
    // Hitung ringkasan
    const uniqueStudentIdsWithRecords = [...new Set(filteredRecords.map(record => record.studentId))];
    
    const summary = {
      totalSiswa: students.length,
      suhuNormal: 0,
      perluPerhatian: 0,
      belumLapor: students.length - uniqueStudentIdsWithRecords.length,
      bmiCategories: {
        kurang: 0,
        normal: 0,
        lebih: 0,
        obesitas: 0
      }
    };
    
    // Kelompokkan berdasarkan siswa dan ambil data terbaru
    const latestRecordByStudent = {};
    
    filteredRecords.forEach(record => {
      const studentId = record.studentId;
      
      if (!latestRecordByStudent[studentId] || new Date(record.createdAt) > new Date(latestRecordByStudent[studentId].createdAt)) {
        latestRecordByStudent[studentId] = record;
      }
    });
    
    // Hitung status kesehatan
    Object.values(latestRecordByStudent).forEach(record => {
      const suhu = parseFloat(record.suhu);
      const standards = this.getHealthStandards();
      
      // Cek suhu
      if (suhu >= standards.suhu.normal.min && suhu <= standards.suhu.normal.max) {
        summary.suhuNormal++;
      } else {
        summary.perluPerhatian++;
      }
      
      // Hitung kategori BMI
      const bmiCategory = record.bmiCategory;
      switch (bmiCategory) {
        case 'Berat Badan Kurang':
          summary.bmiCategories.kurang++;
          break;
        case 'Berat Badan Normal':
          summary.bmiCategories.normal++;
          break;
        case 'Berat Badan Lebih':
          summary.bmiCategories.lebih++;
          break;
        case 'Obesitas':
          summary.bmiCategories.obesitas++;
          break;
      }
    });
    
    return summary;
  },
  
  // Mendapatkan keluhan umum
  getCommonComplaints(kelas = null, period = 'hari-ini') {
    const healthRecords = this.getTable(this.TABLES.HEALTH_DATA);
    const users = this.getTable(this.TABLES.USERS);
    
    // Filter siswa berdasarkan kelas jika ada
    let students;
    if (kelas && kelas !== 'semua') {
      students = users.filter(user => user.role === 'siswa' && user.kelas === kelas);
    } else {
      students = users.filter(user => user.role === 'siswa');
    }
    
    const studentIds = students.map(student => student.id);
    
    // Tentukan rentang tanggal berdasarkan periode
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let startDate = new Date(today);
    
    if (period === 'minggu-ini') {
      // Dapatkan hari Senin dari minggu ini
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      startDate = new Date(today.setDate(diff));
    } else if (period === 'bulan-ini') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    }
    
    // Filter data kesehatan berdasarkan periode dan siswa
    const filteredRecords = healthRecords.filter(record => {
      const recordDate = new Date(record.createdAt);
      return recordDate >= startDate && 
             studentIds.includes(record.studentId) && 
             record.keluhan && 
             record.keluhan.trim() !== '';
    });
    
    // Ekstrak kata kunci keluhan
    const commonKeywords = ['sakit kepala', 'pusing', 'mual', 'batuk', 'pilek', 'demam', 'panas', 'lemas', 'sakit perut', 'diare'];
    const complaintsCount = {};
    
    // Inisialisasi counter
    commonKeywords.forEach(keyword => {
      complaintsCount[keyword] = 0;
    });
    
    // Hitung kemunculan kata kunci
    filteredRecords.forEach(record => {
      const keluhanLower = record.keluhan.toLowerCase();
      
      commonKeywords.forEach(keyword => {
        if (keluhanLower.includes(keyword)) {
          complaintsCount[keyword]++;
        }
      });
    });
    
    // Urutkan dan return top 5
    const sortedComplaints = Object.entries(complaintsCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([keyword, count]) => ({ keyword, count }));
    
    return sortedComplaints;
  }
};

// Inisialisasi database saat script dimuat
DB.init();