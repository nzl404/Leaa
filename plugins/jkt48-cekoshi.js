const jkt48Api = require('@jkt48/core');

let handler = async (m, { conn, args }) => {
    await conn.sendPresenceUpdate('composing', m.chat);
    
    if (!args[0]) {
        await conn.reply(m.chat, 'Ayo, tulis nama kamu dong! Contoh: *.cekoshi Firdaus* biar aku bisa cari jodoh idol buat kamu!', m);
        return;
    }

    const userName = args.join(" ");

    const descriptions = [ 
        'Dia baik banget, bikin hati adem!', 
        'Wajahnya cantik seperti bidadari!', 
        'Pintar dan selalu memberikan inspirasi!', 
        'Senyumnya bisa bikin dunia jadi lebih cerah!', 
        'Dia ceria banget, selalu bikin suasana jadi hidup!', 
        'Punya aura yang bikin semua orang nyaman!', 
        'Humoris dan selalu bikin ketawa!', 
        'Dia perhatian, beneran kayak pasangan idaman!', 
        'Lemah lembut, tapi juga kuat dalam segala hal!', 
        'Selalu penuh semangat dan nggak pernah menyerah!', 
        'Suaranya merdu, bikin kamu terhanyut tiap kali dengerin dia nyanyi!', 
        'Tariannya indah dan energik, bikin kamu ga bisa lepas pandangan!', 
        'Dia punya pesona unik yang ga dimiliki idol lain!', 
        'Sifatnya yang apa adanya bikin kamu suka dan nyaman!', 
        'Dedikasi dan kerja kerasnya bikin kamu jadi terinspirasi!', 
        'Kepintarannya dalam berbahasa bikin kamu terpukau!', 
        'Dia punya fashion sense yang keren abis!', 
        'Bakat aktingnya luar biasa, pantes jadi bintang!', 
        'Selalu positif dalam situasi apapun, panutan banget!', 
        'Multitalenta banget, bisa nyanyi, nari, dan akting!', 
        'Perfeksionis dalam setiap hal yang dia lakuin!', 
        'Kehangatannya akan bikin harimu lebih cerah!', 
        'Punya karisma panggung yang bikin semua mata tertuju padanya!', 
        'Selalu menghargai dan mencintai fansnya sepenuh hati!', 
        'Humble banget meski udah terkenal dan berbakat!' 
    ];

    const messages = [ 
        'Semoga ini awal dari hubungan spesial kamu sebagai fans setia!', 
        'Dukung terus idolmu biar makin bersinar!', 
        'Jangan lupa datang ke event mereka ya, biar makin dekat!', 
        'Semoga kamu jadi salah satu fans yang selalu ada buat dia!', 
        'Tetap jadi fans yang baik, ya! Mereka pasti senang banget.', 
        'Buktikan cinta kamu lewat dukungan di setiap event mereka!', 
        'Jangan cuma jadi fans, tapi juga support mereka di perjalanan karier!', 
        'Ayo bawa nama idolmu makin tinggi dengan dukunganmu!', 
        'Pastikan kamu selalu hadir di Showroom mereka ya!', 
        'Ingat, idol juga butuh fans setia seperti kamu!', 
        'Belilah merchandise resmi untuk mendukung kariernya!', 
        'Jangan lupa vote saat ada event sousenkyo untuk mendukung posisinya!', 
        'Jadilah fans yang sopan dan selalu mematuhi peraturan di setiap event!', 
        'Datanglah ke theater untuk merasakan energi penampilan live-nya!', 
        'Dengarkan lagunya di platform musik untuk meningkatkan popularitasnya!', 
        'Tunjukkan foto-foto penampilan terbaiknya di sosial mediamu!', 
        'Ceritakan ke teman-temanmu betapa hebatnya dia!', 
        'Ikuti fansclub resminya untuk update terbaru dan bertemu fans lain!', 
        'Rayakan ulang tahun idolmu dengan project spesial!', 
        'Buatlah fanart untuk menunjukkan kecintaan dan kreativitasmu!', 
        'Jadilah sumber inspirasi positif bagi idolmu!', 
        'Tunjukkan dukungan dengan membeli single dan album terbarunya!', 
        'Bagikan momen spesialmu bersama idolmu di sosial media!', 
        'Kirimkan fan letter untuk menyampaikan perasaanmu!', 
        'Hadirilah handshake event untuk bertemu langsung dengannya!' 
    ];

    try {
        const members = await jkt48Api.members('JKTCONNECT');

        if (!members || !Array.isArray(members) || members.length === 0) {
            throw new Error('Tidak ada data idol yang ditemukan atau format data tidak sesuai.');
        }

        // Filter out any member with name "JKT48" or similar generic names
        const filteredMembers = members.filter(member => {
            const name = member.name ? member.name.toLowerCase() : '';
            return name !== 'jkt48' && 
                   name !== 'jkt 48' && 
                   !name.includes('jkt48') && 
                   name.trim() !== '';
        });

        if (filteredMembers.length === 0) {
            throw new Error('Tidak ada member yang tersedia.');
        }

        const randomIndex = Math.floor(Math.random() * filteredMembers.length);
        const member = filteredMembers[randomIndex];

        const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        const matchLevel = Math.floor(Math.random() * 101);

        const thumbnailUrl = member.img || 'https://telegra.ph/file/c6ec9739b1a4ee238b325.jpg';

        let socialLinks = '🌐 *Media Sosial:*\n';
        if (member.socials && member.socials.length > 0) {
            member.socials.forEach(social => {
                if (social.title && social.title.toLowerCase() === 'idn' && social.url) {
                    const idnBaseUrl = social.url.split('?')[0];
                    socialLinks += `- ${social.title}: ${idnBaseUrl}\n`;
                } else if (social.title && social.url) {
                    socialLinks += `- ${social.title}: ${social.url}\n`;
                }
            });
        } else {
            socialLinks += 'Tidak ada informasi media sosial.\n';
        }

        const invisibleText = String.fromCharCode(8206).repeat(777);

        let messageContent = `💞 *Jodoh Idolmu Sudah Ketemu, ${userName}!* 💞\n\n`;
        messageContent += `🌟 *Nama Idolmu:* ${member.name}\n`;
        messageContent += `📖 *Kepribadian:* ${randomDescription}\n\n`;
        messageContent += `🔮 *Match Level:* ${matchLevel}%\n\n`;
        messageContent += `${invisibleText}\n`;
        messageContent += `${socialLinks}\n`;
        messageContent += `💌 *Pesan:* "${randomMessage}"\n\n`;
        messageContent += `📅 *Jangan lupa support idol kamu di event-event mereka!*\n\n`;
        messageContent += `© 2011 - 2025 | JKT48 - *Matchmaker* Edition`;

        // Use relayMessage with thumbnail like the example
        await conn.relayMessage(m.chat, {
            extendedTextMessage: {
                text: messageContent.trim(),
                contextInfo: {
                    externalAdReply: {
                        title: `💞 Jodoh Idol: ${member.name}`,
                        body: `Match Level: ${matchLevel}% • ${userName}`,
                        mediaType: 1,
                        previewType: 0,
                        renderLargerThumbnail: true,
                        thumbnailUrl: thumbnailUrl,
                        sourceUrl: member.socials && member.socials.length > 0 ? member.socials[0].url : 'https://jkt48.com'
                    }
                }
            }
        }, {});
        
    } catch (error) {
        console.error(error);
        await conn.reply(m.chat, `⚠️ Yah, ada masalah nih: ${error.message}\nCoba lagi nanti ya!`, m);
    } finally {
        await conn.sendPresenceUpdate('paused', m.chat);
    }
};

handler.help = ['cekoshi [nama]'];
handler.tags = ['jkt48'];
handler.command = /^cekoshi$/i;

module.exports = handler;