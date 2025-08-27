import type { Request, Response } from 'express';
import { BooksService } from './books.service.js';
import type { CreateBookDto, UpdateBookDto } from './books.service.js';
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
            const { title, author, genre } = req.query;

            const filters: BookSearchFilters = {};

            if (typeof title === 'string' && title.trim()) {
                filters.title = title.trim();
            }

            if (typeof author === 'string' && author.trim()) {
                filters.author = author.trim();
            }

            if (typeof genre === 'string' && genre.trim()) {
                filters.genre = genre.trim();
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

    // POST /api/books - Create a new book
    createBook = async (req: Request, res: Response): Promise<void> => {
        try {
            const bookData: CreateBookDto = req.body;

            if (!bookData.title) {
                res.status(400).json({
                    success: false,
                    message: 'Book title is required'
                });
                return;
            }

            const book = await this.booksService.createBook(bookData);

            // Serialize BigInt values before sending response
            const serializedBook = this.serializeBigInt(book);

            res.status(201).json({
                success: true,
                data: serializedBook,
                message: 'Book created successfully'
            });
        } catch (error) {
            console.error('Error creating book:', error);
            res.status(400).json({
                success: false,
                message: 'Failed to create book',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    // PUT /api/books/:id - Update a book
    updateBook = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const bookData: UpdateBookDto = req.body;

            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'Book ID is required'
                });
                return;
            }

            const updatedBook = await this.booksService.updateBook(id, bookData);

            if (!updatedBook) {
                res.status(404).json({
                    success: false,
                    message: 'Book not found'
                });
                return;
            }

            // Serialize BigInt values before sending response
            const serializedBook = this.serializeBigInt(updatedBook);

            res.json({
                success: true,
                data: serializedBook,
                message: 'Book updated successfully'
            });
        } catch (error) {
            console.error('Error updating book:', error);
            res.status(400).json({
                success: false,
                message: 'Failed to update book',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    // DELETE /api/books/:id - Delete a book
    deleteBook = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;

            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'Book ID is required'
                });
                return;
            }

            const deleted = await this.booksService.deleteBook(id);

            if (!deleted) {
                res.status(404).json({
                    success: false,
                    message: 'Book not found'
                });
                return;
            }

            res.json({
                success: true,
                message: 'Book deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting book:', error);
            res.status(400).json({
                success: false,
                message: 'Failed to delete book',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    // POST /api/books/:id/library - Add a book to the global library (favorites)
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

            // Serialize BigInt values before sending response
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

    // DELETE /api/books/:id/library - Remove a book from the global library
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

    // GET /api/library - Retrieve all books in the global library
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