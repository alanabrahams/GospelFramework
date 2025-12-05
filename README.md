# RCTC Church Health Index

A Gospel-Centered Church Health Assessment tool for Redeemer City to City.

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `app/` - Next.js app directory with pages and API routes
- `components/` - React components (StepWizard, RadarChart)
- `types/` - Zod schemas (the core contract)
- `lib/` - Utility functions (calculations, email)

## Email Configuration

The email service in `lib/email.ts` is currently a placeholder. To enable email sending:

1. Choose an email service (SendGrid, Resend, AWS SES, etc.)
2. Add your API key to `.env.local`
3. Update the `sendResultsEmail` function in `lib/email.ts` with your service's API

## Assessment Framework

The assessment evaluates churches across 10 points organized into 3 sections:

**Worship:**
1. Scripture & Gospel Centrality
2. Worship, Preaching, Sacraments
3. Primacy of Prayer

**Discipleship:**
4. Discipleship Practiced Intentionally
5. NT Patterns of Church Life
6. Leadership Development
7. Culture of Generosity

**Mission:**
8. City Culture Engagement
9. Evangelism Contextualization
10. Church Planting & Partnerships

## Building for Production

```bash
npm run build
npm start
```

