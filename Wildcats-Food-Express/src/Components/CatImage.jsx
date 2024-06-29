import './CatImage.css';
import catImage from '/cat_model.svg';

const CatImage = () => {
  return (
    <div className="cat-container">
      <div className="cat">
        <img src={catImage} alt="Smiling chef cat mascot" className="cat-image" />
      </div>
    </div>
  );
};

export default CatImage;
