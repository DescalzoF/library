import React, { useState } from 'react';
import './styles.css';

export interface SearchFilters {
    title?: string;
    author?: string;
    genre?: string;
    search?: string;
}

interface SearchBarProps {
    onSearch: (filters: SearchFilters) => void;
    onClear?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onClear }) => {
    const [searchType, setSearchType] = useState<'simple' | 'advanced'>('simple');
    const [simpleQuery, setSimpleQuery] = useState('');
    const [filters, setFilters] = useState<SearchFilters>({
        title: '',
        author: '',
        genre: ''
    });

    const handleSimpleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (simpleQuery.trim()) {
            // Use the general search parameter for simple search
            onSearch({
                search: simpleQuery.trim()
            });
        } else {
            handleClear();
        }
    };

    const handleAdvancedSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const activeFilters: SearchFilters = {};

        // Only include filters that have values
        if (filters.title?.trim()) activeFilters.title = filters.title.trim();
        if (filters.author?.trim()) activeFilters.author = filters.author.trim();
        if (filters.genre?.trim()) activeFilters.genre = filters.genre.trim();

        // If no filters are active, clear the search
        if (Object.keys(activeFilters).length === 0) {
            handleClear();
        } else {
            onSearch(activeFilters);
        }
    };

    const handleClear = () => {
        setSimpleQuery('');
        setFilters({ title: '', author: '', genre: '' });
        if (onClear) {
            onClear();
        } else {
            onSearch({});
        }
    };

    const updateFilter = (field: keyof SearchFilters, value: string) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    // Quick search buttons for common searches
    const handleQuickSearch = (type: 'title' | 'author' | 'genre', value: string) => {
        if (value.trim()) {
            onSearch({ [type]: value.trim() });
        }
    };

    return (
        <div className="search-container">
            <div className="search-type-toggle">
                <button
                    type="button"
                    className={`toggle-button ${searchType === 'simple' ? 'active' : ''}`}
                    onClick={() => setSearchType('simple')}
                >
                    SIMPLE SEARCH
                </button>
                <button
                    type="button"
                    className={`toggle-button ${searchType === 'advanced' ? 'active' : ''}`}
                    onClick={() => setSearchType('advanced')}
                >
                    ADVANCED SEARCH
                </button>
            </div>

            {searchType === 'simple' ? (
                <form className="search-bar simple-search" onSubmit={handleSimpleSearch}>
                    <input
                        type="text"
                        value={simpleQuery}
                        onChange={(e) => setSimpleQuery(e.target.value)}
                        placeholder="Search books by title, author, or genre..."
                        className="search-input"
                    />
                    <button type="submit" className="search-button">
                        SEARCH
                    </button>
                    <button type="button" className="clear-button" onClick={handleClear}>
                        CLEAR
                    </button>
                </form>
            ) : (
                <form className="search-bar advanced-search" onSubmit={handleAdvancedSearch}>
                    <div className="advanced-filters">
                        <div className="filter-group">
                            <label htmlFor="title-filter">Title:</label>
                            <div className="filter-input-group">
                                <input
                                    id="title-filter"
                                    type="text"
                                    value={filters.title || ''}
                                    onChange={(e) => updateFilter('title', e.target.value)}
                                    placeholder="Search by title..."
                                    className="search-input filter-input"
                                />
                                <button
                                    type="button"
                                    className="quick-search-btn"
                                    onClick={() => handleQuickSearch('title', filters.title || '')}
                                    disabled={!filters.title?.trim()}
                                >
                                    Search Title
                                </button>
                            </div>
                        </div>
                        <div className="filter-group">
                            <label htmlFor="author-filter">Author:</label>
                            <div className="filter-input-group">
                                <input
                                    id="author-filter"
                                    type="text"
                                    value={filters.author || ''}
                                    onChange={(e) => updateFilter('author', e.target.value)}
                                    placeholder="Search by author..."
                                    className="search-input filter-input"
                                />
                                <button
                                    type="button"
                                    className="quick-search-btn"
                                    onClick={() => handleQuickSearch('author', filters.author || '')}
                                    disabled={!filters.author?.trim()}
                                >
                                    Search Author
                                </button>
                            </div>
                        </div>
                        <div className="filter-group">
                            <label htmlFor="genre-filter">Genre:</label>
                            <div className="filter-input-group">
                                <input
                                    id="genre-filter"
                                    type="text"
                                    value={filters.genre || ''}
                                    onChange={(e) => updateFilter('genre', e.target.value)}
                                    placeholder="Search by genre..."
                                    className="search-input filter-input"
                                />
                                <button
                                    type="button"
                                    className="quick-search-btn"
                                    onClick={() => handleQuickSearch('genre', filters.genre || '')}
                                    disabled={!filters.genre?.trim()}
                                >
                                    Search Genre
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="search-actions">
                        <button type="submit" className="search-button">
                            SEARCH ALL FILTERS
                        </button>
                        <button type="button" className="clear-button" onClick={handleClear}>
                            CLEAR
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default SearchBar;