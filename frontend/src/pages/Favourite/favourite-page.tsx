import { useState, useEffect } from 'react';
import Sidebar from "../../components/ui/Sidebar";
import SearchBar, {type SearchFilters } from "../../components/ui/Searchbar";
import BookCard from "../../components/ui/Card";
import { booksApi, type Book } from '../../api/bookAPI';
import './styles.css';

const FavouritePage = () => {
    const [favouriteBooks, setFavouriteBooks] = useState<Book[]>([]);
    const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        loadFavouriteBooks();
    }, []);

    useEffect(() => {
        // Filter books locally when search filters change
        const hasActiveFilters = Object.values(searchFilters).some(value => value && value.trim() !== '');

        if (!hasActiveFilters) {
            setFilteredBooks(favouriteBooks);
        } else {
            const filtered = favouriteBooks.filter(book => {
                // Handle general search
                if (searchFilters.search) {
                    const searchTerm = searchFilters.search.toLowerCase();
                    return (
                        book.title.toLowerCase().includes(searchTerm) ||
                        (book.author || '').toLowerCase().includes(searchTerm) ||
                        (book.genre || '').toLowerCase().includes(searchTerm) ||
                        (book.synopsis || '').toLowerCase().includes(searchTerm)
                    );
                }

                // Handle individual field searches
                const matchesTitle = !searchFilters.title ||
                    book.title.toLowerCase().includes(searchFilters.title.toLowerCase());
                const matchesAuthor = !searchFilters.author ||
                    (book.author || '').toLowerCase().includes(searchFilters.author.toLowerCase());
                const matchesGenre = !searchFilters.genre ||
                    (book.genre || '').toLowerCase().includes(searchFilters.genre.toLowerCase());

                return matchesTitle && matchesAuthor && matchesGenre;
            });
            setFilteredBooks(filtered);
        }
    }, [favouriteBooks, searchFilters]);

    const loadFavouriteBooks = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await booksApi.getLibraryBooks();

            if (response.success) {
                setFavouriteBooks(response.data);
            } else {
                throw new Error(response.message || 'Failed to load favourite books');
            }
        } catch (err) {
            console.error('Error loading favourite books:', err);
            setError(err instanceof Error ? err.message : 'Failed to load favourite books');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (filters: SearchFilters) => {
        setIsSearching(true);
        setSearchFilters(filters);
        // Small delay to show searching state
        setTimeout(() => setIsSearching(false), 100);
    };

    const handleClearSearch = () => {
        setSearchFilters({});
        setIsSearching(false);
    };

    const handleToggleFavourite = async (bookId: string, currentlyFavourited: boolean) => {
        try {
            if (currentlyFavourited) {
                const response = await booksApi.removeFromLibrary(bookId);
                if (response.success) {
                    // Remove the book from the local state
                    setFavouriteBooks(prev => prev.filter(book => book.id !== bookId));
                } else {
                    throw new Error(response.message || 'Failed to remove from favourites');
                }
            } else {
                // This shouldn't happen on the favourites page, but handle it just in case
                const response = await booksApi.addToLibrary(bookId);
                if (response.success) {
                    // Reload the favourite books to get the updated list
                    loadFavouriteBooks();
                } else {
                    throw new Error(response.message || 'Failed to add to favourites');
                }
            }
        } catch (err) {
            console.error('Error toggling favourite:', err);
            alert(err instanceof Error ? err.message : 'Failed to update favourites');
        }
    };

    const getSearchSummary = () => {
        const hasActiveFilters = Object.values(searchFilters).some(value => value && value.trim() !== '');
        if (!hasActiveFilters) return null;

        const filterParts = [];
        if (searchFilters.search) filterParts.push(`"${searchFilters.search}"`);
        if (searchFilters.title) filterParts.push(`title: "${searchFilters.title}"`);
        if (searchFilters.author) filterParts.push(`author: "${searchFilters.author}"`);
        if (searchFilters.genre) filterParts.push(`genre: "${searchFilters.genre}"`);

        return filterParts.join(', ');
    };

    if (loading) {
        return (
            <div className="favourite-page">
                <Sidebar />
                <div className="page-content">
                    <div className="page-header">
                        <h1>Your Favourites</h1>
                        <h2>Loading your favourite books...</h2>
                    </div>
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="favourite-page">
                <Sidebar />
                <div className="page-content">
                    <div className="page-header">
                        <h1>Your Favourites</h1>
                        <h2>Error loading favourite books</h2>
                    </div>
                    <div className="error-message">
                        <p>{error}</p>
                        <button onClick={loadFavouriteBooks} className="retry-button">
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const searchSummary = getSearchSummary();

    return (
        <div className="favourite-page">
            <Sidebar />
            <div className="page-content">
                <div className="page-header">
                    <h1>Your Favourites</h1>
                    <h2>Books you've added to your collection</h2>
                    {favouriteBooks.length > 0 && <SearchBar onSearch={handleSearch} onClear={handleClearSearch} />}
                </div>

                {isSearching && (
                    <div className="search-results-info">
                        <p>Searching...</p>
                    </div>
                )}

                {!isSearching && searchSummary && favouriteBooks.length > 0 && (
                    <div className="search-results-info">
                        {filteredBooks.length > 0 ? (
                            <p>Found {filteredBooks.length} book{filteredBooks.length !== 1 ? 's' : ''} for {searchSummary}</p>
                        ) : (
                            <p>No favourite books found for {searchSummary}</p>
                        )}
                    </div>
                )}

                <div className="books-container">
                    {favouriteBooks.length === 0 ? (
                        <div className="empty-favourites">
                            <div className="empty-state">
                                <h3>No favourite books yet</h3>
                                <p>Start exploring the library and add books to your favourites!</p>
                            </div>
                        </div>
                    ) : filteredBooks.length > 0 ? (
                        filteredBooks.map((book) => (
                            <BookCard
                                key={book.id}
                                id={book.id}
                                title={book.title}
                                author={book.author}
                                genre={book.genre}
                                synopsis={book.synopsis}
                                isFavourited={true} // All books on this page are favourited
                                onToggleFavourite={handleToggleFavourite}
                            />
                        ))
                    ) : searchSummary ? (
                        <div className="no-results">
                            <p>No favourite books match your search.</p>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default FavouritePage;