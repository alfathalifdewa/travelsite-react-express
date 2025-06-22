import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Plus, Dash } from 'react-bootstrap-icons';
import Header from '../../Components/User/Header';
import Footer from '../../Components/User/Footer';
import { Container, Row, Col, Breadcrumb, Image, Button, Modal, Carousel } from 'react-bootstrap';
import '../../assets/css/DetailProduct.css';
import api from '../../api';
import FloatingCart from '../../Components/User/FloatingCart';
import { CartContext } from '../../contexts/CartContext';

const DetailProduct = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [itemCount, setItemCount] = useState(1);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();
  
  // Login Warning Modal State
  const [showLoginWarning, setShowLoginWarning] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data.product);
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    fetchProduct();
  }, [id]);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  const handleAddToCart = async () => {
    // Check if user is logged in by checking authToken
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
      // Show login warning modal
      setShowLoginWarning(true);
      return;
    }

    try {
      await addToCart(id, itemCount);
      setItemCount(1); // Reset itemCount after adding to cart
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleCloseLoginWarning = () => {
    setShowLoginWarning(false);
  };

  const handleGoToLogin = () => {
    // Close modal and navigate to login
    setShowLoginWarning(false);
    navigate('/login');
  };

  const handleIncrement = () => {
    setItemCount(itemCount + 1);
  };

  const handleDecrement = () => {
    if (itemCount > 1) {
      setItemCount(itemCount - 1);
    }
  };

  // Function to render product images (up to 5)
  const renderProductImages = () => {
    if (!product?.images || product.images.length === 0) {
      return (
        <Image 
          src={product?.image || '/assets/placeholder-image.png'} 
          alt={product?.productName || 'Product'} 
          fluid 
          onError={(e) => {
            e.target.error = null; // Prevent infinite loop
            e.target.src = '/assets/placeholder-image.png'; // Fallback image
          }}
        />
      );
    }

    // Display up to 5 images
    const imagesToShow = product.images.slice(0, 5);

    if (imagesToShow.length === 1) {
      return (
        <Image 
          src={imagesToShow[0]} 
          alt={product.productName} 
          fluid 
          onError={(e) => {
            e.target.error = null; // Prevent infinite loop
            e.target.src = '/assets/placeholder-image.png'; // Fallback image
          }}
        />
      );
    }

    return (
      <Carousel>
        {imagesToShow.map((image, index) => (
          <Carousel.Item key={index}>
            <Image
              className="d-block w-100"
              src={image}
              alt={`${product.productName} - Image ${index + 1}`}
              fluid
              style={{ height: '400px', objectFit: 'cover' }}
            />
          </Carousel.Item>
        ))}
      </Carousel>
    );
  };

  return (
    <>
      <Header />
      <FloatingCart />
      <Container className="detail-product-container">
        <Breadcrumb className="breadcrumb">
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
            Beranda
          </Breadcrumb.Item>
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/products' }}>
            Product
          </Breadcrumb.Item>
          <Breadcrumb.Item active>{product?.productName}</Breadcrumb.Item>
        </Breadcrumb>
        
        {product ? (
          <Row className="detail-product">
            <Col md={6} className="detail-product-image">
              {renderProductImages()}
            </Col>
            <Col md={6} className="product-details">
              <h3>{product.productName}</h3>
              <h4 className="detail-product-price">
                <span>{formatRupiah(product.price)}</span>
              </h4>
              <div className="detail-product-actions">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Button variant="outline-primary" className="cart-button" onClick={handleDecrement}>
                    <Dash />
                  </Button>
                  <span className="mx-3 fw-bold">{itemCount}</span>
                  <Button variant="primary" className="cart-button" onClick={handleIncrement}>
                    <Plus />
                  </Button>
                </div>
                <Button variant="primary" className="cart-button w-100" onClick={handleAddToCart}>
                  + Tambah ke Keranjang
                </Button>
              </div>
              <hr />
              <div className="product-deskripsi">
                <h3>Deskripsi</h3>
                {product.desc ? (
                  product.desc.split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                  ))
                ) : (
                  <p>Tidak ada deskripsi tersedia.</p>
                )}
              </div>
            </Col>
          </Row>
        ) : (
          <div className="text-center py-5">
            <p>Loading...</p>
          </div>
        )}
      </Container>

      {/* Login Warning Modal */}
      <Modal show={showLoginWarning} onHide={handleCloseLoginWarning} centered>
        <Modal.Header closeButton>
          <Modal.Title>Login Required</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          You need to log in to add items to your cart. Would you like to go to the login page?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseLoginWarning}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleGoToLogin}>
            Go to Login
          </Button>
        </Modal.Footer>
      </Modal>
      
      <Footer />
    </>
  );
};

export default DetailProduct;