//API endpoints
const API = 'https://openlibrary.org/search.json?q='
const COVER = 'https://covers.openlibrary.org/b/id/'

//DOM elements
const searchInput = document.getElementById('input')
const searchButton = document.getElementById('btn')
const booksGrid = document.querySelector('.books-grid')
const favoritesList = document.querySelector('.fav-list-container')
const favoritesListMobile = document.querySelector('.fav-list-container-mobile')
const favoritesCount = document.querySelector('.fav-count')
const favoritesCountMobile = document.querySelector('.fav-count-mobile')
const favoritesToggle = document.querySelector('.favorites-toggle')
const sidebarOverlay = document.querySelector('.sidebar-overlay')
const mobileSidebar = document.querySelector('.mobile-sidebar')

//load favorites from LS or initialize empty array
let fav = JSON.parse(localStorage.getItem('favorites')) || []

//update favorites in LS 
function updateFav() {
    localStorage.setItem('favorites', JSON.stringify(fav))
    renderFav()
    
    //fixed indentation
    document.querySelectorAll('.book-card .fav-btn').forEach(btn => {
        const key = btn.getAttribute('data-key')
        if (fav.some(f => f.key === key)) {
            btn.classList.add('active')
        } else {
            btn.classList.remove('active')
        }
    })
}

//add book to favorites 
function addToFav(book) {
    if (!fav.some(f => f.key === book.key)) {
        fav.push(book)
        updateFav()
    }
}

//remove book from favorites
function removeFromFav(bookKey) {
    fav = fav.filter(f => f.key !== bookKey)
    updateFav()
}

//render book cards in the grid(max 10 items)
function renderBooks(books) {
    booksGrid.innerHTML = '' 
    
    books.forEach(book => {
        const coverId = book.cover_i
        const hasCover = !!coverId
        const coverUrl = coverId ? `${COVER}${coverId}-L.jpg` : ''
        const isFavorite = fav.some(f => f.key === book.key)
        
        const bookCard = document.createElement('div')
        bookCard.className = 'book-card'
        
        bookCard.innerHTML = `
            <div class="book-cover-container">
                ${hasCover 
                    ? `<img src="${coverUrl}" alt="${book.title}" class="book-cover" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                       <div class="book-cover-placeholder" style="display:none;">No Cover</div>`
                    : `<div class="book-cover-placeholder">No Cover</div>`
                }
                <button class="fav-btn ${isFavorite ? 'active' : ''}" type="button" data-key="${book.key}">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.6667 9.33333C13.66 8.36 14.6667 7.19333 14.6667 5.66667C14.6667 4.69421 14.2804 3.76158 13.5928 3.07394C12.9051 2.38631 11.9725 2 11 2C9.82671 2 9.00004 2.33333 8.00004 3.33333C7.00004 2.33333 6.17337 2 5.00004 2C4.02758 2 3.09495 2.38631 2.40732 3.07394C1.71968 3.76158 1.33337 4.69421 1.33337 5.66667C1.33337 7.2 2.33337 8.36667 3.33337 9.33333L8.00004 14L12.6667 9.33333Z" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
            <div class="book-info">
                <h4>${book.title}</h4>
                <p class="book-author">${book.author_name ? book.author_name[0] : 'Unknown Author'}</p>
                <p class="book-year">${book.first_publish_year || 'N/A'}</p>
            </div>
        `
        
        const favBtn = bookCard.querySelector('.fav-btn')
        favBtn.addEventListener('click', () => {
            const bookData = {
                key: book.key,
                title: book.title,
                author: book.author_name ? book.author_name[0] : 'Unknown Author',
                year: book.first_publish_year || 'N/A',
                cover: coverUrl || 'no-cover'
            }
            
            if (fav.some(f => f.key === book.key)) {
                removeFromFav(book.key)
            } else {
                addToFav(bookData)
            }
        })
        
        booksGrid.appendChild(bookCard)
    })
}

