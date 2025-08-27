import React, { useState } from 'react';
import './styles.css';

export interface SearchFilters {
    title?: string;
    author?: string;
    genre?: string;
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
            // Search across all fields for simple search
            onSearch({
                title: simpleQuery.trim(),
                author: simpleQuery.trim(),
                genre: simpleQuery.trim()
            });
        } else {
            handleClear();
        }
    };

    const handleAdvancedSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const activeFilters: SearchFilters = {};

        if (filters.title?.trim()) activeFilters.title = filters.title.trim();
        if (filters.author?.trim()) activeFilters.author = filters.author.trim();
        if (filters.genre?.trim()) activeFilters.genre = filters.genre.trim();

        onSearch(activeFilters);
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
                            <input
                                id="title-filter"
                                type="text"
                                value={filters.title || ''}
                                onChange={(e) => updateFilter('title', e.target.value)}
                                placeholder="Search by title..."
                                className="search-input filter-input"
                            />
                        </div>
                        <div className="filter-group">
                            <label htmlFor="author-filter">Author:</label>
                            <input
                                id="author-filter"
                                type="text"
                                value={filters.author || ''}
                                onChange={(e) => updateFilter('author', e.target.value)}
                                placeholder="Search by author..."
                                className="search-input filter-input"
                            />
                        </div>
                        <div className="filter-group">
                            <label htmlFor="genre-filter">Genre:</label>
                            <input
                                id="genre-filter"
                                type="text"
                                value={filters.genre || ''}
                                onChange={(e) => updateFilter('genre', e.target.value)}
                                placeholder="Search by genre..."
                                className="search-input filter-input"
                            />
                        </div>
                    </div>
                    <div className="search-actions">
                        <button type="submit" className="search-button">
                            SEARCH
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