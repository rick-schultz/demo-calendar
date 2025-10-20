# Demo Calendar

A modern calendar application built with Nuxt 4 and Vue 3. Create reminders with weather forecasts and manage your schedule with an intuitive interface.

## Features

- Interactive calendar view with month navigation
- Create, edit, and delete reminders with custom colors
- Automatic weather forecasts via OpenWeatherMap API
- Responsive design for desktop and mobile
- Safari-compatible 12-hour time format
- Persistent storage using browser localStorage
- Form validation with visual feedback
- Color-coded reminders (8 color options)
- Smart weather caching (5-minute refresh)

## Quick Start

### Prerequisites

- Node.js 18 or higher
- npm, pnpm, yarn, or bun
- OpenWeatherMap API key (free tier available)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/rick-schultz/demo-calendar.git
   cd demo-calendar
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Configure environment variables
   
   Create a `.env` file in the root directory:
   ```env
   VITE_OPENWEATHER_API_KEY=your_api_key_here
   ```
   
   Get your free API key at https://openweathermap.org/api

4. Start development server
   ```bash
   npm run dev
   ```
   
   Open http://localhost:3000

## Tech Stack

### Core
- Nuxt 4.1.3 - Vue framework with SSR support
- Vue 3.5.22 - Progressive JavaScript framework
- TypeScript 5.9.3 - Type-safe development

### UI and Styling
- @nuxt/ui 4.0.1 - UI component library with Tailwind CSS v4
- Iconify - Material Symbols and Heroicons

### State Management
- Pinia 3.0.3 - Vue Store with composition API

### Utilities
- dayjs-nuxt 2.1.11 - Date manipulation and formatting
- Vuelidate 2.0 - Form validation

### API
- OpenWeatherMap API - 5-day weather forecasts

### Testing
- Vitest 3.2.4 - Unit testing framework

## Usage

### Creating a Reminder

1. Click on any date in the calendar
2. Fill in the required fields:
   - Date - Reminder date
   - Time - Reminder time (12-hour format)
   - Reminder - Description (max 30 characters)
   - City - Location for weather forecast
3. Choose a color (optional)
4. Click "Add Reminder"

### Managing Reminders

- Edit - Click the pencil icon on any reminder
- Delete - Click the trash icon to remove a reminder
- Delete All - Remove all reminders for a specific date

### Weather Information

Weather automatically fetches when opening a date with reminders. Updates are cached for 5 minutes to minimize API calls. The app uses OpenWeatherMap's 5-day forecast and displays weather icons for different conditions.

### Navigation

Use the arrow buttons to navigate between months. The app uses URL-based routing, so browser back and forward buttons work as expected. On mobile, the layout adjusts to show collapsible sections.

## Available Scripts

```bash
npm run dev          # Start dev server at localhost:3000
npm run build        # Build for production
npm run generate     # Generate static site
npm run preview      # Preview production build
npm run test         # Run tests in watch mode
npm run test:ui      # Run tests with UI
npm run test:run     # Run tests once (CI mode)
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest) - includes custom 12-hour time input
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| VITE_OPENWEATHER_API_KEY | OpenWeatherMap API key | Yes |

## Implementation Notes

## Implementation Notes

### Safari Time Input

Safari doesn't support native time inputs well, so I implemented a custom solution with a text input that auto-formats as you type (hh:mm) and an AM/PM selector.

### LocalStorage Persistence

All reminders are saved automatically to localStorage, including weather cache timestamps. This means your data persists across page refreshes and browser restarts. Everything is stored under a single key called "reminders".

### Form Validation

The app uses Vuelidate for real-time form validation. Required fields show a red asterisk, and invalid inputs display red borders with error messages. The form won't submit until all validation passes.

### Weather Caching

To avoid hitting API rate limits, weather data is cached for 5 minutes per date. The cache is smart enough to only refresh when needed and persists in localStorage along with the reminders.

## License

MIT License

## Author

Rick Schultz - https://github.com/rick-schultz
