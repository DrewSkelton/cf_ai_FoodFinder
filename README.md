# Food Search App - Cloudflare Workers

A simple food recommendation app built with Cloudflare Workers, Hono, and AI agents. This app helps users find food options in any area without requiring external API keys.

## Features

- 🍕 AI-powered food recommendations
- 🌍 Search by location
- 🍽️ Filter by cuisine type
- 💰 Filter by price range
- 🥗 Support for dietary restrictions
- 📱 RESTful API with OpenAPI documentation
- ⚡ Fast deployment on Cloudflare Workers

## Setup

1. **Install dependencies:**
```bash
cd my-app
npm install
```

2. **Configure AI binding:**
The app uses Cloudflare's AI Workers binding. Make sure your `wrangler.jsonc` includes:
```json
{
  "ai": {
    "binding": "AI"
  }
}
```

3. **Start development server:**
```bash
npm run dev
```

## API Endpoints

### POST /api/food/search

Search for food options in a specific area.

**Request Body:**
```json
{
  "location": "San Francisco, CA",
  "cuisine": "Italian",
  "priceRange": "moderate",
  "dietaryRestrictions": "vegetarian-friendly"
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "location": "San Francisco, CA",
    "searchResults": [
      {
        "name": "Local Bistro",
        "cuisine": "Italian",
        "priceRange": "moderate",
        "description": "Authentic Italian cuisine with fresh ingredients",
        "address": "123 Main St, San Francisco, CA",
        "rating": 4.3,
        "dietaryOptions": ["vegetarian-friendly", "gluten-free"]
      }
    ],
    "searchSummary": "Found several great Italian restaurants in San Francisco..."
  }
}
```

**Parameters:**
- `location` (required): The area or location to search for food options
- `cuisine` (optional): Preferred cuisine type
- `priceRange` (optional): "budget", "moderate", or "upscale"
- `dietaryRestrictions` (optional): Dietary restrictions or preferences

## Web App

The app includes a beautiful, responsive web interface! Once the server is running:

1. **Open the Web App**: Visit `http://localhost:8787/` in your browser
2. **Features**:
   - Modern, mobile-responsive design
   - Real-time form validation
   - Animated loading states with progress bar
   - Clean, card-based results display
   - Error handling with retry options

## Testing

### Test the Web App
Open `http://localhost:8787/` in your browser and try searching for restaurants!

### Test the API directly
```bash
curl -X POST http://localhost:8787/api/food/search \
  -H "Content-Type: application/json" \
  -d '{"location": "New York, NY", "cuisine": "Japanese", "priceRange": "upscale"}'
```

### Test with the test page
Open `test-web-app.html` in your browser for a quick API test interface.

## Deploy

Deploy to Cloudflare Workers:
```bash
npm run deploy
```

## How It Works

1. **AI-Powered Recommendations**: Uses Cloudflare's AI Workers with the Llama 3.1 model to generate realistic food recommendations
2. **No External APIs**: Doesn't require billable API keys - uses Cloudflare's built-in AI capabilities
3. **Smart Fallbacks**: If AI response parsing fails, provides sensible default recommendations
4. **Type Safety**: Full TypeScript support with Zod validation

## API Documentation

Once the server is running, visit `http://localhost:8787/` to see the interactive OpenAPI documentation.

## Example Usage

```javascript
// Search for budget-friendly Mexican food in Austin
const response = await fetch('http://localhost:8787/api/food/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    location: "Austin, TX",
    cuisine: "Mexican",
    priceRange: "budget"
  })
});

const data = await response.json();
console.log(data.result.searchResults);
```

## Architecture

- **Framework**: Hono for fast HTTP routing
- **API Documentation**: chanfana for OpenAPI integration
- **AI**: Cloudflare Workers AI binding with Llama 3.1
- **Validation**: Zod for request/response validation
- **Deployment**: Cloudflare Workers platform

## Development

1. Run `npm run dev` to start a local instance of the API.
2. Open `http://localhost:8787/` in your browser to see the Swagger interface where you can try the endpoints.
3. Changes made in the `src/` folder will automatically trigger the server to reload, you only need to refresh the Swagger interface.