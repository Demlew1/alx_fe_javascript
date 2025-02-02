const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";
const syncInterval = 30000; // Sync every 30 seconds
let lastSyncTimestamp = localStorage.getItem("lastSync") || Date.now();

async function syncWithServer() {
  try {
    const response = await fetch(SERVER_URL);
    if (!response.ok) throw new Error("Failed to fetch from server");

    const serverQuotes = await response.json();
    const localQuotes = JSON.parse(localStorage.getItem("quotes")) || [];

    const newQuotes = serverQuotes.filter(
      (sq) => !localQuotes.some((lq) => lq.text === sq.text)
    );
    if (newQuotes.length > 0) {
      const updatedQuotes = [...localQuotes, ...newQuotes];
      localStorage.setItem("quotes", JSON.stringify(updatedQuotes));
      lastSyncTimestamp = Date.now();
      localStorage.setItem("lastSync", lastSyncTimestamp);

      alert("New quotes synced from the server!");
    }
  } catch (error) {
    console.error("Sync Error:", error);
  }
}

async function pushToServer(quote) {
  try {
    await fetch(SERVER_URL, {
      method: "POST",
      body: JSON.stringify(quote),
      headers: { "Content-Type": "application/json" },
    });
    console.log("Quote synced to server:", quote);
  } catch (error) {
    console.error("Push Error:", error);
  }
}

function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText");
  const newQuoteCategory = document.getElementById("newQuoteCategory");

  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  if (text && category) {
    const newQuote = { text, category };
    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    newQuoteText.value = "";
    newQuoteCategory.value = "";
    filterQuotes();
    pushToServer(newQuote);
  } else {
    alert("Please enter both quote text and category.");
  }
}

function checkForConflicts() {
  const localQuotes = JSON.parse(localStorage.getItem("quotes")) || [];
  const serverQuotes = JSON.parse(sessionStorage.getItem("serverQuotes")) || [];

  const conflicts = localQuotes.filter((lq) =>
    serverQuotes.some(
      (sq) => sq.text === lq.text && sq.category !== lq.category
    )
  );
  if (conflicts.length > 0) {
    alert("Conflicts detected! Review manually.");
    console.log("Conflicting Quotes:", conflicts);
  }
}

setInterval(syncWithServer, syncInterval);
