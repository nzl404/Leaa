const { createHash } = require('crypto');
let Reg = /\|?(.*)([.|] *?)([0-9]*)$/i;

let handler = async function (m, { conn, text, usedPrefix, command }) {
  let user = global.db.data.users[m.sender];
  if (user.registered === true) throw `Anda sudah terdaftar\nMau daftar ulang? ${usedPrefix}unreg <SN|SERIAL NUMBER>`;
  if (!Reg.test(text)) throw `Format salah\n*Contoh: ${usedPrefix + command} Budi.18*`;
  
  let [_, name, splitter, age] = text.match(Reg);
  if (!name) throw 'Nama tidak boleh kosong (Alphanumeric)';
  if (!age) throw 'Umur tidak boleh kosong (Angka)';
  age = parseInt(age);
  if (age > 120) throw 'Umur terlalu tua, mari kita yang realistis saja :)';
  if (age < 5) throw 'Bayi kok bisa ngetik, hebat! Tapi daftar nanti ya kalau sudah besar :D';

  // --- PENAMBAHAN FITUR BANNED NAME ---
  
  // Daftar kata-kata terlarang dalam huruf kecil
  const bannedNames = [
    'kontol', 'memek', 'jembut', 'bangsat', 'bgsd', 'bgst', 'jancok', 'jancuk',
    'ngentot', 'ngewe', 'pler', 'peler', 'titit', 'tetek', 'toket', 'anjingg', 'babi',
    'firdaus', 'daus', 'dawus' 
    // Anda bisa menambahkan kata lain di sini jika perlu
  ];

  // Ubah nama yang diinput pengguna menjadi huruf kecil untuk pengecekan
  const lowerCaseName = name.toLowerCase();

  // Cek apakah nama mengandung salah satu kata dari daftar terlarang
  const isBanned = bannedNames.some(bannedWord => lowerCaseName.includes(bannedWord));

  if (isBanned) {
    // Jika nama mengandung kata terlarang, tolak pendaftaran
    throw `Maaf, nama "${name}" mengandung kata-kata yang tidak diizinkan. Silakan gunakan nama lain yang lebih sopan.`;
  }

  // --- AKHIR FITUR BANNED NAME ---

  user.name = name.trim();
  user.age = age;
  user.regTime = +new Date();
  user.registered = true;
  let sn = createHash('md5').update(m.sender).digest('hex');
  
  m.reply(`
Pendaftaran berhasil! ✅

╭─「 Info Pengguna 」
│ Nama: ${name}
│ Umur: ${age} tahun
│ Status: Terdaftar
╰────
SN (SERIAL NUMBER) Anda:
*${sn}*

Gunakan SN ini untuk proses unreg. Simpan baik-baik!
`.trim());
};

handler.help = ['daftar', 'reg', 'register'].map(v => v + ' <nama>.<umur>');
handler.tags = ['xp'];
handler.command = /^(daftar|reg(ister)?)$/i;

module.exports = handler;