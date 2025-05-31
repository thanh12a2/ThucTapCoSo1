import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import ExplorePage from "../pages/ExplorePage";
import DetailsPage from "../pages/DetailsPage";
import SearchPage from "../pages/SearchPage";
import AuthPage from "../pages/AuthPage";
import FavouritePage from "../pages/FavouritePage";
import ProfilePage from "../pages/ProfilePage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import PersonPage from "../pages/PersonPage";
import ChatboxPage from "../pages/ChatboxPage";

const router = createBrowserRouter([
    {
        path : "/",
        element : <App/>,
        children : [
            {
                path : "",
                element : <Home/>
            },
            {
                path : ":explore",
                element : <ExplorePage/>
            },
            {
                path : ":explore/:id",
                element : <DetailsPage/>
            },
            {
                path : "search",
                element : <SearchPage/>
            },
            {
                path : "auth",
                element : <AuthPage/>
            },
            {
                path : "favourite",
                element : <FavouritePage/>
            },
            {
                path : "profile",
                element : <ProfilePage/>
            },
            {
                path : "forgot-password",
                element : <ForgotPasswordPage/>
            },
            {
                path : "person/:id",
                element : <PersonPage/>
            },
            {
                path : "chatbox",
                element : <ChatboxPage/>
            }
        ]
    }
])

export default router