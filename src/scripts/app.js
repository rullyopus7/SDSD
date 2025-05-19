/**
 * SIKESAN - Main Application
 * Menginisialisasi aplikasi dan komponen global
 */

// When the document is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('SIKESAN - Aplikasi Pemantau Kesehatan Anak SD');
  
  // Tambahkan style untuk notifikasi
  addNotificationStyles();
});

// Menambahkan style notifikasi ke dokumen
function addNotificationStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .notification {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 8px;
      color: white;
      font-weight: 600;
      z-index: 1000;
      opacity: 0;
      transform: translateY(-20px);
      transition: all 0.3s ease;
      max-width: 300px;
    }
    
    .notification.success {
      background-color: var(--success-color);
      box-shadow: 0 4px 12px rgba(6, 214, 160, 0.3);
    }
    
    .notification.error {
      background-color: var(--error-color);
      box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
    }
    
    .notification.show {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(style);
}

// Menambahkan asset logo SVG
function createLogoSVG() {
  const logos = document.querySelectorAll('.logo, .logo-small');
  
  logos.forEach(logo => {
    // Hapus logo placeholder jika ada
    logo.innerHTML = '';
    
    // Buat SVG logo sederhana
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.style.width = '100%';
    svg.style.height = '100%';
    
    // Tambahkan elemen-elemen SVG
    svg.innerHTML = `
      <circle cx="50" cy="50" r="45" fill="#4EAFE5" />
      <circle cx="50" cy="50" r="35" fill="#FFF" />
      <path d="M50 25C49 35 35 40 35 50C35 60 45 70 50 75C55 70 65 60 65 50C65 40 51 35 50 25Z" fill="#FF7A2F" />
      <path d="M40 55C40 60 45 65 50 65C55 65 60 60 60 55C60 50 55 45 50 45C45 45 40 50 40 55Z" fill="#4ED969" />
    `;
    
    // Tambahkan SVG ke dalam logo element
    logo.appendChild(svg);
  });
}

// Panggil fungsi untuk membuat logo setelah DOM dimuat
document.addEventListener('DOMContentLoaded', function() {
  createLogoSVG();
});