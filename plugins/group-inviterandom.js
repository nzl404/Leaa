// Helper function untuk jeda waktu (delay)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let handler = async (m, { conn, participants }) => {
    try {
        // 1. Dapatkan semua pengguna dari database & filter target potensial
        const allUsers = Object.keys(global.db.data.users);
        if (!allUsers || allUsers.length < 1) {
            return m.reply('Database pengguna bot masih kosong, tidak ada target untuk diundang.');
        }

        const currentParticipants = participants.map(p => p.id);
        
        let potentialTargets = allUsers.filter(jid => 
            !currentParticipants.includes(jid) && 
            jid.endsWith('@s.whatsapp.net') &&   
            !jid.startsWith('212') 
        );

        if (potentialTargets.length === 0) {
            return m.reply('Tidak ada pengguna baru yang bisa diundang. Semua pengguna di database bot sudah ada di grup ini.');
        }

        // 2. Acak (shuffle) target dan ambil maksimal 50
        // Fisher-Yates shuffle algorithm
        for (let i = potentialTargets.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [potentialTargets[i], potentialTargets[j]] = [potentialTargets[j], potentialTargets[i]];
        }
        
        const targets = potentialTargets.slice(0, 50);
        const totalTargets = targets.length;

        // 3. Siapkan pesan undangan dan link grup
        const groupMetadata = await conn.groupMetadata(m.chat);
        const groupName = groupMetadata.subject;
        const inviteCode = await conn.groupInviteCode(m.chat);
        const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;

        // --- PERUBAHAN DI SINI ---
        const inviteMessage = `Hey! Gabung yuk ke grup *${groupName}*! 🤙

Di sini kita bisa ngobrol bebas, santai, dan seru-seruan bareng. 

Asyiknya lagi, ada bot canggih yang bisa kamu pakai buat:
✅ Bikin stiker otomatis
✅ Jernihin foto (jadi HD)
✅ Download video TikTok/Instagram/YT
...dan masih banyak fitur keren lainnya!

Penasaran? Langsung klik link di bawah buat join ya! 👇
${inviteLink}`;

        // 4. Beri notifikasi awal kepada admin
        const estimatedTime = Math.ceil((totalTargets * 10) / 60); // Estimasi dalam menit
        await m.reply(`✅ Memulai pengiriman undangan ke *${totalTargets}* pengguna acak.\n\nProses ini akan menggunakan jeda 10 detik per pesan untuk keamanan.\n*Estimasi waktu selesai:* ~${estimatedTime} menit.\n\nHarap tunggu laporan akhir setelah proses selesai.`);

        let successCount = 0;
        let failCount = 0;

        // 5. Looping pengiriman dengan jeda waktu
        for (let i = 0; i < totalTargets; i++) {
            const jid = targets[i];
            try {
                // Kirim pesan undangan secara pribadi
                await conn.sendMessage(jid, { text: inviteMessage });
                successCount++;
            } catch (e) {
                failCount++;
                console.error(`Gagal mengirim undangan ke ${jid}:`, e);
            }
            
            // Terapkan jeda 10 detik setelah setiap pengiriman
            if (i < totalTargets - 1) { // Tidak perlu jeda setelah pesan terakhir
                await sleep(10000); // 10000 milidetik = 10 detik
            }
        }
        
        // 6. Kirim laporan akhir
        await m.reply(`*Laporan Selesai*\n\n✅ Berhasil mengirim undangan: *${successCount}* pengguna.\n❌ Gagal mengirim: *${failCount}* pengguna.`);

    } catch (e) {
        console.error(e);
        m.reply('Gagal menjalankan perintah. Terjadi kesalahan pada sistem.');
    }
};

handler.help = ['inviterandom', 'undangacak'];
handler.tags = ['group'];
handler.command = /^(inviterandom|undangacak)$/i;

handler.admin = true;
handler.group = true;
handler.botAdmin = false; 
handler.owner = true;

module.exports = handler;