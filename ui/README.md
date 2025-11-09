# Parivyaya UI

Financial transaction management UI built with Next.js and Tailwind CSS.

## Features

- **Upload**: Upload PDF bank statements for AI-powered transaction extraction
  - File upload interface
  - Live job status updates (refreshed every 5 seconds)
  - Upload history with status tracking

- **Transactions**: View and filter extracted transactions
  - Filter by upload job
  - Adjustable results per page
  - Detailed transaction information with categories

- **Spend Analysis**: Visualize spending by category
  - Monthly spending breakdown
  - Category-wise analysis (Primary or Detailed)
  - Visual progress bars showing percentage of total spending

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` file (copy from `.env.local.example`):
   ```bash
   cp .env.local.example .env.local
   ```

3. Configure the API URL in `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   Or using Make:
   ```bash
   make ui-dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Tech Stack

- Next.js 16
- React 19
- Tailwind CSS 4
- TypeScript

## API Integration

The UI connects to the Parivyaya Python API backend. Make sure the API is running on port 8000 (or update `NEXT_PUBLIC_API_URL` accordingly).
