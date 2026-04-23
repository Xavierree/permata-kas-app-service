/**
 * Generates the chat template for Promotion Mode.
 * @param {object} member - The member data object.
 * @param {string} senderName - The name of the sender.
 * @param {string} greeting - The greeting (e.g., "Kakak", "Abang").
 * @param {boolean} [noSenderName] - Whether to exclude sender's name
 * @param {boolean} [noReceiverName] - Whether to exclude receiver's name
 * @returns {string} - The generated message.
 */
const generateTemplate = (member, senderName, greeting, noSenderName, noReceiverName) => {
    let shortGreeting = greeting ? greeting.trim() : '';
    if (shortGreeting.toLowerCase() === 'kakak') shortGreeting = 'Kak';
    if (shortGreeting.toLowerCase() === 'abang') shortGreeting = 'Bang';
    if (shortGreeting.toLowerCase() === 'none') shortGreeting = '';

    let msgGreeting = shortGreeting ? ` ${shortGreeting}` : '';
    let kakBang = shortGreeting ? ` ${shortGreeting.toLowerCase()}` : ' kak/bang';

    let message = '';
    
    if (noReceiverName) {
        message += `Shalom ras mejuah juah${msgGreeting}\n`;
    } else {
        message += `Shalom ras mejuah juah${msgGreeting} ${member.name}\n`;
    }

    if (noSenderName) {
        message += `Aku dari Tim Keuangan Permata Bogor Barat ingin menawarkan Danusan Permata, berikut adalah danusannya\n\n`;
    } else {
        message += `Aku ${senderName} dari Tim Keuangan Permata Bogor Barat ingin menawarkan Danusan Permata, berikut adalah danusannya\n\n`;
    }

    message += `— 🥤TUMBLER : Rp100.000 \n`;
    message += `dengan, \n`;
    message += `Warna : Pink, Merah, Tosca, Putih & Biru Tua\n`;
    message += `Kapasitas : 900ml\n`;
    message += `Material : Stainless Steel\n`;
    message += `Hot & Cold 8-12 Hours\n`;
    message += `BPA Free\n`;
    message += `Hasil Gambar SILVER\n\n`;

    message += `— ⛱️ PAYUNG : Rp 80.000 dengan, \n`;
    message += `Warna : Biru Muda, Pink, Putih Tulang\n`;
    message += `Dilengkapi : UV Protection\n`;
    message += `Model : Payung Lipat Otomatis\n\n`;

    message += `Notes : detail gambar Tumblr & Payung terlampir\n\n`;

    message += `Tumbler dan Payung ini bisa di pesan mulai dari hari ini dan akan close PO pada hari Senin, 27 April 2026 ya${kakBang}😊\n`;
    message += `Kami tunggu partisipasinduu dalam memesan Tumbler & Payung ini🤗\n\n`;
    
    message += `Bujur melala${kakBang}, Tuhan Yesus memberkati🙏🏻😇`;

    return message;
};

module.exports = { generateTemplate };
