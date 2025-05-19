/**
 * SIKESAN - Admin Module
 * Mengelola fungsionalitas dashboard admin
 */

// Inisialisasi dashboard admin
function initAdminDashboard(user) {
  // Set nama admin
  document.getElementById('admin-nama').textContent = user.name;
  document.getElementById('welcome-admin-nama').textContent = user.name;
  
  // Load data kelas
  loadClassOptions();
  
  // Load data akun
  loadAccountsList('siswa');
  
  // Load data laporan
  loadHealthReportSummary();
  
  // Inisialisasi event listeners
  initAdminEventListeners();
}

// Memuat opsi kelas
function loadClassOptions() {
  const classes = DB.getClasses();
  
  // Populate kelas dropdown di form akun
  const kelasDropdowns = document.querySelectorAll('#account-kelas, #account-wali-kelas');
  kelasDropdowns.forEach(dropdown => {
    if (dropdown) {
      // Simpan opsi pertama
      const firstOption = dropdown.innerHTML;
      
      // Reset dan tambahkan opsi pertama
      dropdown.innerHTML = firstOption;
      
      // Tambahkan kelas-kelas
      classes.forEach(kelas => {
        const option = document.createElement('option');
        option.value = kelas;
        option.textContent = kelas;
        dropdown.appendChild(option);
      });
    }
  });
  
  // Populate kelas dropdown di filter laporan
  const reportClassDropdown = document.getElementById('filter-report-class');
  if (reportClassDropdown) {
    // Simpan opsi pertama
    const firstOption = reportClassDropdown.innerHTML;
    
    // Reset dan tambahkan opsi pertama
    reportClassDropdown.innerHTML = firstOption;
    
    // Tambahkan kelas-kelas
    classes.forEach(kelas => {
      const option = document.createElement('option');
      option.value = kelas;
      option.textContent = kelas;
      reportClassDropdown.appendChild(option);
    });
  }
}

// Memuat daftar akun berdasarkan peran
function loadAccountsList(role) {
  const users = DB.getUsersByRole(role);
  const accountsTable = document.getElementById('accounts-list');
  
  if (accountsTable) {
    if (users.length > 0) {
      // Filter jika ada pencarian
      const searchTerm = document.getElementById('search-account').value.toLowerCase();
      let filteredUsers = users;
      
      if (searchTerm) {
        filteredUsers = users.filter(user => 
          user.name.toLowerCase().includes(searchTerm) || 
          (user.kelas && user.kelas.toLowerCase().includes(searchTerm))
        );
      }
      
      // Buat HTML untuk daftar akun
      let html = '';
      filteredUsers.forEach(user => {
        html += `
          <tr>
            <td>${user.name}</td>
            <td>${user.username}</td>
            <td>${user.kelas || '-'}</td>
            <td><span class="status-badge ${user.status === 'active' ? 'status-normal' : 'status-danger'}">${user.status === 'active' ? 'Aktif' : 'Nonaktif'}</span></td>
            <td>
              <button class="btn btn-secondary edit-account-btn" data-id="${user.id}">Edit</button>
              <button class="btn btn-danger delete-account-btn" data-id="${user.id}">Hapus</button>
            </td>
          </tr>
        `;
      });
      
      if (html === '') {
        html = `
          <tr>
            <td colspan="5" class="text-center">Tidak ada akun yang sesuai dengan pencarian.</td>
          </tr>
        `;
      }
      
      accountsTable.innerHTML = html;
      
      // Tambahkan event listener untuk tombol edit dan hapus
      initAccountButtonListeners();
      
    } else {
      accountsTable.innerHTML = `
        <tr>
          <td colspan="5" class="text-center">Tidak ada akun ${getRoleDisplayName(role)} terdaftar.</td>
        </tr>
      `;
    }
  }
}

// Memuat ringkasan laporan kesehatan
function loadHealthReportSummary() {
  // Dapatkan filter
  const kelas = document.getElementById('filter-report-class').value;
  const period = document.getElementById('filter-report-date').value;
  
  // Dapatkan ringkasan kesehatan
  const summary = DB.getHealthSummary(kelas, period);
  
  // Update elemen UI
  document.getElementById('total-siswa').textContent = summary.totalSiswa;
  document.getElementById('suhu-normal').textContent = summary.suhuNormal;
  document.getElementById('perlu-perhatian').textContent = summary.perluPerhatian;
  document.getElementById('belum-lapor').textContent = summary.belumLapor;
  
  // Simulasi chart (placeholder)
  simulateReportCharts(kelas, period);
}

