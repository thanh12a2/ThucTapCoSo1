import { MdHomeFilled, MdFavorite } from "react-icons/md";
import { PiTelevisionFill } from "react-icons/pi";
import { BiSolidMoviePlay } from "react-icons/bi";
import { IoSearchOutline } from "react-icons/io5";

export const navigation = [
    {
        label : "TV Shows",
        href : 'tv',
        icon : <PiTelevisionFill/>
    },
    {
        label : "Movies",
        href : "movie",
        icon : <BiSolidMoviePlay/>
    },
    {
        label: "Favourite",
        href: "favourite",
        icon: <MdFavorite/>
    }
]

export const mobileNavigation = [
    {
        label : "Home",
        href : "/",
        icon : <MdHomeFilled/>
    },
    ...navigation,
    {
        label : "search",
        href : "/search",
        icon : <IoSearchOutline/>
    },
    {
        label: "Favourite",
        href: "/favourite",
        icon: <MdFavorite/>
    }
]
