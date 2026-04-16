# CDC Growth Charts

A modern, responsive web app for tracking children's growth against the CDC growth reference (0–20 years).

## Features

- 📊 Interactive growth charts (Recharts)
- 📱 Responsive design
- 📈 CDC 2000 Growth Reference, full LMS tables, ages 0–240 months
- 🔁 US (lb / in) and metric (kg / cm) unit toggle
- 💙 Tracks weight, length / height, head circumference, and BMI-for-age (2+)
- 📉 Percentile calculations via the LMS method

## Data source

LMS parameter files come from the CDC and are the same tables used by most
US pediatric EMRs:
<https://www.cdc.gov/growthcharts/percentile_data_files.htm>

Raw CSVs live in `data/raw/`. To regenerate `lib/growthData.ts`:

```bash
node data/build_lms.mjs
```

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Deployment**: Railway.com

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment to Railway

1. Push your code to GitHub
2. Connect your repository to Railway
3. Railway will automatically detect Next.js and deploy
4. Set the start command to: `npm start`

## License

MIT
