# 🕵️‍♂️ DebugSense (v1.2.0-pro)

**DebugSense** is an AI-driven debugging platform designed to help developers identify, understand, and fix code bugs instantly. Built with high-performance React 19 and powered exclusively by Google's **Gemini 1.5 Flash** model, DebugSense transforms the debugging experience into a seamless, intelligent workflow.

---

## 🚀 Key Features

- **AI Code Analysis**: Paste any code snippet to receive an instant breakdown of bugs, root causes, and a corrected code solution.
- **Smart Error Lookup**: Search for common error codes (e.g., `404`, `NullPointerException`) with an intelligent fallback system that checks a local database before querying the AI.
- **Interactive Solution Tabs**: Quickly toggle between a detailed explanation of the issue and the direct code-based solution.
- **Common Errors Library**: A curated repository of frequent programming hurdles for quick reference.
- **Code History**: Automatically saves your last 10 analyzed snippets locally, so you can reload and refine them anytime.
- **Premium UI**: Professional dark-themed interface featuring glassmorphism effects, smooth animations, and optimized syntax highlighting.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **AI Intelligence**: [Google Gemini 1.5 Flash](https://aistudio.google.com/) via `@google/genai`
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) (Dark Mode)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix Primitives)
- **Animations**: [Motion](https://motion.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## ⚙️ Development Setup

### Prerequisites

- Node.js (Latest LTS recommended)
- A Google Gemini API Key

### 1. Clone & Install

```bash
# Clone the repository (if applicable)
# git clone https://github.com/CypherXploit/DebugSense.git

# Navigate to the project directory
cd DebugSense

# Install dependencies
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory and add your API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Launch the App

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🌐 Deployment

Live Version: **[https://debug-sense.vercel.app](https://debug-sense.vercel.app)**

---

## 🛡️ Privacy & Terms

DebugSense is designed for professional development. All code history is stored locally in your browser to ensure privacy. Use of the Gemini AI is subject to Google's Privacy Policy.

---

<p align="center">Built with ⚡ by <b>CypherXploit</b></p>
