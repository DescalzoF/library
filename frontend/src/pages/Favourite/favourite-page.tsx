import { useState, useEffect } from 'react';
import Sidebar from "../../components/ui/Sidebar";
import SearchBar from "../../components/ui/Searchbar";
import BookCard from "../../components/ui/Card";
import { booksApi, type Book } from '../../api/bookAPI';
import './styles.css';

const FavouritePage = () => {
    const [favouriteBooks, setFavouriteBooks] = useState<Book[]>([]);
    const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadFavouriteBooks();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredBooks(favouriteBooks);
        } else {
            const filtered = favouriteBooks.filter(book =>
                book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                book.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                book.synopsis.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredBooks(filtered);
        }
    }, [favouriteBooks, searchQuery]);

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

    const handleSearch = (query: string) => {
        setSearchQuery(query);
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

    return (
        <div className="favourite-page">
            <Sidebar />
            <div className="page-content">
                <div className="page-header">
                    <h1>Your Favourites</h1>
                    <h2>Books you've added to your collection</h2>
                    {favouriteBooks.length > 0 && <SearchBar onSearch={handleSearch} />}
                </div>

                {searchQuery && favouriteBooks.length > 0 && (
                    <div className="search-results-info">
                        {filteredBooks.length > 0 ? (
                            <p>Found {filteredBooks.length} book{filteredBooks.length !== 1 ? 's' : ''} for "{searchQuery}"</p>
                        ) : (
                            <p>No favourite books found for "{searchQuery}"</p>
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
                    ) : searchQuery ? (
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