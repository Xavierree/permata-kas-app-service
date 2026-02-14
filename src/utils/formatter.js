/**
 * Formats a number to Indonesian Rupiah currency string.
 * @param {number} number - The number to format.
 * @returns {string} - The formatted string (e.g., "Rp 100.000").
 */
const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(number);
};

/**
 * Parses a currency string (e.g., "Rp 100.000" or "100.000") into a number.
 * Removes "Rp", ".", and returns an integer.
 * @param {string} currencyString - The string to parse.
 * @returns {number} - The parsed number.
 */
const parseCurrency = (currencyString) => {
    if (!currencyString) return 0;
    // Remove "Rp", ".", and trim whitespace
    const cleanString = currencyString.toString().replace(/Rp|\./g, '').trim();
    const number = parseInt(cleanString, 10);
    return isNaN(number) ? 0 : number;
};

/**
 * Format phone number to international format (62...)
 * @param {string} phone - The phone number input.
 * @returns {string} - The formatted phone number.
 */
const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    let formatted = phone.toString().replace(/\D/g, ''); // Remove non-digits
    if (formatted.startsWith('0')) {
        formatted = '62' + formatted.slice(1);
    }
    return formatted;
}


module.exports = {
    formatRupiah,
    parseCurrency,
    formatPhoneNumber
};
