const { formatRupiah } = require('./formatter');

/**
 * Generates the chat template based on member data and arrears status.
 * @param {object} member - The member data object.
 * @param {string} senderName - The name of the sender.
 * @param {string} greeting - The greeting (e.g., "Kakak", "Abang").
 * @returns {string} - The generated message.
 */
const generateTemplate = (member, senderName, greeting) => {
    // Check if TOTAL is "LUNAS" (case-insensitive) or 0
    if (String(member.total).toUpperCase().includes('LUNAS')) {
        return null; // Should be handled by the caller to indicate paid status
    }

    const arrears2024 = member.arrears2024 || 0;
    const arrears2025 = member.arrears2025 || 0;
    const totalDues2026 = member.totalDues2026 || 0; // Aggregated sum
    const total = member.totalPayment; // numerical total

    // Generate 2026 Label
    let label2026 = "2026";
    if (member.dues2026Detail && Object.keys(member.dues2026Detail).length > 0) {
        const months = Object.keys(member.dues2026Detail);
        // Clean up "2026" from keys if present to just get months
        const cleanMonths = months.map(m => m.replace(' 2026', '').trim());

        if (cleanMonths.length > 1) {
            // E.g. "Jan-Feb 2026"
            label2026 = `${cleanMonths[0]}-${cleanMonths[cleanMonths.length - 1]} 2026`;
        } else {
            // E.g. "Jan 2026"
            label2026 = `${cleanMonths[0]} 2026`;
        }
    }

    // Greeting Logic
    let shortGreeting = greeting;
    let longGreeting = greeting;

    // Standard mappings for presets, otherwise use input as-is
    if (greeting.toLowerCase() === 'kakak') shortGreeting = 'Kak';
    if (greeting.toLowerCase() === 'abang') shortGreeting = 'Bang';

    // Time-based Greeting Logic
    const hour = new Date().getHours();
    let timeGreeting = 'pagi'; // Default

    if (hour >= 5 && hour < 11) {
        timeGreeting = 'pagi';
    } else if (hour >= 11 && hour < 15) {
        timeGreeting = 'siang';
    } else if (hour >= 15 && hour < 18) {
        timeGreeting = 'sore';
    } else {
        timeGreeting = 'malam'; // 18:00 - 04:59
    }

    let message = `Shalom selamat ${timeGreeting} ${longGreeting}\n`;
    message += `Aku ${senderName} dari Bidang Keuangan PERMATA, ingin mengingatkan untuk pembayaran iuran ${shortGreeting}\n\n`;

    message += `Untuk rincian iuranndu ${shortGreeting}\n`;

    // Only show years with arrears/dues > 0 to keep it "viable" and clean
    // OR if the user strictly wants the list, we can show Rp 0. 
    // Given "reminder", showing what is owed is standard. 
    // However, the prompt implies a specific structure. 
    // Let's safe-guard: if total is >0, show the breakdown.

    // Generate Arrears List from Map
    // Sort keys to ensure chronological order (optional, but good)
    if (member.arrearsMap) {
        const sortedYears = Object.keys(member.arrearsMap).sort();
        sortedYears.forEach(year => {
            const amount = member.arrearsMap[year];
            if (amount > 0) {
                message += `${year} : ${formatRupiah(amount)}\n`;
            }
        });
    }

    // Always show 2026 if it's the current period, or only if > 0?
    // User wrote "Jan-Feb 2026 : Rp...". Likely standard.
    if (totalDues2026 > 0) {
        message += `${label2026} : ${formatRupiah(totalDues2026)}\n`;
    }

    message += `Untuk total keseluruhannya ${formatRupiah(total)} boleh dicicil atau langsung di lunasi ya ${shortGreeting}\n`;
    message += `Pembayaran bisa di transfer ke rekening BCA 1740689211 an. Aginta Dindi Purba, untuk bukti transfernya bisa dikirim sama ku ya ${shortGreeting}\n\n`;
    message += `Kalau ada yang mau ditanyakan, boleh ditanyakan sama ku ${shortGreeting}. Bujur, Tuhan Berkati`;

    return message;
};

module.exports = { generateTemplate };
