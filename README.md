<h1 align="center">Nightline - AI Chat Assistant</h1>

<p align="center">
  <b>A minimal AI chat application built with React, Firebase, Firestore, and modern AI APIs.</b><br>
  🌐 <a href="https://nightline-ai.vercel.app/">Live Demo</a> •
  💾 <a href="https://github.com/SajjadR17/ai-chat-app.git">GitHub Repository</a>
</p>

---

# 🤖 About The Project

Nightline is a modern AI chat application inspired by conversational AI platforms.

The project focuses on building a complete AI assistant experience from scratch, including real-time conversations, authentication, persistent chat history, AI responses, image generation, markdown rendering, and voice features.

The goal of this project was to practice building a production-style React application with Firebase as the backend and integrating external AI services into a real user experience.

---

# ✨ Features

## 💬 AI Chat Experience

- Real-time AI conversations
- Persistent chat history
- Multiple conversations per user
- Automatic conversation titles
- Markdown formatted responses
- Code block rendering
- Copy messages
- Retry failed responses
- Auto scroll behavior
- Chat loading states

## 🔐 Authentication

- Email & Password authentication
- Protected routes
- User-specific data isolation
- Firebase Authentication integration

## 🗄 Firestore Integration

- Real-time conversation updates
- User-based conversation storage
- Message subcollections
- Secure Firestore Security Rules
- Optimized Firestore queries

## 🖼 AI Image Generation

- Image generation tool
- AI prompt optimization
- Generated image preview
- Download generated images
- Separate image creation workflow

## 🎤 Voice Features

### Text To Speech

- Read Messages aloud
- Markdown cleanup before reading
- Language-aware voice selection
- Stop reading functionality

### Speech To Text

- Voice input using browser speech recognition
- Live transcription
- Continue recording support
- Microphone controls

## 🛠 Developer Features

- Tool-based AI routing
- JSON structured AI responses
- AI request classification
- Error handling
- Loading indicators
- Custom design system

---

# 🌟 Highlights

- ✅ Custom ChatGPT-like interface
- ✅ AI tool calling architecture
- ✅ Structured AI responses using JSON
- ✅ Image generation pipeline
- ✅ Real-time Firebase architecture
- ✅ Secure Firestore rules
- ✅ Markdown rendering system
- ✅ Voice interaction support
- ✅ Scalable React component structure
- ✅ Custom dark UI design system

---

# 🧠 AI Architecture

Nightline uses a classification layer before generating responses.

User messages are analyzed and classified into different actions:

User Message => AI Classifier => Text Response-Image Generation-Blocked Request

The AI returns structured JSON:

json
{
"type": "text",
"answer": "Markdown response"
}

or:

json
{
"type": "image",
"prompt": "Optimized image generation prompt"
}

---

# 🛠 Tech Stack

| Technology              | Usage                    |
| ----------------------- | ------------------------ |
| React.js                | User Interface           |
| React Router            | Client-side Routing      |
| Firebase Authentication | User Authentication      |
| Firestore               | Database                 |
| Groq API                | AI Responses             |
| Flux Image Model        | AI Image Generation      |
| Web Speech API          | Voice Features           |
| React Markdown          | Markdown Rendering       |
| React Icons             | UI Icons                 |
| React Spinners          | Loading States           |
| Vite                    | Development & Build Tool |
| Cloudinary              | Images Database          |
| Thinking Orbs           | AI Response Loading      |
| CSS Custom Properties   | Design System            |
| Vercel                  | Deployment               |

---

# 🗄 Firestore Data Model

users => userId => conversations => conversationId => messages

### User

Stores authentication related information.

### Conversations

Stores:

- Conversation title
- Created time
- Updated time

### Messages

Stores:

- Role (user / assistant)
- Message content
- Message type
- Language information
- Timestamp

---

# 🚀 Installation

Clone the repository:

bash
git clone https://github.com/SajjadR17/ai-chat-app.git

npm install

npm run dev

---

# 🔑 Environment Variables

Create a .env file:

- VITE_FIREBASE_API_KEY=
- VITE_FIREBASE_AUTH_DOMAIN=
- VITE_FIREBASE_PROJECT_ID=
- VITE_FIREBASE_STORAGE_BUCKET=
- VITE_FIREBASE_MESSAGING_SENDER_ID=
- VITE_FIREBASE_APP_ID=
- VITE_FIREBASE_MEASUREMENT_ID=
- VITE_GROQ_API_KEY=

---

# 🔒 Security

The project uses:

- Firebase Authentication
- Firestore Security Rules
- User-isolated database structure
- Protected application routes

Each user can only access their own conversations and messages.

---

# 📌 Future Improvements

- Web search integration
- File uploads
- Better AI memory system
- More AI tools
- Conversation sharing

---

# 📄 License

All Rights Reserved.

This source code may not be copied, modified, distributed, or used commercially without explicit permission.

© 2026 Sajjad Roohandeh

<h3 align="center">
Made with ❤️ by <b>Sajjad Roohandeh</b>
</h3>
