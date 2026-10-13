# Netflix Clone

A fully functional Netflix clone built with Next.js (App Router), React, TypeScript, Tailwind CSS, and Prisma (SQLite).

## Features
- **Admin Panel (`/admin`)**: Password-protected dashboard to manage Profiles, Categories, and Videos. Supports direct file uploads to local storage or external URLs.
- **Dynamic Profiles**: "Who's watching?" screen dynamically populated from the database.
- **Browse Experience**: Netflix-style hero banner and horizontal scrollable category rows with hover animations.
- **Video Player**: Full-screen video player for streaming.
- **Sound Effects**: Netflix-style "pop" click sounds on interactions with a mute toggle.
- **Zero Initial Data**: The app handles empty states gracefully until content is added via the admin panel.

## How to Run Locally

1. **Install Dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Initialize Database**
   This project uses a local SQLite database (`dev.db`).
   \`\`\`bash
   npx prisma generate
   npx prisma db push
   \`\`\`

3. **Start Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`
   The app will be available at [http://localhost:3000](http://localhost:3000).

## Admin Panel Instructions

1. Navigate to `/admin`.
2. Enter the password: **`admin123`**.
3. **Step 1: Add a Profile** - Go to the Profiles tab and add at least one profile to access the browse page.
4. **Step 2: Add Categories** - Go to the Categories tab and create rows (e.g., "Trending Now", "Action Movies").
5. **Step 3: Add Videos** - Go to the Videos tab, upload or link a video and thumbnail, and select the categories it belongs to.

## Tech Stack
- Next.js 14+ (App Router)
- React & TypeScript
- Tailwind CSS v3/v4
- Prisma ORM & SQLite
- Zustand (Local state management)
- Lucide React (Icons)
