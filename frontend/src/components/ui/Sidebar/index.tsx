import React from 'react';
import RedirectButton from '../Button';
import './styles.css';

type SidebarProps = {
    children?: React.ReactNode;
    width?: string;
};

const Sidebar = ({ children, width = '250px' }: SidebarProps) => {
    return (
        <div className="sidebar" style={{ width }}>
            <div className="sidebar-content">
                <RedirectButton text="Explore" path="/" />
                <RedirectButton text="Favourites" path="/favourites" />
                {children}
            </div>
        </div>
    );
};

export default Sidebar;