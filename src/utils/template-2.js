const { formatRupiah } = require('./formatter');

/**
 * Generates the chat template WITHOUT introduction.
 * @param {object} member - The member data object.
 * @param {string} senderName - The name of the sender (kept for signature/context if needed).
 * @param {string} greeting - The greeting (e.g., "Kakak", "Abang").
 * @returns {string} - The generated message.
 */
const generateTemplate = (member, senderName, greeting) => {
    // Check if TOTAL is "LUNAS" (case-insensitive) or 0
    if (String(member.total).toUpperCase().includes('LUNAS')) {
        return null;
    }

    const totalDues2026 = member.totalDues2026 || 0;
    const total = member.totalPayment;

    // Generate 2026 Label
    let label2026 = "2026";
    if (member.dues2026Detail && Object.keys(member.dues2026Detail).length > 0) {
        const months = Object.keys(member.dues2026Detail);
        const cleanMonths = months.map(m => m.replace(' 2026', '').trim());

        if (cleanMonths.length > 1) {
            label2026 = `${cleanMonths[0]}-${cleanMonths[cleanMonths.length - 1]} 2026`;
        } else {
            label2026 = `${cleanMonths[0]} 2026`;
        }
    }

    // Greeting Logic
    let shortGreeting = greeting ? greeting.trim() : '';
    if (shortGreeting.toLowerCase() === 'kakak') shortGreeting = 'Kak';
    if (shortGreeting.toLowerCase() === 'abang') shortGreeting = 'Bang';
    if (shortGreeting.toLowerCase() === 'none') shortGreeting = '';

    // Time-based Greeting Logic
    const hour = new Date().getHours();
    let timeGreeting = 'pagi';

    if (hour >= 5 && hour < 11) {
        timeGreeting = 'pagi';
    } else if (hour >= 11 && hour < 15) {
        timeGreeting = 'siang';
    } else if (hour >= 15 && hour < 18) {
        timeGreeting = 'sore';
    } else {
        timeGreeting = 'malam';
    }

    let msgGreeting = shortGreeting ? ` ${greeting !== 'none' ? greeting : ''}` : '';
    let msgShort = shortGreeting ? ` ${shortGreeting}` : '';

    // Template 2: NO INTRODUCTION
    let message = `Shalom selamat ${timeGreeting}${msgGreeting}\n`;
    message += `Ingin mengingatkan untuk pembayaran iuran${msgShort}\n\n`;

    message += `Untuk rincian iuranndu${msgShort}\n`;

    // Generate Arrears List from Map
    if (member.arrearsMap) {
        const sortedYears = Object.keys(member.arrearsMap).sort();
        sortedYears.forEach(year => {
            const amount = member.arrearsMap[year];
            if (amount > 0) {
                message += `${year} : ${formatRupiah(amount)}\n`;
            }
        });
    }

    if (totalDues2026 > 0) {
        message += `${label2026} : ${formatRupiah(totalDues2026)}\n`;
    }

    message += `Untuk total keseluruhannya ${formatRupiah(total)} boleh dicicil atau langsung di lunasi ya${msgShort}\n`;
    message += `Pembayaran bisa di transfer ke rekening BCA 1740689211 an. Aginta Dindi Purba, untuk bukti transfernya bisa dikirim sama ku ya${msgShort}\n\n`;
    message += `Kalau ada yang mau ditanyakan, boleh ditanyakan sama ku ya${msgShort}. Bujur, Tuhan Berkati`;

    return message;
};

module.exports = { generateTemplate };
