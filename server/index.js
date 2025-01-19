require("dotenv").config(); // Load environment variables from .env file
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const pool = require("./config/db"); // Import the database pool
const { scrapeStories } = require("./utils/grabUtil"); // Import the scrapeStories function
const path = require("path");

const app = express();
const server = http.createServer(app); // Create an HTTP server
const wss = new WebSocket.Server({ server }); // Initialize WebSocket server

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "../public")));

// Fallback route for any unmatched routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Handle new WebSocket connections
wss.on("connection", async (ws) => {
  console.log("WebSocket client connected");
  try {
    // Query the number of recent stories from the last 5 minutes
    const { rows } = await pool.query(
      `SELECT COUNT(*) FROM stories WHERE time >= NOW() - INTERVAL '5 minutes'`
    );
    const recentCount = rows[0].count;
    console.log(`Sending recentCount: ${recentCount}`);
    ws.send(JSON.stringify({ recentCount })); // Send the count to the client
  } catch (error) {
    console.error("Error fetching recent stories count:", error);
    ws.send(JSON.stringify({ error: "Failed to fetch recent stories count" }));
  }

  // Log when a client disconnects
  ws.on("close", () => {
    console.log("WebSocket client disconnected");
  });

  // Log any WebSocket errors
  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

// Schedule the scraper to run every 5 minutes
setInterval(() => {
  scrapeStories(wss);
}, 300000); // 300,000 ms = 5 minutes

// Start the server and perform an initial scrape
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Listening on port ${port}`);
  scrapeStories(wss); // Perform initial scraping when server starts
});
