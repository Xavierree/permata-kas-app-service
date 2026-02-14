// State
let members = [];
let currentMember = null;
let isSorted = false;

// DOM Elements
const sheetSelect = document.getElementById('sheetSelect');
const senderName = document.getElementById('senderName');
const greetingSelect = document.getElementById('greetingSelect');
const greetingInput = document.getElementById('greetingInput');
// SEARCHABLE DROPDOWN ELEMENTS
const memberSearch = document.getElementById('memberSearch');
const memberDropdown = document.getElementById('memberDropdown');
// const memberSelect = document.getElementById('memberSelect'); // Removed
const refreshBtn = document.getElementById('refreshBtn');
const filterUnpaidCheckbox = document.getElementById('filterUnpaid');
const sortBtn = document.getElementById('sortBtn');
const generateBtn = document.getElementById('generateBtn');
const resultArea = document.getElementById('resultArea');
const messagePreview = document.getElementById('messagePreview');
const waLink = document.getElementById('waLink');
const statusBadge = document.getElementById('statusBadge');
const copyBtn = document.getElementById('copyBtn');
const loadingState = document.getElementById('loadingState');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchSheets();

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!memberSearch.contains(e.target) && !memberDropdown.contains(e.target)) {
            memberDropdown.classList.add('hidden');
        }
    });

    // Show dropdown on focus
    memberSearch.addEventListener('focus', () => {
        renderDropdownList(members); // Show full list on focus
        memberDropdown.classList.remove('hidden');
    });

    // Filter on type
    memberSearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filtered = members.filter(m => m.name.toLowerCase().includes(searchTerm));
        renderDropdownList(filtered);
        memberDropdown.classList.remove('hidden');
        currentMember = null; // Reset selection on new search
    });
});

// Event Listeners
sheetSelect.addEventListener('change', fetchMembers);
refreshBtn.addEventListener('click', fetchMembers);
filterUnpaidCheckbox.addEventListener('change', () => {
    const searchTerm = memberSearch.value.toLowerCase();
    const filtered = members.filter(m => m.name.toLowerCase().includes(searchTerm));
    renderDropdownList(filtered);
});
sortBtn.addEventListener('click', toggleSort);
generateBtn.addEventListener('click', generateTemplate);
copyBtn.addEventListener('click', copyToClipboard);

// Greeting Toggle
greetingSelect.addEventListener('change', () => {
    if (greetingSelect.value === 'custom') {
        greetingInput.classList.remove('hidden');
        greetingInput.focus();
    } else {
        greetingInput.classList.add('hidden');
    }
});

// Live Update WA Link on Edit
messagePreview.addEventListener('input', () => {
    if (currentMember && currentMember.phone && waLink) {
        const updatedMessage = messagePreview.value;
        const encodedMsg = encodeURIComponent(updatedMessage);
        // Normalize phone if needed (already done in backend, but let's be safe)
        // actually `currentMember.phone` might be raw from sheet, backend sends `data.phone`.
        // We verified backend sends `data.phone` which is formatted.
        // But `currentMember` is from the `members` array.
        // Let's store the generated phone in a dataset or global var to be safe.
        // Better: extract phone from current WA link? Or just use `members` data if it's there.
        // The backend does normalization. `members` has raw phone.
        // Let's rely on the fact that `data.phone` was used to set the link.

        // Simpler approach: update the href's text param only.
        const currentHref = waLink.href;
        if (currentHref && currentHref.includes("wa.me")) {
            const baseUrl = currentHref.split("?")[0];
            waLink.href = `${baseUrl}?text=${encodedMsg}`;
        }
    }
});

// Keyboard Navigation
let currentFocus = -1;

memberSearch.addEventListener('keydown', (e) => {
    let x = document.getElementById("memberDropdown").getElementsByTagName("div");
    if (e.key === "ArrowDown") {
        currentFocus++;
        addActive(x);
    } else if (e.key === "ArrowUp") {
        currentFocus--;
        addActive(x);
    } else if (e.key === "Enter") {
        e.preventDefault();
        if (currentFocus > -1) {
            if (x) x[currentFocus].click();
        }
    }
});

function addActive(x) {
    if (!x) return false;
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);

    x[currentFocus].classList.add("bg-blue-100"); // Add highlight
    x[currentFocus].classList.remove("hover:bg-blue-50"); // Remove generic hover to avoid clash

    // Scroll to view
    x[currentFocus].scrollIntoView({ block: "nearest" });
}

function removeActive(x) {
    for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("bg-blue-100");
        x[i].classList.add("hover:bg-blue-50");
    }
}

