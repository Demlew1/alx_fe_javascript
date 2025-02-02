const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";
const syncInterval = 30000;

async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    if (!response.ok) throw new Error("Failed to fetch from server");

    const serverQuotes = await response.json();
    return serverQuotes.map((q) => ({ text: q.title, category: "General" }));
  } catch (error) {
    console.error("Fetch Error:", error);
    return [];
  }
}

async function postQuoteToServer(quote) {
  try {
    await fetch(SERVER_URL, {
      method: "POST",
      body: JSON.stringify(quote),
      headers: { "Content-Type": "application/json" },
    });
    console.log("Quote posted to server:", quote);
  } catch (error) {
    console.error("Post Error:", error);
  }
}

async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  let localQuotes = JSON.parse(localStorage.getItem("quotes")) || [];

  const newQuotes = serverQuotes.filter(
    (sq) => !localQuotes.some((lq) => lq.text === sq.text)
  );
  if (newQuotes.length > 0) {
    localQuotes = [...localQuotes, ...newQuotes];
    localStorage.setItem("quotes", JSON.stringify(localQuotes));
    alert("New quotes synced from the server!");
  }

  // Check for conflicts (server takes precedence)
  const conflicts = localQuotes.filter((lq) =>
    serverQuotes.some(
      (sq) => sq.text === lq.text && sq.category !== lq.category
    )
  );
  if (conflicts.length > 0) {
    alert("Conflicts detected! Server data was applied.");
    localStorage.setItem("quotes", JSON.stringify(serverQuotes));
  }
}

setInterval(syncQuotes, syncInterval);
