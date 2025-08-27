const API_BASE_URL = 'http://localhost:5174/api';

export interface Book {
    id: string;
    name: string;
    author: string;
    genre: string;
    synopsis: string;
    isInLibrary?: boolean;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export const booksApi = {
    getAllBooks: async (): Promise<ApiResponse<Book[]>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/books`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching all books:', error);
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

    addToLibrary: async (bookId: string): Promise<ApiResponse<any>> => {
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

    searchBooks: async (query: string): Promise<ApiResponse<Book[]>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/books?search=${encodeURIComponent(query)}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error searching books:', error);
            throw error;
        }
    }
};