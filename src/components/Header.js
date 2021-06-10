import React from 'react'
import './myStyles.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearchDollar } from "@fortawesome/free-solid-svg-icons";

function Header() {
    return (
        <div className="topnav">
            <div className="search-container">
                <form action="/action_page.php">
                    <input type="text" placeholder="Cercar..." name="search" />
                    <button type="submit"><FontAwesomeIcon icon={ faSearchDollar } /></button>
                </form>                
            </div>
        </div>
    )
}

export default Header
