const fs = require('fs').promises;
const syntaxError = require('syntax-error');
const path = require('path');

let handler = async (m, { text, usedPrefix, command }) => {
    if (!text) {
        throw `Example usage: ${usedPrefix}${command} filename
Example: 
${usedPrefix}savefile main.js
${usedPrefix}saveplugin owner`;
    }
    
    if (!m.quoted) throw 'Please reply to the code or file you want to save';

    const pluginsDir = 'plugins';
    const filename = path.join(
        pluginsDir, 
        text.replace(/plugin(s)\//i, '') + (!text.endsWith('.js') ? '.js' : '')
    );

    try {
        // Handle JavaScript files
        if (m.quoted.text && (!m.quoted.mediaMessage || /\.js$/i.test(text))) {
            const codeText = m.quoted.text.trim();
            
            // Check for syntax errors
            const error = syntaxError(codeText, filename, {
                sourceType: 'module',
                allowReturnOutsideFunction: true,
                allowAwaitOutsideFunction: true
            });

            if (error) throw error;

            await fs.writeFile(filename, codeText);
            
            // Simplified success message
            return m.reply(`✓ File saved successfully\n📁 Path: ${filename}`);
        }

        // Handle media files
        if (m.quoted.mediaMessage) {
            const media = await m.quoted.download();
            await fs.writeFile(filename, media);
            return m.reply(`✓ Media file saved successfully\n📁 Path: ${filename}`);
        }

        throw 'Unsupported file type!';
    } catch (err) {
        throw `Failed to save file: ${err.message}`;
    }
};

handler.help = ['saveplugin'];
handler.tags = ['owner'];
handler.command = /^(sp|saveplugin)$/i;
handler.rowner = true;

module.exports = handler;