import type {Book} from '@prisma/client';
import type {BookSearchFilters} from './books.repository.js';
import {BooksRepository} from './books.repository.js';

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

            return await Promise.all(
                books.map(async (book) => ({
                    ...book,
                    isFavorite: await this.booksRepository.isBookInFavorites(book.id)
                }))
            );
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