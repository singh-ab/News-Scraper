const fetch = require("node-fetch");
const pool = require("../config/db");
const WebSocket = require("ws"); // Ensure WebSocket is available

async function scrapeStories(wss) {
  try {
    console.log(`Scraping stories at ${new Date().toISOString()}`);

    // Fetch new story IDs
    const newStoriesResponse = await fetch(
      "https://hacker-news.firebaseio.com/v0/newstories.json"
    );
    const storyIds = await newStoriesResponse.json();
    console.log(`Fetched new story IDs: ${storyIds.slice(0, 10).join(", ")}`);

    // Fetch details for each story ID
    for (const id of storyIds.slice(0, 10)) {
      // Limiting to top 10 new stories for example
      const storyDetailsResponse = await fetch(
        `https://hacker-news.firebaseio.com/v0/item/${id}.json`
      );
      const story = await storyDetailsResponse.json();

      // Validate story data
      if (!story || !story.id || !story.title || !story.time) {
        console.warn(`Incomplete story data for ID: ${id}`);
        continue; // Skip incomplete stories
      }

      console.log(`Inserting story ID: ${story.id} - Title: "${story.title}"`);

      // Insert story into the database
      const result = await pool.query(
        `INSERT INTO stories (id, title, url, time) VALUES ($1, $2, $3, to_timestamp($4))
         ON CONFLICT (id) DO NOTHING RETURNING *`,
        [story.id, story.title, story.url, story.time]
      );

      // Broadcast newly inserted story
      if (result.rows.length > 0) {
        const newStory = result.rows[0];
        console.log("New story inserted:", newStory);
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            // Use WebSocket.OPEN for readability
            client.send(JSON.stringify(newStory));
          }
        });
      } else {
        console.log(`Story ID ${story.id} already exists. Skipping broadcast.`);
      }
    }
  } catch (error) {
    console.error("Error scraping stories:", error);
  }
}

module.exports = { scrapeStories };
