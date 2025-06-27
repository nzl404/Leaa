let handler = async (m) => {
    let plugins = global.plugins;
    let stats = Object.entries(global.db.data.stats || {}).map(([key, val]) => {
        let name = Array.isArray(plugins[key]?.help)
            ? plugins[key].help.join(' & ')
            : plugins[key]?.help || key;

        if (!name || /(=>|~>|sf|sfp|save|saveplugins|exec)/i.test(name)) return null;

        return {
            name,
            ...val,
        };
    }).filter(Boolean);

    stats.sort((a, b) => b.total - a.total);

    let top = stats.slice(0, 5).map(({ name, total, last }, i) => {
        if (name.includes('-') && name.endsWith('.js')) {
            name = name.split('-')[1].replace('.js', '');
        }
        return `${i + 1}. *${name}*\n   ▸ Digunakan: ${formatNumber(total)}x\n   ▸ Terakhir: ${getTime(last)}`;
    }).join('\n\n');

    m.reply(`🌟 *Top 5 Fitur Terpopuler* 🌟\n\n${top || '*Belum ada data fitur populer.*'}`);
};

handler.help = ['populerfitur'];
handler.tags = ['info'];
handler.command = /^(populerfitur)$/i;
module.exports = handler;

// Fungsi bantu
function parseMs(ms) {
    if (typeof ms !== 'number') throw new Error('Parameter harus angka!');
    return {
        days: Math.floor(ms / 86400000),
        hours: Math.floor((ms % 86400000) / 3600000),
        minutes: Math.floor((ms % 3600000) / 60000),
        seconds: Math.floor((ms % 60000) / 1000),
    };
}

function getTime(ms) {
    let now = parseMs(Date.now() - ms);
    if (now.days) return `${now.days} hari yang lalu`;
    if (now.hours) return `${now.hours} jam yang lalu`;
    if (now.minutes) return `${now.minutes} menit yang lalu`;
    return `beberapa detik yang lalu`;
}

function formatNumber(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}