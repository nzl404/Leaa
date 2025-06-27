const fs = require('fs');
const path = require('path');

let handler = async (m, { conn }) => {
    const now = new Date() * 1;
    const groupDataFile = path.join(__dirname, 'info-listgroup.json');

    // --- PERUBAHAN UTAMA DI SINI ---
    // 1. Ambil daftar LENGKAP semua grup yang diikuti bot secara paksa.
    // Ini jauh lebih andal daripada mengandalkan conn.chats setelah restart.
    let groupMetadatas;
    try {
        groupMetadatas = await conn.groupFetchAllParticipating();
    } catch (e) {
        console.error("Gagal mengambil daftar grup:", e);
        return m.reply("Gagal mengambil daftar grup. Mungkin ada masalah koneksi sementara.");
    }
    
    const activeGroups = Object.keys(groupMetadatas);

    if (activeGroups.length === 0) {
        return m.reply('Bot saat ini tidak bergabung dengan grup manapun.');
    }

    // 2. Muat database grup untuk mendapatkan/memperbarui pengaturan tambahan
    let groupDatabase = {};
    if (fs.existsSync(groupDataFile)) {
        try {
            groupDatabase = JSON.parse(fs.readFileSync(groupDataFile, 'utf-8'));
        } catch (e) {
            console.error("Gagal membaca atau parsing info-listgroup.json:", e);
            groupDatabase = {};
        }
    }
    
    let txt = '';
    
    // 3. Loop melalui daftar grup LENGKAP yang sudah kita dapatkan
    for (const jid of activeGroups) {
        // Kita bisa gunakan nama dari metadata yang sudah diambil atau panggil conn.getName lagi untuk jaminan nama terbaru
        const groupName = await conn.getName(jid); 
        
        const groupInfo = groupDatabase[jid] || {
            isBanned: false,
            welcome: false,
            antiLink: false,
            delete: true,
            expired: 0,
        };

        groupInfo.name = groupName;

        const expiredStr = (groupInfo.expired && groupInfo.expired > now)
            ? msToDate(groupInfo.expired - now)
            : '*Tidak Diatur Expired Group*';

        txt += `*${groupName}*\n`;
        txt += `${jid}\n`;
        txt += `Kadaluarsa: ${expiredStr}\n`;
        txt += `${groupInfo.isBanned ? '✅' : '❌'} _Group Banned_\n`;
        txt += `${groupInfo.welcome ? '✅' : '❌'} _Auto Welcome_\n`;
        txt += `${groupInfo.antiLink ? '✅' : '❌'} _Anti Link_\n\n`;
        
        groupDatabase[jid] = groupInfo;
    }

    // 4. Kirim balasan dan simpan database yang diperbarui
    m.reply(`*List Grup yang Diikuti:*\nTotal Grup: ${activeGroups.length}\n\n${txt.trim()}`);

    fs.writeFileSync(groupDataFile, JSON.stringify(groupDatabase, null, 2));
}

handler.help = ['grouplist', 'listgroup'];
handler.tags = ['group'];
handler.command = /^(group(s|list)|(s|list)group)$/i;
handler.owner = true;

module.exports = handler;

function msToDate(ms) {
    if (ms < 0) return "Expired";
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    const daysms = ms % (24 * 60 * 60 * 1000);
    const hours = Math.floor(daysms / (60 * 60 * 1000));
    const hoursms = ms % (60 * 60 * 1000);
    const minutes = Math.floor(hoursms / (60 * 1000));
    return `${days} hari ${hours} jam ${minutes} menit`;
}