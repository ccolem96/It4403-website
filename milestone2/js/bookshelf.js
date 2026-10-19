
const bookshelfGrid = document.querySelector("#bookshelf-grid");
const shelfStatus = document.querySelector("#shelf-status");

// Selected Open Library Work IDs for your personal bookshelf.
const selectedBooks = [
  "OL82563W",
  "OL262758W",
  "OL27448W",
  "OL15317338W",
  "OL1793857W"
];

function createShelfCard(book, workId) {
  const card = document.createElement("article");
  card.className = "book-card";

  const coverLink = document.createElement("a");
  coverLink.className = "book-cover-link";
  coverLink.href = `details.html?id=${encodeURIComponent(workId)}`;

  const coverId = book.covers?.find((id) => id > 0);

  if (coverId) {
    const image = document.createElement("img");
    image.className = "book-cover";
    image.src = `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
    image.alt = `Cover of ${book.title || "this book"}`;
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
  title.href = `details.html?id=${encodeURIComponent(workId)}`;
  title.textContent = book.title || "Untitled";

  info.appendChild(title);
  card.append(coverLink, info);

  return card;
}

async function loadBookshelf() {
  shelfStatus.textContent = "Loading your selected books…";

  const fragment = document.createDocumentFragment();
  let successfulBooks = 0;

  try {
    const results = await Promise.all(
      selectedBooks.map(async (workId) => {
        const response = await fetch(
          `https://openlibrary.org/works/${workId}.json`
        );

        if (!response.ok) {
          throw new Error(`Unable to load book ${workId}`);
        }

        return {
          workId,
          book: await response.json()
        };
      })
    );

    results.forEach(({ workId, book }) => {
      fragment.appendChild(createShelfCard(book, workId));
      successfulBooks++;
    });

    bookshelfGrid.appendChild(fragment);

    shelfStatus.textContent = successfulBooks
      ? `Your bookshelf contains ${successfulBooks} selected books.`
      : "No books could be loaded.";
  } catch (error) {
    console.error("Bookshelf error:", error);
    shelfStatus.textContent =
      "Some books could not be loaded. Please refresh the page to try again.";

    // Display any books that can still be retrieved.
    const individualResults = await Promise.allSettled(
      selectedBooks.map(async (workId) => {
        const response = await fetch(
          `https://openlibrary.org/works/${workId}.json`
        );

        if (!response.ok) {
          throw new Error("Book request failed");
        }

        return { workId, book: await response.json() };
      })
    );

    individualResults.forEach((result) => {
      if (result.status === "fulfilled") {
        bookshelfGrid.appendChild(
          createShelfCard(result.value.book, result.value.workId)
        );
      }
    });
  }
}

loadBookshelf();
