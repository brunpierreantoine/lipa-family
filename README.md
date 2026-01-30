# Lipa Family

Lipa Family is a personal Next.js application designed to generate safe, engaging bedtime stories for children using AI. Built with a focus on clean architecture and a family-oriented user experience, it aims to make bedtime a magical and stress-free part of the day through mobile-first design and thoughtful content filtering.

## Key Features

- **AI Story Generation**: Leverages OpenAI to create unique, age-appropriate bedtime stories.
- **Family-Oriented**: Dedicated focus on safety and educational, wholesome content.
- **Mobile-First UX**: Optimized for bedtime reading on phones and tablets.
- **Personalized Settings**: Customize story parameters to fit your child's preferences.
- **Clean Architecture**: Built with modern web standards for maintainability and performance.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **AI Integration**: [OpenAI API](https://openai.com/api/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## Project Structure

```text
├── agents/             # Project-local IDE agents and configurations
├── public/             # Static assets (images, fonts, slogans)
├── src/
│   ├── app/            # Next.js App Router (pages and API routes)
│   ├── lib/            # Shared utilities and core logic
│   └── styles/         # Global styles and theme variables
└── README.md           # Project documentation
```

## Local Development

### Prerequisites

- Node.js (Latest LTS recommended)
- `npm`, `yarn`, `pnpm`, or `bun`

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/pa/lipa-family.git
    cd lipa-family
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Set up environment variables:
    Create a `.env.local` file in the root directory and add the following:

    ```bash
    OPENAI_API_KEY=your_openai_api_key_here
    ```

    *(Note: Never commit your actual API keys to version control.)*

4. Run the development server:

    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

The project is optimized for deployment on the [Vercel Platform](https://vercel.com/new). When deploying, ensure the `OPENAI_API_KEY` is added to your project's Environment Variables in the Vercel dashboard.

## Status & Roadmap

- [x] Initial story generation MVP
- [x] Mobile-responsive layout
- [ ] User authentication for saving favorites
- [ ] Multiple language support
- [ ] Audio narration (TTS integration)

---

## Why this structure works

This README follows the **Crafting Effective READMEs** guidelines for a **Personal Project**:

- **Concise Description**: Immediately identifies the *what* and *why* for a developer audience.
- **Tech Explanations**: Lists core technologies directly, justifying the modern stack choice.
- **Minimalist Instructions**: Provides the shortest path to "it works" without unnecessary fluff.
- **Structure Visualization**: A brief lookup table for the codebase helps new contributors (or future-you) navigate quickly.
- **Safety First**: Clearly highlights environment variable requirements without exposing sensitive data.
