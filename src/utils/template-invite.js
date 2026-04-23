/**
 * Generates the chat template for Inviting Mode.
 * @param {object} member - The member data object.
 * @param {string} senderName - The name of the sender.
 * @param {string} greeting - The greeting (e.g., "Kakak", "Abang").
 * @param {string} [groupLink] - The optional WhatsApp group link.
 * @returns {string} - The generated message.
 */
const generateTemplate = (member, senderName, greeting, groupLink) => {
    let shortGreeting = greeting ? greeting.trim() : '';
    if (shortGreeting.toLowerCase() === 'kakak') shortGreeting = 'Kak';
    if (shortGreeting.toLowerCase() === 'abang') shortGreeting = 'Bang';
    if (shortGreeting.toLowerCase() === 'none') shortGreeting = '';

    const hour = new Date().getHours();
    let timeGreeting = 'pagi';
    if (hour >= 5 && hour < 11) timeGreeting = 'pagi';
    else if (hour >= 11 && hour < 15) timeGreeting = 'siang';
    else if (hour >= 15 && hour < 18) timeGreeting = 'sore';
    else timeGreeting = 'malam';

    let msgGreeting = shortGreeting ? ` ${shortGreeting}` : '';

    let message = `halo ${member.name} selamat ${timeGreeting}${msgGreeting}.\n\n`;
    message += `Aku ${senderName}, dari kepanitiaan AUPCUP 2026.\n\n`;

    if (member.position_1 && member.position_2) {
        message += `di list kepanitiaan kami, kak ${member.name} terdaftar sebagai seksi ${member.position_1} dan ${member.position_2}.\n\n`;
    } else if (member.position_1) {
        message += `di list kepanitiaan kami, kak ${member.name} terdaftar sebagai seksi ${member.position_1}.\n\n`;
    }

    message += `Melalui pesan ini kami meng-invite kak ${member.name} ke dalam Grup Kepanitiaan AUP CUP 2026. `;

    if (groupLink) {
        let textBisaGabung = shortGreeting ? `${shortGreeting} bisa` : 'Bisa';
        message += `${textBisaGabung} langsung bergabung melalui link berikut:\n${groupLink}\n\n`;
    } else {
        message += `\n\n`; // Just in case the link isn't provided, though they asked for it.
    }

    let textKesediaan = shortGreeting ? `kesediaan ${shortGreeting}` : 'kesediaannya';
    message += `Kami sangat berterima kasih atas ${textKesediaan} untuk ikut ambil bagian dalam kepanitiaan AUP CUP ini.\n\n`;
    
    let textTanya = shortGreeting ? ` ya ${shortGreeting}` : '';
    message += `Jika ada pertanyaan, boleh disampaikan langsung${textTanya}.\n`;
    
    let textThankyou = shortGreeting ? `Thankyou kak.` : `Thankyou.`;
    message += `${textThankyou}`;

    return message;
};

module.exports = { generateTemplate };
