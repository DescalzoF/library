import { useState } from 'react';
import './styles.css';

type FavouriteButtonProps = {
    bookId: string;
    isFavourited: boolean;
    onToggleFavourite: (bookId: string, isFavourited: boolean) => void;
};

const FavouriteButton = ({ bookId, isFavourited, onToggleFavourite }: FavouriteButtonProps) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async () => {
        setIsLoading(true);
        try {
            onToggleFavourite(bookId, isFavourited);
        } catch (error) {
            console.error('Error toggling favourite:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            className={`favourite-button ${isFavourited ? 'favourited' : ''} ${isLoading ? 'loading' : ''}`}
            onClick={handleClick}
            disabled={isLoading}
        >
            <span className="heart-icon">
                {isFavourited ? '❤️' : '🤍'}
            </span>
            <span className="button-text">
                {isLoading ? 'Loading...' : (isFavourited ? 'Remove from Favourites' : 'Add to Favourites')}
            </span>
        </button>
    );
};

export default FavouriteButton;