//render favorites list in sidebar
function renderFav() {
    if (favoritesCount) favoritesCount.textContent = `${fav.length} books saved`
    if (favoritesCountMobile) favoritesCountMobile.textContent = `${fav.length} books saved`
    
    const emptyMessage = '<p class="empty-fav-message">No favorites yet</p>'
    
    if (fav.length === 0) {
        if (favoritesList) favoritesList.innerHTML = emptyMessage
        if (favoritesListMobile) favoritesListMobile.innerHTML = emptyMessage
        return
    }
    
    if (favoritesList) favoritesList.innerHTML = ''
    if (favoritesListMobile) favoritesListMobile.innerHTML = ''
    
    fav.forEach(book => {
        if (favoritesList) renderFavItem(book, favoritesList)
        if (favoritesListMobile) renderFavItem(book, favoritesListMobile)
    })
}

//helper to render single favorite 
function renderFavItem(book, container) {
    const favItem = document.createElement('div')
    favItem.className = 'fav-item'
    
    const hasCover = book.cover && book.cover !== 'no-cover'
    
    favItem.innerHTML = `
        ${hasCover 
            ? `<img src="${book.cover}" alt="${book.title}" class="fav-item-cover" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
               <div class="fav-item-cover fav-item-cover-placeholder" style="display:none;">No Cover</div>`
            : `<div class="fav-item-cover fav-item-cover-placeholder">No Cover</div>`
        }
        <div class="fav-item-info">
            <p class="fav-item-title">${book.title}</p>
            <p class="fav-item-author">${book.author}</p>
        </div>
        <button class="fav-item-remove" type="button">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.6667 9.33333C13.66 8.36 14.6667 7.19333 14.6667 5.66667C14.6667 4.69421 14.2804 3.76158 13.5928 3.07394C12.9051 2.38631 11.9725 2 11 2C9.82671 2 9.00004 2.33333 8.00004 3.33333C7.00004 2.33333 6.17337 2 5.00004 2C4.02758 2 3.09495 2.38631 2.40732 3.07394C1.71968 3.76158 1.33337 4.69421 1.33337 5.66667C1.33337 7.2 2.33337 8.36667 3.33337 9.33333L8.00004 14L12.6667 9.33333Z" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </button>
    `
    
    favItem.querySelector('.fav-item-remove').addEventListener('click', () => {
        removeFromFav(book.key)
    })
    
    container.appendChild(favItem)
}

//search books 
function searchBooks() {
    const query = searchInput.value.trim()
    if (!query) {
        booksGrid.innerHTML = '<p class="status-message">Please enter a search query.</p>'
        return
    }
    booksGrid.innerHTML = '<p class="status-message">Loading...</p>'
    
    fetch(`${API}${encodeURIComponent(query)}`)
        .then(response => {
            if (!response.ok) throw new Error('Network response error')
            return response.json()
        })
        .then(data => {
            const books = data.docs
            if (!books || books.length === 0) {
                booksGrid.innerHTML = '<p class="status-message">No books found.</p>'
                return
            }
            renderBooks(books.slice(0, 10))
        })
        .catch(error => {
            console.error('Error:', error)
            booksGrid.innerHTML = '<p class="status-message">Network error. Please try again later.</p>'
        })
}

//load random classic literature on startup
function loadRandomBooks() {
    booksGrid.innerHTML = '<p class="status-message">Loading...</p>'
    
    fetch('https://openlibrary.org/subjects/classic_literature.json?limit=10')
        .then(response => {
            if (!response.ok) throw new Error('Server error')
            return response.json()
        })
        .then(data => {
            const books = data.works
            if (!books || books.length === 0) {
                booksGrid.innerHTML = '<p class="status-message">Failed to load initial books.</p>'
                return
            }
            
            const formattedBooks = books.map(book => ({
                key: book.key,
                title: book.title,
                author_name: book.authors ? book.authors.map(a => a.name) : ['Unknown Author'],
                first_publish_year: book.first_publish_year,
                cover_i: book.cover_id
            }))
            
            renderBooks(formattedBooks)
        })
        .catch(error => {
            console.error('Error:', error)
            booksGrid.innerHTML = '<p class="status-message">Failed to load initial books.</p>'
        })
}

//event listeners
searchButton.addEventListener('click', searchBooks)
searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        searchBooks()
    }
})

//mobile sidebar layout toggles
if (favoritesToggle) {
    favoritesToggle.addEventListener('click', () => {
        mobileSidebar.classList.add('active')
        sidebarOverlay.classList.add('active')
    })
}

if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => {
        mobileSidebar.classList.remove('active')
        sidebarOverlay.classList.remove('active')
    })
}
renderFav()
loadRandomBooks()