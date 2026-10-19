
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

function showStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("error", isError);
}

function createBookCard(book) {
  const card = document.createElement("article");
  card.className = "book-card";

  const coverLink = document.createElement("a");
  coverLink.className = "book-cover-link";
  coverLink.href = `details.html?id=${encodeURIComponent(book.key)}`;
  coverLink.setAttribute("aria-label", `View ${book.title}`);

  if (book.cover_i) {
    const image = document.createElement("img");
    image.className = "book-cover";
    image.src = `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
    image.alt = `Cover of ${book.title}`;
    image.loading = "lazy";
    image.onerror = () => {
      image.remove();
      const placeholder = document.createElement("div");
      placeholder.className = "cover-placeholder";
      placeholder.textContent = "Cover unavailable";
      coverLink.appendChild(placeholder);
    };
    coverLink.appendChild(image);
  } else {
    const placeholder = document.createElement("div");
    placeholder.className = "cover-placeholder";
    placeholder.textContent = "Cover unavailable";
    coverLink.appendChild(placeholder);
  }

  const info = document.createElement("div");
  info.className = "book-info";

  const title = document.createElement("a");
  title.className = "book-title";
  title.href = `details.html?id=${encodeURIComponent(book.key)}`;
  title.textContent = book.title || "Untitled";

  const author = document.createElement("p");
  author.className = "book-author";
  author.textContent = book.author_name?.slice(0, 2).join(", ") || "Author unknown";

  info.append(title, author);
  card.append(coverLink, info);

  return card;
}

function updatePagination() {
  const pageCount = Math.min(60, Math.ceil(totalResults / pageSize));
  pagination.hidden = pageCount <= 1;
  pageSelect.replaceChildren();

  for (let page = 1; page <= pageCount; page++) {
    const option = document.createElement("option");
    option.value = page;
    option.textContent = `Page ${page}`;
    option.selected = page === currentPage;
    pageSelect.appendChild(option);
  }
}

async function searchBooks() {
  if (!currentSearch.trim()) {
    showStatus("Please enter a book title, author, or keyword.", true);
    resultsGrid.replaceChildren();
    pagination.hidden = true;
    return;
  }

  showStatus("Searching Open Library…");
  resultsGrid.replaceChildren();
  pagination.hidden = true;

  const params = new URLSearchParams({
    q: currentSearch,
    limit: pageSize,
    page: currentPage
  });

  try {
    const response = await fetch(
      `https://openlibrary.org/search.json?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error("The book search request failed.");
    }

    const data = await response.json();
    totalResults = Math.min(data.numFound || 0, pageSize * 60, 600);
    const books = (data.docs || []).slice(0, pageSize);

    if (books.length === 0) {
      showStatus("No books found. Try another search term.");
      return;
    }

    const fragment = document.createDocumentFragment();

    books.forEach((book) => {
      if (book.key && book.key.startsWith("/works/")) {
        fragment.appendChild(createBookCard(book));
      }
    });

    resultsGrid.appendChild(fragment);

    if (!resultsGrid.children.length) {
      showStatus("No usable book results found. Try another search.");
      return;
    }

    showStatus(`Showing page ${currentPage} of ${Math.max(1, Math.ceil(totalResults / pageSize))}.`);
    updatePagination();
  } catch (error) {
    console.error("Open Library search error:", error);
    showStatus("Unable to load books. Check your connection and try again.", true);
  }
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  currentSearch = searchInput.value.trim();
  currentPage = 1;
  searchBooks();
});

pageSizeSelect.addEventListener("change", () => {
  pageSize = Number(pageSizeSelect.value);
  currentPage = 1;
  if (currentSearch) searchBooks();
});

pageSelect.addEventListener("change", () => {
  currentPage = Number(pageSelect.value);
  searchBooks();
});
