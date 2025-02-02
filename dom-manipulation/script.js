const categoryFilterKey = "selectedCategory";

const categoryFilter = document.getElementById("categoryFilter");

function populateCategories() {
  const uniqueCategories = [...new Set(quotes.map((q) => q.category))];
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  uniqueCategories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  const lastSelectedCategory = localStorage.getItem(categoryFilterKey);
  if (lastSelectedCategory) {
    categoryFilter.value = lastSelectedCategory;
  }
}

function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem(categoryFilterKey, selectedCategory);

  if (selectedCategory === "all") {
    showRandomQuote();
  } else {
    const filteredQuotes = quotes.filter(
      (q) => q.category === selectedCategory
    );

    if (filteredQuotes.length === 0) {
      quoteDisplay.innerHTML = "<p>No quotes available in this category.</p>";
    } else {
      const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
      const quote = filteredQuotes[randomIndex];
      quoteDisplay.innerHTML = `<p>"${quote.text}" - <strong>${quote.category}</strong></p>`;
    }
  }
}

function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText");
  const newQuoteCategory = document.getElementById("newQuoteCategory");

  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    populateCategories();
    newQuoteText.value = "";
    newQuoteCategory.value = "";
    filterQuotes();
  } else {
    alert("Please enter both quote text and category.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  populateCategories();
  filterQuotes();
});
