// Establish WebSocket connection
const protocol = window.location.protocol === "https:" ? "wss" : "ws";
const socket = new WebSocket(`${protocol}://${window.location.host}`);

const recentCountElement = document.getElementById("recentCount");
const storiesList = document.getElementById("stories");

socket.onopen = () => {
  console.log("Connected to WebSocket server");
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.recentCount) {
    recentCountElement.textContent = data.recentCount;
  }

  if (data.id && data.title && data.url && data.time) {
    const listItem = document.createElement("li");
    const storyLink = document.createElement("a");
    storyLink.href = data.url || "#";
    storyLink.target = "_blank";
    storyLink.textContent = `${data.title} (${new Date(
      data.time
    ).toLocaleString()})`;
    listItem.appendChild(storyLink);
    storiesList.prepend(listItem); // Add new stories to the top
  }

  if (data.error) {
    console.error("WebSocket Error:", data.error);
  }
};

socket.onerror = (error) => {
  console.error("WebSocket Error:", error);
};

socket.onclose = () => {
  console.log("WebSocket connection closed");
};
