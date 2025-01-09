import React, { useState, useEffect, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingCart } from 'lucide-react';
import a4 from "../assets/images/logo.jpg";
import { Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

function Navbar({ scrollTo, refs }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const { isLoggedIn, logout } = useContext(AuthContext);

  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItemsCount(cart.length);
    };

    updateCartCount();
    window.addEventListener('storage', updateCartCount);

    return () => {
      window.removeEventListener('storage', updateCartCount);
    };
  }, []);

  const handleScroll = (sectionName) => {
    const sectionRef = refs[sectionName];
    if (sectionRef?.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <header className="fixed w-full z-40 bg-white bg-opacity-90 backdrop-blur-md shadow-md transition-all duration-300">
        <div className="container mx-auto px-7 py-4">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center space-x-4"
            >
              <img src={a4} alt="10Med Logo" className="h-10" />
              <h1 className="text-2xl font-bold text-green-600">10Med Delivery</h1>
            </motion.div>
            <nav className="hidden md:flex space-x-6">
              <Link to="/" className='text-gray-600 hover:text-green-500 transition-colors'>Home</Link>
              <Link to="/history" className='text-gray-600 hover:text-green-500 transition-colors'>History</Link>
              {['Appointment', 'Medicines', 'Cases', 'Testimonials'].map((item) => (
                <motion.a
                  key={item}
                  href="#"
                  onClick={() => handleScroll(item)}
                  className="text-gray-600 hover:text-green-500 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item}
                </motion.a>
              ))}
            </nav>
            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <motion.button
                  onClick={logout}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors"
                >
                  Log out
                </motion.button>
              ) : (
                <>
                  <Link to="/login">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-white text-green-500 px-4 py-2 rounded-full border border-green-500 hover:bg-green-500 hover:text-white transition-colors"
                    >
                      Log in
                    </motion.button>
                  </Link>
                  <Link to="/signup">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition-colors"
                    >
                      Sign up
                    </motion.button>
                  </Link>
                </>
              )}
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <Link to="/cart">
                  <ShoppingCart className="text-green-500 cursor-pointer" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                  )}
                </Link>
              </motion.div>
            </div>
            <button
              className="md:hidden text-gray-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white shadow-lg fixed w-full z-30 top-16"
          >
            <nav className="flex flex-col p-4 space-y-4">
              {['Home', 'Appointment', 'Medicines', 'Cases', 'Testimonials'].map((item) => (
                <motion.a
                  key={item}
                  href="#"
                  onClick={() => {
                    handleScroll(item);
                    setIsMenuOpen(false);
                  }}
                  className="text-gray-600 hover:text-green-500 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item}
                </motion.a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar