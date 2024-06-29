import './App.css';
import Header from './Components/Header';
import MainContent from './Components/MainContent';
import CatImage from './Components/CatImage';
import Footer from './Components/Footer';

function App() {
  return (
    <div className="wrap">
      <Header />
      <hr className="hide-hr"/>
      <MainContent />
      <CatImage />
      <Footer />
    </div>
  );
}

export default App;
