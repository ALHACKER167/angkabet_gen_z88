    // Data Storage
    let resetHistory = [];
    
    // Load history from localStorage
    function loadHistory() {
        const saved = localStorage.getItem('angkabet_password_history_v2');
        if (saved) {
            resetHistory = JSON.parse(saved);
        }
        renderHistory();
        updateTotalUser();
    }
    
    // Save history to localStorage
    function saveHistory() {
        localStorage.setItem('angkabet_password_history_v2', JSON.stringify(resetHistory));
        renderHistory();
        updateTotalUser();
    }
    
    // Update total user count
    function updateTotalUser() {
        const totalUserSpan = document.getElementById('total-user-count');
        if (totalUserSpan) {
            totalUserSpan.textContent = resetHistory.length;
        }
    }
    
    // Generate random password — hanya huruf & angka, min 6 maks 12
    function generatePassword(noLimit = false) {
        const lower   = 'abcdefghijklmnopqrstuvwxyz';
        const upper   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';

        let length;
        if (noLimit) {
            length = Math.floor(Math.random() * (20 - 13 + 1)) + 13; // 13-20 untuk no-limit
        } else {
            length = Math.floor(Math.random() * (12 - 6 + 1)) + 6;   // 6-12 karakter
        }

        const allChars = lower + upper + numbers;

        let password = '';
        let isUnique  = false;

        while (!isUnique) {
            password = '';

            // wajib ada huruf kecil
            password += lower[Math.floor(Math.random() * lower.length)];
            // wajib ada huruf besar
            password += upper[Math.floor(Math.random() * upper.length)];
            // wajib ada angka
            password += numbers[Math.floor(Math.random() * numbers.length)];

            // isi sisanya
            while (password.length < length) {
                password += allChars[Math.floor(Math.random() * allChars.length)];
            }

            // acak posisi
            password = password.split('').sort(() => Math.random() - 0.5).join('');

            // pastikan unik
            isUnique = !resetHistory.some(item => item.password === password);
        }

        return password;
    }
    
    // Show Toast Notification
    function showToast(message, type = 'success') {
        const toast = document.getElementById('toast-notification');
        toast.innerHTML = '';
        
        let icon = '';
        if (type === 'success') icon = '<i class="fas fa-check-circle" style="color:#4ecdc4"></i>';
        if (type === 'error')   icon = '<i class="fas fa-exclamation-circle" style="color:#ff6b6b"></i>';
        if (type === 'info')    icon = '<i class="fas fa-info-circle" style="color:#45b7d1"></i>';
        
        toast.innerHTML = icon + '<span>' + message + '</span>';
        toast.className = 'toast ' + type + ' show';
        
        setTimeout(() => { toast.classList.remove('show'); }, 3000);
    }
    
    // Copy to clipboard
    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            showToast('Berhasil disalin ke clipboard!', 'success');
            return true;
        } catch (err) {
            showToast('Gagal menyalin data', 'error');
            return false;
        }
    }
    
    // Copy password only (tombol kecil di sebelah password — TIDAK auto clear)
    function copyPasswordOnly() {
        const password = document.getElementById('result-password').textContent;
        if (password) {
            copyToClipboard(password);
        } else {
            showToast('Tidak ada password untuk disalin', 'error');
        }
    }
    
    // Copy full message lalu langsung bersihkan data
    async function copyFullMessage() {
        const username = document.getElementById('result-username').textContent;
        const password = document.getElementById('result-password').textContent;
        
        const fullMessage =
`Yth, Kami sudah berhasil mereset kembali password anda,

User ID / Username : ${username}  
Password : ${password}

Mohon untuk mengcopy paste User ID / Username dan password yang telah kami berikan tanpa menggunakan spasi ya bosku.
Saran kami di simpan di memo anda dan ubah password anda secara berkala, pada menu Ubah Password , Dan mohon untuk selalu menjaga kerahasiaan akun data anda dari orang lain, Terima kasih.`;
        
        const ok = await copyToClipboard(fullMessage);
        if (ok) {
            // Tunda sedikit agar toast "disalin" sempat muncul, lalu bersihkan
            setTimeout(() => { clearResult(true); }, 600);
        }
    }
    
    // Delete single history item
    function deleteHistoryItem(index) {
        if (confirm('Yakin ingin menghapus history ini?')) {
            resetHistory.splice(index, 1);
            saveHistory();
            showToast('History berhasil dihapus', 'info');
        }
    }
    
    // Render History Table
    function renderHistory() {
        const tbody = document.getElementById('history-body');
        if (!tbody) return;
        
        if (resetHistory.length === 0) {
            tbody.innerHTML = '<tr class="empty-row"><td colspan="5">✨ Belum ada history reset password ✨</td></tr>';
            return;
        }
        
        tbody.innerHTML = resetHistory.map((item, index) => `
            <tr>
                <td>${index + 1}</td>
                <td><strong style="color: #4ecdc4;">${escapeHtml(item.username)}</strong></td>
                <td style="font-family: monospace; color: #ff6b6b;">${escapeHtml(item.password)}</td>
                <td style="font-size: 12px;">${escapeHtml(item.datetime)}</td>
                <td>
                    <button class="btn-delete-row" onclick="deleteHistoryItem(${index})">
                        <i class="fas fa-trash-alt"></i> Hapus
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    // Escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Get current datetime
    function getCurrentDateTime() {
        const now = new Date();
        const tanggal = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
        const jam     = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        return `${tanggal} - ${jam}`;
    }
    
    // Proses Reset Password
    function prosesReset() {
        const usernameInput = document.getElementById('username');
        const username      = usernameInput.value.trim();
        const noLimit       = document.getElementById('no-limit').checked;
        
        if (!username) {
            showToast('Masukkan User ID / Username terlebih dahulu!', 'error');
            usernameInput.focus();
            return;
        }
        
        const newPassword = generatePassword(noLimit);
        
        document.getElementById('result-username').textContent = username;
        document.getElementById('result-password').textContent  = newPassword;
        document.getElementById('result-card').style.display    = 'block';
        
        resetHistory.unshift({ username, password: newPassword, datetime: getCurrentDateTime() });
        saveHistory();
        
        document.getElementById('result-card').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        showToast(`✅ Password berhasil direset untuk ${username}`, 'success');
    }
    
    // Clear result form
    // skipToast: true jika dipanggil setelah copy (toast sudah tampil)
    function clearResult(skipToast = false) {
        document.getElementById('result-card').style.display = 'none';
        document.getElementById('username').value = '';
        document.getElementById('username').focus();
        if (!skipToast) showToast('Form berhasil dibersihkan', 'info');
    }
    
    // Clear all history
    function clearAllHistory() {
        if (confirm('⚠️ Yakin ingin menghapus SEMUA history reset password? ⚠️')) {
            resetHistory = [];
            saveHistory();
            showToast('Semua history berhasil dihapus', 'info');
        }
    }

    // ========== BACKGROUND MANAGER ==========
    let bgObjectURL = null;  // untuk revoke URL lama

    function initBgManager() {
        const panel     = document.getElementById('bg-panel');
        const toggleBtn = document.getElementById('bg-toggle-btn');
        const fileInput = document.getElementById('bg-file-input');
        const clearBtn  = document.getElementById('bg-clear-btn');
        const opSlider  = document.getElementById('bg-opacity-slider');
        const opValue   = document.getElementById('bg-opacity-value');
        const bgMedia   = document.getElementById('bg-media');
        const bgOverlay = document.getElementById('bg-overlay');

        // Toggle panel
        toggleBtn.addEventListener('click', () => {
            panel.classList.toggle('open');
        });

        // Tutup panel kalau klik di luar
        document.addEventListener('click', (e) => {
            if (!panel.contains(e.target) && e.target !== toggleBtn) {
                panel.classList.remove('open');
            }
        });

        // Upload file
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (bgObjectURL) URL.revokeObjectURL(bgObjectURL);
            bgObjectURL = URL.createObjectURL(file);

            const type = file.type;

            // Sembunyikan semua child lama
            bgMedia.innerHTML = '';

            if (type.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = bgObjectURL;
                img.id  = 'bg-img';
                bgMedia.appendChild(img);
            } else if (type.startsWith('video/')) {
                const vid = document.createElement('video');
                vid.src      = bgObjectURL;
                vid.autoplay = true;
                vid.loop     = true;
                vid.muted    = true;
                vid.playsInline = true;
                vid.id       = 'bg-vid';
                bgMedia.appendChild(vid);
            } else {
                showToast('Format tidak didukung. Gunakan JPG, PNG, GIF, atau video.', 'error');
                return;
            }

            bgMedia.style.display = 'block';
            applyOpacity(parseFloat(opSlider.value));
            showToast('Background berhasil dipasang!', 'success');
            fileInput.value = '';
        });

        // Hapus background
        clearBtn.addEventListener('click', () => {
            if (bgObjectURL) { URL.revokeObjectURL(bgObjectURL); bgObjectURL = null; }
            bgMedia.innerHTML = '';
            bgMedia.style.display = 'none';
            bgOverlay.style.background = 'transparent';
            showToast('Background dihapus', 'info');
        });

        // Slider opacity
        opSlider.addEventListener('input', () => {
            const val = parseFloat(opSlider.value);
            opValue.textContent = Math.round(val * 100) + '%';
            applyOpacity(val);
        });

        function applyOpacity(val) {
            // val 0 = media transparan penuh (bisa dipakai jika ingin efek ghost),
            // val 1 = media penuh terlihat.
            // Kita balik: slider ke kiri = lebih transparan = overlay lebih gelap
            bgMedia.style.opacity = val;
            // Overlay gelap biar konten tetap terbaca (sedikit lebih gelap saat media terang)
            const overlayAlpha = Math.round((1 - val) * 0.5 * 100) / 100;
            bgOverlay.style.background = `rgba(15,12,41,${overlayAlpha})`;
        }
    }

    // ========== INITIALIZE ==========
    document.addEventListener('DOMContentLoaded', function () {
        setTimeout(() => {
            document.getElementById('loading-overlay').style.display = 'none';
            document.getElementById('main-content').style.display    = 'block';
            showToast('✨ Selamat datang di ANGKABET_GEN_Z88 ✨', 'info');
        }, 2000);
        
        loadHistory();
        initBgManager();
        
        document.getElementById('proses-btn').addEventListener('click', prosesReset);
        document.getElementById('copy-btn').addEventListener('click', copyFullMessage);
        document.getElementById('clear-btn').addEventListener('click', () => clearResult(false));
        
        const copyPasswordBtn = document.getElementById('copy-password-only');
        if (copyPasswordBtn) copyPasswordBtn.addEventListener('click', copyPasswordOnly);
        
        const clearHistoryBtn = document.getElementById('clear-history-btn');
        if (clearHistoryBtn) clearHistoryBtn.addEventListener('click', clearAllHistory);
        
        document.getElementById('username').addEventListener('keypress', function (e) {
            if (e.key === 'Enter') prosesReset();
        });
    });
    
    window.deleteHistoryItem = deleteHistoryItem;
