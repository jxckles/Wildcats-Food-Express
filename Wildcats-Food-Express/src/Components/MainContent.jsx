import './MainContent.css';

const MainContent = () => {
  return (
    <main className="main-content">
      <div className="rh1">
        <div className="hide-mobile">
          <h1 className="wildcats-foods">Wildcats Food <span className="express-mobile">Express</span></h1>
        </div>
        <div className="hide-title">
          <h1 className="wildcats-food">Wildcats Food</h1>
          <h1 className="express">Express</h1>
        </div>
      </div>
      
      <h3>Fast. Fresh. Fierce.</h3>
      <a href="#" className="primary-cta">Order Food</a>
    </main>
  );
};

export default MainContent;
