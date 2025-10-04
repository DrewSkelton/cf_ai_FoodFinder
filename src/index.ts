import { fromHono } from "chanfana";
import { Hono } from "hono";
import { serveStatic } from "hono/cloudflare-workers";
import { TaskCreate } from "./endpoints/taskCreate";
import { TaskDelete } from "./endpoints/taskDelete";
import { TaskFetch } from "./endpoints/taskFetch";
import { TaskList } from "./endpoints/taskList";
import { FoodSearch } from "./endpoints/foodSearch";
import type { Env } from "./types";

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

// Setup OpenAPI registry
const openapi = fromHono(app, {
	docs_url: "/",
});

// Register OpenAPI endpoints
openapi.get("/api/tasks", TaskList);
openapi.post("/api/tasks", TaskCreate);
openapi.get("/api/tasks/:taskSlug", TaskFetch);
openapi.delete("/api/tasks/:taskSlug", TaskDelete);
openapi.post("/api/food/search", FoodSearch);

// Serve static files for the web app
app.get("/", serveStatic({ path: "./public/index.html" }));
app.get("/styles.css", serveStatic({ path: "./public/styles.css" }));
app.get("/script.js", serveStatic({ path: "./public/script.js" }));

// You may also register routes for non OpenAPI directly on Hono
// app.get('/test', (c) => c.text('Hono!'))

// Export the Hono app
export default app;
