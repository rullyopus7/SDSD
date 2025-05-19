/**
 * SIKESAN - Authentication Service
 * Mengelola fungsi autentikasi dan session
 */

const Auth = {
  // Kunci untuk menyimpan data user di localStorage
  USER_KEY: 'sikesan_current_user',
  
  // Login
  login(username, password, role) {
    // Otentikasi user dari database
    const user = DB.authenticate(username, password, role);
    
    if (user) {
      // Hapus password sebelum menyimpan di session
      const { password, ...userWithoutPassword } = user;
      
      // Simpan data user ke localStorage
      localStorage.setItem(this.USER_KEY, JSON.stringify(userWithoutPassword));
      
      return { success: true, user: userWithoutPassword };
    }
    
    return { success: false, message: 'Username, password, atau peran tidak valid' };
  },
  
  // Logout
  logout() {
    localStorage.removeItem(this.USER_KEY);
  },
  
  // Cek apakah user sudah login
  isLoggedIn() {
    return localStorage.getItem(this.USER_KEY) !== null;
  },
  
  // Mendapatkan user yang sedang login
  getCurrentUser() {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },
  
  // Mendapatkan peran user yang sedang login
  getCurrentRole() {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  },
  
  // Memperbarui data user yang sedang login
  updateCurrentUser(userData) {
    const currentUser = this.getCurrentUser();
    
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    }
    
    return null;
  }
};

// Event listener untuk form login
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('login-form');
  const loginMessage = document.getElementById('login-message');
  
  // Redirect if already logged in
  if (Auth.isLoggedIn()) {
    const currentRole = Auth.getCurrentRole();
    redirectToDashboard(currentRole);
  }
  
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const role = document.getElementById('role').value;
      
      // Validasi input
      if (!username || !password || !role) {
        showLoginMessage('Semua field harus diisi', 'error');
        return;
      }
      
      // Proses login
      const loginResult = Auth.login(username, password, role);
      
      if (loginResult.success) {
        // Tampilkan pesan sukses
        showLoginMessage('Login berhasil! Mengalihkan ke dashboard...', 'success');
        
        // Redirect ke dashboard yang sesuai
        setTimeout(() => {
          redirectToDashboard(role);
        }, 1000);
      } else {
        // Tampilkan pesan error
        showLoginMessage(loginResult.message || 'Login gagal', 'error');
      }
    });
  }
  
  // Handler untuk logout buttons
  const logoutButtons = document.querySelectorAll('#siswa-logout, #guru-logout, #admin-logout');
  logoutButtons.forEach(button => {
    button.addEventListener('click', function() {
      Auth.logout();
      window.location.href = 'index.html';
    });
  });
  
  // Fungsi untuk menampilkan pesan login
  function showLoginMessage(message, type) {
    loginMessage.textContent = message;
    loginMessage.className = 'login-message ' + type;
  }
  
  // Fungsi untuk redirect ke dashboard yang sesuai
  function redirectToDashboard(role) {
    // Sembunyikan semua dashboard
    document.querySelectorAll('.dashboard-container').forEach(el => {
      el.style.display = 'none';
    });
    
    // Tampilkan dashboard yang sesuai
    const dashboardElement = document.getElementById(`${role}-dashboard`);
    if (dashboardElement) {
      dashboardElement.style.display = 'flex';
      
      // Tampilkan data user di dashboard
      const currentUser = Auth.getCurrentUser();
      if (currentUser) {
        // Update elemen UI sesuai dengan peran
        if (role === 'siswa') {
          initSiswaDashboard(currentUser);
        } else if (role === 'guru') {
          initGuruDashboard(currentUser);
        } else if (role === 'admin') {
          initAdminDashboard(currentUser);
        }
      }
    } else {
      console.error('Dashboard tidak ditemukan untuk peran: ' + role);
    }
    
    // Sembunyikan halaman login
    const loginPage = document.getElementById('login-page');
    if (loginPage) {
      loginPage.style.display = 'none';
    }
  }
});