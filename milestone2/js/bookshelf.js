
const bookshelfGrid = document.querySelector("#bookshelf-grid");
const shelfStatus = document.querySelector("#shelf-status");

const selectedBooks = [
  "OL18130476W",
  "OL97609W",
  "OL261169W",
  "OL5720023W",
  "OL82563W"
];

async function fetchBook(workId) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(
      `https://openlibrary.org/works/${workId}.json`,
      { signal: controller.signal }
    );

    if (!response.ok) {
      throw new Error(`Book request failed: ${workId}`);
    }

    const book = await response.json();
    return { workId, book };
  } finally {
    clearTimeout(timeout);
  }
}

function createShelfCard(book, workId) {
  const card = document.createElement("article");
  card.className = "book-card";

  const coverLink = document.createElement("a");
  coverLink.className = "book-cover-link";
  coverLink.href = `details.html?id=${encodeURIComponent(workId)}`;

  const coverId = Array.isArray(book.covers)
    ? book.covers.find((id) => id > 0)
    : null;

  if (coverId) {
    const image = document.createElement("img");
    image.className = "book-cover";
    image.src = `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
    image.alt = `Cover of ${book.title || "this book"}`;
    image.loading = "lazy";

    image.onerror = () => {
      const placeholder = document.createElement("div");
      placeholder.className = "cover-placeholder";
      placeholder.textContent = "Cover unavailable";
      image.replaceWith(placeholder);
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
  title.href = `details.html?id=${encodeURIComponent(workId)}`;
  title.textContent = book.title || "Untitled book";

  info.appendChild(title);
  card.append(coverLink, info);

  return card;
}

async function loadBookshelf() {
  shelfStatus.textContent = "Loading your selected books...";
  bookshelfGrid.replaceChildren();

  try {
    const results = await Promise.allSettled(
      selectedBooks.map((workId) => fetchBook(workId))
    );

    let loadedCount = 0;

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        const { workId, book } = result.value;
        bookshelfGrid.appendChild(createShelfCard(book, workId));
        loadedCount++;
      } else {
        console.error("Book loading failed:", result.reason);
      }
    });

    if (loadedCount === selectedBooks.length) {
      shelfStatus.textContent = "All five books loaded successfully.";
    } else if (loadedCount > 0) {
      shelfStatus.textContent =
        `Loaded ${loadedCount} of five books. Some books could not be retrieved.`;
    } else {
      shelfStatus.textContent =
        "The books could not be loaded. Please check your connection and try again.";
    }
  } catch (error) {
    console.error("Bookshelf error:", error);
    shelfStatus.textContent =
      "Something went wrong while loading the books. Please refresh and try again.";
  }
}

loadBookshelf();
