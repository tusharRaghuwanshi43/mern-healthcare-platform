# Appointy - AI-Powered MERN Healthcare Platform 🏥✨

![Appointy Logo]<img src="./frontend/src/assets/logo.png" width="50"/>

Welcome to **Appointy**, a premium open-source healthcare platform designed to seamlessly bridge the gap between patients and specialized care providers. Built on the modern MERN stack, Appointy features **Chopper AI**, an intelligent symptom-analysis triage assistant powered by Google Gemini, a sleek animated interface, and robust scheduling mechanisms.

## ✨ Key Features

- **Chopper AI Health Assistant:** Intelligent triage bot that analyzes natural language symptoms to recommend medical conditions and dynamically match you with top-rated specialists. 
- **Dynamic Appointments & Scheduling:** Real-time doctor availability engine with dynamic date/time slot booking.
- **Unified Ecosystem:** Dedicated dashboards for both Patients and Doctors to manage profiles, reviews, and active consultations.
- **Stunning UI/UX:** Built with Tailwind CSS and Framer Motion for a 100% responsive, high-end visual experience featuring glassmorphism, smooth scrolling, and dynamic micro-animations.
- **Secure Authentication:** Complete JWT + Google OAuth flows with strict route protection.
- **Review Engine:** Built-in 5-star rating mechanisms dynamically tied to doctor search rankings.

---

## 🛠️ Technology Stack

- **Frontend:** React (Vite), Tailwind CSS, Framer Motion, Redux Toolkit, React Router DOM, Lucide Icons.
- **Backend:** Node.js, Express.js, Mongoose.
- **Database:** MongoDB (Atlas).
- **AI Integration:** Google GenAI SDK (`@google/genai`).
- **Payments:** Stripe (Sandbox ready).

---

## 🚀 Getting Started

Follow these incredibly simple steps to get Appointy running on your local machine.

### Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v16.0.0 or higher)
- [Git](https://git-scm.com/)
- A free [MongoDB Atlas Database](https://www.mongodb.com/atlas/database)
- A free [Google AI Studio Key](https://aistudio.google.com/) (For Chopper AI)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/mern-healthcare-platform.git
cd mern-healthcare-platform
```

### 2. Setup Environment Variables

In the `backend/` directory, create a `.env` file and configure it based on this template:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_google_ai_key

# Optional (If testing payments/auth)
STRIPE_SECRET_KEY=your_stripe_key
GOOGLE_CLIENT_ID=your_google_oauth_client
SMTP_USER=your_email_address
SMTP_PASS=your_email_password
```

### 3. Install Dependencies & Run

We run two distinct environments (Backend and Frontend). Open two terminal instances:

**Terminal 1: Start the Backend Layer**
```bash
cd backend
npm install
npm run dev
```
*(Server will start on http://localhost:5000)*

**Terminal 2: Start the Frontend Layer**
```bash
cd frontend
npm install
npm run dev
```
*(App will run locally on http://localhost:5173)*

---

## 💻 Usage Examples

1. **Patient Journey:** Register a new user account, open the **Chopper AI** button in the bottom right, and type: *"I have a severe rash on my arm"*. Chopper AI will suggest conditions and present direct links to book top-rated Dermatologists.
2. **Doctor Journey:** Sign up on the `/doctor/signup` route, configure your `Experience` and `Fee`. Most importantly, set up your `Availability` engine (e.g. "Mondays, 09:00 AM") so patients can discover your open slots using the booking widget.

---

## 📂 Project Structure

```text
mern-healthcare-platform/
├── backend/
│   ├── src/
│   │   ├── config/      # Database & Environment setups
│   │   ├── controllers/ # Core logic (aiController, doctorController, etc.)
│   │   ├── middleware/  # JWT Auth & Error Handling
│   │   ├── models/      # Mongoose Schemas (User, Doctor, Appointment)
│   │   └── routes/      # Express API Maps
│   └── server.js        # Entry point for backend API
│
└── frontend/
    ├── public/
    └── src/
        ├── assets/      # Static media (Chopper Avatar, Hero graphics)
        ├── components/  # Reusable UI (Chatbot, Navbar, HeroSection)
        ├── pages/       # Distinct Screens (Landing, Dashboards)
        ├── store/       # Redux State Management
        └── App.jsx      # Global Router & Layout
```

---

## 🤝 Contribution Guidelines

We welcome community contributions! Please follow this workflow:

1. **Fork** the repository.
2. **Create a new branch:** `git checkout -b feature/amazing-feature`
3. **Commit your changes:** `git commit -m 'Add an amazing feature'`
4. **Push to the branch:** `git push origin feature/amazing-feature`
5. **Open a Pull Request!**

Please ensure your code runs successfully in local compilation (`npm run build`) and doesn't crash the Vite/Oxc engine.

---

## 📄 License

Distributed under the Apache License 2.0. See `LICENSE` for more information.

> *Redefining clinical excellence, one line of code at a time.*
