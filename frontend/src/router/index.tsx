import {BrowserRouter, Route, Routes} from "react-router-dom";
import ExplorePage from "../pages/Explore/explore-page.tsx";
import FavouritePage from "../pages/Favourite/favourite-page.tsx";

export const Router = () => {

    return (
        <BrowserRouter>
            <Routes>
                <Route path = "/"  element = { < ExplorePage /> } />
                <Route path = "/favourites" element = { <FavouritePage /> } />
            </Routes>
        </BrowserRouter>
    )
}