
// ========================================
// Open Library - IT 4403 Milestone 3
// Single Page Application using jQuery AJAX
// ========================================

const API_URL = "https://openlibrary.org";
const app = $("#app");

// Store saved books
let bookshelf = JSON.parse(
    localStorage.getItem("openLibraryBooks") || "[]"
);

// HOME PAGE
function showHome() {
    app.empty();

    const section = $("<section>");
    section.append(
        $("<h2>").text("Welcome to Open Library!")
    );
    section.append(
        $("<p>").text("Discover books, explore new stories, and build your personal bookshelf.")
    );

    const button = $("<button>")
        .attr("id", "startSearch")
        .text("Explore Books");

    section.append(button);
    app.append(section);
}

// SEARCH PAGE
function showSearch() {
    app.empty();

    const section = $("<section>");

    section.append(
        $("<h2>").text("Search for Books")
    );

    const form = $("<form>").attr("id", "searchForm");

    const input = $("<input>")
        .attr({
            type: "text",
            id: "searchInput",
            placeholder: "Enter a book title or author...",
            required: true
        });

    const button = $("<button>")
        .attr("type", "submit")
        .text("Search");

    form.append(input, button);

    section.append(form);
    section.append(
        $("<div>").attr("id", "searchResults")
    );

    app.append(section);
}

// AJAX BOOK SEARCH
function searchBooks(query) {
    const results = $("#searchResults");

    results.empty().append(
        $("<p>").text("Searching for books...")
    );

    $.ajax({
        url: API_URL + "/search.json",
        method: "GET",
        data: {
            q: query,
            limit: 20
        },
        dataType: "json",

        success: function(data) {
            results.empty();

            if (!data.docs || data.docs.length === 0) {
                results.append(
                    $("<p>").text("No books found. Try another search.")
                );
                return;
            }

            const grid = $("<div>").addClass("book-grid");

            data.docs.forEach(function(book) {

                const key = book.key;
                const title = book.title || "Unknown Title";

                const author = book.author_name
                    ? book.author_name.join(", ")
                    : "Unknown Author";

                const cover = book.cover_i
                    ? "https://covers.openlibrary.org/b/id/" +
                      book.cover_i + "-M.jpg"
                    : "";

                const card = $("<div>").addClass("book-card");

                if (cover) {
                    card.append(
                        $("<img>")
                            .attr("src", cover)
                            .attr("alt", "Cover of " + title)
                    );
                }

                card.append(
                    $("<h3>").text(title)
                );

                card.append(
                    $("<p>").text("By: " + author)
                );

                const detailsButton = $("<button>")
                    .text("View Details")
                    .attr("data-key", key)
                    .addClass("detailsBtn");

                const saveButton = $("<button>")
                    .text("Add to Bookshelf")
                    .attr("data-key", key)
                    .addClass("saveBtn");

                card.append(detailsButton, saveButton);
                grid.append(card);
            });

            results.append(grid);
        },

        error: function() {
            results.empty().append(
                $("<p>").text("Unable to retrieve books. Please try again.")
            );
        }
    });
}

// BOOK DETAILS PAGE
function showBookDetails(key) {
    app.empty();

    app.append(
        $("<p>").text("Loading book details...")
    );

    const workId = key.replace("/works/", "");

    $.ajax({
        url: API_URL + "/works/" + encodeURIComponent(workId) + ".json",
        method: "GET",
        dataType: "json",

        success: function(book) {
            app.empty();

            const section = $("<section>");

            section.append(
                $("<h2>").text(book.title || "Book Details")
            );

            let description = book.description || "No description available.";

            if (typeof description === "object") {
                description = description.value || "No description available.";
            }

            section.append(
                $("<p>").text(description)
            );

            if (book.subjects) {
                section.append(
                    $("<h3>").text("Subjects")
                );

                section.append(
                    $("<p>").text(book.subjects.slice(0, 10).join(", "))
                );
            }

            const backButton = $("<button>")
                .text("Back to Search")
                .attr("id", "backToSearch");

            section.append(backButton);
            app.append(section);
        },

        error: function() {
            app.empty().append(
                $("<p>").text("Unable to load book details.")
            );

            app.append(
                $("<button>")
                    .attr("id", "backToSearch")
                    .text("Back to Search")
            );
        }
    });
}

// SAVE BOOK TO BOOKSHELF
function saveBook(key) {
    $.ajax({
        url: API_URL + "/search.json",
        method: "GET",
        data: {
            q: "key:" + key,
            limit: 1
        },
        dataType: "json",

        success: function(data) {
            const book = data.docs && data.docs.length
                ? data.docs[0]
                : null;

            if (!book) {
                alert("Unable to save this book.");
                return;
            }

            if (bookshelf.some(item => item.key === key)) {
                alert("This book is already on your bookshelf!");
                return;
            }

            bookshelf.push({
                key: key,
                title: book.title || "Unknown Title",
                author: book.author_name
                    ? book.author_name.join(", ")
                    : "Unknown Author",
                cover: book.cover_i || null
            });

            localStorage.setItem(
                "openLibraryBooks",
                JSON.stringify(bookshelf)
            );

            alert("Book added to your bookshelf!");
        },

        error: function() {
            alert("Unable to save book. Please try again.");
        }
    });
}

// BOOKSHELF PAGE
function showBookshelf() {
    app.empty();

    const section = $("<section>");

    section.append(
        $("<h2>").text("My Bookshelf")
    );

    if (bookshelf.length === 0) {
        section.append(
            $("<p>").text("Your bookshelf is empty. Search for books to add!")
        );
    } else {
        const grid = $("<div>").addClass("book-grid");

        bookshelf.forEach(function(book) {
            const card = $("<div>").addClass("book-card");

            if (book.cover) {
                card.append(
                    $("<img>").attr({
                        src: "https://covers.openlibrary.org/b/id/" +
                            book.cover + "-M.jpg",
                        alt: "Cover of " + book.title
                    })
                );
            }

            card.append(
                $("<h3>").text(book.title)
            );

            card.append(
                $("<p>").text("By: " + book.author)
            );

            const removeButton = $("<button>")
                .text("Remove Book")
                .attr("data-key", book.key)
                .addClass("removeBtn");

            card.append(removeButton);
            grid.append(card);
        });

        section.append(grid);
    }

    app.append(section);
}

// NAVIGATION EVENTS

$("#homeBtn").on("click", showHome);

$("#searchBtn").on("click", showSearch);

$("#bookshelfBtn").on("click", showBookshelf);

$(document).on("click", "#startSearch", showSearch);

$(document).on("submit", "#searchForm", function(event) {
    event.preventDefault();

    const query = $("#searchInput").val().trim();

    if (query) {
        searchBooks(query);
    }
});

// VIEW BOOK DETAILS
$(document).on("click", ".detailsBtn", function() {
    const key = $(this).attr("data-key");

    showBookDetails(key);
});

// ADD BOOK
$(document).on("click", ".saveBtn", function() {
    const key = $(this).attr("data-key");

    saveBook(key);
});

// REMOVE BOOK
$(document).on("click", ".removeBtn", function() {
    const key = $(this).attr("data-key");

    bookshelf = bookshelf.filter(
        book => book.key !== key
    );

    localStorage.setItem(
        "openLibraryBooks",
        JSON.stringify(bookshelf)
    );

    showBookshelf();
});

// BACK TO SEARCH
$(document).on("click", "#backToSearch", showSearch);

// START APPLICATION
$(document).ready(function() {
    showHome();
});

