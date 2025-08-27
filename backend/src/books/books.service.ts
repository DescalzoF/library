import type { Book } from '@prisma/client';
import { BooksRepository } from './books.repository.js';
import type { BookSearchFilters } from './books.repository.js';

export interface CreateBookDto {
    title: string;
    author?: string;
    genre?: string;
    synopsis?: string;
}

export interface UpdateBookDto {
    title?: string;
    author?: string;
    genre?: string;
    synopsis?: string;
}

export interface BookWithFavoriteStatus extends Book {
    isFavorite: boolean;
}

export class BooksService {
    private booksRepository: BooksRepository;

    constructor() {
        this.booksRepository = new BooksRepository();
    }

    async getAllBooks(filters?: BookSearchFilters): Promise<BookWithFavoriteStatus[]> {
        try {
            const books = await this.booksRepository.getAllBooks(filters);

            // Add favorite status to each book
            const booksWithFavorites = await Promise.all(
                books.map(async (book) => ({
                    ...book,
                    isFavorite: await this.booksRepository.isBookInFavorites(book.id)
                }))
            );

            return booksWithFavorites;
        } catch (error) {
            throw new Error('Failed to retrieve books');
        }
    }

    async getBookById(id: string): Promise<BookWithFavoriteStatus | null> {
        try {
            const bookId = BigInt(id);
            const book = await this.booksRepository.getBookById(bookId);

            if (!book) {
                return null;
            }

            const isFavorite = await this.booksRepository.isBookInFavorites(bookId);

            return {
                ...book,
                isFavorite
            };
        } catch (error) {
            throw new Error('Invalid book ID or failed to retrieve book');
        }
    }

    async createBook(bookData: CreateBookDto): Promise<BookWithFavoriteStatus> {
        try {
            // Validate required fields
            if (!bookData.title || bookData.title.trim() === '') {
                throw new Error('Book title is required');
            }

            const book = await this.booksRepository.createBook({
                title: bookData.title.trim(),
                author: bookData.author?.trim() || null,
                genre: bookData.genre?.trim() || null,
                synopsis: bookData.synopsis?.trim() || null
            });

            return {
                ...book,
                isFavorite: false
            };
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to create book');
        }
    }

    async updateBook(id: string, bookData: UpdateBookDto): Promise<BookWithFavoriteStatus | null> {
        try {
            const bookId = BigInt(id);

            // Clean up the data
            const cleanData: Partial<Omit<Book, 'id'>> = {};

            if (bookData.title !== undefined) {
                if (bookData.title.trim() === '') {
                    throw new Error('Book title cannot be empty');
                }
                cleanData.title = bookData.title.trim();
            }

            if (bookData.author !== undefined) {
                cleanData.author = bookData.author?.trim() || null;
            }

            if (bookData.genre !== undefined) {
                cleanData.genre = bookData.genre?.trim() || null;
            }

            if (bookData.synopsis !== undefined) {
                cleanData.synopsis = bookData.synopsis?.trim() || null;
            }

            const updatedBook = await this.booksRepository.updateBook(bookId, cleanData);

            if (!updatedBook) {
                return null;
            }

            const isFavorite = await this.booksRepository.isBookInFavorites(bookId);

            return {
                ...updatedBook,
                isFavorite
            };
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Invalid book ID or failed to update book');
        }
    }

    async deleteBook(id: string): Promise<boolean> {
        try {
            const bookId = BigInt(id);
            return await this.booksRepository.deleteBook(bookId);
        } catch (error) {
            throw new Error('Invalid book ID or failed to delete book');
        }
    }

    async addToLibrary(bookId: string): Promise<BookWithFavoriteStatus | null> {
        try {
            const id = BigInt(bookId);
            const favorite = await this.booksRepository.addToFavorites(id);

            if (!favorite) {
                return null;
            }

            const book = await this.booksRepository.getBookById(id);

            if (!book) {
                return null;
            }

            return {
                ...book,
                isFavorite: true
            };
        } catch (error) {
            throw new Error('Invalid book ID or failed to add to library');
        }
    }

    async removeFromLibrary(bookId: string): Promise<boolean> {
        try {
            const id = BigInt(bookId);
            return await this.booksRepository.removeFromFavorites(id);
        } catch (error) {
            throw new Error('Invalid book ID or failed to remove from library');
        }
    }

    async getLibraryBooks(): Promise<BookWithFavoriteStatus[]> {
        try {
            const favoriteBooks = await this.booksRepository.getFavoriteBooks();

            return favoriteBooks.map(book => ({
                ...book,
                isFavorite: true
            }));
        } catch (error) {
            throw new Error('Failed to retrieve library books');
        }
    }
}