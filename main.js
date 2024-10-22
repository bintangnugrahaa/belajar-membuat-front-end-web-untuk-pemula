// Initial setup for localStorage keys
const BOOKSHELF_STORAGE_KEY = "bookshelf";
let books = [];
let currentEditId = null; // To store the current book ID being edited

// Helper function to generate unique IDs for each book
const generateId = () =>
  "book-" + Date.now() + "-" + Math.floor(Math.random() * 1000);

// Function to check if localStorage has books
const checkLocalStorage = () => {
  const storedBooks = localStorage.getItem(BOOKSHELF_STORAGE_KEY);
  return storedBooks ? JSON.parse(storedBooks) : [];
};

// Function to save books to localStorage
const saveToLocalStorage = () => {
  localStorage.setItem(BOOKSHELF_STORAGE_KEY, JSON.stringify(books));
};

// Function to render book lists with search functionality
// Function to render book lists with search functionality
const renderBooks = (searchQuery = "") => {
  const incompleteBookList = document.getElementById("incompleteBookList");
  const completeBookList = document.getElementById("completeBookList");

  // Clear existing content
  incompleteBookList.innerHTML = "";
  completeBookList.innerHTML = "";

  // Filter books based on search query
  const filteredBooks = books.filter((book) => {
    return book.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  filteredBooks.forEach((book) => {
    const bookItem = document.createElement("div");
    bookItem.setAttribute("data-bookid", book.id);
    bookItem.setAttribute("data-testid", "bookItem");

    bookItem.innerHTML = `
              <img src="${
                book.image || "path/to/placeholder/image.jpg"
              }" alt="Book Cover" />
              <h3 data-testid="bookItemTitle">${book.title}</h3>
              <p data-testid="bookItemAuthor">Penulis: ${book.author}</p>
              <p data-testid="bookItemYear">Tahun: ${book.year}</p>
              <div>
                  <button data-testid="bookItemIsCompleteButton">${
                    book.isComplete ? "Belum Dibaca" : "Selesai Dibaca"
                  }</button>
                  <button data-testid="bookItemDeleteButton">Hapus Buku</button>
                  <button data-testid="bookItemEditButton">Edit Buku</button>
              </div>
          `;

    // Add event listeners
    bookItem
      .querySelector('[data-testid="bookItemIsCompleteButton"]')
      .addEventListener("click", () => toggleCompleteStatus(book.id));
    bookItem
      .querySelector('[data-testid="bookItemDeleteButton"]')
      .addEventListener("click", () => deleteBook(book.id));
    bookItem
      .querySelector('[data-testid="bookItemEditButton"]')
      .addEventListener("click", () => editBook(book.id));

    if (book.isComplete) {
      completeBookList.appendChild(bookItem);
    } else {
      incompleteBookList.appendChild(bookItem);
    }
  });
};

// Event listener for the search book input
document
  .getElementById("searchBookTitle")
  .addEventListener("input", (event) => {
    const searchQuery = event.target.value; // Get the search query
    renderBooks(searchQuery); // Pass the search query to renderBooks
  });

// Load books from localStorage on page load
window.addEventListener("load", () => {
  books = checkLocalStorage();
  renderBooks(); // Call renderBooks without a search query
});

// Event listener for the search book form
document
  .getElementById("searchBookForm")
  .addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent the form from submitting normally
    const searchQuery = document.getElementById("searchBookTitle").value; // Get the search query
    renderBooks(searchQuery); // Pass the search query to renderBooks
  });

// Load books from localStorage on page load
window.addEventListener("load", () => {
  books = checkLocalStorage();
  renderBooks(); // Call renderBooks without a search query
});

// Function to add a new book
const addBook = (book) => {
  books.push(book);
  saveToLocalStorage();
  renderBooks();
};

// Function to toggle the completion status of a book
const toggleCompleteStatus = (id) => {
  const bookIndex = books.findIndex((book) => book.id === id);
  if (bookIndex !== -1) {
    books[bookIndex].isComplete = !books[bookIndex].isComplete;
    saveToLocalStorage();
    renderBooks();
  }
};

// Function to delete a book
const deleteBook = (id) => {
  if (confirm("Yakin mau dihapus?")) {
    books = books.filter((book) => book.id !== id);
    saveToLocalStorage();
    renderBooks();
  }
};

