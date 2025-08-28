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
    search?: string; // Add general search parameter
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