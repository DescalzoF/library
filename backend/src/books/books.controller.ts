import type { Request, Response } from 'express';
import { BooksService } from './books.service.js';
import type { BookSearchFilters } from './books.repository.js';

export class BooksController {
    private booksService: BooksService;

    constructor() {
        this.booksService = new BooksService();
    }

    // Helper method to convert BigInt values to strings
    private serializeBigInt(obj: any): any {
        return JSON.parse(JSON.stringify(obj, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));
    }

    getAllBooks = async (req: Request, res: Response): Promise<void> => {
        try {
            const { title, author, genre, search } = req.query;

            const filters: BookSearchFilters = {};

            // Priority to general search if provided
            if (typeof search === 'string' && search.trim()) {
                filters.search = search.trim();
            } else {
                // Individual field filters
                if (typeof title === 'string' && title.trim()) {
                    filters.title = title.trim();
                }

                if (typeof author === 'string' && author.trim()) {
                    filters.author = author.trim();
                }

                if (typeof genre === 'string' && genre.trim()) {
                    filters.genre = genre.trim();
                }
            }

            const books = await this.booksService.getAllBooks(filters);

            // Serialize BigInt values before sending response
            const serializedBooks = this.serializeBigInt(books);

            res.json({
                success: true,
                data: serializedBooks,
                count: serializedBooks.length
            });
        } catch (error) {
            console.error('Error retrieving books:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve books',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    // New endpoint: Search books by title only
    getBooksByTitle = async (req: Request, res: Response): Promise<void> => {
        try {
            const { title } = req.query;

            if (!title || typeof title !== 'string' || !title.trim()) {
                res.status(400).json({
                    success: false,
                    message: 'Title parameter is required'
                });
                return;
            }

            const books = await this.booksService.getBooksByTitle(title.trim());
            const serializedBooks = this.serializeBigInt(books);

            res.json({
                success: true,
                data: serializedBooks,
                count: serializedBooks.length,
                message: `Found ${serializedBooks.length} book(s) with title containing "${title.trim()}"`
            });
        } catch (error) {
            console.error('Error searching books by title:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to search books by title',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    // New endpoint: Search books by author only
    getBooksByAuthor = async (req: Request, res: Response): Promise<void> => {
        try {
            const { author } = req.query;

            if (!author || typeof author !== 'string' || !author.trim()) {
                res.status(400).json({
                    success: false,
                    message: 'Author parameter is required'
                });
                return;
            }

            const books = await this.booksService.getBooksByAuthor(author.trim());
            const serializedBooks = this.serializeBigInt(books);

            res.json({
                success: true,
                data: serializedBooks,
                count: serializedBooks.length,
                message: `Found ${serializedBooks.length} book(s) by author containing "${author.trim()}"`
            });
        } catch (error) {
            console.error('Error searching books by author:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to search books by author',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    // New endpoint: Search books by genre only
    getBooksByGenre = async (req: Request, res: Response): Promise<void> => {
        try {
            const { genre } = req.query;

            if (!genre || typeof genre !== 'string' || !genre.trim()) {
                res.status(400).json({
                    success: false,
                    message: 'Genre parameter is required'
                });
                return;
            }

            const books = await this.booksService.getBooksByGenre(genre.trim());
            const serializedBooks = this.serializeBigInt(books);

            res.json({
                success: true,
                data: serializedBooks,
                count: serializedBooks.length,
                message: `Found ${serializedBooks.length} book(s) in genre containing "${genre.trim()}"`
            });
        } catch (error) {
            console.error('Error searching books by genre:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to search books by genre',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    // New endpoint: General search across all fields
    searchBooks = async (req: Request, res: Response): Promise<void> => {
        try {
            const { q } = req.query;

            if (!q || typeof q !== 'string' || !q.trim()) {
                res.status(400).json({
                    success: false,
                    message: 'Search query parameter "q" is required'
                });
                return;
            }

            const books = await this.booksService.searchBooks(q.trim());
            const serializedBooks = this.serializeBigInt(books);

            res.json({
                success: true,
                data: serializedBooks,
                count: serializedBooks.length,
                message: `Found ${serializedBooks.length} book(s) matching "${q.trim()}"`
            });
        } catch (error) {
            console.error('Error searching books:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to search books',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    // GET /api/books/:id - Retrieve a single book by ID
    getBookById = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;

            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'Book ID is required'
                });
                return;
            }

            const book = await this.booksService.getBookById(id);

            if (!book) {
                res.status(404).json({
                    success: false,
                    message: 'Book not found'
                });
                return;
            }

            // Serialize BigInt values before sending response
            const serializedBook = this.serializeBigInt(book);

            res.json({
                success: true,
                data: serializedBook
            });
        } catch (error) {
            console.error('Error retrieving book:', error);
            res.status(400).json({
                success: false,
                message: 'Invalid book ID or failed to retrieve book',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    addToLibrary = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;

            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'Book ID is required'
                });
                return;
            }

            const book = await this.booksService.addToLibrary(id);

            if (!book) {
                res.status(404).json({
                    success: false,
                    message: 'Book not found'
                });
                return;
            }
            const serializedBook = this.serializeBigInt(book);

            res.json({
                success: true,
                data: serializedBook,
                message: 'Book added to library successfully'
            });
        } catch (error) {
            console.error('Error adding book to library:', error);
            res.status(400).json({
                success: false,
                message: 'Failed to add book to library',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    removeFromLibrary = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;

            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'Book ID is required'
                });
                return;
            }

            const removed = await this.booksService.removeFromLibrary(id);

            if (!removed) {
                res.status(404).json({
                    success: false,
                    message: 'Book not found in library'
                });
                return;
            }

            res.json({
                success: true,
                message: 'Book removed from library successfully'
            });
        } catch (error) {
            console.error('Error removing book from library:', error);
            res.status(400).json({
                success: false,
                message: 'Failed to remove book from library',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    getLibraryBooks = async (req: Request, res: Response): Promise<void> => {
        try {
            const libraryBooks = await this.booksService.getLibraryBooks();

            // Serialize BigInt values before sending response
            const serializedBooks = this.serializeBigInt(libraryBooks);

            res.json({
                success: true,
                data: serializedBooks,
                count: serializedBooks.length
            });
        } catch (error) {
            console.error('Error retrieving library books:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve library books',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
}