// Function to edit a book
const editBook = (id) => {
  console.log("Editing book with ID:", id); // Debugging line
  currentEditId = id; // Store the current ID being edited
  const book = books.find((b) => b.id === id);
  if (book) {
    console.log("Book found:", book); // Debugging line
    // Fill the edit form with the current book's data
    document.getElementById("editBookTitle").value = book.title;
    document.getElementById("editBookAuthor").value = book.author;
    document.getElementById("editBookYear").value = book.year;
    document.getElementById("editBookImage").value = ""; // Reset image input
    document.getElementById("editBookIsComplete").checked = book.isComplete;

    // Show the edit form and hide the add form
    document.getElementById("editBookForm").style.display = "block";
    document.getElementById("bookForm").style.display = "none";
  }
};

// Function to handle book form submission
const handleBookFormSubmit = (event) => {
  event.preventDefault();

  const title = document.getElementById("bookFormTitle").value;
  const author = document.getElementById("bookFormAuthor").value;
  const year = parseInt(document.getElementById("bookFormYear").value);
  const imageInput = document.getElementById("bookFormImage").files[0];
  const isComplete = document.getElementById("bookFormIsComplete").checked;

  const reader = new FileReader();
  reader.onload = (event) => {
    const newBook = {
      id: generateId(),
      title,
      author,
      year,
      image: event.target.result, // Use data URL from FileReader
      isComplete,
    };

    addBook(newBook);

    // Clear the form fields
    document.getElementById("bookForm").reset();
  };

  // Read the image file if it exists
  if (imageInput) {
    reader.readAsDataURL(imageInput);
  } else {
    // Handle the case where no image is provided
    const newBook = {
      id: generateId(),
      title,
      author,
      year,
      image: "", // Default to an empty string or a placeholder image
      isComplete,
    };
    addBook(newBook);
  }
};

// Function to handle edit book form submission
const handleEditBookFormSubmit = (event) => {
  event.preventDefault();

  const title = document.getElementById("editBookTitle").value;
  const author = document.getElementById("editBookAuthor").value;
  const year = parseInt(document.getElementById("editBookYear").value);
  const imageInput = document.getElementById("editBookImage").files[0];
  const isComplete = document.getElementById("editBookIsComplete").checked;

  const reader = new FileReader();
  reader.onload = (event) => {
    const bookIndex = books.findIndex((book) => book.id === currentEditId);
    if (bookIndex !== -1) {
      books[bookIndex] = {
        id: currentEditId,
        title,
        author,
        year,
        image: event.target.result, // Use data URL from FileReader
        isComplete,
      };
      saveToLocalStorage();
      renderBooks();

      // Hide the edit form and show the add form again
      document.getElementById("editBookForm").style.display = "none";
      document.getElementById("bookForm").style.display = "block";

      // Clear the edit form fields
      document.getElementById("editBookForm").reset();
      currentEditId = null; // Reset currentEditId
    }
  };

  // Read the image file if it exists
  if (imageInput) {
    reader.readAsDataURL(imageInput);
  } else {
    // If no new image is uploaded, keep the existing image
    const existingBook = books.find((b) => b.id === currentEditId);
    if (existingBook) {
      const bookIndex = books.findIndex((book) => book.id === currentEditId);
      books[bookIndex] = {
        id: currentEditId,
        title,
        author,
        year,
        image: existingBook.image, // Keep the existing image
        isComplete,
      };
      saveToLocalStorage();
      renderBooks();

      // Hide the edit form and show the add form again
      document.getElementById("editBookForm").style.display = "none";
      document.getElementById("bookForm").style.display = "block";

      // Clear the edit form fields
      document.getElementById("editBookForm").reset();
      currentEditId = null; // Reset currentEditId
    }
  }
};

// Event listeners
document
  .getElementById("bookForm")
  .addEventListener("submit", handleBookFormSubmit);
document
  .getElementById("editBookForm")
  .addEventListener("submit", handleEditBookFormSubmit);
document.getElementById("cancelEditButton").addEventListener("click", () => {
  // Hide the edit form and show the add form again
  document.getElementById("editBookForm").style.display = "none";
  document.getElementById("bookForm").style.display = "block";
});

// Load books from localStorage on page load
window.addEventListener("load", () => {
  books = checkLocalStorage();
  renderBooks();
});
