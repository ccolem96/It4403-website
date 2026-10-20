
const statusMessage = document.querySelector("#detail-status");
const detailCard = document.querySelector("#book-detail");
const titleElement = document.querySelector("#detail-title");
const idElement = document.querySelector("#detail-id");
const descriptionElement = document.querySelector("#detail-description");
const subjectsElement = document.querySelector("#detail-subjects");
const coverElement = document.querySelector("#detail-cover");
const openLibraryLink = document.querySelector("#open-library-link");

function showDetailStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("error", isError);
}

function getDescription(description) {
  if (typeof description === "string" && description.trim()) {
    return description;
  }

  if (
    description &&
    typeof description.value === "string" &&
    description.value.trim()
  ) {
    return description.value;
  }

  return "No description is available for this book.";
}

function showCoverPlaceholder() {
  coverElement.hidden = true;

  let placeholder = document.querySelector("#cover-placeholder");

  if (!placeholder) {
    placeholder = document.createElement("div");
    placeholder.id = "cover-placeholder";
    placeholder.className = "cover-placeholder";
    placeholder.textContent = "Cover unavailable";

    coverElement.insertAdjacentElement("afterend", placeholder);
  }

  placeholder.hidden = false;
}

function showCover(coverId, title) {
  const existingPlaceholder = document.querySelector("#cover-placeholder");

  if (existingPlaceholder) {
    existingPlaceholder.hidden = true;
  }

  if (!coverId) {
    showCoverPlaceholder();
    return;
  }

  coverElement.hidden = false;
  coverElement.alt = `Cover of ${title}`;

  coverElement.onerror = () => {
    showCoverPlaceholder();
  };

  coverElement.src =
    `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
}

async function loadBookDetails() {
  const params = new URLSearchParams(window.location.search);
  const workId = params.get("id");

  detailCard.hidden = true;

  if (!workId || !/^OL\d+W$/.test(workId)) {
    showDetailStatus(
      "A valid book Work ID was not provided. Return to the search page and select a book.",
      true
    );
    return;
  }

  showDetailStatus("Loading book details...");

  try {
    const response = await fetch(
      `https://openlibrary.org/works/${encodeURIComponent(workId)}.json`
    );

    if (!response.ok) {
      throw new Error("Unable to retrieve this book.");
    }

    const book = await response.json();
    const title = book.title || "Untitled";

    titleElement.textContent = title;
    idElement.textContent = workId;
    descriptionElement.textContent = getDescription(book.description);

    subjectsElement.replaceChildren();

    const subjects = Array.isArray(book.subjects)
      ? book.subjects.slice(0, 10)
      : [];

    if (subjects.length > 0) {
      subjects.forEach((subject) => {
        const item = document.createElement("li");
        item.textContent = subject;
        subjectsElement.appendChild(item);
      });
    } else {
      const item = document.createElement("li");
      item.textContent = "No subjects are available.";
      subjectsElement.appendChild(item);
    }

    const coverId = Array.isArray(book.covers)
      ? book.covers.find((id) => id > 0)
      : null;

    showCover(coverId, title);

    openLibraryLink.href =
      `https://openlibrary.org/works/${encodeURIComponent(workId)}`;

    detailCard.hidden = false;
    showDetailStatus("");
  } catch (error) {
    console.error("Book details error:", error);

    showDetailStatus(
      "We couldn't load this book. Please check your connection and try again.",
      true
    );
  }
}

loadBookDetails();
