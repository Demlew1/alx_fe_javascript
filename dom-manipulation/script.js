const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // Mock API
const syncInterval = 30000; // Sync every 30 seconds
let quotes = JSON.parse(localStorage.getItem("quotes")) || [];

// Function to show notifications
function showNotification(message, type = "success") {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.style.display = "block";
  notification.style.backgroundColor = type === "error" ? "red" : "green";
  notification.style.color = "white";

  setTimeout(() => {
    notification.style.display = "none";
  }, 3000);
}

// Fetch quotes from the server
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

// Post new quotes to the server
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

// Sync quotes between local storage and server
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  let localQuotes = JSON.parse(localStorage.getItem("quotes")) || [];

  // Check for new quotes from the server
  const newQuotes = serverQuotes.filter(
    (sq) => !localQuotes.some((lq) => lq.text === sq.text)
  );
  if (newQuotes.length > 0) {
    localQuotes = [...localQuotes, ...newQuotes];
    localStorage.setItem("quotes", JSON.stringify(localQuotes));
    showNotification("Quotes synced with server!");
  }

  // Check for conflicts (server takes precedence)
  const conflicts = localQuotes.filter((lq) =>
    serverQuotes.some(
      (sq) => sq.text === lq.text && sq.category !== lq.category
    )
  );
  if (conflicts.length > 0) {
    showNotification("Conflicts detected! Server data applied.", "error");
    localStorage.setItem("quotes", JSON.stringify(serverQuotes));
  }
}

// Show a random quote
function showRandomQuote() {
  if (quotes.length === 0) return;
  const randomIndex = Math.floor(Math.random() * quotes.length);
  document.getElementById("quoteDisplay").textContent =
    quotes[randomIndex].text;
}

// Add a new quote
function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText").value.trim();
  const newQuoteCategory = document
    .getElementById("newQuoteCategory")
    .value.trim();

  if (newQuoteText && newQuoteCategory) {
    const newQuote = { text: newQuoteText, category: newQuoteCategory };
    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
    filterQuotes();
    postQuoteToServer(newQuote);
  } else {
    showNotification("Please enter both quote text and category.", "error");
  }
}

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Populate categories in dropdown
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const categories = ["All", ...new Set(quotes.map((q) => q.category))];
  categoryFilter.innerHTML = categories
    .map((cat) => `<option value="${cat}">${cat}</option>`)
    .join("");
}

// Filter quotes by category
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  const filteredQuotes =
    selectedCategory === "all"
      ? quotes
      : quotes.filter((q) => q.category === selectedCategory);
  document.getElementById("quoteDisplay").textContent = filteredQuotes.length
    ? filteredQuotes[0].text
    : "No quotes found";
}

// Export quotes to JSON file
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "quotes.json";
  a.click();
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      showNotification("Quotes imported successfully!");
    } catch (error) {
      showNotification("Invalid JSON file.", "error");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Event Listener for "Show New Quote" Button
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  populateCategories();
  filterQuotes();
});

setInterval(syncQuotes, syncInterval);
