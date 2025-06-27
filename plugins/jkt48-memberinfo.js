const { getAllMembers } = require('jkt48connect-cli');
const util = require('util');
let fetch = require("node-fetch");

let handler = async function(m, { conn, text, usedPrefix, command }) {
    await conn.sendPresenceUpdate('composing', m.chat);
    
    try {
        if (!text) {
            const apiKey = "marshalena";
            const membersObject = await getAllMembers(apiKey);
            if (!membersObject || Object.keys(membersObject).length === 0) {
                throw new Error('Gagal mengambil daftar member dari API.');
            }
            const membersArray = Object.values(membersObject);

            const groupedByGen = {};
            for (const member of membersArray) {
                if (!member || !member.generation || !member.nicknames) continue;
                const genMatch = member.generation.match(/\d+/);
                if (!genMatch) continue;
                const genNumber = genMatch[0];
                const genKey = `Generasi ${genNumber}`;
                const primaryNickname = member.nicknames[0] || member.name;
                if (!groupedByGen[genKey]) {
                    groupedByGen[genKey] = [];
                }
                groupedByGen[genKey].push(primaryNickname);
            }

            const readmore = '\u200C'.repeat(4001);

            let headerMessage = `*Daftar Member JKT48 Aktif*\n\nBerikut adalah daftar nama panggilan member berdasarkan generasi:\n`;
            let listMessage = `\n`;
            const sortedGens = Object.keys(groupedByGen).sort((a, b) => {
                return parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]);
            });

            for (const genKey of sortedGens) {
                listMessage += `*${genKey}*\n`;
                const names = groupedByGen[genKey].sort().join(', ');
                listMessage += `> ${names}\n\n`;
            }
            
            listMessage += `Untuk melihat detail, ketik: *${usedPrefix}${command} <nama panggilan>*`;
            
            return conn.reply(m.chat, headerMessage + readmore + listMessage, m);
        }

        const apiKey = "marshalena";
        const membersObject = await getAllMembers(apiKey);
        const membersArray = Object.values(membersObject);
        const query = text.toLowerCase().trim();

        const member = membersArray.find(mem => {
            if (!mem) return false;
            const urlMatch = mem.url && mem.url.toLowerCase() === query;
            const nicknameMatch = mem.nicknames && Array.isArray(mem.nicknames) && mem.nicknames.some(nick => nick.toLowerCase() === query);
            return urlMatch || nicknameMatch;
        });

        if (!member) {
            return conn.reply(m.chat, `❌ Member dengan nama panggilan "${text}" tidak ditemukan. Coba lihat daftar lengkap dengan mengetik *${usedPrefix+command}*`, m);
        }

        const thumbnailUrl = member.img || member.img_alt || 'https://telegra.ph/file/c6ec9739b1a4ee238b325.jpg';

        let generationText = 'N/A';
        if (member.generation) {
            const match = member.generation.match(/\d+/);
            if (match) { generationText = match[0]; }
        }

        const readmore = '\u200C'.repeat(777);
        
        let messageContent = `🌟 *${member.name || 'N/A'}*\n\n`;
        messageContent += `📛 *Nama Panggilan:* ${(member.nicknames && member.nicknames.join(', ')) || 'N/A'}\n`;
        messageContent += `🎓 *Generasi:* ${generationText}\n`;
        messageContent += `📺 *ID Showroom:* ${member.room_id || 'N/A'}\n\n`;
        
        messageContent += `🌐 *Media Sosial:*\n${readmore}\n`;

        if (member.socials && member.socials.length > 0) {
            member.socials.forEach(social => {
                messageContent += `• ${social.title}: ${social.url}\n`;
            });
        } else {
            messageContent += '• Tidak ada informasi media sosial.\n';
        }
        await conn.relayMessage(m.chat, {
            extendedTextMessage: {
                text: messageContent.trim(),
                contextInfo: {
                    externalAdReply: {
                        title: member.name || 'JKT48 Member',
                        body: `${(member.nicknames && member.nicknames.join(', ')) || 'N/A'} • Generasi ${generationText}`,
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
        console.error("Member Info Error:", error);
        let errorMessage = `‼️ *Terjadi Error*\n\n*Pesan:*\n${error.message}`;
        await conn.reply(m.chat, errorMessage, m);
    } finally {
        await conn.sendPresenceUpdate('paused', m.chat);
    }
};

handler.help = ['jkt48member <nama panggilan>'];
handler.tags = ['jkt48'];
handler.command = /^(memberinfo|jkt48member)$/i;
handler.limit = true;

module.exports = handler;