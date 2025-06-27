const format = (num) => {
  const n = String(num), p = n.indexOf(".");
  return n.replace(/\d(?=(?:\d{3})+(?:\.|$))/g, (m, i) => p < 0 || i < p ? `${m},` : m);
};

let handler = async (m, { conn, text, usedPrefix }) => {
  // 1. Logika penentuan target yang lebih sederhana dan andal
  let who;
  if (m.mentionedJid && m.mentionedJid[0]) {
    who = m.mentionedJid[0];
  } else if (m.quoted) {
    who = m.quoted.sender;
  } else {
    // Mencoba mengambil nomor dari teks, membersihkan dari karakter non-digit
    let number = text.replace(/[^0-9]/g, '');
    if (!number) return conn.reply(m.chat, `Gagal menentukan target.\n\nContoh Penggunaan:\n${usedPrefix}tembak @user\n${usedPrefix}tembak (sambil reply chat target)`, m);
    if (number.length > 15) return conn.reply(m.chat, 'Format nomor tidak valid!', m);
    who = number + '@s.whatsapp.net';
  }

  // 2. Pengecekan awal (Guard Clauses)
  const users = global.db.data.users;
  if (!users[who]) {
    return conn.reply(m.chat, 'Target tidak terdaftar di database.', m);
  }
  if (who === m.sender) {
    return conn.reply(m.chat, 'Tidak bisa menembak diri sendiri!', m);
  }
  if (who === conn.user.jid) {
    return conn.reply(m.chat, 'Bot tidak bisa ditembak, dia milik semua.', m);
  }

  const senderData = users[m.sender];
  const targetData = users[who];
  const senderPartnerJid = senderData.pasangan;
  const targetPartnerJid = targetData.pasangan;

  // 3. Memeriksa status hubungan PENGIRIM (Sender)
  // Ini adalah perbaikan utama untuk error 'TypeError'
  if (senderPartnerJid) {
    // Cek dulu apakah data partner ada di database
    if (users[senderPartnerJid] && users[senderPartnerJid].pasangan === m.sender) {
      const partnerName = conn.getName(senderPartnerJid);
      return conn.reply(m.chat, `Anda sudah berpacaran dengan @${senderPartnerJid.split('@')[0]}.\n\nPutus dulu sana pakai command *${usedPrefix}putus* kalau mau nembak yang lain!`, m, { mentions: [senderPartnerJid] });
    }
  }

  // 4. Memeriksa status hubungan TARGET
  if (targetPartnerJid) {
    // Cek dulu apakah data partner target ada di database
    if (users[targetPartnerJid] && users[targetPartnerJid].pasangan === who) {
      const partnerName = conn.getName(targetPartnerJid);
      return conn.reply(m.chat, `Maaf, @${who.split('@')[0]} sudah berpacaran dengan @${targetPartnerJid.split('@')[0]}. Cari yang lain ya!`, m, { mentions: [who, targetPartnerJid] });
    }
  }
  
  // 5. Logika utama untuk MENEMBAK
  // Cek apakah ada yang sedang menembak si target
  if (targetData.pasangan === m.sender) {
       return conn.reply(m.chat, `Anda sudah menembak @${who.split('@')[0]}.\nSabar, tunggu jawaban darinya.`, m, { mentions: [who] });
  }

  senderData.pasangan = who;
  conn.reply(m.chat, `Anda baru saja mengajak @${who.split('@')[0]} berpacaran.\n\nTunggu jawaban darinya dengan mengetik:\n*${usedPrefix}terima @${m.sender.split('@')[0]}* atau *${usedPrefix}tolak @${m.sender.split('@')[0]}*`, m, {
    mentions: [who, m.sender]
  });
};

handler.help = ['tembak @user'];
handler.tags = ['fun'];
handler.command = /^(tembak)$/i;
handler.group = true;
handler.limit = false; // Set ke false agar tidak memakan limit

module.exports = handler;