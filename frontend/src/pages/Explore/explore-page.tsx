import { useState, useEffect } from 'react';
import './styles.css';
import Sidebar from "../../components/ui/Sidebar";
import SearchBar from "../../components/ui/Searchbar";
import BookCard from "../../components/ui/Card";
import { booksApi, type Book } from '../../api/bookAPI';

const ExplorePage = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
    const [libraryBooks, setLibraryBooks] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredBooks(books);
        } else {
            const filtered = books.filter(book =>
                book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                book.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                book.synopsis.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredBooks(filtered);
        }
    }, [books, searchQuery]);

    const loadData = async () => {
        setLoading(true);
        setError(null);

        try {
            // Load all books and library books in parallel
            const [booksResponse, libraryResponse] = await Promise.all([
                booksApi.getAllBooks(),
                booksApi.getLibraryBooks()
            ]);

            if (booksResponse.success) {
                setBooks(booksResponse.data);
            } else {
                throw new Error(booksResponse.message || 'Failed to load books');
            }

            if (libraryResponse.success) {
                const libraryIds = new Set(libraryResponse.data.map(book => book.id));
                setLibraryBooks(libraryIds);
            } else {
                console.warn('Failed to load library books:', libraryResponse.message);
            }
        } catch (err) {
            console.error('Error loading data:', err);
            setError(err instanceof Error ? err.message : 'Failed to load data');
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
                    setLibraryBooks(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(bookId);
                        return newSet;
                    });
                } else {
                    throw new Error(response.message || 'Failed to remove from favourites');
                }
            } else {
                const response = await booksApi.addToLibrary(bookId);
                if (response.success) {
                    setLibraryBooks(prev => new Set([...prev, bookId]));
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
            <div className="explore-page">
                <Sidebar />
                <div className="page-content">
                    <div className="page-header">
                        <h1>Library</h1>
                        <h2>Loading books...</h2>
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
            <div className="explore-page">
                <Sidebar />
                <div className="page-content">
                    <div className="page-header">
                        <h1>Library</h1>
                        <h2>Error loading books</h2>
                    </div>
                    <div className="error-message">
                        <p>{error}</p>
                        <button onClick={loadData} className="retry-button">
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="explore-page">
            <Sidebar />
            <div className="page-content">
                <div className="page-header">
                    <h1>Library</h1>
                    <h2>Our catalog of books</h2>
                    <SearchBar onSearch={handleSearch} />
                </div>

                {searchQuery && (
                    <div className="search-results-info">
                        {filteredBooks.length > 0 ? (
                            <p>Found {filteredBooks.length} book{filteredBooks.length !== 1 ? 's' : ''} for "{searchQuery}"</p>
                        ) : (
                            <p>No books found for "{searchQuery}"</p>
                        )}
                    </div>
                )}

                <div className="books-container">
                    {filteredBooks.length > 0 ? (
                        filteredBooks.map((book) => (
                            <BookCard
                                key={book.id}
                                id={book.id}
                                name={book.name}
                                author={book.author}
                                genre={book.genre}
                                synopsis={book.synopsis}
                                isFavourited={libraryBooks.has(book.id)}
                                onToggleFavourite={handleToggleFavourite}
                            />
                        ))
                    ) : !searchQuery ? (
                        <div className="no-books-message">
                            <p>No books available in the catalog.</p>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default ExplorePage;