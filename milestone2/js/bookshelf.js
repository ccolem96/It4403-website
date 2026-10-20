const bookshelfGrid = document.querySelector("#bookshelf-grid");
const shelfStatus = document.querySelector("#shelf-// Five selected classic books from Open Library.
status");

const selectedBooks = [
  "OL18130476W",
  "OL97609W",
  "OL261169W",
  "OL5720023W",
  "OL82563W"
];


function createShelfCard(book, workId) {
  const card = document.createElement("article");
  card.className = "book-card";

  const coverLink = document.createElement("a");
  coverLink.className = "book-cover-link";
  coverLink.href = `details.html?id=${encodeURIComponent(workId)}`;
  coverLink.setAttribute(
    "aria-label",
    `View details for ${book.title || "this book"}`
  );

  const coverId = book.covers?.find((id) => id > 0);

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
  title.textContent = book.title || "Untitled";

  info.appendChild(title);
  card.append(coverLink, info);

  return card;
}

async function loadBookshelf() {
  shelfStatus.textContent = "Loading your selected books...";
  bookshelfGrid.innerHTML = "";

  const results = await Promise.allSettled(
    selectedBooks.map(async (workId) => {
      const response = await fetch(
        `https://openlibrary.org/works/${workId}.json`
      );

      if (!response.ok) {
        throw new Error(`Unable to load ${workId}`);
      }

      const book = await response.json();
      return { workId, book };
    })
  );

  let successfulBooks = 0;

  results.forEach((result) => {
    if (result.status === "fulfilled") {
      const { workId, book } = result.value;
      bookshelfGrid.appendChild(createShelfCard(book, workId));
      successfulBooks++;
    } else {
      console.error("A bookshelf book could not be loaded:", result.reason);
    }
  });

  if (successfulBooks === selectedBooks.length) {
    shelfStatus.textContent =
      `Your bookshelf contains ${successfulBooks} selected books.`;
  } else if (successfulBooks > 0) {
    shelfStatus.textContent =
      `Loaded ${successfulBooks} of ${selectedBooks.length} selected books.`;
  } else {
    shelfStatus.textContent =
      "Books could not be loaded. Please check your connection and try again.";
  }
}

loadBookshelf();
