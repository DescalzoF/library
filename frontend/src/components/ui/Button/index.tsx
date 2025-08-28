import { useNavigate } from 'react-router-dom';
import './styles.css';

type RedirectButtonProps = {
    text: string;
    path: string;
};

const RedirectButton = ({ text, path }: RedirectButtonProps) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(path);
    };

    return (
        <button
            className={`redirect-button redirect-button`}
            onClick={handleClick}
        >
            {text}
        </button>
    );
};

export default RedirectButton;