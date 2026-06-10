    // Data Storage
    let resetHistory = [];

    // Load history from localStorage
    function loadHistory() {
        const saved = localStorage.getItem('angkabet_password_history_v2');
        if (saved) resetHistory = JSON.parse(saved);
        renderHistory();
        updateTotalUser();
    }

    function saveHistory() {
        localStorage.setItem('angkabet_password_history_v2', JSON.stringify(resetHistory));
        renderHistory();
        updateTotalUser();
    }

    function updateTotalUser() {
        const el = document.getElementById('total-user-count');
        if (el) el.textContent = resetHistory.length;
    }

    // Generate password — huruf & angka saja, min 6 maks 12
    function generatePassword(noLimit = false) {
        const lower   = 'abcdefghijklmnopqrstuvwxyz';
        const upper   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const all     = lower + upper + numbers;

        const length = noLimit
            ? Math.floor(Math.random() * 8) + 13   // 13-20
            : Math.floor(Math.random() * 7) + 6;   // 6-12

        let password = '', isUnique = false;
        while (!isUnique) {
            password  = lower[Math.floor(Math.random() * lower.length)];
            password += upper[Math.floor(Math.random() * upper.length)];
            password += numbers[Math.floor(Math.random() * numbers.length)];
            while (password.length < length)
                password += all[Math.floor(Math.random() * all.length)];
            password = password.split('').sort(() => Math.random() - 0.5).join('');
            isUnique = !resetHistory.some(i => i.password === password);
        }
        return password;
    }

    // Toast
    function showToast(message, type = 'success') {
        const toast = document.getElementById('toast-notification');
        const icons = { success: '#4ecdc4', error: '#ff6b6b', info: '#45b7d1' };
        const iClass = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
        toast.innerHTML = `<i class="fas ${iClass[type]}" style="color:${icons[type]}"></i><span>${message}</span>`;
        toast.className = `toast ${type} show`;
        clearTimeout(toast._t);
        toast._t = setTimeout(() => toast.classList.remove('show'), 3000);
    }

    // Copy to clipboard
    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            showToast('Berhasil disalin ke clipboard!', 'success');
            return true;
        } catch {
            showToast('Gagal menyalin data', 'error');
            return false;
        }
    }

    // Copy password only (tombol kecil — tidak auto clear)
    function copyPasswordOnly() {
        const pw = document.getElementById('result-password').textContent;
        pw ? copyToClipboard(pw) : showToast('Tidak ada password untuk disalin', 'error');
    }

    // Copy full message lalu langsung bersihkan
    async function copyFullMessage() {
        const username = document.getElementById('result-username').textContent;
        const password = document.getElementById('result-password').textContent;
        const msg =
`Yth, Kami sudah berhasil mereset kembali password anda,

User ID / Username : ${username}
Password : ${password}

Mohon untuk mengcopy paste User ID / Username dan password yang telah kami berikan tanpa menggunakan spasi ya bosku.
Saran kami di simpan di memo anda dan ubah password anda secara berkala, pada menu Ubah Password, Dan mohon untuk selalu menjaga kerahasiaan akun data anda dari orang lain, Terima kasih.`;
        const ok = await copyToClipboard(msg);
        if (ok) setTimeout(() => clearResult(true), 600);
    }

    function deleteHistoryItem(index) {
        if (confirm('Yakin ingin menghapus history ini?')) {
            resetHistory.splice(index, 1);
            saveHistory();
            showToast('History berhasil dihapus', 'info');
        }
    }

    function renderHistory() {
        const tbody = document.getElementById('history-body');
        if (!tbody) return;
        if (resetHistory.length === 0) {
            tbody.innerHTML = '<tr class="empty-row"><td colspan="5">✨ Belum ada history reset password ✨</td></tr>';
            return;
        }
        tbody.innerHTML = resetHistory.map((item, i) => `
            <tr>
                <td>${i + 1}</td>
                <td><strong style="color:#4ecdc4">${escapeHtml(item.username)}</strong></td>
                <td style="font-family:monospace;color:#ff6b6b">${escapeHtml(item.password)}</td>
                <td style="font-size:12px">${escapeHtml(item.datetime)}</td>
                <td><button class="btn-delete-row" onclick="deleteHistoryItem(${i})">
                    <i class="fas fa-trash-alt"></i> Hapus</button></td>
            </tr>`).join('');
    }

    function escapeHtml(t) {
        const d = document.createElement('div');
        d.textContent = t;
        return d.innerHTML;
    }

    function getCurrentDateTime() {
        const now = new Date();
        return now.toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'})
             + ' - ' + now.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    }

    function prosesReset() {
        const inp      = document.getElementById('username');
        const username = inp.value.trim();
        if (!username) { showToast('Masukkan User ID / Username terlebih dahulu!', 'error'); inp.focus(); return; }
        const newPassword = generatePassword(document.getElementById('no-limit').checked);
        document.getElementById('result-username').textContent = username;
        document.getElementById('result-password').textContent  = newPassword;
        document.getElementById('result-card').style.display    = 'block';
        resetHistory.unshift({ username, password: newPassword, datetime: getCurrentDateTime() });
        saveHistory();
        document.getElementById('result-card').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        showToast(`✅ Password berhasil direset untuk ${username}`, 'success');
    }

    function clearResult(skipToast = false) {
        document.getElementById('result-card').style.display = 'none';
        document.getElementById('username').value = '';
        document.getElementById('username').focus();
        if (!skipToast) showToast('Form berhasil dibersihkan', 'info');
    }

    function clearAllHistory() {
        if (confirm('⚠️ Yakin ingin menghapus SEMUA history reset password? ⚠️')) {
            resetHistory = [];
            saveHistory();
            showToast('Semua history berhasil dihapus', 'info');
        }
    }

    // ========== BACKGROUND MANAGER ==========
    // Background disimpan ke localStorage sebagai base64 agar tidak hilang saat refresh
    const BG_STORE_KEY = 'angkabet_bg_v1';

    function saveBgToStorage(base64, mimeType, opacity) {
        try {
            localStorage.setItem(BG_STORE_KEY, JSON.stringify({ base64, mimeType, opacity }));
        } catch(e) {
            // Jika file terlalu besar (>5MB) localStorage bisa penuh — tampilkan pesan
            showToast('File terlalu besar untuk disimpan permanen. Background aktif sampai refresh.', 'info');
        }
    }

    function clearBgFromStorage() {
        localStorage.removeItem(BG_STORE_KEY);
    }

    function applyBg(src, mimeType, opacity) {
        const bgMedia   = document.getElementById('bg-media');
        const bgOverlay = document.getElementById('bg-overlay');
        bgMedia.innerHTML = '';

        if (mimeType.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = src;
            bgMedia.appendChild(img);
        } else if (mimeType.startsWith('video/')) {
            const vid = document.createElement('video');
            vid.src = src;
            vid.autoplay = true;
            vid.loop     = true;
            vid.muted    = true;
            vid.playsInline = true;
            bgMedia.appendChild(vid);
        }

        bgMedia.style.display = 'block';
        setOpacity(opacity);
    }

    function setOpacity(val) {
        const bgMedia   = document.getElementById('bg-media');
        const bgOverlay = document.getElementById('bg-overlay');
        const slider    = document.getElementById('bg-opacity-slider');
        const opValue   = document.getElementById('bg-opacity-value');

        bgMedia.style.opacity = val;

        // Overlay: saat opacity rendah (transparan), konten tetap terbaca
        // — pakai overlay gelap tipis tapi JANGAN terlalu gelap
        // Rumus: semakin transparan bg, overlay semakin terang agar card tetap kontras
        const overlayAlpha = (1 - val) * 0.35;
        bgOverlay.style.background = `rgba(10,8,28,${overlayAlpha.toFixed(2)})`;

        if (slider)  slider.value = val;
        if (opValue) opValue.textContent = Math.round(val * 100) + '%';
    }

    function initBgManager() {
        const panel     = document.getElementById('bg-panel');
        const toggleBtn = document.getElementById('bg-toggle-btn');
        const fileInput = document.getElementById('bg-file-input');
        const clearBtn  = document.getElementById('bg-clear-btn');
        const opSlider  = document.getElementById('bg-opacity-slider');
        const bgMedia   = document.getElementById('bg-media');

        // ---- FIX: toggle panel — stopPropagation agar tidak konflik dg listener luar ----
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            panel.classList.toggle('open');
        });

        // Klik di dalam panel tidak menutupnya
        panel.addEventListener('click', (e) => e.stopPropagation());

        // Klik di luar panel → tutup
        document.addEventListener('click', () => panel.classList.remove('open'));

        // ---- Upload file → konversi ke base64 agar bisa disimpan di localStorage ----
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const validImage = file.type.startsWith('image/');
            const validVideo = file.type.startsWith('video/');
            if (!validImage && !validVideo) {
                showToast('Format tidak didukung. Gunakan JPG, PNG, GIF, atau video.', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = (ev) => {
                const base64   = ev.target.result;          // data:mime;base64,...
                const mimeType = file.type;
                const opacity  = parseFloat(opSlider.value);

                applyBg(base64, mimeType, opacity);
                saveBgToStorage(base64, mimeType, opacity);
                showToast('Background berhasil dipasang & disimpan!', 'success');
            };
            reader.readAsDataURL(file);
            fileInput.value = '';
        });

        // Hapus background
        clearBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            bgMedia.innerHTML = '';
            bgMedia.style.display = 'none';
            document.getElementById('bg-overlay').style.background = 'transparent';
            clearBgFromStorage();
            showToast('Background dihapus', 'info');
        });

        // Slider opacity
        opSlider.addEventListener('input', () => {
            const val     = parseFloat(opSlider.value);
            const stored  = localStorage.getItem(BG_STORE_KEY);
            setOpacity(val);
            // Update opacity di storage juga
            if (stored) {
                try {
                    const data = JSON.parse(stored);
                    data.opacity = val;
                    localStorage.setItem(BG_STORE_KEY, JSON.stringify(data));
                } catch {}
            }
        });

        // ---- Muat background dari localStorage saat halaman dibuka ----
        const storedBg = localStorage.getItem(BG_STORE_KEY);
        if (storedBg) {
            try {
                const { base64, mimeType, opacity } = JSON.parse(storedBg);
                applyBg(base64, mimeType, opacity);
            } catch {
                clearBgFromStorage();
            }
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

        const cpBtn = document.getElementById('copy-password-only');
        if (cpBtn) cpBtn.addEventListener('click', copyPasswordOnly);

        const chBtn = document.getElementById('clear-history-btn');
        if (chBtn) chBtn.addEventListener('click', clearAllHistory);

        document.getElementById('username').addEventListener('keypress', e => {
            if (e.key === 'Enter') prosesReset();
        });
    });

    window.deleteHistoryItem = deleteHistoryItem;
