
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
  if (typeof description === "string") {
    return description;
  }

  if (description && typeof description.value === "string") {
    return description.value;
  }

  return "No description is available for this book.";
}

async function loadBookDetails() {
  const params = new URLSearchParams(window.location.search);
  const workId = params.get("id");

  if (!workId || !/^OL\d+W$/.test(workId)) {
    showDetailStatus("A valid book Work ID was not provided.", true);
    return;
  }

  showDetailStatus("Loading book details…");

  try {
    const response = await fetch(
      `https://openlibrary.org/works/${encodeURIComponent(workId)}.json`
    );

    if (!response.ok) {
      throw new Error("Unable to retrieve this book.");
    }

    const book = await response.json();

    titleElement.textContent = book.title || "Untitled";
    idElement.textContent = workId;
    descriptionElement.textContent = getDescription(book.description);

    subjectsElement.replaceChildren();

    (book.subjects || []).slice(0, 10).forEach((subject) => {
      const item = document.createElement("li");
      item.textContent = subject;
      subjectsElement.appendChild(item);
    });

    if (subjectsElement.children.length === 0) {
      const item = document.createElement("li");
      item.textContent = "No subjects are available.";
      subjectsElement.appendChild(item);
    }

    const coverId = book.covers?.find((id) => id > 0);

    if (coverId) {
      coverElement.src = `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
      coverElement.alt = `Cover of ${book.title || "this book"}`;
      coverElement.hidden = false;
      coverElement.onerror = () => {
        coverElement.hidden = true;
      };
    } else {
      coverElement.hidden = true;
    }

    openLibraryLink.href = `https://openlibrary.org/works/${workId}`;
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
