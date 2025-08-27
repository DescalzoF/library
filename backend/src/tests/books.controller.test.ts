import request from 'supertest';
import { describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import { BooksController } from '../books/books.controller.js';
import { PrismaClient } from '@prisma/client';
import express from "express";

const prisma = new PrismaClient();

// Create test app
const createTestApp = () => {
    const app = express();
    app.use(express.json());

    const booksController = new BooksController();

    app.get('/api/books', booksController.getAllBooks);
    app.get('/api/books/:id', booksController.getBookById);
    app.post('/api/books', booksController.createBook);
    app.put('/api/books/:id', booksController.updateBook);
    app.delete('/api/books/:id', booksController.deleteBook);
    app.post('/api/books/:id/library', booksController.addToLibrary);
    app.delete('/api/books/:id/library', booksController.removeFromLibrary);
    app.get('/api/library', booksController.getLibraryBooks);

    return app;
};

describe('BooksController', () => {
    let app: express.Application;

    beforeAll(() => {
        app = createTestApp();
    });

    beforeEach(async () => {
        // Clean database before each test
        await prisma.favorite.deleteMany();
        await prisma.book.deleteMany();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('POST /api/books', () => {
        it('should create a new book successfully', async () => {
            const bookData = {
                title: 'Test Book',
                author: 'Test Author',
                genre: 'Fiction',
                synopsis: 'A test book synopsis'
            };

            const response = await request(app)
                .post('/api/books')
                .send(bookData)
                .expect(201);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Book created successfully',
                data: {
                    title: 'Test Book',
                    author: 'Test Author',
                    genre: 'Fiction',
                    synopsis: 'A test book synopsis',
                    isFavorite: false
                }
            });

            expect(response.body.data.id).toBeDefined();
        });

        it('should fail to create book without title', async () => {
            const bookData = {
                author: 'Test Author',
                genre: 'Fiction'
            };

            const response = await request(app)
                .post('/api/books')
                .send(bookData)
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Book title is required'
            });
        });

        it('should create book with only title (minimal data)', async () => {
            const bookData = {
                title: 'Minimal Book'
            };

            const response = await request(app)
                .post('/api/books')
                .send(bookData)
                .expect(201);

            expect(response.body.data).toMatchObject({
                title: 'Minimal Book',
                author: null,
                genre: null,
                synopsis: null,
                isFavorite: false
            });
        });
    });

    describe('GET /api/books', () => {
        beforeEach(async () => {
            // Create test books
            await prisma.book.createMany({
                data: [
                    { title: 'Book 1', author: 'Author 1', genre: 'Fiction' },
                    { title: 'Book 2', author: 'Author 2', genre: 'Non-Fiction' },
                    { title: 'Another Book', author: 'Author 1', genre: 'Fiction' }
                ]
            });
        });

        it('should get all books', async () => {
            const response = await request(app)
                .get('/api/books')
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                count: 3
            });

            expect(response.body.data).toHaveLength(3);
            expect(response.body.data[0]).toHaveProperty('isFavorite', false);
        });

        it('should filter books by title', async () => {
            const response = await request(app)
                .get('/api/books?title=Another')
                .expect(200);

            expect(response.body.count).toBe(1);
            expect(response.body.data[0].title).toBe('Another Book');
        });

        it('should filter books by author', async () => {
            const response = await request(app)
                .get('/api/books?author=Author 1')
                .expect(200);

            expect(response.body.count).toBe(2);
        });
    });

    describe('GET /api/books/:id', () => {
        let bookId: string;

        beforeEach(async () => {
            const book = await prisma.book.create({
                data: {
                    title: 'Test Book',
                    author: 'Test Author',
                    genre: 'Fiction'
                }
            });
            bookId = book.id.toString();
        });

        it('should get book by id', async () => {
            const response = await request(app)
                .get(`/api/books/${bookId}`)
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                data: {
                    title: 'Test Book',
                    author: 'Test Author',
                    genre: 'Fiction',
                    isFavorite: false
                }
            });
        });

        it('should return 404 for non-existent book', async () => {
            const response = await request(app)
                .get('/api/books/999999')
                .expect(404);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Book not found'
            });
        });

        it('should return 400 for invalid book id', async () => {
            const response = await request(app)
                .get('/api/books/invalid-id')
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Invalid book ID or failed to retrieve book'
            });
        });
    });

    describe('PUT /api/books/:id', () => {
        let bookId: string;

        beforeEach(async () => {
            const book = await prisma.book.create({
                data: {
                    title: 'Original Title',
                    author: 'Original Author',
                    genre: 'Original Genre'
                }
            });
            bookId = book.id.toString();
        });

        it('should update book successfully', async () => {
            const updateData = {
                title: 'Updated Title',
                author: 'Updated Author'
            };

            const response = await request(app)
                .put(`/api/books/${bookId}`)
                .send(updateData)
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Book updated successfully',
                data: {
                    title: 'Updated Title',
                    author: 'Updated Author',
                    genre: 'Original Genre' // Should remain unchanged
                }
            });
        });

        it('should return 404 for non-existent book', async () => {
            const response = await request(app)
                .put('/api/books/999999')
                .send({ title: 'New Title' })
                .expect(404);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Book not found'
            });
        });

        it('should fail to update with empty title', async () => {
            const response = await request(app)
                .put(`/api/books/${bookId}`)
                .send({ title: '' })
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Failed to update book'
            });
        });
    });

    describe('DELETE /api/books/:id', () => {
        let bookId: string;

        beforeEach(async () => {
            const book = await prisma.book.create({
                data: {
                    title: 'Book to Delete',
                    author: 'Test Author'
                }
            });
            bookId = book.id.toString();
        });

        it('should delete book successfully', async () => {
            const response = await request(app)
                .delete(`/api/books/${bookId}`)
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Book deleted successfully'
            });

            // Verify book is actually deleted
            const deletedBook = await prisma.book.findUnique({
                where: { id: BigInt(bookId) }
            });
            expect(deletedBook).toBeNull();
        });

        it('should return 404 for non-existent book', async () => {
            const response = await request(app)
                .delete('/api/books/999999')
                .expect(404);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Book not found'
            });
        });
    });

    describe('Library/Favorites functionality', () => {
        let bookId: string;

        beforeEach(async () => {
            const book = await prisma.book.create({
                data: {
                    title: 'Library Test Book',
                    author: 'Test Author'
                }
            });
            bookId = book.id.toString();
        });

        describe('POST /api/books/:id/library', () => {
            it('should add book to library successfully', async () => {
                const response = await request(app)
                    .post(`/api/books/${bookId}/library`)
                    .expect(200);

                expect(response.body).toMatchObject({
                    success: true,
                    message: 'Book added to library successfully',
                    data: {
                        title: 'Library Test Book',
                        isFavorite: true
                    }
                });
            });

            it('should handle adding same book to library twice', async () => {
                // Add to library first time
                await request(app)
                    .post(`/api/books/${bookId}/library`)
                    .expect(200);

                // Add to library second time
                const response = await request(app)
                    .post(`/api/books/${bookId}/library`)
                    .expect(200);

                expect(response.body.success).toBe(true);
            });

            it('should return 404 for non-existent book', async () => {
                const response = await request(app)
                    .post('/api/books/999999/library')
                    .expect(404);

                expect(response.body).toMatchObject({
                    success: false,
                    message: 'Book not found'
                });
            });
        });

        describe('DELETE /api/books/:id/library', () => {
            beforeEach(async () => {
                // Add book to library first
                await prisma.favorite.create({
                    data: { book_id: BigInt(bookId) }
                });
            });

            it('should remove book from library successfully', async () => {
                const response = await request(app)
                    .delete(`/api/books/${bookId}/library`)
                    .expect(200);

                expect(response.body).toMatchObject({
                    success: true,
                    message: 'Book removed from library successfully'
                });
            });

            it('should return 404 when book not in library', async () => {
                // Remove from library first
                await prisma.favorite.deleteMany({
                    where: { book_id: BigInt(bookId) }
                });

                const response = await request(app)
                    .delete(`/api/books/${bookId}/library`)
                    .expect(404);

                expect(response.body).toMatchObject({
                    success: false,
                    message: 'Book not found in library'
                });
            });
        });

        describe('GET /api/library', () => {
            beforeEach(async () => {
                // Create additional books and add some to favorites
                const book2 = await prisma.book.create({
                    data: { title: 'Library Book 2', author: 'Author 2' }
                });

                await prisma.favorite.createMany({
                    data: [
                        { book_id: BigInt(bookId) },
                        { book_id: book2.id }
                    ]
                });
            });

            it('should get all library books', async () => {
                const response = await request(app)
                    .get('/api/library')
                    .expect(200);

                expect(response.body).toMatchObject({
                    success: true,
                    count: 2
                });

                expect(response.body.data).toHaveLength(2);
                expect(response.body.data[0]).toHaveProperty('isFavorite', true);
                expect(response.body.data[1]).toHaveProperty('isFavorite', true);
            });

            it('should return empty array when no books in library', async () => {
                // Clear all favorites
                await prisma.favorite.deleteMany();

                const response = await request(app)
                    .get('/api/library')
                    .expect(200);

                expect(response.body).toMatchObject({
                    success: true,
                    count: 0,
                    data: []
                });
            });
        });
    });

    describe('Integration tests', () => {
        it('should show correct favorite status after adding to library', async () => {
            // Create a book
            const createResponse = await request(app)
                .post('/api/books')
                .send({ title: 'Integration Test Book' })
                .expect(201);

            const bookId = createResponse.body.data.id;

            // Initially should not be favorite
            let getResponse = await request(app)
                .get(`/api/books/${bookId}`)
                .expect(200);

            expect(getResponse.body.data.isFavorite).toBe(false);

            // Add to library
            await request(app)
                .post(`/api/books/${bookId}/library`)
                .expect(200);

            // Now should be favorite
            getResponse = await request(app)
                .get(`/api/books/${bookId}`)
                .expect(200);

            expect(getResponse.body.data.isFavorite).toBe(true);

            // Should appear in library
            const libraryResponse = await request(app)
                .get('/api/library')
                .expect(200);

            expect(libraryResponse.body.count).toBe(1);
            expect(libraryResponse.body.data[0].id).toBe(bookId);
        });
    });
});