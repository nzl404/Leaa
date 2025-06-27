let handler = async (m, { conn }) => {
	let user = global.db.data.users[m.sender];

	if (user.premium) {
		conn.sendFile(m.chat, "./vn/desahh.mp3", "lah.mp3", null, m, true, {
			type: "audioMessage",
			ptt: true,
		});
	} else {
		m.reply("Siapa luu");
	}
};

handler.customPrefix = /^(Desah|desah)$/i;
handler.command = new RegExp();

module.exports = handler;