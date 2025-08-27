import { PrismaClient } from '@prisma/client';
import type { Book, Favorite } from '@prisma/client';

const prisma = new PrismaClient();

export interface BookSearchFilters {
    title?: string;
    author?: string;
    genre?: string;
}

export class BooksRepository {
    async getAllBooks(filters?: BookSearchFilters): Promise<Book[]> {
        const where: any = {};

        if (filters?.title) {
            where.title = { contains: filters.title, mode: 'insensitive' };
        }

        if (filters?.author) {
            where.author = { contains: filters.author, mode: 'insensitive' };
        }

        if (filters?.genre) {
            where.genre = { contains: filters.genre, mode: 'insensitive' };
        }

        return prisma.book.findMany({
            where,
            orderBy: {title: 'asc'}
        });
    }

    async getBookById(id: bigint): Promise<Book | null> {
        return prisma.book.findUnique({
            where: {id}
        });
    }

    async createBook(bookData: Omit<Book, 'id'>): Promise<Book> {
        return prisma.book.create({
            data: bookData
        });
    }

    async updateBook(id: bigint, bookData: Partial<Omit<Book, 'id'>>): Promise<Book | null> {
        try {
            return await prisma.book.update({
                where: { id },
                data: bookData
            });
        } catch (error) {
            return null;
        }
    }

    async deleteBook(id: bigint): Promise<boolean> {
        try {
            await prisma.book.delete({
                where: { id }
            });
            return true;
        } catch (error) {
            return false;
        }
    }

    async addToFavorites(bookId: bigint): Promise<Favorite | null> {
        try {
            // Check if book exists
            const book = await this.getBookById(bookId);
            if (!book) {
                return null;
            }

            // Check if already in favorites
            const existingFavorite = await prisma.favorite.findFirst({
                where: { book_id: bookId }
            });

            if (existingFavorite) {
                return existingFavorite;
            }

            return await prisma.favorite.create({
                data: { book_id: bookId }
            });
        } catch (error) {
            return null;
        }
    }

    async removeFromFavorites(bookId: bigint): Promise<boolean> {
        try {
            const result = await prisma.favorite.deleteMany({
                where: { book_id: bookId }
            });
            return result.count > 0;
        } catch (error) {
            return false;
        }
    }

    async getFavoriteBooks(): Promise<Book[]> {
        const favorites = await prisma.favorite.findMany({
            include: {
                books: true
            }
        });

        return favorites
            .map(favorite => favorite.books)
            .filter((book): book is Book => book !== null);
    }

    async isBookInFavorites(bookId: bigint): Promise<boolean> {
        const favorite = await prisma.favorite.findFirst({
            where: { book_id: bookId }
        });
        return !!favorite;
    }
}