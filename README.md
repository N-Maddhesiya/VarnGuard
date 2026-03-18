# 🛡️ VarnGuard — The Deepfake & Scam Shield

> **"Protecting the people who trust the internet the most."**
> An AI-powered Chrome Extension that acts as a real-time guardian against deepfakes and deceptive Terms & Conditions — built for parents, the elderly, and everyday users.

![VarnGuard Banner](https://img.shields.io/badge/VarnGuard-Deepfake%20%26%20Scam%20Shield-red?style=for-the-badge&logo=google-chrome)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/status-Active%20Development-green?style=for-the-badge)
![Stack](https://img.shields.io/badge/stack-MERN%20%2B%20Python%20FastAPI-yellow?style=for-the-badge)

---

## 🚨 The Problem

In 2026, AI-generated scams are no longer science fiction — they're a daily threat:

- 🎭 **Deepfake video calls** impersonate family members to steal money
- 🎙️ **Voice cloning** tricks elderly parents into fake emergencies  
- 📄 **Predatory Terms & Conditions** hide data-selling clauses in walls of legal text
- 👴 **Regular people** — especially parents and the elderly — have no tools to fight back

**VarnGuard is that tool.**

---

## ✨ Features

### 🔍 Scam / T&C Shield
- Automatically detects when you visit a **legal, signup, or privacy page**
- Uses NLP to **summarize dense Terms & Conditions** into 3 simple bullet points
- **Flags risky clauses** like data selling, forced arbitration, and no-refund policies
- Injects a **🔴 Red Alert Banner** for high-risk pages or **🟢 Green Banner** for safe ones
- One-click **"View Summary"** modal with plain-English explanations

### 🎭 Deepfake Shield
- Injects a **"Verify Deepfake"** overlay button onto any HTML5 video player
- Detects **synthetic media artifacts** in video using Computer Vision models
- Flashes a **massive RED ALERT** when deepfake probability exceeds 90%
- Works on YouTube, social media, news sites, and video call platforms

---

## 🏗️ Architecture

VarnGuard follows a **Decoupled Quad-Folder Architecture**:

```
VarnGuard/
├── 🧩 extension/        # Chrome Extension (Manifest V3)
│   ├── content/         # DOM manipulation & banner injection
│   ├── background/      # Service Worker & API proxy
│   └── popup/           # Extension popup UI
│
├── 🖥️ client/           # React + Vite Management Dashboard
│   └── src/             # Scan history, settings, detailed reports
│
├── ⚙️ server/           # Node.js + Express Primary API
│   └── index.js         # Auth, MongoDB logging, AI service proxy
│
└── 🤖 ai-service/       # Python FastAPI AI Brain
    ├── main.py          # T&C NLP analysis & risk scoring
    └── app.py           # Deepfake CV detection models
```

---

## 🔄 How It Works

```
User visits a page
       ↓
Content Script detects T&C / Video
       ↓
Text/Media sent → Node.js (port 5000)
       ↓
Node.js forwards → Python FastAPI (port 8000)
       ↓
AI returns Risk Score (0–100)
       ↓
Score > 70?  →  🔴 RED BANNER injected into DOM
Score < 70?  →  🟢 GREEN BANNER injected into DOM
       ↓
User clicks "View Summary" → Modal with 3 bullet points
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Chrome Extension | Manifest V3, Vanilla JS, Content Scripts |
| Frontend Dashboard | React 18, Vite, Tailwind CSS |
| Backend API | Node.js, Express.js, JWT Auth |
| Database | MongoDB Atlas (Mongoose) |
| AI Service | Python, FastAPI, Transformers, PyTorch |
| Containerization | Docker, Docker Compose |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Python 3.10+
- MongoDB Atlas account (or local MongoDB)
- Google Chrome browser

### 1. Clone the repository
```bash
git clone https://github.com/N-Maddhesiya/VarnGuard.git
cd VarnGuard
```

### 2. Start the AI Service
```bash
cd ai-service
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

### 3. Start the Node.js Server
```bash
cd server
npm install
# Add your MongoDB URI to .env (see .env.example)
node index.js
```

### 4. Start the React Dashboard
```bash
cd client
npm install
npm run dev
```

### 5. Load the Chrome Extension
1. Open Chrome → `chrome://extensions/`
2. Enable **Developer Mode**
3. Click **"Load Unpacked"**
4. Select the `/extension` folder

---

## ⚙️ Environment Variables

Create a `.env` file in the `/server` directory:

```env
MONGO_URI=mongodb+srv://your_user:your_pass@cluster.mongodb.net/varnguard
PORT=5000
JWT_SECRET=your_secret_key
AI_SERVICE_URL=http://localhost:8000/analyze
```

---

## 🎯 Why VarnGuard?

> *"It's an Arms Race project. We're using AI to fight AI."*

- 🏆 **Timely** — Deepfake scams are the #1 emerging digital threat of 2026
- 🛡️ **Ethical** — Protecting the most vulnerable users on the internet
- 🔬 **Technical Depth** — Full-stack ML pipeline from Chrome DOM to Python CV models
- ❤️ **Personal** — Built to protect our own families

---

## 📸 Screenshots

> Extension detecting a risky T&C page → Red Alert Banner injected  
> Deepfake verification overlay on YouTube video → "Verified: Clear" badge

---

## 🗺️ Roadmap

- [ ] Real ML deepfake detection model (FaceForensics++ dataset)
- [ ] Voice cloning detection for audio calls
- [ ] Mobile overlay app (Android/iOS)
- [ ] Chrome Web Store deployment
- [ ] Multi-language T&C summarization

---

## 👨‍💻 Author

**Nileshwar Maddhesiya**  
GitHub: [@N-Maddhesiya](https://github.com/N-Maddhesiya)

---

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">
  <strong>🛡️ VarnGuard — Because your family deserves a shield.</strong>
</p>
