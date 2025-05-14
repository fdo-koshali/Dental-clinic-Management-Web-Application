import { useEffect, useState } from 'react';
import img1 from '../assets/img1.jpg';
import img2 from '../assets/img2.jpg';
import img3 from '../assets/img3.jpg';
import { Link } from 'react-router-dom';

const images = [img1, img2, img3];

const LandingPart = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-screen h-screen">
      <img
        src={images[currentIndex]}
        alt="carousel"
        className="w-fully h-auto object-cover transition-all duration-1000 ease-in-out"
      />

      {/* Overlay content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/40 text-center px-4">
        <h1 className="text-5xl font-bold mb-4">Welcome to Dental Clinic</h1>
        <p className="text-xl mb-6">Your journey starts here.</p>
        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white">
          <Link to="/login" className="text-white no-underline">Book Now</Link>
        </button>
      </div>
    </div>
  );
};

export default LandingPart;