// Inisialisasi event listeners untuk dashboard admin
function initAdminEventListeners() {
  // Tab navigation untuk dashboard admin
  const adminTabs = document.querySelectorAll('.admin-tab-btn');
  adminTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      // Deaktifkan semua tab
      adminTabs.forEach(t => t.classList.remove('active'));
      
      // Sembunyikan semua section
      document.getElementById('accounts-section').style.display = 'none';
      document.getElementById('reports-section').style.display = 'none';
      
      // Aktifkan tab yang diklik
      this.classList.add('active');
      
      // Tampilkan section yang sesuai
      const tabId = this.getAttribute('data-tab');
      document.getElementById(`${tabId}-section`).style.display = 'block';
    });
  });
  
  // Tab navigation untuk tipe akun
  const accountTabs = document.querySelectorAll('.account-tabs .tab-btn');
  accountTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      // Deaktifkan semua tab
      accountTabs.forEach(t => t.classList.remove('active'));
      
      // Aktifkan tab yang diklik
      this.classList.add('active');
      
      // Tampilkan akun yang sesuai
      const role = this.getAttribute('data-account');
      loadAccountsList(role);
    });
  });
  
  // Tombol Tambah Akun
  const addAccountBtn = document.getElementById('add-account-btn');
  if (addAccountBtn) {
    addAccountBtn.addEventListener('click', function() {
      openAccountModal();
    });
  }
  
  // Tombol search akun
  const searchBtn = document.getElementById('search-btn');
  if (searchBtn) {
    searchBtn.addEventListener('click', function() {
      const activeTab = document.querySelector('.account-tabs .tab-btn.active');
      const role = activeTab ? activeTab.getAttribute('data-account') : 'siswa';
      loadAccountsList(role);
    });
  }
  
  // Tombol generate laporan
  const generateReportBtn = document.getElementById('generate-report');
  if (generateReportBtn) {
    generateReportBtn.addEventListener('click', function() {
      loadHealthReportSummary();
    });
  }
  
  // Form account modal
  const accountForm = document.getElementById('account-form');
  if (accountForm) {
    accountForm.addEventListener('submit', function(e) {
      e.preventDefault();
      saveAccount();
    });
  }
  
  // Close button modal
  const closeModalBtn = document.querySelector('.close-btn');
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', function() {
      closeAccountModal();
    });
  }
  
  // Perubahan role pada form akun
  const accountRole = document.getElementById('account-role');
  if (accountRole) {
    accountRole.addEventListener('change', function() {
      toggleRoleFields();
    });
  }
}

// Inisialisasi event listener untuk tombol akun
function initAccountButtonListeners() {
  // Edit account buttons
  const editButtons = document.querySelectorAll('.edit-account-btn');
  editButtons.forEach(button => {
    button.addEventListener('click', function() {
      const userId = this.getAttribute('data-id');
      openAccountModal(userId);
    });
  });
  
  // Delete account buttons
  const deleteButtons = document.querySelectorAll('.delete-account-btn');
  deleteButtons.forEach(button => {
    button.addEventListener('click', function() {
      const userId = this.getAttribute('data-id');
      if (confirm('Apakah Anda yakin ingin menghapus akun ini?')) {
        deleteAccount(userId);
      }
    });
  });
}

// Membuka modal akun
function openAccountModal(userId = null) {
  const modal = document.getElementById('account-modal');
  const modalTitle = document.getElementById('modal-title');
  const accountForm = document.getElementById('account-form');
  
  // Reset form
  accountForm.reset();
  
  if (userId) {
    // Edit mode
    modalTitle.textContent = 'Edit Akun';
    
    // Dapatkan data user
    const user = DB.getUserById(userId);
    if (user) {
      // Set field values
      document.getElementById('account-id').value = user.id;
      document.getElementById('account-role').value = user.role;
      document.getElementById('account-name').value = user.name;
      document.getElementById('account-username').value = user.username;
      document.getElementById('account-password').value = user.password;
      
      if (user.kelas) {
        const classField = user.role === 'siswa' ? 'account-kelas' : 'account-wali-kelas';
        document.getElementById(classField).value = user.kelas;
      }
      
      // Update field visibility berdasarkan role
      toggleRoleFields();
      
      // Disable role field saat edit
      document.getElementById('account-role').disabled = true;
    }
  } else {
    // Add mode
    modalTitle.textContent = 'Tambah Akun Baru';
    document.getElementById('account-id').value = '';
    document.getElementById('account-role').disabled = false;
    
    // Set default field visibility
    toggleRoleFields();
  }
  
  // Tampilkan modal
  modal.style.display = 'block';
}

