# RN Tailor — Management System

**Production Release v1.0 — Windows Desktop Edition**

A complete, self-contained desktop web application for tailoring shops. Manage clothing varieties, record customer measurements, create itemized invoices, track billing history, and view business analytics.

---

## 🚀 How to Run (Quick Start)

1. **Check Java Prerequisite**:
   * Ensure **Java 17 or Java 21** (or higher) is installed on your Windows machine.
   * If Java is not installed, download it for free from [Adoptium Eclipse Temurin](https://adoptium.net/) (Windows x64 Installer).

2. **Start the Application**:
   * Double-click **`run.bat`** in the `tailor-app` folder.
   * A terminal window will open and start the local application server.

3. **Use the Application**:
   * Your default web browser will automatically open once the server is ready:
     ```
     http://localhost:8080
     ```
   * Log in or register an account to start managing your tailoring store.

4. **Stopping the Application**:
   * When you are finished, simply close the terminal window that opened with `run.bat`.

---

## 🛠️ Build From Source

To build the client distribution package yourself, run:

```bash
bash build.sh
```

This script will:
1. Compile the Angular frontend (`taui`)
2. Copy static assets to the Spring Boot resources directory
3. Package the executable `tailor-app.jar`
4. Assemble the `tailor-app/` distribution folder with `run.bat`

---

## 📁 Files in Distribution (`tailor-app/`)

| File | Description |
| :--- | :--- |
| **`run.bat`** | Windows 1-click startup script. Validates Java, sets the secure client token, and opens the browser when the server is ready. |
| **`tailor-app.jar`** | Self-contained application bundle containing the Spring Boot engine, SQLite database driver, and Angular user interface. |
| **`tailor.db`** | Created automatically on first run. Contains customer records, measurements, varieties, and invoices. |
| **`logs\`** | Folder containing daily diagnostic logs (`logs\tailor-service.log`). |

---

## 💾 Database & Backups

* **Where is my data stored?**  
  All customer records, measurements, and billing details are stored locally inside **`tailor.db`** in the application directory.
* **Persistent Storage**:  
  Closing or restarting the application **never** deletes your data.
* **Creating a Backup**:  
  To back up your data, simply copy the **`tailor.db`** file to an external drive, USB stick, or cloud folder (Google Drive, OneDrive).

---

## 🔒 Security & Secret Token

* The security token used for authentication is passed dynamically at runtime from `run.bat` (`JWT_SECRET`).
* No secret keys or hardcoded credentials exist inside the application binary.

---

*RN Tailor Management System • Built with Spring Boot 3 & Angular*
