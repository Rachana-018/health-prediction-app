# 🩺 HealthPredict — AI-Powered Patient Health Analysis

> A full-stack web application for managing patient blood test records with automatic AI-generated health risk assessments.



## 🌟 Overview

**HealthPredict** is a full-stack health management application that allows medical staff to manage patient blood test records and receive instant AI-generated health risk assessments. When a patient record is saved, the system automatically analyses their Glucose, Haemoglobin, and Cholesterol values against WHO/ADA clinical reference ranges and generates a human-readable risk report in the **Remarks** field.

---

## ✨ Features

| Feature | Description |
|---|---|
| ✅ **CRUD Operations** | Create, Read, Update, and Delete patient records |
| 🤖 **AI Health Remarks** | Auto-generated risk assessment on every save/update |
| 🔍 **Live Search** | Filter patients by name or email in real time |
| ✔️ **Dual Validation** | Client-side (React) + Server-side (Flask) input validation |
| 🏷️ **Risk Badges** | Visual Low / Moderate / High risk labels per patient |
| 💾 **Persistent Storage** | SQLite for development; PostgreSQL-ready for production |
| 🔔 **Toast Notifications** | Instant success/error feedback for all actions |
| 🗑️ **Safe Delete** | Confirmation dialog before any destructive action |

---

## 🛠 Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| **Backend** | Python 3.8+ / Flask 3.0 | Lightweight REST API, minimal boilerplate |
| **Database ORM** | SQLAlchemy 2.0 | Easy DB abstraction; SQLite → PostgreSQL swap with one env var |
| **Database** | SQLite (dev) | Zero-config persistent storage |
| **Frontend** | React 18 + Vite | Fast HMR, component-based, CSS Modules for scoped styles |
| **HTTP Client** | Fetch API | Native browser API, no extra dependencies |
| **AI/ML Logic** | Rule-based clinical engine | Transparent, explainable, no external API key required |
| **Styling** | CSS Modules + Google Fonts | Scoped styles, no class collisions, custom typography |

---

## 📁 Project Structure

```
health-prediction-app/
│
├── .gitignore                  # Ignores venv, .env, node_modules, *.db
├── .env.example                # Template for environment variables
├── README.md                   # This file
│
├── backend/
│   ├── app.py                  # Flask app: routes, DB model, validation, AI logic
│   ├── requirements.txt        # Python dependencies
│   └── patients.db             # SQLite database (auto-created on first run)
│
└── frontend/
    ├── index.html              # HTML entry point
    ├── package.json            # Node dependencies & scripts
    ├── vite.config.js          # Vite config with API proxy
    └── src/
        ├── main.jsx            # React DOM entry point
        ├── App.jsx             # Root component — all state & view management
        ├── App.module.css      # Root layout styles
        │
        ├── services/
        │   └── api.js          # Centralised HTTP client (all fetch calls)
        │
        ├── styles/
        │   └── globals.css     # CSS variables, reset, global typography
        │
        └── components/
            ├── PatientForm.jsx         # Add / Edit form with live validation
            ├── PatientForm.module.css
            ├── PatientTable.jsx        # Records table with risk badges
            ├── PatientTable.module.css
            ├── ConfirmDialog.jsx       # Delete confirmation modal
            ├── ConfirmDialog.module.css
            ├── Toast.jsx               # Auto-dismiss notifications
            └── Toast.module.css
```

---

## 🔧 Prerequisites

Make sure the following are installed on your machine:

| Tool | Minimum Version | Check Command |
|---|---|---|
| Python | 3.8+ | `python --version` |
| pip | Any | `pip --version` |
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| Git | Any | `git --version` |

**Download links:**
- Python → https://python.org/downloads
- Node.js → https://nodejs.org
- Git → https://git-scm.com

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/health-prediction-app.git
cd health-prediction-app
```

### 2. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Create a Python virtual environment
python -m venv venv

# Activate the virtual environment
# macOS / Linux:
source venv/bin/activate

# Windows CMD:
venv\Scripts\activate.bat

# Windows PowerShell:
venv\Scripts\Activate.ps1

# Install Python dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup

Open a **new terminal window**, then:

```bash
# Navigate to frontend folder
cd frontend

# Install Node dependencies
npm install
```

---

## ▶️ Running the Application

You need **two terminals running simultaneously**.

### Terminal 1 — Start the Backend (Flask)

```bash
cd backend
source venv/bin/activate    # skip if already active
python app.py
```

Expected output:
```
INFO:app:Database tables created / verified.
 * Running on http://127.0.0.1:5000
```

### Terminal 2 — Start the Frontend (React + Vite)

```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE v5.x.x  ready in xxx ms
  ➜  Local:   http://localhost:3000/
```

### Open in Browser

Navigate to **http://localhost:3000**

The SQLite database (`patients.db`) is created automatically on first run — no manual DB setup needed.

---

## 📡 API Reference

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description | Request Body |
|---|---|---|---|
| `GET` | `/health` | Server liveness check | — |
| `GET` | `/patients` | List all patients | — |
| `GET` | `/patients?search=name` | Search patients by name or email | — |
| `GET` | `/patients/:id` | Get a single patient | — |
| `POST` | `/patients` | Create patient + generate AI remark | JSON body (see below) |
| `PUT` | `/patients/:id` | Update patient + regenerate AI remark | JSON body (partial ok) |
| `DELETE` | `/patients/:id` | Delete a patient | — |




## 🤖 AI Health Prediction Logic

The `predict_health()` function in `backend/app.py` applies established clinical reference ranges to each biomarker and generates a plain-English risk summary.

### Reference Ranges Used

| Biomarker | Unit | Normal | Borderline | High Risk |
|---|---|---|---|---|
| **Glucose** | mg/dL | 70–99 | 100–125 (Pre-diabetic) | > 125 (Diabetic) |
| **Haemoglobin** | g/dL | 12–17.5 | 8–11.9 (Mild Anaemia) | < 8 (Severe Anaemia) |
| **Cholesterol** | mg/dL | < 200 | 200–239 (Borderline) | ≥ 240 (High) |

### Overall Risk Scoring

The final risk level is computed as the **maximum severity** across all three biomarkers:

```
Low      → all values within normal range
Moderate → at least one value in borderline range
High     → at least one value in the high-risk range
```



## ✔️ Data Validation

Validation runs on **both** the client (React) and the server (Flask) for defense-in-depth.

| Field | Rules |
|---|---|
| **Full Name** | Required, minimum 2 characters |
| **Date of Birth** | Required, must be a past date (not today, not future), format YYYY-MM-DD |
| **Email** | Required, must match standard email format, must be unique |
| **Glucose** | Required, numeric, range 0–2000 mg/dL |
| **Haemoglobin** | Required, numeric, range 0–30 g/dL |
| **Cholesterol** | Required, numeric, range 0–1000 mg/dL |

---

## 🔐 Environment Variables

Copy `.env.example` to `.env` and fill in your values. **Never commit `.env` to Git.**

```bash
cp .env.example .env
```

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `sqlite:///patients.db` | Database connection string |
| `FLASK_ENV` | `development` | Flask environment |
| `VITE_API_URL` | `http://localhost:5000/api` | Backend URL for the React frontend |
