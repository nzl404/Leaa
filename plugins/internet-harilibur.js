const fetch = require('node-fetch');

let handler = async (m, { conn }) => {
	// 1. Beri reaksi 'loading' menggunakan conn.sendMessage
	await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

	try {
		const apiUrl = 'https://api.nekorinn.my.id/info/hari-libur-v2';
		const response = await fetch(apiUrl);
		const data = await response.json();

		if (!data.status || !data.result || data.result.length === 0) {
			// Jika data gagal didapat, beri reaksi 'gagal'
			await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
			return m.reply('Maaf, gagal mendapatkan data hari libur atau tidak ada data yang ditemukan.');
		}

		const results = data.result;
		let replyText = `📅 *Daftar Hari Libur Nasional Tahun 2025*\n\n`;
		
		results.forEach((holiday) => {
			replyText += `*${holiday.keterangan}*\n`;
			replyText += `  - Tanggal: ${holiday.tanggal}\n\n`;
		});

		replyText += `> _© Leaa_`;
		
		await m.reply(replyText);

		// 2. Jika berhasil, ubah reaksi menjadi 'sukses'
		await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

	} catch (error) {
		// 3. Jika terjadi error, ubah reaksi menjadi 'gagal'
		await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
		console.error(error);
		m.reply('Terjadi kesalahan saat mengambil data dari API. Coba lagi nanti.');
	}
};

handler.help = ['infolibur'];
handler.tags = ['internet'];
handler.command = /^(harilibur|infolibur|holiday)$/i;
handler.limit = true;

module.exports = handler;