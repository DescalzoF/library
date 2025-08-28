const API_BASE_URL = 'http://localhost:5174/api';

export interface Book {
    id: string;
    title: string;
    author: string | null;
    genre: string | null;
    synopsis: string | null;
    isFavorite: boolean;
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
    search?: string; // General search parameter
}

export const booksApi = {
    getAllBooks: async (filters?: SearchFilters): Promise<ApiResponse<Book[]>> => {
        try {
            let url = `${API_BASE_URL}/books`;

            if (filters) {
                const params = new URLSearchParams();

                // If general search is provided, use it (takes priority)
                if (filters.search?.trim()) {
                    params.append('search', filters.search.trim());
                } else {
                    // Otherwise, use individual field filters
                    if (filters.title?.trim()) params.append('title', filters.title.trim());
                    if (filters.author?.trim()) params.append('author', filters.author.trim());
                    if (filters.genre?.trim()) params.append('genre', filters.genre.trim());
                }

                if (params.toString()) {
                    url += `?${params.toString()}`;
                }
            }

            const response = await fetch(url);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching books:', error);
            throw error;
        }
    },

    // New method: Search by title only using dedicated endpoint
    getBooksByTitle: async (title: string): Promise<ApiResponse<Book[]>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/books/search/title?title=${encodeURIComponent(title)}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching books by title:', error);
            throw error;
        }
    },

    // New method: Search by author only using dedicated endpoint
    getBooksByAuthor: async (author: string): Promise<ApiResponse<Book[]>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/books/search/author?author=${encodeURIComponent(author)}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching books by author:', error);
            throw error;
        }
    },

    // New method: Search by genre only using dedicated endpoint
    getBooksByGenre: async (genre: string): Promise<ApiResponse<Book[]>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/books/search/genre?genre=${encodeURIComponent(genre)}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching books by genre:', error);
            throw error;
        }
    },

    // New method: General search across all fields using dedicated endpoint
    searchBooks: async (searchTerm: string): Promise<ApiResponse<Book[]>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(searchTerm)}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error searching books:', error);
            throw error;
        }
    },

    getLibraryBooks: async (): Promise<ApiResponse<Book[]>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/library`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
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
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
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
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error removing from library:', error);
            throw error;
        }
    }
};