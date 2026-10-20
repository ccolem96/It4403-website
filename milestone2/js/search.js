
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const resultsGrid = document.querySelector("#search-results");
const statusMessage = document.querySelector("#search-status");
const pageSizeSelect = document.querySelector("#page-size");
const pageSelect = document.querySelector("#page-select");
const pagination = document.querySelector("#pagination");

let currentSearch = "";
let currentPage = 1;
let totalResults = 0;
let pageSize = Number(pageSizeSelect?.value) || 10;

function showStatus(message) {
  statusMessage.textContent = message;
}

function createBookCard(book) {
  const card = document.createElement("article");
  card.className = "book-card";

  const workId = (book.key || "").replace(/^\/works\//, "");
  const title = book.title || "Untitled book";
  const author = book.author_name?.[0] || "Unknown author";
  const year = book.first_publish_year || "Year unavailable";

  const coverLink = document.createElement("a");
  coverLink.className = "book-cover-link";
  coverLink.href = workId
    ? `details.html?id=${encodeURIComponent(workId)}`
    : "#";
  coverLink.setAttribute("aria-label", `View details for ${title}`);

  if (book.cover_i) {
    const cover = document.createElement("img");
    cover.className = "book-cover";
    cover.src = `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
    cover.alt = `Cover of ${title}`;
    cover.loading = "lazy";

    cover.onerror = function () {
      const placeholder = document.createElement("div");
      placeholder.className = "cover-placeholder";
      placeholder.textContent = "Cover unavailable";
      cover.replaceWith(placeholder);
    };

    coverLink.appendChild(cover);
  } else {
    const placeholder = document.createElement("div");
    placeholder.className = "cover-placeholder";
    placeholder.textContent = "No cover available";
    coverLink.appendChild(placeholder);
  }

  const info = document.createElement("div");
  info.className = "book-info";

  const heading = document.createElement("h3");
  heading.className = "book-title";

  if (workId) {
    const titleLink = document.createElement("a");
    titleLink.href = `details.html?id=${encodeURIComponent(workId)}`;
    titleLink.textContent = title;
    heading.appendChild(titleLink);
  } else {
    heading.textContent = title;
  }

  const authorText = document.createElement("p");
  authorText.className = "book-author";
  authorText.textContent = `By ${author}`;

  const yearText = document.createElement("p");
  yearText.className = "book-year";
  yearText.textContent = `First published: ${year}`;

  info.appendChild(heading);
  info.appendChild(authorText);
  info.appendChild(yearText);

  card.appendChild(coverLink);
  card.appendChild(info);

  return card;
}

function updatePagination() {
  const pageCount = Math.ceil(totalResults / pageSize);

  pageSelect.innerHTML = "";

  if (pageCount <= 1) {
    pagination.hidden = true;
    return;
  }

  pagination.hidden = false;

  for (let page = 1; page <= pageCount; page++) {
    const option = document.createElement("option");
    option.value = page;
    option.textContent = `Page ${page}`;

    if (page === currentPage) {
      option.selected = true;
    }

    pageSelect.appendChild(option);
  }
}

async function searchBooks(page = 1) {
  if (!currentSearch) {
    showStatus("Enter a keyword above to begin.");
    resultsGrid.innerHTML = "";
    pagination.hidden = true;
    return;
  }

  currentPage = page;
  pageSize = Number(pageSizeSelect.value) || 10;

  showStatus("Searching for books...");
  resultsGrid.innerHTML = "";
  pagination.hidden = true;

  try {
    const url = new URL("https://openlibrary.org/search.json");

    url.searchParams.set("q", currentSearch);
    url.searchParams.set("limit", pageSize);
    url.searchParams.set("page", currentPage);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Unable to retrieve books.");
    }

    const data = await response.json();

    // Limit the assignment results to a maximum of 60 books.
    totalResults = Math.min(data.numFound || 0, 60);

    const books = (data.docs || []).slice(
      0,
      Math.max(0, totalResults - (currentPage - 1) * pageSize)
    );

    if (books.length === 0) {
      showStatus("No books found. Try another title, author, or topic.");
      updatePagination();
      return;
    }

    books.forEach((book) => {
      resultsGrid.appendChild(createBookCard(book));
    });

    const firstResult = (currentPage - 1) * pageSize + 1;
    const lastResult = Math.min(
      currentPage * pageSize,
      totalResults
    );

    showStatus(
      `Showing ${firstResult}-${lastResult} of up to ${totalResults} matching books.`
    );

    updatePagination();
  } catch (error) {
    console.error("Book search error:", error);
    showStatus(
      "Sorry, we couldn't load the books. Please check your connection and try again."
    );
  }
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();

  currentSearch = searchInput.value.trim();
  currentPage = 1;

  if (!currentSearch) {
    showStatus("Please enter a title, author, or topic.");
    resultsGrid.innerHTML = "";
    pagination.hidden = true;
    return;
  }

  searchBooks(1);
});

pageSizeSelect.addEventListener("change", () => {
  pageSize = Number(pageSizeSelect.value) || 10;
  currentPage = 1;

  if (currentSearch) {
    searchBooks(1);
  }
});

pageSelect.addEventListener("change", () => {
  searchBooks(Number(pageSelect.value));
});
