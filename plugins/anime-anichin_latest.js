const fetch = require('node-fetch');

let handler = async (m, { conn }) => {
	await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });

	try {
		const apiUrl = 'https://api.nekorinn.my.id/info/anichin-latest';
		const response = await fetch(apiUrl);
		const data = await response.json();

		if (!data.status || !data.result || data.result.length === 0) {
			return m.reply('Maaf, gagal mendapatkan data terbaru atau tidak ada update yang ditemukan.');
		}

		const results = data.result;
		let replyText = '✨ *Update Terbaru dari Anichin*\n\n';
		
		results.forEach((item, index) => {
			replyText += `*${index + 1}. ${item.title}*\n`;
			replyText += `›  *Episode:* ${item.episode}\n`;
			replyText += `›  *Tipe:* ${item.type}\n`;
			replyText += `›  *Link:* ${item.url}\n`;
			replyText += '------------------------------------\n';
		});

		replyText += `\n> _© Leaa_`;
		
		m.reply(replyText);

	} catch (error) {
		console.error(error);
		m.reply('Terjadi kesalahan saat mengambil data dari API. Coba lagi nanti.');
	}
};

handler.help = ['anichinlatest'];
handler.tags = ['anime', 'internet'];
handler.command = /^(anichin|anichinlatest)$/i;
handler.limit = true;

module.exports = handler;