// Menutup modal akun
function closeAccountModal() {
  const modal = document.getElementById('account-modal');
  modal.style.display = 'none';
}

// Toggle field form berdasarkan role
function toggleRoleFields() {
  const role = document.getElementById('account-role').value;
  
  if (role === 'siswa') {
    document.querySelector('.siswa-field').style.display = 'block';
    document.querySelector('.guru-field').style.display = 'none';
  } else if (role === 'guru') {
    document.querySelector('.siswa-field').style.display = 'none';
    document.querySelector('.guru-field').style.display = 'block';
  } else {
    document.querySelector('.siswa-field').style.display = 'none';
    document.querySelector('.guru-field').style.display = 'none';
  }
}

// Menyimpan akun baru/edit
function saveAccount() {
  // Kumpulkan data form
  const accountId = document.getElementById('account-id').value;
  const role = document.getElementById('account-role').value;
  const name = document.getElementById('account-name').value;
  const username = document.getElementById('account-username').value;
  const password = document.getElementById('account-password').value;
  
  // Validasi input
  if (!name || !username || !password) {
    alert('Semua field wajib diisi!');
    return;
  }
  
  // Set kelas berdasarkan role
  let kelas = null;
  if (role === 'siswa') {
    kelas = document.getElementById('account-kelas').value;
    if (!kelas) {
      alert('Pilih kelas untuk siswa!');
      return;
    }
  } else if (role === 'guru') {
    kelas = document.getElementById('account-wali-kelas').value;
    if (!kelas) {
      alert('Pilih kelas untuk guru!');
      return;
    }
  }
  
  // Buat data user
  const userData = {
    name,
    username,
    password,
    role,
    kelas,
    status: 'active'
  };
  
  let result;
  
  if (accountId) {
    // Update akun
    result = DB.updateUser(accountId, userData);
  } else {
    // Tambah akun baru
    result = DB.addUser(userData);
  }
  
  if (result.success) {
    // Tutup modal
    closeAccountModal();
    
    // Tampilkan pesan berhasil
    alert(accountId ? 'Akun berhasil diperbarui!' : 'Akun baru berhasil ditambahkan!');
    
    // Refresh daftar akun
    const activeTab = document.querySelector('.account-tabs .tab-btn.active');
    const currentRole = activeTab ? activeTab.getAttribute('data-account') : 'siswa';
    loadAccountsList(currentRole);
  } else {
    alert(result.message || 'Gagal menyimpan akun.');
  }
}

// Menghapus akun
function deleteAccount(userId) {
  const result = DB.deleteUser(userId);
  
  if (result.success) {
    // Tampilkan pesan berhasil
    alert('Akun berhasil dihapus!');
    
    // Refresh daftar akun
    const activeTab = document.querySelector('.account-tabs .tab-btn.active');
    const currentRole = activeTab ? activeTab.getAttribute('data-account') : 'siswa';
    loadAccountsList(currentRole);
  } else {
    alert(result.message || 'Gagal menghapus akun.');
  }
}

// Simulasi chart untuk laporan
function simulateReportCharts(kelas, period) {
  // Placeholder untuk chart status kesehatan
  const healthStatusChart = document.getElementById('health-status-chart');
  if (healthStatusChart) {
    healthStatusChart.innerHTML = 'Grafik Status Kesehatan akan ditampilkan di sini';
    healthStatusChart.style.display = 'flex';
    healthStatusChart.style.justifyContent = 'center';
    healthStatusChart.style.alignItems = 'center';
  }
  
  // Dapatkan keluhan umum
  const complaints = DB.getCommonComplaints(kelas, period);
  
  // Placeholder untuk chart keluhan umum
  const complaintsChart = document.getElementById('common-complaints-chart');
  if (complaintsChart) {
    if (complaints.length > 0) {
      let complaintText = 'Keluhan umum: ';
      complaints.forEach((item, index) => {
        complaintText += `${item.keyword} (${item.count})${index < complaints.length - 1 ? ', ' : ''}`;
      });
      complaintsChart.innerHTML = complaintText;
    } else {
      complaintsChart.innerHTML = 'Tidak ada data keluhan';
    }
    
    complaintsChart.style.display = 'flex';
    complaintsChart.style.justifyContent = 'center';
    complaintsChart.style.alignItems = 'center';
  }
}

// Helper function untuk mendapatkan nama display dari role
function getRoleDisplayName(role) {
  switch (role) {
    case 'siswa':
      return 'Siswa';
    case 'guru':
      return 'Guru';
    case 'admin':
      return 'Administrator';
    default:
      return role;
  }
}