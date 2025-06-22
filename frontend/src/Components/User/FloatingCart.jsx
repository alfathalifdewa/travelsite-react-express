import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Image, Button, Spinner } from 'react-bootstrap';
import { Cart4, Trash, Plus, Dash } from 'react-bootstrap-icons';
import { CartContext } from '../../contexts/CartContext';
import '../../assets/css/FloatingCart.css';

const FloatingCart = ({ hideCartButton }) => {
  const location = useLocation();
  const { cart, removeFromCart, updateCartItemQuantity, isLoading, getTotalItems, getTotalPrice } = useContext(CartContext);
  const [showCart, setShowCart] = useState(false);
  const navigate = useNavigate();
  const floatingCartRef = useRef(null);

  const hideOnPaths = ['/dashboard', '/login', '/register', '/checkout', '/forgot-password', '/reset-password'];
  const shouldHide = hideOnPaths.some(path => location.pathname.startsWith(path));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (floatingCartRef.current && !floatingCartRef.current.contains(event.target)) {
        setShowCart(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCartClick = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }
    setShowCart(!showCart);
  };

  const handleCheckout = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }
    setShowCart(false);
    navigate('/checkout');
  };

  const handleRemoveItem = async (productId) => {
    const result = await removeFromCart(productId);
    if (!result.success) {
      alert('Gagal menghapus item dari keranjang');
    }
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const result = await updateCartItemQuantity(productId, newQuantity);
    if (!result.success) {
      alert('Gagal mengubah jumlah item');
    }
  };

  // Helper function to get image URL with fallback
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/assets/placeholder-image.png';
    
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http')) return imageUrl;
    
    // If it's a relative path, construct full URL
    // Adjust this based on your backend image serving setup
    return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${imageUrl}`;
  };

  if (hideCartButton || shouldHide) return null;

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  return (
    <div className="floating-cart" ref={floatingCartRef}>
      <Button 
        variant="primary" 
        onClick={handleCartClick} 
        className="floating-cart-button"
        disabled={isLoading}
      >
        {isLoading ? (
          <Spinner animation="border" size="sm" />
        ) : (
          <>
            <Cart4 size={30} />
            {totalItems > 0 && (
              <span className="cart-item-count">{totalItems}</span>
            )}
          </>
        )}
      </Button>

      {showCart && (
        <div className="floating-cart-details shadow">
          <Container>
            <Row>
              <Col>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">Keranjang</h5>
                  <Button 
                    variant="link" 
                    className="p-0"
                    onClick={() => setShowCart(false)}
                  >
                    ×
                  </Button>
                </div>

                {isLoading ? (
                  <div className="text-center py-3">
                    <Spinner animation="border" />
                  </div>
                ) : !cart || !cart.items || cart.items.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted">Keranjang kosong</p>
                  </div>
                ) : (
                  <>
                    <div className="cart-items-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {cart.items.map(item => (
                        <div key={item.product._id} className="cart-item mb-3 p-2 border rounded">
                          <Row className="align-items-center">
                            <Col xs={3}>
                              <Image 
                                src={getImageUrl(item.product.images?.length? item.product.images[0]:item.product.image )} 
                                alt={item.product.productName}
                                thumbnail 
                                style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                onError={(e) => {
                                  e.target.error = null; // Prevent infinite loop
                                  e.target.src = '/assets/placeholder-image.png';
                                }}
                              />
                            </Col>
                            <Col xs={9}>
                              <div className="cart-item-details">
                                <h6 className="mb-1" style={{ fontSize: '0.9rem' }}>
                                  {item.product.productName}
                                </h6>
                                <p className="mb-2 text-muted" style={{ fontSize: '0.8rem' }}>
                                  {new Intl.NumberFormat('id-ID', { 
                                    style: 'currency', 
                                    currency: 'IDR' 
                                  }).format(item.product.price)}
                                </p>
                                <div className="d-flex justify-content-between align-items-center">
                                  <div className="cart-item-actions d-flex align-items-center">
                                    <Button 
                                      variant="outline-secondary" 
                                      size="sm"
                                      onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                                      disabled={isLoading}
                                    >
                                      <Dash size={12} />
                                    </Button>
                                    <span className="mx-2 fw-bold">{item.quantity}</span>
                                    <Button 
                                      variant="outline-secondary" 
                                      size="sm"
                                      onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                                      disabled={isLoading}
                                    >
                                      <Plus size={12} />
                                    </Button>
                                  </div>
                                  <Button 
                                    variant="outline-danger" 
                                    size="sm"
                                    onClick={() => handleRemoveItem(item.product._id)}
                                    disabled={isLoading}
                                  >
                                    <Trash size={12} />
                                  </Button>
                                </div>
                              </div>
                            </Col>
                          </Row>
                        </div>
                      ))}
                    </div>

                    <div className="cart-summary mt-3 pt-3 border-top">
                      <div className="d-flex justify-content-between mb-2">
                        <strong>Total: </strong>
                        <strong>
                          {new Intl.NumberFormat('id-ID', { 
                            style: 'currency', 
                            currency: 'IDR' 
                          }).format(totalPrice)}
                        </strong>
                      </div>
                      <Button 
                        variant="success" 
                        onClick={handleCheckout} 
                        disabled={cart.items.length === 0 || isLoading} 
                        className="w-100"
                      >
                        Checkout ({totalItems} item{totalItems !== 1 ? 's' : ''})
                      </Button>
                    </div>
                  </>
                )}
              </Col>
            </Row>
          </Container>
        </div>
      )}
    </div>
  );
};

export default FloatingCart;