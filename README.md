# NITC Smart Bus System

A dual-dashboard web application that optimizes school bus routes based on student bookings, eliminating unnecessary stops and improving efficiency.

## Features

- **Student Dashboard:** Book bus stops, view scheduled pickup times, and track bus location in real-time
- **Driver Dashboard:** View dynamically generated optimized routes based on student bookings
- **Route Optimization:** Calculate the most efficient path between booked stops
- **Interactive Map Interface:** Both dashboards feature interactive maps showing campus locations
- **Modern UI:** Clean, responsive design with intuitive booking forms and status indicators

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account
- Google Maps API key

### Environment Variables

Copy the `.env.example` file to `.env` and fill in your credentials:

```
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Google Maps API Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the Maps JavaScript API and Places API
4. Create an API key with appropriate restrictions
5. Add the API key to your `.env` file

## Demo Accounts

- **Student:** student@nitc.edu / student123
- **Driver:** DRIVER001 / driver123

## Technologies Used

- React with TypeScript
- Vite for fast development
- Tailwind CSS with shadcn/ui components
- Google Maps JavaScript API
- Supabase for authentication and database
- Framer Motion for animations