// Fetch Sheets
async function fetchSheets() {
    try {
        const response = await fetch('/api/sheets');
        const sheets = await response.json();

        sheetSelect.innerHTML = '';
        sheets.forEach(sheet => {
            const option = document.createElement('option');
            option.value = sheet;
            option.textContent = sheet;
            sheetSelect.appendChild(option);
        });

        const defaultSheet = sheets.find(s => s.includes('2025-2027'));
        if (defaultSheet) {
            sheetSelect.value = defaultSheet;
        }

        fetchMembers();

    } catch (error) {
        console.error("Error fetching sheets:", error);
        sheetSelect.innerHTML = '<option>Error loading sheets</option>';
    }
}

// Utility: Fetch with Timeout
async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 15000 } = options;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(resource, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
}

// Fetch Members
async function fetchMembers() {
    setLoading(true);
    memberSearch.disabled = true;
    memberSearch.value = 'Mengambil data...'; // More natural "Fetching..."

    const selectedSheet = sheetSelect.value;
    const url = selectedSheet ? `/api/members?sheet=${encodeURIComponent(selectedSheet)}` : '/api/members';

    try {
        const response = await fetchWithTimeout(url, { timeout: 15000 }); // 15s Timeout
        if (!response.ok) throw new Error('Gagal mengambil data dari server.');

        members = await response.json();
        memberSearch.value = '';
        memberSearch.placeholder = "Ketik nama anggota...";
        renderDropdownList(members);
    } catch (error) {
        console.error('Error:', error);
        memberSearch.value = 'Error (Coba Refresh)';
        if (error.name === 'AbortError') {
            alert('Koneksi lambat (Timeout). Silakan refresh halaman atau periksa koneksi internet Anda.');
        } else {
            alert('Gagal mengambil data anggota: ' + error.message);
        }
    } finally {
        setLoading(false);
        memberSearch.disabled = false;
        // Keep placeholder if empty
        if (!memberSearch.value) {
            memberSearch.placeholder = "Ketik nama anggota...";
        }
    }
}

function renderDropdownList(listToRender) {
    memberDropdown.innerHTML = '';

    // Apply Filters (Unpaid / Sort)
    let processedList = [...listToRender];

    if (filterUnpaidCheckbox.checked) {
        processedList = processedList.filter(m => m.status === 'UNPAID');
    }

    if (isSorted) {
        processedList.sort((a, b) => b.totalPayment - a.totalPayment);
    }

    if (processedList.length === 0) {
        const div = document.createElement('div');
        div.className = "px-4 py-2 text-gray-500 text-sm italic";
        div.textContent = "Tidak ada anggota ditemukan";
        memberDropdown.appendChild(div);
        return;
    }

    currentFocus = -1; // Reset focus on new list render

    processedList.forEach((member, index) => {
        // We use the original index from the main 'members' array to identify them uniquely if names define uniqueness
        // But for simplicity, we can pass the member object directly to selection handler

        const div = document.createElement('div');
        div.className = "px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition duration-150";

        // Highlight logic
        const searchTerm = memberSearch.value.toLowerCase();
        let nameDisplay = member.name;
        // Simple manual bolding for search match could be added here if desired

        div.innerHTML = `
            <div class="flex justify-between items-center">
                <span class="font-medium text-gray-800">${member.name}</span>
                ${member.status === 'PAID'
                ? '<span class="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">LUNAS</span>'
                : `<span class="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">${member.total}</span>`
            }
            </div>
        `;

        div.addEventListener('click', () => {
            selectMember(member);
        });

        memberDropdown.appendChild(div);
    });
}

function selectMember(member) {
    currentMember = member;
    memberSearch.value = member.name;
    memberDropdown.classList.add('hidden');
    // Optional: Auto focus greeting or generic
}

function renderMemberOptions() {
    // Legacy function support redirected to renderDropdown
    renderDropdownList(members);
}

function toggleSort() {
    isSorted = !isSorted;
    sortBtn.textContent = isSorted ? '⬆️ Reset Urutan' : '⬇️ Urutkan Tunggakan Terbesar';

    // Trigger re-render of dropdown
    const searchTerm = memberSearch.value.toLowerCase();
    const filtered = members.filter(m => m.name.toLowerCase().includes(searchTerm));
    renderDropdownList(filtered);
}

