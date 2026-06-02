// Data Storage
let resetHistory = [];

// Load history from localStorage
function loadHistory() {
    const saved = localStorage.getItem('angkabet_password_history');
    if (saved) {
        resetHistory = JSON.parse(saved);
    }
    renderHistory();
}

// Save history to localStorage
function saveHistory() {
    localStorage.setItem('angkabet_password_history', JSON.stringify(resetHistory));
    renderHistory();
}

// Generate random password
function generatePassword(noLimit = false) {
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const special = '@#$%&*!?';
    
    let length;
    if (noLimit) {
        length = Math.floor(Math.random() * (24 - 17 + 1)) + 17; // 17-24 karakter
    } else {
        length = Math.floor(Math.random() * (16 - 6 + 1)) + 6; // 6-16 karakter
    }
    
    const allChars = lower + upper + numbers + special;
    let password = '';
    
    // Pastikan setidaknya ada 1 huruf besar, 1 kecil, 1 angka, 1 spesial
    password += lower[Math.floor(Math.random() * lower.length)];
    password += upper[Math.floor(Math.random() * upper.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];
    
    // Isi sisa
    for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Acak urutan password
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    return password;
}

// Show Toast Notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast-notification');
    toast.innerHTML = '';
    
    let icon = '';
    if (type === 'success') icon = '<i class="fas fa-check-circle" style="color:#4caf50"></i>';
    if (type === 'error') icon = '<i class="fas fa-exclamation-circle" style="color:#f44336"></i>';
    if (type === 'info') icon = '<i class="fas fa-info-circle" style="color:#2196f3"></i>';
    
    toast.innerHTML = icon + '<span>' + message + '</span>';
    toast.className = 'toast ' + type + ' show';
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Copy to clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Data berhasil disalin ke clipboard!', 'success');
        return true;
    } catch (err) {
        showToast('Gagal menyalin data', 'error');
        return false;
    }
}

// Render History Table
function renderHistory() {
    const tbody = document.getElementById('history-body');
    if (!tbody) return;
    
    if (resetHistory.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="4">Belum ada history</td></tr>';
        return;
    }
    
    tbody.innerHTML = resetHistory.map((item, index) => `
        <tr>
            <td>${index + 1}</td>
            <td><strong>${escapeHtml(item.username)}</strong></td>
            <td style="font-family: monospace;">${escapeHtml(item.password)}</td>
            <td>${item.datetime}</td>
        </tr>
    `).join('');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Get current datetime
function getCurrentDateTime() {
    const now = new Date();
    const tanggal = now.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
    const jam = now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    return `${tanggal} - ${jam}`;
}

// Proses Reset Password
function prosesReset() {
    const usernameInput = document.getElementById('username');
    const username = usernameInput.value.trim();
    const noLimitCheckbox = document.getElementById('no-limit');
    const noLimit = noLimitCheckbox.checked;
    
    if (!username) {
        showToast('Masukkan User ID / Username terlebih dahulu!', 'error');
        usernameInput.focus();
        return;
    }
    
    // Generate password
    const newPassword = generatePassword(noLimit);
    
    // Tampilkan hasil
    document.getElementById('result-username').textContent = username;
    document.getElementById('result-password').textContent = newPassword;
    document.getElementById('result-card').style.display = 'block';
    
    // Simpan ke history
    const historyItem = {
        username: username,
        password: newPassword,
        datetime: getCurrentDateTime()
    };
    resetHistory.unshift(historyItem); // Tambah di awal
    saveHistory();
    
    // Scroll ke hasil
    document.getElementById('result-card').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    showToast(`Password berhasil direset untuk ${username}`, 'success');
}

// Copy data result
function copyResultData() {
    const username = document.getElementById('result-username').textContent;
    const password = document.getElementById('result-password').textContent;
    
    const copyText = `User ID / Username : ${username}\nPassword : ${password}`;
    copyToClipboard(copyText);
}

// Clear result form
function clearResult() {
    document.getElementById('result-card').style.display = 'none';
    document.getElementById('username').value = '';
    document.getElementById('username').focus();
    showToast('Form berhasil dibersihkan', 'info');
}

// Clear all history
function clearAllHistory() {
    if (confirm('Yakin ingin menghapus semua history reset password?')) {
        resetHistory = [];
        saveHistory();
        showToast('Semua history berhasil dihapus', 'info');
    }
}

// Loading Animation & Initialization
document.addEventListener('DOMContentLoaded', function() {
    // Simulasi loading
    setTimeout(() => {
        document.getElementById('loading-overlay').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        showToast('Selamat datang di ANGKABET_GEN_Z88', 'info');
    }, 1500);
    
    // Load history from localStorage
    loadHistory();
    
    // Event Listeners
    document.getElementById('proses-btn').addEventListener('click', prosesReset);
    document.getElementById('copy-btn').addEventListener('click', copyResultData);
    document.getElementById('clear-btn').addEventListener('click', clearResult);
    
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', clearAllHistory);
    }
    
    // Enter key submit
    document.getElementById('username').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            prosesReset();
        }
    });
});

// Handle refresh loading
window.addEventListener('beforeunload', function() {
    // Optional: show loading again
});
