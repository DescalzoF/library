const API_BASE_URL = 'http://localhost:5174/api';

export interface Book {
    id: string;
    title: string;  // Changed from 'name' to 'title' to match backend
    author: string | null;
    genre: string | null;
    synopsis: string | null;
    isFavorite: boolean;  // Changed from 'isInLibrary' to match backend
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    count?: number;
}

export interface SearchFilters {
    title?: string;
    author?: string;
    genre?: string;
}

export const booksApi = {
    getAllBooks: async (filters?: SearchFilters): Promise<ApiResponse<Book[]>> => {
        try {
            let url = `${API_BASE_URL}/books`;

            if (filters) {
                const params = new URLSearchParams();
                if (filters.title) params.append('title', filters.title);
                if (filters.author) params.append('author', filters.author);
                if (filters.genre) params.append('genre', filters.genre);

                if (params.toString()) {
                    url += `?${params.toString()}`;
                }
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching books:', error);
            throw error;
        }
    },

    getBookById: async (id: string): Promise<ApiResponse<Book>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/books/${id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching book:', error);
            throw error;
        }
    },

    createBook: async (bookData: {
        title: string;
        author?: string;
        genre?: string;
        synopsis?: string;
    }): Promise<ApiResponse<Book>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/books`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookData),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error creating book:', error);
            throw error;
        }
    },

    updateBook: async (id: string, bookData: {
        title?: string;
        author?: string;
        genre?: string;
        synopsis?: string;
    }): Promise<ApiResponse<Book>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/books/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookData),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error updating book:', error);
            throw error;
        }
    },

    deleteBook: async (id: string): Promise<ApiResponse<any>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/books/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error deleting book:', error);
            throw error;
        }
    },

    getLibraryBooks: async (): Promise<ApiResponse<Book[]>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/library`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching library books:', error);
            throw error;
        }
    },

    addToLibrary: async (bookId: string): Promise<ApiResponse<Book>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/books/${bookId}/library`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error adding to library:', error);
            throw error;
        }
    },

    removeFromLibrary: async (bookId: string): Promise<ApiResponse<any>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/books/${bookId}/library`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error removing from library:', error);
            throw error;
        }
    },

    // Utility method for simple text search across all fields
    searchBooks: async (query: string): Promise<ApiResponse<Book[]>> => {
        try {
            const filters: SearchFilters = {
                title: query,
                author: query,
                genre: query
            };
            return await booksApi.getAllBooks(filters);
        } catch (error) {
            console.error('Error searching books:', error);
            throw error;
        }
    }
};