async function generateTemplate() {
    // Validate selection
    if (!currentMember || memberSearch.value !== currentMember.name) {
        alert("Silakan pilih anggota dari daftar dropdown terlebih dahulu (klik nama anggota).");
        return;
    }

    const sender = senderName.value || "Pengurus";

    // Determine Greeting
    let greeting = greetingSelect.value;
    if (greeting === 'custom') {
        greeting = greetingInput.value.trim();
        if (!greeting) {
            alert('Silakan ketik sapaan manualnya!');
            return;
        }
    }

    // Generate Button Loading State
    const originalBtnText = generateBtn.textContent;
    generateBtn.disabled = true;
    generateBtn.textContent = "Generating...";

    setLoading(true); // Keep global loading state
    resultArea.classList.add('hidden'); // Hide result area while generating

    try {
        console.log("Sending generate request:", { member: currentMember, sender, greeting });

        const response = await fetchWithTimeout('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                member: currentMember,
                senderName: sender, // Fix: Backend expects senderName
                greeting
            }),
            timeout: 10000 // 10s Timeout
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        // Update UI directly (integrating displayResult logic)
        resultArea.classList.remove('hidden');

        // Status Badge
        statusBadge.classList.remove('hidden', 'bg-green-100', 'text-green-800', 'bg-red-100', 'text-red-800');
        if (data.status === 'PAID') {
            statusBadge.textContent = 'LUNAS';
            statusBadge.classList.add('bg-green-100', 'text-green-800');
        } else {
            statusBadge.textContent = 'BELUM LUNAS';
            statusBadge.classList.add('bg-red-100', 'text-red-800');
        }

        // Message
        if (data.message) {
            messagePreview.value = data.message;
            waLink.classList.remove('hidden', 'pointer-events-none', 'opacity-50');

            // WA Link
            if (data.phone) {
                const encodedMsg = encodeURIComponent(data.message);
                waLink.href = `https://wa.me/${data.phone}?text=${encodedMsg}`;
                waLink.innerHTML = `<i class="fab fa-whatsapp text-xl"></i> Buka WhatsApp (${data.phone})`;
            } else {
                waLink.href = '#';
                waLink.innerHTML = `<i class="fab fa-whatsapp text-xl"></i> No Phone Number`;
                waLink.classList.add('pointer-events-none', 'opacity-50');
            }
        } else {
            messagePreview.value = data.info || "Tidak ada template untuk status ini.";
            waLink.classList.add('hidden');
        }

    } catch (error) {
        console.error('Error:', error);
        if (error.name === 'AbortError') {
            alert('Waktu habis (Timeout). Server tidak merespon dalam 10 detik.');
        } else {
            alert('Terjadi kesalahan: ' + error.message);
        }
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = originalBtnText;
        setLoading(false); // Reset global loading state
    }
}

function displayResult(data) {
    // This function is now largely integrated into generateTemplate,
    // but keeping it for now if other parts of the code still call it.
    // It might be removed in a future refactor.
    resultArea.classList.remove('hidden');

    // Status Badge
    statusBadge.classList.remove('hidden', 'bg-green-100', 'text-green-800', 'bg-red-100', 'text-red-800');
    if (data.status === 'PAID') {
        statusBadge.textContent = 'LUNAS';
        statusBadge.classList.add('bg-green-100', 'text-green-800');
    } else {
        statusBadge.textContent = 'BELUM LUNAS';
        statusBadge.classList.add('bg-red-100', 'text-red-800');
    }

    // Message
    if (data.message) {
        messagePreview.value = data.message;
        waLink.classList.remove('hidden', 'pointer-events-none', 'opacity-50');

        // WA Link
        if (data.phone) {
            const encodedMsg = encodeURIComponent(data.message);
            waLink.href = `https://wa.me/${data.phone}?text=${encodedMsg}`;
            waLink.innerHTML = `<i class="fab fa-whatsapp text-xl"></i> Buka WhatsApp (${data.phone})`;
        } else {
            waLink.href = '#';
            waLink.innerHTML = `<i class="fab fa-whatsapp text-xl"></i> No Phone Number`;
            waLink.classList.add('pointer-events-none', 'opacity-50');
        }
    } else {
        messagePreview.value = data.info || "Tidak ada template untuk status ini.";
        waLink.classList.add('hidden');
    }
}

function copyToClipboard() {
    messagePreview.select();
    document.execCommand('copy'); // Fallback usually works
    navigator.clipboard.writeText(messagePreview.value).then(() => {
        const originalHtml = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check text-green-500"></i>';
        setTimeout(() => copyBtn.innerHTML = originalHtml, 2000);
    });
}

function setLoading(isLoading) {
    if (isLoading) {
        loadingState.classList.remove('hidden');
    } else {
        loadingState.classList.add('hidden');
    }
}
