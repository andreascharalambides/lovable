# Lovable (Take-Home Assignment for Conception)

This project is a client-side SvelteKit application that transforms natural language prompts into functional Svelte components. It supports conversational refinement and undo/redo functionality. The app uses the OpenAI API directly from the browser, with no backend.

## 🚀 Features

- Generate Svelte components from natural language prompts
- Refine components conversationally through follow-up prompts
- Undo/redo version history with full state preservation
- Syntax-highlighted code viewer with copy/download options
- Secure, client-side API key storage (never sent to any server except OpenAI)

## 📋 Requirements

- Node.js 18+
- npm or yarn
- OpenAI API key (starts with `sk-`)

## 🛠️ Installation & Setup

```bash
# Clone the repository
git clone https://github.com/your-username/lovable.git
cd lovable

# Install dependencies
npm install

# Start the development server
npm run dev
```

Then open your browser at:

```
http://localhost:5173
```

## 🔑 API Key Usage

The app uses the OpenAI API to generate Svelte components from natural language prompts.  
You will be prompted to enter your API key (starting with `sk-`) when using the tool.

- The key is stored locally in your browser (`localStorage`)
- It is never sent to any server other than OpenAI
- You can remove the key anytime using the UI

## 🌐 Deployment

The application is deployed publicly for review.  
You can access it here: **[Live Demo](http://loveable.surge.sh)**

If you want to deploy it yourself:

```bash
# Build for production
npm run build

# Deploy to Surge (you must have Surge installed globally)
npx surge dist
```

Alternatively, the app can be deployed using platforms like **Vercel**, **Netlify**, or **GitHub Pages**.

## ⚠️ Limitations

- A live preview feature was initially developed, but due to issues with interaction handling and iframe behavior, it was removed from the final version.
- Currently, only single `.svelte` files are generated. Multi-file export is not supported.

## 🎥 Demo Video

Watch the 3–5 minute demo here: [Loom Video](https://www.loom.com/share/your-loom-link)

## ⚙️ Tech Stack

- **Framework**: SvelteKit + TypeScript
- **State Management**: Svelte stores with IndexedDB
- **Styling**: CSS variables and scoped styles
- **AI Integration**: OpenAI GPT-4 API (client-only)
- **Build Tool**: Vite