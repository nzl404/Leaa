const jkt48Api = require('@jkt48/core');
const axios = require("axios");

// Variabel status dan cache global
let isCheckingLive = false;
let checkInterval = null;
let heartbeatInterval = null;
let consecutiveFailures = 0;
const MAX_FAILURES = 5;
const sentEvents = new Set();
const sentYouTubeEvents = new Set();
// --- PERUBAHAN: Mengirim notifikasi ke dua grup ---
const groupChatIds = [
    '120363130008666048@g.us', 
    '120363223614020906@g.us'
];
const connectionObj = {}; // Untuk menyimpan koneksi
    
// Fungsi log dengan timestamp dan level
const debugLog = (message, data = null, isError = false) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${isError ? 'ERROR' : 'INFO'}] ${message}`);
    if (data && isError) console.error(data);
};

// Fungsi untuk format tanggal dan waktu dalam WIB
const getFormattedDateTimeWIB = (dateString) => {
    try {
        const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        const date = new Date(dateString);
        if (isNaN(date.getTime())) throw new Error("Invalid date");
        const utc = date.getTime() + date.getTimezoneOffset() * 60000;
        const wibTime = new Date(utc + 7 * 3600000);
        return {
            date: `${days[wibTime.getDay()]}, ${wibTime.getDate()} ${months[wibTime.getMonth()]} ${wibTime.getFullYear()}`,
            time: `${wibTime.getHours().toString().padStart(2, "0")}:${wibTime.getMinutes().toString().padStart(2, "0")} WIB`,
        };
    } catch (error) {
        debugLog("Error formatting date: " + error.message, error, true);
        return { date: "Invalid Date", time: "Invalid Time" };
    }
};

// Fungsi untuk mendapatkan link platform
const getDirectPlatformLinks = (live) => {
    const { type, url_key, slug } = live;
    const links = { jkt48connect: `https://www.jkt48connect.my.id/watch?name=${encodeURIComponent(live.name)}` };
    if (type === 'showroom') links.original = `https://www.showroom-live.com/r/${url_key}`;
    if (type === 'idn') {
        if (url_key && slug) links.original = `https://www.idn.app/${url_key}/live/${slug}`;
        if (slug) links.embed = `https://www.idn.app/embed/${slug}`;
    }
    return links;
};

// Format pesan live IDN atau SHOWROOM
const formatMessage = (live, formattedDateTime) => {
    const platformName = live.type === 'showroom' ? 'SHOWROOM' : 'IDN Live';
    const platformLinks = getDirectPlatformLinks(live);
    let message = `✨ *${live.name}* sedang live di *${platformName}*! Jangan sampai ketinggalan!\n\n` +
           `📅 *Tanggal:* ${formattedDateTime.date}\n` +
           `⏰ *Waktu:* ${formattedDateTime.time}\n\n` +
           `🔗 *Tonton di:*\n`;
    if (platformLinks.original) message += `➡️ ${platformName} Official: ${platformLinks.original}\n`;
    if (platformLinks.embed) message += `➡️ ${platformName} (Tanpa Komen): ${platformLinks.embed}\n`;
    message += `➡️ JKT48Connect: ${platformLinks.jkt48connect}\n\n`;
    message += `📌 *Ajak teman-teman untuk menonton juga!* 🎉`;
    return message;
};

// Format pesan live YouTube
const formatYouTubeMessage = (video) => {
    return `🔴 *LIVE YOUTUBE!* 🔴\n\n` +
           `🎥 *${video.channelTitle || "Unknown Channel"}* sedang live!\n\n` +
           `📌 *Judul:* ${video.title || "Untitled"}\n` +
           `📝 *Deskripsi:* ${video.description || "No description available"}\n\n` +
           `🔗 *Tonton di sini:*\n➡️ ${video.url || "#"}`;
};

// Fungsi untuk mengirim pesan ke semua grup
const sendMessageToGroups = async (conn, content) => {
    for (const groupId of groupChatIds) {
        try {
            await conn.sendMessage(groupId, content);
        } catch (error) {
            debugLog(`Failed to send message to group ${groupId}:`, error, true);
        }
    }
};

// Fungsi utama untuk mengecek live dan mengirim pesan
const checkAndSendMessage = async () => {
    const conn = connectionObj.conn;
    if (!conn || !isCheckingLive) {
        if (!isCheckingLive) debugLog("Skipping check, live check is not active.");
        else debugLog("No connection object available", null, true);
        return;
    }

    try {
        // --- PERUBAHAN: API Key di-set langsung ---
        const apiKey = 'JKTCONNECT';

        debugLog("Fetching live data...");
        const responseData = await jkt48Api.live(apiKey);
        
        // --- PERBAIKAN KRITIS: Menangani kemungkinan data API ter-nesting ---
        let liveEvents = [];
        if (Array.isArray(responseData)) {
            liveEvents = responseData; // API mengembalikan array langsung
        } else if (responseData && Array.isArray(responseData.live)) {
            liveEvents = responseData.live; // API mengembalikan objek { live: [...] }
        } else {
            debugLog("Format data live dari API tidak dikenali atau kosong.", responseData, true);
            consecutiveFailures++;
            return;
        }
        
        consecutiveFailures = 0; // Reset kegagalan jika data berhasil diproses
        debugLog(`Received ${liveEvents.length} live events`);

        const currentLiveNames = new Set();
        const currentYouTubeLive = new Set();

        for (const live of liveEvents) {
            if (!live || !live.type) continue;
            
            const processLive = async (eventId, eventType, messageFormatter, liveData) => {
                const sentSet = eventType === 'youtube' ? sentYouTubeEvents : sentEvents;
                const currentSet = eventType === 'youtube' ? currentYouTubeLive : currentLiveNames;
                currentSet.add(eventId);

                if (sentSet.has(eventId)) return;

                debugLog(`Processing new ${eventType} live: ${eventId}`);
                const messageText = messageFormatter(liveData);
                await sendMessageToGroups(conn, { text: messageText });
                sentSet.add(eventId);
                debugLog(`Successfully sent ${eventType} notification for: ${eventId}`);
            };

            if (live.type === 'youtube' && live.title) {
                await processLive(live.title, 'youtube', formatYouTubeMessage, live);
            } else if ((live.type === 'showroom' || live.type === 'idn') && live.name) {
                const formattedDateTime = getFormattedDateTimeWIB(live.started_at || new Date().toISOString());
                await processLive(live.name, live.type, (l) => formatMessage(l, formattedDateTime), live);
            }
        }

        // Hapus event yang sudah tidak live dari cache
        sentEvents.forEach(name => !currentLiveNames.has(name) && (sentEvents.delete(name), debugLog(`Removed finished event: ${name}`)));
        sentYouTubeEvents.forEach(title => !currentYouTubeLive.has(title) && (sentYouTubeEvents.delete(title), debugLog(`Removed finished YouTube event: ${title}`)));
        
    } catch (error) {
        debugLog("Critical error in checkAndSendMessage:", error, true);
        consecutiveFailures++;
    }
    
    // Auto-restart jika terlalu banyak kegagalan
    if (consecutiveFailures >= MAX_FAILURES) {
        await restartLiveCheck(conn);
    }
};

