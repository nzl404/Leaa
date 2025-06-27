const jkt48Api = require('@jkt48/core');

// Fungsi log untuk debugging
const debugLog = (message, data = null, isError = false) => {
    const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    console.log(`[${timestamp}] [${isError ? 'ERROR' : 'INFO'}] ${message}`);
    if (data && isError) console.error(data);
};

// Status dan cache management
let newsCheckStatus = {
    isActive: false,
    interval: null,
    lastCheck: null,
    errorCount: 0,
    maxErrors: 5
};

const sentNews = new Set();
// --- PERUBAHAN: Menambahkan ID Grup Chat Baru ---
const groupChatIds = [
    '120363130008666048@g.us', 
    '120363223614020906@g.us'
];
const CHECK_INTERVAL = 60000; // 1 menit

// Fungsi untuk mengonversi tanggal ke format WIB
const getFormattedDateWIB = (dateString) => {
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";

    const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    const wibTime = new Date(utc + (3600000 * 7));

    return `${days[wibTime.getDay()]}, ${wibTime.getDate()} ${months[wibTime.getMonth()]} ${wibTime.getFullYear()}`;
};

// --- FUNGSI FORMAT KONTEN YANG DIPERBARUI ---
const formatNewsContent = (htmlContent) => {
    if (!htmlContent) return '';

    let text = htmlContent;

    // 1. Ganti tag dasar dengan newline untuk menjaga struktur paragraf
    text = text.replace(/<br\s*\/?>/gi, '\n');
    text = text.replace(/<p[^>]*>/gi, '\n');
    text = text.replace(/<\/p>/gi, '\n');
    text = text.replace(/<li>/gi, '\n');

    // 2. Hapus semua tag HTML yang tersisa
    text = text.replace(/<[^>]*>/g, '');

    // 3. Ganti entitas HTML dengan karakter yang sesuai
    text = text
        .replace(/&nbsp;/g, ' ')
        .replace(/&ldquo;/g, '“')
        .replace(/&rdquo;/g, '”')
        .replace(/&lsquo;/g, '‘')
        .replace(/&rsquo;/g, '’')
        .replace(/&amp;/g, '&')
        .replace(/&middot;/g, '•')
        .replace(/&ndash;/g, '–')
        .replace(/&mdash;/g, '—')
        .replace(/\[email&#160;protected\]/g, 'info@jkt48.com');

    // 4. Bersihkan dan rapikan newline
    // Memisahkan setiap baris, membuang baris kosong, lalu menggabungkannya kembali dengan spasi paragraf
    const paragraphs = text.split('\n').map(p => p.trim()).filter(p => p.length > 0);
    
    return paragraphs.join('\n\n');
};

// Fungsi untuk mengambil gambar pertama dalam konten berita
const extractImageFromContent = (content) => {
    if (!content) return null;
    const imgMatch = content.match(/<img[^>]+src=["'](.*?)["']/);
    return imgMatch ? (imgMatch[1].startsWith('http') ? imgMatch[1] : `https://www.jkt48.com${imgMatch[1]}`) : null;
};

// Fungsi untuk format pesan berita
const formatNewsMessage = (newsDetail) => {
    const formattedDate = getFormattedDateWIB(newsDetail.date);
    // Menggunakan fungsi format yang baru
    const content = formatNewsContent(newsDetail.content);

    return `📰 *Berita Terbaru JKT48!* 📰\n\n` +
           `📌 *Judul:* ${newsDetail.title}\n` +
           `📅 *Tanggal:* ${formattedDate}\n\n` +
           `${content}\n\n` +
           `_Sumber: JKT48 Official Website_`;
};

// Fungsi start, stop, restart, dan get status (tidak ada perubahan)
const stopNewsCheck = () => { if (newsCheckStatus.interval) { clearInterval(newsCheckStatus.interval); newsCheckStatus.interval = null; } newsCheckStatus.isActive = false; newsCheckStatus.errorCount = 0; debugLog("News check stopped"); };
const startNewsCheck = (conn) => { stopNewsCheck(); newsCheckStatus.isActive = true; newsCheckStatus.lastCheck = new Date(); newsCheckStatus.errorCount = 0; newsCheckStatus.interval = setInterval(() => checkAndSendNews(conn), CHECK_INTERVAL); debugLog("News check started"); };
const restartNewsCheck = (conn) => { debugLog("Restarting news check..."); stopNewsCheck(); setTimeout(() => startNewsCheck(conn), 2000); };
const getNewsStatus = () => { return `📊 *Status News Checker*\n\n*Status:* ${newsCheckStatus.isActive ? '✅ Aktif' : '❌ Tidak Aktif'}\n*Cek Terakhir:* ${newsCheckStatus.lastCheck ? newsCheckStatus.lastCheck.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) : 'Belum pernah'}\n*Jumlah Error:* ${newsCheckStatus.errorCount}/${newsCheckStatus.maxErrors}\n*Berita Terkirim:* ${sentNews.size}\n*Interval:* ${CHECK_INTERVAL / 1000} detik\n*Target Grup:* ${groupChatIds.length} grup`; };

// Fungsi checkAndSendNews (tidak ada perubahan logika utama)
const checkAndSendNews = async (conn) => {
    if (!newsCheckStatus.isActive) return;

    try {
        const apiKey = 'JKTCONNECT';
        const apiResponse = await jkt48Api.news(apiKey);
        const newsList = apiResponse.news;

        if (!newsList || !Array.isArray(newsList) || newsList.length === 0) {
            debugLog("Array berita tidak ditemukan dalam respons API atau kosong.");
            return;
        }

        const latestNews = newsList[0];
        if (!latestNews || !latestNews.id || sentNews.has(latestNews.id)) {
            return;
        }

        const newsDetail = await jkt48Api.newsDetail(latestNews.id, apiKey);
        if (!newsDetail) {
            debugLog(`Gagal mendapatkan detail untuk berita ID: ${latestNews.id}`);
            return;
        }

        const messageText = formatNewsMessage(newsDetail);
        const imageUrl = extractImageFromContent(newsDetail.content);

        for (const groupId of groupChatIds) {
            try {
                const messageOptions = imageUrl 
                    ? { image: { url: imageUrl }, caption: messageText }
                    : { text: messageText };
                await conn.sendMessage(groupId, messageOptions);
                debugLog(`Berita "${newsDetail.title}" berhasil dikirim ke grup ${groupId}`);
            } catch (error) {
                debugLog(`Gagal mengirim berita ke grup ${groupId}:`, error, true);
            }
        }

        sentNews.add(latestNews.id);
        newsCheckStatus.lastCheck = new Date();
        newsCheckStatus.errorCount = 0;

    } catch (error) {
        debugLog("Error di fungsi checkAndSendNews:", error, true);
        newsCheckStatus.errorCount++;
        
        if (newsCheckStatus.errorCount >= newsCheckStatus.maxErrors) {
            debugLog("Terlalu banyak error, merestart pengecekan otomatis...", null, true);
            restartNewsCheck(conn);
        }
    }
};

// Handler command WhatsApp (tidak ada perubahan)
const handler = async (m, { conn, command, isOwner }) => {
    if (!isOwner) { return m.reply("❌ Maaf, command ini hanya untuk Owner Bot."); }
    switch (command) {
        case "startnews":
            if (newsCheckStatus.isActive) return m.reply("✅ Pengecekan berita sudah aktif.");
            startNewsCheck(conn);
            m.reply(`✅ Pengecekan berita JKT48 diaktifkan! (Interval: ${CHECK_INTERVAL / 1000} detik)`);
            break;
        case "stopnews":
            if (!newsCheckStatus.isActive) return m.reply("❌ Pengecekan berita memang sudah tidak aktif.");
            stopNewsCheck();
            m.reply("❌ Pengecekan berita JKT48 dimatikan.");
            break;
        case "restartnews":
            m.reply("🔄 Merestart service pengecekan berita...");
            restartNewsCheck(conn);
            break;
        case "statusnews":
            m.reply(getNewsStatus());
            break;
        case "checknews":
            m.reply("🔍 Memeriksa berita terbaru secara manual...");
            await checkAndSendNews(conn);
            break;
        case "clearnews":
            sentNews.clear();
            m.reply("🗑️ Cache berita yang sudah terkirim telah dibersihkan.");
            break;
    }
};

handler.help = ['startnews', 'stopnews', 'restartnews', 'statusnews', 'checknews', 'clearnews'];
handler.tags = ['owner'];
handler.command = /^(startnews|stopnews|restartnews|statusnews|checknews|clearnews)$/i;

module.exports = handler;