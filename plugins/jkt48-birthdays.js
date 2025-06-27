const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const util = require('util');
const cron = require('node-cron');

// --- KONSTANTA & VARIABEL GLOBAL ---
const communityChatId = '120363130008666048@g.us';
const logFilePath = path.join(__dirname, '../database/birthday_log.json');
const API_URL = 'https://api.jkt48connect.my.id/api/next-birthday?api_key=marshalena';

// Variabel untuk menyimpan koneksi bot agar bisa diakses oleh cron job
let botConnection;

// --- FUNGSI BANTUAN ---
const readLog = () => (fs.existsSync(logFilePath) ? JSON.parse(fs.readFileSync(logFilePath)) : {});
const writeLog = (log) => fs.writeFileSync(logFilePath, JSON.stringify(log, null, 2));

const processBirthdayData = (data) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return data.map(member => {
        const birthDate = new Date(member.birthdate);
        let nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        if (nextBirthday < today) {
            nextBirthday.setFullYear(today.getFullYear() + 1);
        }
        const diffTime = nextBirthday.getTime() - today.getTime();
        const remaining_days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const formatted_birthday = birthDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' });
        return { ...member, remaining_days, formatted_birthday };
    }).sort((a, b) => a.remaining_days - b.remaining_days);
};

// --- FUNGSI UNTUK TUGAS OTOMATIS (CRON JOB) ---
const checkAndSendBirthdayWishes = async () => {
    // Periksa apakah botConnection sudah terdefinisi
    if (!botConnection) {
        console.log('[Birthday Cron] Peringatan: Koneksi bot belum siap. Cron job dilewati.');
        return;
    }
    console.log('[Birthday Cron] Menjalankan pengecekan ulang tahun harian...');
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`API error! status: ${response.status}`);
        const data = await response.json();
        
        const processedData = processBirthdayData(data);
        const birthdayMembers = processedData.filter(member => member.remaining_days === 0);

        if (birthdayMembers.length === 0) {
            console.log('[Birthday Cron] Tidak ada member yang berulang tahun hari ini.');
            return;
        }

        const log = readLog();
        const currentYear = new Date().getFullYear();
        for (const member of birthdayMembers) {
            const logKey = `${currentYear}-${member.name}`;
            if (log[logKey]) {
                console.log(`[Birthday Cron] Ucapan untuk ${member.name} sudah pernah dikirim tahun ini.`);
                continue;
            }

            const message = `🎉 *Happy Birthday, ${member.name}!* 🎉\n\nSelamat ulang tahun! Semoga hari ini membawa kebahagiaan, kesehatan, dan kesuksesan yang melimpah. Teruslah bersinar dan menginspirasi kita semua.\n\nDengan cinta,\nSeluruh Fans dan Bot`;
            await botConnection.sendMessage(communityChatId, { image: { url: member.img }, caption: message });
            console.log(`[Birthday Cron] Sukses mengirim ucapan untuk ${member.name}.`);
            log[logKey] = new Date().toISOString();
        }
        writeLog(log);
    } catch (error) {
        console.error("Birthday Cron Job Error:", error);
    }
};

// --- PERINTAH MANUAL ---
// Definisikan handler sebagai fungsi utama
const handler = async function(m, { conn }) {
    // FIX: Simpan koneksi bot ke variabel global setiap kali perintah dijalankan
    botConnection = conn; 
    
    await conn.sendPresenceUpdate('composing', m.chat);
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`API error! status: ${response.status}`);
        let data = await response.json();
        if (!data || !Array.isArray(data) || data.length === 0) {
            throw new Error("Tidak ada data ulang tahun yang ditemukan.");
        }

        const processedData = processBirthdayData(data);
        
        let message = '🎂 *Daftar Ulang Tahun Member Berikutnya*\n\n';
        // Ambil 10 member teratas dari daftar yang sudah diurutkan
        const upcomingList = processedData.slice(0, 10);

        for (const member of upcomingList) {
            const countdown = member.remaining_days === 0 ? '(Hari Ini!)' : `(${member.remaining_days} hari lagi)`;
            message += `• *${member.name}*: ${member.formatted_birthday} ${countdown}\n`;
        }

        await conn.reply(m.chat, message, m);

    } catch (error) {
        console.error("Manual Birthday Check Error:", error);
        let errorMessage = `‼️ *Terjadi Error*\n\n*Pesan:*\n${error.message}`;
        await conn.reply(m.chat, errorMessage, m);
    } finally {
        await conn.sendPresenceUpdate('paused', m.chat);
    }
};

// --- EKSPOR DAN METADATA ---
// FIX: Tempelkan properti/metadata langsung ke fungsi handler
handler.help = ['jkt48birthdays'];
handler.tags = ['jkt48'];
handler.command = /^(jkt48birthdays|ultahjkt48)$/i;
handler.limit = true;

// Opsi untuk mematikan/menyalakan fitur otomatis dari kode (opsional, jika framework mendukung)
// handler.disabled = false; 

// FIX: Ekspor handler sebagai modul utama
module.exports = handler;

// --- PENJADWAL OTOMATIS (CRON JOB) ---
// Menjalankan pengecekan setiap hari pada jam 00:30 WIB
cron.schedule('30 0 * * *', checkAndSendBirthdayWishes, {
  scheduled: true,
  timezone: "Asia/Jakarta"
});