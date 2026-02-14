# Permata Kas Generator 💰

A web application to streamline the generation of WhatsApp payment reminder templates for Permata (Youth) treasury collection.

## Features ✨

*   **Google Sheets Integration**: Fetches member data directly from your Google Sheet.
*   **Smart Template Generation**: automatically detects payment status (Paid/Unpaid/Arrears) and generates the appropriate message.
*   **Full History Support**: Displays arrears from 2019 all the way to 2027+.
*   **Dynamic Greeting**: Automatically adjusts greeting based on time of day (Pagi/Siang/Sore/Malam).
*   **Hybrid Greeting**: Choose from presets (Kakak, Abang) or type a custom nickname.
*   **Editable Preview**: Edit the message before sending, and the WhatsApp link updates instantly.
*   **Multi-Sheet Support**: Switch between different year ranges (e.g., 2025-2027).

## Prerequisites 📋

*   **Node.js** (v14 or higher)
*   **Google Cloud Service Account** credentials (JSON file)

## Installation 🛠️

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Xavierree/permata-kas-app-service.git
    cd permata-kas-app-service
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Setup Environment**
    *   Create a `.env` file in the root directory.
    *   Add your Google Sheet ID:
        ```
        GOOGLE_SHEETS_ID=your_spreadsheet_id_here
        PORT=3000
        ```
    *   Place your Google Service Account JSON file in the root directory (e.g., `service-account.json`).
    *   Update `.env` to point to it:
        ```
        GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
        ```

## Usage 🚀

### macOS / Linux
Run the startup script:
```bash
./start-app.sh
```

### Windows
Run the PowerShell script:
```powershell
.\start-app.ps1
```

### Manual Start
```bash
npm start
```

Open your browser at `http://localhost:3000`.

## License 📄
Private / Internal Use for Permata.
