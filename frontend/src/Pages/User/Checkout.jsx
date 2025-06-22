import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container, Row, Col, Card,
  Button, Form, ListGroup,
  Breadcrumb, Modal, Spinner, Alert
} from 'react-bootstrap';
import Header from "../../Components/User/Header";
import Footer from "../../Components/User/Footer";
import api from '../../api';


// Helper function to get image URL with fallback
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return '/assets/placeholder-image.png';
  
  // If it's already a full URL, return as is
  if (imageUrl.startsWith('http')) return imageUrl;
  
  // If it's a relative path, construct full URL
  // Adjust this based on your backend image serving setup
  return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${imageUrl}`;
};

const Cart = () => {
  const [address, setAddress] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [products, setProducts] = useState([]);
  const [totalOrder, setTotalOrder] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Load Midtrans Snap script
  useEffect(() => {
    const snapScript = 'https://app.sandbox.midtrans.com/snap/snap.js';
    const clientKey = 'SB-Mid-client-YOUR_CLIENT_KEY'; // Ganti dengan client key Midtrans Anda
    
    const script = document.createElement('script');
    script.src = snapScript;
    script.setAttribute('data-client-key', clientKey);
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    }
  }, []);

  // Fetch user data and cart
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await api.get('/users/me');
        setUserAddress(userRes.data.address);
        setAddress(userRes.data.address || '');

        const cartRes = await api.get('/cart');
        setProducts(cartRes.data.items);
        const total = cartRes.data.items
          .reduce((acc, p) => acc + p.product.price * p.quantity, 0);
        setTotalOrder(total);
      } catch (err) {
        console.error('Error fetching cart/user:', err);
        setError('Gagal memuat data keranjang');
      }
    };
    fetchData();
  }, []);

  // Checkout with Midtrans popup
  const handleCheckout = async () => {
    if (!address.trim()) {
      setError('Alamat pengiriman harus diisi');
      return;
    }

    setIsProcessing(true);
    setError('');
    setSuccess('');

    try {
      // Call backend checkout endpoint
      const res = await api.post('/order/checkout', { address });
      
      if (res.status === 201) {
        const { token, order } = res.data;
        
        // Use Midtrans Snap popup
        window.snap.pay(token, {
          onSuccess: function(result) {
            console.log('Payment success:', result);
            setSuccess('Pembayaran berhasil!');
            setTimeout(() => {
              navigate('/order-success');
            }, 2000);
          },
          onPending: function(result) {
            console.log('Payment pending:', result);
            setSuccess('Pembayaran sedang diproses. Silakan selesaikan pembayaran Anda.');
            setTimeout(() => {
              navigate('/orders');
            }, 3000);
          },
          onError: function(result) {
            console.log('Payment error:', result);
            setError('Terjadi kesalahan dalam pembayaran. Silakan coba lagi.');
          },
          onClose: function() {
            console.log('Payment popup closed');
            setError('Pembayaran dibatalkan');
          }
        });
      }
    } catch (err) {
      console.error('Error during checkout:', err);
      setError('Terjadi kesalahan saat memproses checkout. Silakan coba lagi.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Update quantity function (optional - if you want to add quantity update)
  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity <= 0) return;
    
    try {
      await api.put('/cart/update', {
        productId,
        quantity: newQuantity
      });
      
      // Refresh products
      const cartRes = await api.get('/cart');
      setProducts(cartRes.data.items);
      const total = cartRes.data.items
        .reduce((acc, p) => acc + p.product.price * p.quantity, 0);
      setTotalOrder(total);
    } catch (err) {
      console.error('Error updating quantity:', err);
      setError('Gagal mengupdate jumlah produk');
    }
  };

  // Remove item from cart
  const removeItem = async (productId) => {
    try {
      await api.delete(`/cart/remove/${productId}`);
      
      // Refresh products
      const cartRes = await api.get('/cart');
      setProducts(cartRes.data.items);
      const total = cartRes.data.items
        .reduce((acc, p) => acc + p.product.price * p.quantity, 0);
      setTotalOrder(total);
    } catch (err) {
      console.error('Error removing item:', err);
      setError('Gagal menghapus item dari keranjang');
    }
  };

  return (
    <>
      <Header />

      <Container className="mt-5">
        <Row>
          <Breadcrumb>
            <Breadcrumb.Item as={Link} to="/products">Kembali ke Produk</Breadcrumb.Item>
            <Breadcrumb.Item active>Keranjang</Breadcrumb.Item>
          </Breadcrumb>
        </Row>

        {/* Alert Messages */}
        {error && (
          <Row className="mt-3">
            <Col>
              <Alert variant="danger" onClose={() => setError('')} dismissible>
                {error}
              </Alert>
            </Col>
          </Row>
        )}

        {success && (
          <Row className="mt-3">
            <Col>
              <Alert variant="success" onClose={() => setSuccess('')} dismissible>
                {success}
              </Alert>
            </Col>
          </Row>
        )}

        <Row className="mt-3">
          {/* Cart Items */}
          <Col md={8}>
            <Card>
              <Card.Body>
                <Card.Title>Keranjang Anda ({products.length} item)</Card.Title>
                
                {/* Address Selection */}
                <Form className="mb-4">
                  <Form.Group controlId="addressSelect">
                    <Form.Label>Alamat Pengiriman</Form.Label>
                    <Form.Control
                      as="select"
                      value={address === userAddress ? userAddress : 'custom'}
                      onChange={e => {
                        if (e.target.value === 'custom') {
                          setAddress('');
                        } else {
                          setAddress(e.target.value);
                        }
                      }}
                    >
                      {userAddress && (
                        <option value={userAddress}>
                          Gunakan Alamat Terdaftar: {userAddress}
                        </option>
                      )}
                      <option value="custom">Masukkan Alamat Baru</option>
                    </Form.Control>
                    
                    {(address !== userAddress || !userAddress) && (
                      <Form.Control
                        type="text"
                        className="mt-2"
                        placeholder="Masukkan alamat lengkap pengiriman"
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        required
                      />
                    )}
                  </Form.Group>
                </Form>

                {/* Product List */}
                <Card>
                  <Card.Body>
                    <Card.Title>Rincian Produk</Card.Title>
                    {products.length === 0 ? (
                      <div className="text-center py-4">
                        <p>Keranjang Anda kosong</p>
                        <Button as={Link} to="/products" variant="primary">
                          Mulai Belanja
                        </Button>
                      </div>
                    ) : (
                      <ListGroup variant="flush">
                        {products.map(({ product, quantity }) => (
                          <ListGroup.Item key={product._id}>
                            <Row className="align-items-center">
                              <Col md={2}>
                                <img
                                  src={getImageUrl(product.images?.length? product.images[0]: product.image)}
                                  alt={product.productName}
                                  className="img-fluid rounded"
                                  style={{ maxHeight: '80px', objectFit: 'cover' }}
                                  onError={(e) => {
                                    e.target.error = null; // Prevent infinite loop
                                    e.target.src = '/assets/placeholder-image.png';
                                  }}
                                />
                              </Col>
                              <Col md={4}>
                                <h6 className="mb-1">{product.productName}</h6>
                                <small className="text-muted">
                                  Rp {product.price.toLocaleString()} / item
                                </small>
                              </Col>
                              <Col md={3}>
                                <div className="d-flex align-items-center">
                                  <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={() => updateQuantity(product._id, quantity - 1)}
                                    disabled={quantity <= 1}
                                  >
                                    -
                                  </Button>
                                  <span className="mx-3">{quantity}</span>
                                  <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={() => updateQuantity(product._id, quantity + 1)}
                                  >
                                    +
                                  </Button>
                                </div>
                              </Col>
                              <Col md={2}>
                                <strong>Rp {(product.price * quantity).toLocaleString()}</strong>
                              </Col>
                              <Col md={1}>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => removeItem(product._id)}
                                >
                                  ×
                                </Button>
                              </Col>
                            </Row>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    )}
                  </Card.Body>
                </Card>
              </Card.Body>
            </Card>
          </Col>

          {/* Payment Summary */}
          <Col md={4}>
            <Card className="sticky-top" style={{ top: '20px' }}>
              <Card.Body>
                <Card.Title>Ringkasan Pembayaran</Card.Title>
                <ListGroup variant="flush">
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>Subtotal ({products.length} item)</span>
                    <span>Rp {totalOrder.toLocaleString()}</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>Biaya Pengiriman</span>
                    <span className="text-success">GRATIS</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between">
                    <strong>Total Bayar</strong>
                    <strong className="text-primary">Rp {totalOrder.toLocaleString()}</strong>
                  </ListGroup.Item>
                </ListGroup>
                
                <Button
                  variant="primary"
                  className="w-100 mt-3"
                  onClick={handleCheckout}
                  disabled={isProcessing || products.length === 0 || !address.trim()}
                >
                  {isProcessing ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Memproses...
                    </>
                  ) : (
                    'Bayar Sekarang'
                  )}
                </Button>
                
                <div className="mt-3 text-center">
                  <small className="text-muted">
                    Dengan melanjutkan, Anda menyetujui syarat dan ketentuan kami
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Footer />
    </>
  );
};

export default Cart;