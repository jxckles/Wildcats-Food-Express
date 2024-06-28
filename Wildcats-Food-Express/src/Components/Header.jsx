import './Header.css';
import logo from '/public/logo.svg';

const Header = () => {
  return (
    <header className="header">
      <div className="header-left">
        <a href="/" className="logo">
          <img src={logo} alt="Wildcats Food Express Logo" className="logo-image" />
        </a>
      </div>
      <div className="header-right">
      <a href="#" className="cta login-cta">Log In</a>
      <a href="#" className="cta signup-cta">Sign Up</a>
      </div>
    </header>
  );
};

export default Header;
