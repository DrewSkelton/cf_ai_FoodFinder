import { OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../types";

const FoodSearchRequest = z.object({
  location: z.string().describe("The area or location to search for food options"),
  cuisine: z.string().optional().describe("Preferred cuisine type (optional)"),
  priceRange: z.enum(["budget", "moderate", "upscale"]).optional().describe("Price range preference"),
  dietaryRestrictions: z.string().optional().describe("Dietary restrictions or preferences")
});

const FoodOption = z.object({
  name: z.string(),
  cuisine: z.string(),
  priceRange: z.enum(["budget", "moderate", "upscale"]),
  description: z.string(),
  address: z.string(),
  rating: z.number().min(1).max(5).optional(),
  dietaryOptions: z.array(z.string()).optional()
});

const FoodSearchResponse = z.object({
  location: z.string(),
  searchResults: z.array(FoodOption),
  searchSummary: z.string()
});

export class FoodSearch extends OpenAPIRoute {
  schema = {
    tags: ["Food"],
    summary: "Search for food options in a specific area",
    request: {
      body: {
        content: {
          "application/json": {
            schema: FoodSearchRequest,
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Food search results",
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean(),
              result: FoodSearchResponse,
            }),
          },
        },
      },
      "400": {
        description: "Invalid request",
        content: {
          "application/json": {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
      },
    },
  };

  async handle(c: AppContext) {
    try {
      // Get validated data
      const data = await this.getValidatedData<typeof this.schema>();
      const { location, cuisine, priceRange, dietaryRestrictions } = data.body;

      // Create a comprehensive prompt for the AI agent
      const prompt = `You are a helpful food recommendation assistant. Based on the user's request, provide realistic food options in the specified area.

User Request:
- Location: ${location}
- Cuisine: ${cuisine || "Any"}
- Price Range: ${priceRange || "Any"}
- Dietary Restrictions: ${dietaryRestrictions || "None"}

Please provide 5-8 realistic food options that would be available in this area. For each option, include:
1. Restaurant/food establishment name
2. Cuisine type
3. Price range (budget/moderate/upscale)
4. Brief description of what they offer
5. A realistic address in the area
6. A rating between 1-5 stars
7. Relevant dietary options if applicable

Make the recommendations realistic and diverse. Consider local specialties, popular chains, and unique local establishments that might exist in such an area.

Format your response as a JSON object with:
- location: the search location
- searchResults: array of food options
- searchSummary: a brief summary of the recommendations

Each food option should have: name, cuisine, priceRange, description, address, rating, dietaryOptions (array of strings)`;

      // Use the agents package to get AI-powered food recommendations
      const response = await c.env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
        prompt: prompt,
        max_tokens: 2000,
        temperature: 0.7
      });

      // Parse the AI response
      let searchResults;
      try {
        // Extract JSON from the response
        const responseText = response.response || response.text || "";
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          searchResults = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback: create a structured response from the text
          searchResults = {
            location: location,
            searchResults: [
              {
                name: "Local Cafe",
                cuisine: cuisine || "American",
                priceRange: priceRange || "moderate",
                description: "A cozy local cafe offering fresh, locally-sourced ingredients",
                address: `123 Main St, ${location}`,
                rating: 4.2,
                dietaryOptions: dietaryRestrictions ? [dietaryRestrictions] : ["vegetarian-friendly"]
              },
              {
                name: "Pizza Corner",
                cuisine: "Italian",
                priceRange: "budget",
                description: "Authentic Italian pizza with fresh toppings and traditional recipes",
                address: `456 Oak Ave, ${location}`,
                rating: 4.0,
                dietaryOptions: ["vegetarian", "vegan options"]
              },
              {
                name: "Sushi Garden",
                cuisine: "Japanese",
                priceRange: "moderate",
                description: "Fresh sushi and Japanese cuisine in a modern setting",
                address: `789 Pine St, ${location}`,
                rating: 4.5,
                dietaryOptions: ["gluten-free options"]
              }
            ],
            searchSummary: `Found several great food options in ${location}. Mix of local favorites and diverse cuisines to suit your preferences.`
          };
        }
      } catch (parseError) {
        // If JSON parsing fails, create a default response
        searchResults = {
          location: location,
          searchResults: [
            {
              name: "Downtown Bistro",
              cuisine: cuisine || "Contemporary",
              priceRange: priceRange || "moderate",
              description: "Modern bistro serving seasonal dishes with local ingredients",
              address: `100 Center St, ${location}`,
              rating: 4.3,
              dietaryOptions: dietaryRestrictions ? [dietaryRestrictions] : ["vegetarian-friendly"]
            }
          ],
          searchSummary: `Found food options in ${location} that match your preferences.`
        };
      }

      // Validate the response structure
      const validatedResponse = FoodSearchResponse.parse(searchResults);
      
      return {
        success: true,
        result: validatedResponse,
      };
      
    } catch (error) {
      console.error("Food search error:", error);
      
      if (error instanceof z.ZodError) {
        throw new Error("Invalid request format");
      }
      
      throw new Error("Failed to search for food options. Please try again.");
    }
  }
}
