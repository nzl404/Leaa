const fetch = require('node-fetch');

let handler = async (m, { conn, text, args }) => {
	if (!args[0]) {
		throw `Gunakan perintah ini untuk mencari informasi kesehatan dari Halodoc.\n\n*Contoh Penggunaan:*\n\n*1. Mencari Artikel:*\n.halodoc artikel batuk\n\n*2. Mencari Obat:*\n.halodoc obat paracetamol`;
	}

	// Memisahkan tipe pencarian (artikel/obat) dan query
	const searchType = args[0].toLowerCase();
	const query = args.slice(1).join(' ');

	if (!query) throw 'Silakan masukkan topik atau nama obat yang ingin dicari.';
	if (searchType !== 'artikel' && searchType !== 'obat') {
		throw 'Tipe pencarian tidak valid. Gunakan "artikel" atau "obat".\n\n*Contoh:*\n.halodoc artikel demam';
	}

	await m.reply(`🔎 Sedang mencari *${query}* di Halodoc...`);

	try {
		let apiUrl;
		if (searchType === 'artikel') {
			apiUrl = `https://api.nekorinn.my.id/search/halodoc-article?q=${encodeURIComponent(query)}`;
		} else {
			apiUrl = `https://api.nekorinn.my.id/search/halodoc-medicine?q=${encodeURIComponent(query)}`;
		}

		const response = await fetch(apiUrl);
		const data = await response.json();

		if (!data.status || data.result.length === 0) {
			return m.reply(`Maaf, tidak ada hasil yang ditemukan untuk *"${query}"*.`);
		}

		const results = data.result;
		let replyText = `*Hasil Pencarian "${query}" di Halodoc*\n\n`;

		if (searchType === 'artikel') {
			results.forEach((item, index) => {
				replyText += `*${index + 1}. ${item.title}*\n`;
				replyText += `  - *Deskripsi:* ${item.description}\n`;
				replyText += `  - *Link:* ${item.url}\n\n`;
			});
		} else { // searchType === 'obat'
			results.forEach((item, index) => {
				replyText += `*${index + 1}. ${item.title}*\n`;
				replyText += `  - *Info:* ${item.subtitle}\n`;
				replyText += `  - *Harga:* ${item.price.trim()}\n`;
				replyText += `  - *Link:* ${item.url}\n\n`;
			});
		}
		
		replyText += `> _© Leaa_`;

		// DIGANTI: Mengirim hasil sebagai pesan teks biasa, bukan file gambar
		m.reply(replyText);

	} catch (error) {
		console.error(error);
		m.reply('Terjadi kesalahan saat mengambil data dari API. Coba lagi nanti.');
	}
};

handler.help = ['halodoc <artikel/obat> <query>'];
handler.tags = ['search', 'internet'];
handler.command = /^halodoc$/i;
handler.limit = true;

module.exports = handler;