// Fungsi heartbeat (tidak ada perubahan signifikan selain API key)
const performHeartbeat = async () => {
    debugLog("Performing heartbeat check...");
    try {
        const apiKey = 'JKTCONNECT';
        await jkt48Api.live(apiKey); // Cukup panggil API untuk cek koneksi
        debugLog("Heartbeat check successful");
    } catch (error) {
        debugLog("Heartbeat check failed:", error, true);
        consecutiveFailures++;
    }
};

// Fungsi start, stop, dan restart (logika utama tetap, hanya pemanggilan)
const stopLiveCheck = () => {
    isCheckingLive = false;
    if (checkInterval) clearInterval(checkInterval);
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    checkInterval = null;
    heartbeatInterval = null;
    debugLog("Live check system deactivated");
};

const startLiveCheck = async (conn) => {
    stopLiveCheck();
    connectionObj.conn = conn;
    isCheckingLive = true;
    consecutiveFailures = 0;
    checkInterval = setInterval(checkAndSendMessage, 30000); // Cek tiap 30 detik
    heartbeatInterval = setInterval(performHeartbeat, 300000); // Heartbeat tiap 5 menit
    debugLog("Live check system activated");
    await checkAndSendMessage(); // Lakukan pengecekan pertama
};

const restartLiveCheck = async (conn) => {
    debugLog("Restarting live check system due to multiple failures...", null, true);
    stopLiveCheck();
    await new Promise(resolve => setTimeout(resolve, 5000));
    await startLiveCheck(conn);
    // Kirim notifikasi restart ke owner jika nomornya ada
    // Note: Pastikan global.nomorown didefinisikan di file utama bot Anda
    if (global.nomorown) {
        try {
            let ownerNumber = global.nomorown.toString().replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            await conn.sendMessage(ownerNumber, { text: "🔄 *Sistem Notifikasi Live*\n\nTelah direstart secara otomatis karena beberapa kali kegagalan. Sistem kembali berjalan normal." });
            debugLog(`Restart notification sent to owner: ${ownerNumber}`);
        } catch (e) {
            debugLog("Failed to send restart notification to owner", e, true);
        }
    }
};

// Handler command WhatsApp
const handler = async (m, { conn, command, isOwner }) => {
    if (!isOwner) {
        return m.reply("❌ Maaf, command ini hanya untuk Owner Bot.");
    }
    connectionObj.conn = conn; // Selalu update koneksi terbaru

    switch (command) {
        case "startlive":
            if (isCheckingLive) return m.reply("✅ Live check sudah aktif.");
            await startLiveCheck(conn);
            m.reply("✅ Live check berhasil diaktifkan! Mengecek setiap 30 detik.");
            break;

        case "stoplive":
            if (!isCheckingLive) return m.reply("❌ Live check memang sudah tidak aktif.");
            stopLiveCheck();
            m.reply("❌ Live check berhasil dimatikan.");
            break;

        case "statuslive":
            m.reply(`📊 *STATUS LIVE CHECK*\n\n` +
                `*Status:* ${isCheckingLive ? '✅ Aktif' : '❌ Tidak aktif'}\n` +
                `*Kegagalan Berturut-turut:* ${consecutiveFailures}/${MAX_FAILURES}\n` +
                `*Cache Aktif:* ${sentEvents.size} SR/IDN, ${sentYouTubeEvents.size} YouTube`);
            break;

        case "resetlive":
            sentEvents.clear();
            sentYouTubeEvents.clear();
            consecutiveFailures = 0;
            m.reply("🔄 Cache live events dan counter kegagalan berhasil direset.");
            break;
                
        case "restartlive":
            await restartLiveCheck(conn);
            m.reply("🔄 Live check berhasil direstart!");
            break;
                
        case "testlive":
            m.reply("✅ Menjalankan pengecekan manual...");
            await checkAndSendMessage();
            break;
    }
};

handler.help = ['startlive', 'stoplive', 'statuslive', 'resetlive', 'restartlive', 'testlive'];
handler.tags = ['owner'];
handler.command = /^(startlive|stoplive|statuslive|resetlive|restartlive|testlive)$/i;

module.exports = handler;