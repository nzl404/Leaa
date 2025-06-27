const badwordRegex = /\b(anj(ing|g)|asw|kont(ol|i)|to?lo?l|gbl?k|bgsd|ajn|baj(ingan|ing)|ba?ngs(at|ad)|mem[ee]k|p[ee]p[ee]k|m[ee]ki|jilm[ee]k|titi?t|p[ee]l[ee]r|t[ee]t[ee]k|tok[ee]t|ng[ee]w[ee]|g[uo]bl[uo]k|t[ou]l[ou]l|idi[ou]t|ng[ee]nt[ou]t|j[ee]mbut|b[ee]g[ou]|dajal|janc[uo]k|pant[ee]k|puk[ii]ma?k|kimak|kampang|l[ou]nt[ee]|c[ou]lim[ee]k|p[ee]lacur|h[ee]nc[ee]ut|nigga|mmk|mmek|memk|kntl|fuck|dick|bitch|tits|bastard|assh[ou]l[ee]|cuki|peju|ajg|cok|cuk|mmk|njing|bgst|jink|kw[ou]nt[ou]l|j[ee]mb[ou]d|[ee]nt[ou][dt]|lacur|hamilin|kentu|kentod|entot|entod|jembod|bokep|jembud|jembot|jembut|puki|ku[ee]w[ee]|sial(an)?|kampret|bego|keparat|brengsek|kirik|kafir|bajul|perek|bencong|banci|cacat|asu|bajing|(ta[iy]|ta[iy]k)|anjrit|kunyuk|babi|monyet|setan|bispak|jablay|jembel|coli|bokin)\b/gi;

let handler = m => m; // Handler ini hanya untuk mengekspor fungsi 'before'

handler.before = async function (m, { conn, isAdmin, isBotAdmin }) {
    // Abaikan jika pesan dari bot sendiri atau bukan di grup
    if (m.isBaileys && m.fromMe) return true;
    if (!m.isGroup) return true;

    let chat = global.db.data.chats[m.chat];
    
    // Cek apakah fitur anti-toxic aktif di chat ini. Jika tidak, hentikan.
    if (!chat.antiToxic) return true;

    // Cek apakah pesan mengandung kata kasar
    let isBadword = badwordRegex.test(m.text);
    
    if (isBadword) {
        // Hanya kirim peringatan jika pesan mengandung badword dan fitur aktif
        //m.reply('_*Terdeteksi kata kasar!*_') // Bisa berupa teks atau VN
        
        // Contoh jika ingin mengirim VN (pastikan file vn/toksik.mp3 ada)
        
        await conn.sendFile(m.chat, "./vn/toksik.mp3", "toxic.mp3", null, m, true, {
            type: "audioMessage",
            ptt: true
        });
        
       
        // Opsi tambahan: Hapus pesan jika bot adalah admin
        if (isBotAdmin) {
            // return conn.sendMessage(m.chat, { delete: m.key }); // Uncomment untuk menghapus pesan
        }
    }
    
    return true; // Lanjutkan ke plugin lain
}

module.exports = handler;