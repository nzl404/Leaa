const uploadFile = require('../lib/uploadFile');
const uploadImage = require('../lib/uploadImage');

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(dm) + ' ' + sizes[i];
}

let handler = async (m) => {
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || '';
  if (!mime) throw 'Tidak ada media yang ditemukan. Reply media yang ingin di-upload.';

  const disallowedMimes = [
    'application/x-msdownload',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/java-archive'
  ];

  if (disallowedMimes.includes(mime)) {
    return m.reply(`❌ Gagal! Jenis file (${mime}) tidak diizinkan untuk diunggah demi keamanan.`);
  }

  const isPrimaryUploaderSupported = /image\/(png|jpe?g|gif|webp)|video\/(mp4|webm|quicktime)|audio\/(mpeg|mp3|wav|ogg|opus)|application\/pdf/.test(mime);

  let media = await q.download();
  
  let fileSizeLimit = 15 * 1024 * 1024; // Limit 15 MB
  if (media.length > fileSizeLimit) {
    throw 'Ukuran media tidak boleh melebihi 15MB';
  }

  let link = await (isPrimaryUploaderSupported ? uploadImage : uploadFile)(media);

  m.reply(`${link}
${formatBytes(media.length)}
${isPrimaryUploaderSupported ? '(Tidak Ada Tanggal Kedaluwarsa)' : '(Memiliki Tanggal Kedaluwarsa)'}`);
}

handler.help = ['upload', 'tourl'];
handler.tags = ['tools'];
handler.command = /^(upload|tourl|u)$/i;
handler.premium = false;

module.exports = handler;