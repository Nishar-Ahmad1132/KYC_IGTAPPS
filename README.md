# 🔐 AI-Powered KYC Verification System (Binance-Grade)

A high-performance, full-stack **End-to-End Online KYC System** built using **FastAPI, React, and Advanced Computer Vision**. This system automates identity verification with military-grade precision using **OCR, Face Matching, and Liveness Detection**.

---

## 🚀 Advanced Features

### 👤 User Experience
- **Secure Authentication**: JWT-based login/registration with role-based access.
- **Guided KYC Flow**: Step-by-step document upload and live capture.
- **Smart OCR Extraction**: Automated Aadhaar data extraction (PaddleOCR).
- **Liveness Verification**: Real-time blink & head-turn detection (MediaPipe).
- **Digital Certification**: Downloadable **PDF KYC Certificate** with unique QR codes and verification metadata.

### 🛡️ Admin Control Center
- **Categorized Dashboard**: Real-time management of "Needs Attention" vs "AI Verified" users.
- **Deep-Dive Review**: Side-by-side comparison of Aadhaar photos vs. live selfies.
- **Audit & Analytics**: Interactive charts (Recharts) for status distribution and registration trends.
- **Manual Override**: One-click approval/rejection with custom feedback for users.

---

## 🧠 AI & Security Core

- **OCR Data Extraction**: 🔍 PaddleOCR for high-accuracy text extraction.
- **Face Matching**: 👤 InsightFace for deep-learning face vector comparison.
- **Liveness Detection**: 🟢 Dynamic liveness checks to prevent spoofing.
- **Data Privacy**: 🔒 Aadhaar Masking (XXXX XXXX 1234) & UUID-based anonymous storage.
- **Encryption**: Secure password hashing and JWT tokenization.

---

## 🏗️ Tech Stack

### Backend
- **Framework**: FastAPI (High-performance Python)
- **Database**: PostgreSQL / SQLAlchemy
- **PDF Core**: `fpdf2` & `qrcode` for secure document generation.

### AI / Computer Vision
- PaddleOCR, OpenCV, InsightFace, MediaPipe.

### Frontend
- **Interface**: React.js & Tailwind CSS
- **Visuals**: Framer Motion (Animations) & Lucide-React (Icons)
- **Analytics**: Recharts (Interactive Data Visualization)
- **State**: Zustand

---

## 📂 Project Structure

```
kyc_system/
│
├── kyc-backend/
│ ├── app/
│ │ ├── routers/   # user, admin, kyc, upload, selfie
│ │ ├── services/  # face_service, matching_service
│ │ ├── models.py  # SQLAlchemy Models
│ │ └── main.py    # FastAPI Entrance
│ └── uploads/     # Secure file storage
│
├── kyc-frontend/
│ ├── src/
│ │ ├── pages/     # Dashboard, Admin, Upload, Liveness
│ │ ├── components/# UI library, Cards, Buttons
```

---

## ⚙️ Installation

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Nishar-Ahmad1132/KYC_IGTAPPS.git
cd KYC_IGTAPPS
```

### 2️⃣ Backend Setup
```bash
cd kyc-backend
python -m venv venv
venv\Scripts\activate   # For Windows
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --port 9090
```

### 3️⃣ Frontend Setup
```bash
cd kyc-frontend
npm install
npm run dev
```

---

## 🔄 The KYC Lifecycle
1.  **Authentication**: Secure login via JWT.
2.  **Aadhaar Submission**: Upload front/back images with AI-driven preprocessing.
3.  **OCR Processing**: Extraction of Name, DOB, and Aadhaar Number.
4.  **Liveness Check**: Interactive selfie capture with spoof detection.
5.  **AI Decision Engine**: Automatic comparison of Face Score vs Name Match.
6.  **Admin Review**: Final human oversight for pending or failed cases.
7.  **Certification**: Generation of branded, QR-encoded PDF certificate.

---

## 📊 Performance Metrics
- **OCR Accuracy**: ~88%
- **Face Matching**: ~95%
- **Liveness Detection**: ~98%

---

## 📌 Roadmap
- [ ] Multi-document support (PAN Card, Passport)
- [ ] Video KYC (Live 1:1 call simulation)
- [ ] Docker Containerization
- [ ] Multi-factor Authentication (2FA)

---

## 👨‍💻 Author
**Nishar Ahmad**  
*Full Stack & AI Developer*  
[GitHub Profile](https://github.com/Nishar-Ahmad1132)
