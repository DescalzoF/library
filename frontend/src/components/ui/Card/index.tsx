import './styles.css';
import FavouriteButton from '../FavouriteButton';

type BookCardProps = {
    id: string;
    title: string;
    author: string;
    genre: string;
    synopsis: string;
    isFavourited: boolean;
    onToggleFavourite: (bookId: string, isFavourited: boolean) => void;
};

const BookCard = ({ id, title, author, genre, synopsis, isFavourited, onToggleFavourite }: BookCardProps) => {
    return (
        <div className="book-card">
            <div className="book-card-header">
                <h3 className="book-title">{title}</h3>
                <div className="book-author">By: {author}</div>
            </div>
            <div className="book-genre">
                <span className="genre-label">Genre:</span> {genre}
            </div>
            <div className="book-synopsis">
                <div className="synopsis-label">Synopsis:</div>
                <p className="synopsis-text">{synopsis}</p>
            </div>
            <FavouriteButton
                bookId={id}
                isFavourited={isFavourited}
                onToggleFavourite={onToggleFavourite}
            />
        </div>
    );
};

export default BookCard;