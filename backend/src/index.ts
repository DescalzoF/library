import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { BooksController } from './books/books.controller.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5174;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const booksController = new BooksController();

app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Books API Server is running',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/books', booksController.getAllBooks);
app.get('/api/books/:id', booksController.getBookById);

app.get('/api/books/search/title', booksController.getBooksByTitle);
app.get('/api/books/search/author', booksController.getBooksByAuthor);
app.get('/api/books/search/genre', booksController.getBooksByGenre);
app.get('/api/search', booksController.searchBooks);

app.post('/api/books/:id/library', booksController.addToLibrary);
app.delete('/api/books/:id/library', booksController.removeFromLibrary);
app.get('/api/library', booksController.getLibraryBooks);

app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        availableEndpoints: [
            'GET /health',
            'GET /api/books',
            'GET /api/books/:id',
            'GET /api/books/search/title?title=searchTerm',
            'GET /api/books/search/author?author=searchTerm',
            'GET /api/books/search/genre?genre=searchTerm',
            'GET /api/search?q=searchTerm',
            'POST /api/books/:id/library',
            'DELETE /api/books/:id/library',
            'GET /api/library'
        ]
    });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Books API server is running on port ${PORT}`);
    console.log(`📚 Health check: http://localhost:${PORT}/health`);
});