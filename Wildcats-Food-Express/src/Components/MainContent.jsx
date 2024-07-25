import './MainContent.css';
import { Link } from 'react-router-dom';
import catImage from "../assets/chef.png";

const MainContent = () => {
    return (
        <main className="main-content">
            <div className="rh1">
                <div className="hide-mobile">
                    <h1 className="wildcats-foods">Wildcats Food <span className="express-mobile">Express</span></h1>
                </div>
                <div className="hide-title">
                    <h1 className="wildcats-food">Wildcats Food <span className="express-mobile">Express</span></h1>
                </div>
                <h3>Fast. Fresh. Fierce.</h3>
                <Link to="/dashboard" className="primary-cta">Order Food</Link>
            </div>

            <div className="cat">
                <img src={catImage} alt="Photo of Wildcat chef"/>
            </div>
        </main>
    );
};

export default MainContent;
