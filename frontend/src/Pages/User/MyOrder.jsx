import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, ListGroup, Breadcrumb, Button, Accordion } from 'react-bootstrap';
import Header from "../../Components/User/Header";
import Footer from "../../Components/User/Footer";
import api from '../../api';

const MyOrder = () => {
  const [orders, setOrders] = useState({}); // Grouped orders by date
  const [selectedOrderDetails, setSelectedOrderDetails] = useState({}); // Store order details by transaction ID
  const [loadingDetails, setLoadingDetails] = useState({}); // Loading state for each order
  const [isCheckingPayment, setIsCheckingPayment] = useState(false); // Loading state for payment check

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/order');
        const groupedOrders = response.data.reduce((acc, order) => {
          const date = new Date(order.createdAt).toLocaleDateString();
          if (!acc[date]) acc[date] = [];
          acc[date].push(order);
          return acc;
        }, {});

        setOrders(groupedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);

  const fetchOrderDetails = async (transactionId) => {
    // Don't fetch if already loading or already have details
    if (loadingDetails[transactionId] || selectedOrderDetails[transactionId]) {
      return;
    }

    setLoadingDetails(prev => ({ ...prev, [transactionId]: true }));
    
    try {
      const response = await api.get(`/order/orderid/${transactionId}`);
      setSelectedOrderDetails(prev => ({ 
        ...prev, 
        [transactionId]: response.data 
      }));
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoadingDetails(prev => ({ ...prev, [transactionId]: false }));
    }
  };

  const checkPaymentStatus = async (paymentLink) => {
    setIsCheckingPayment(true);
    try {
      window.open(paymentLink, '_blank');
    } catch (error) {
      console.error('Error checking payment status:', error);
    } finally {
      setIsCheckingPayment(false);
    }
  };

  return (
    <>
      <Header />
      <Container className="mt-5">
        <Row>
          <Breadcrumb>
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>Home</Breadcrumb.Item>
            <Breadcrumb.Item active>My Order</Breadcrumb.Item>
          </Breadcrumb>
        </Row>

        {Object.keys(orders).length === 0 ? (
          <Row className="mt-4">
            <Col md={12}>
              <Card>
                <Card.Body className="text-center">
                  <h5>No orders found</h5>
                  <p>You haven't placed any orders yet.</p>
                  <Button as={Link} to="/" variant="primary">
                    Start Shopping
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        ) : (
          Object.keys(orders).map(date => (
            <div key={date} className="mb-4">
              <h5 className="text-primary">Orders on {date}</h5>
              {orders[date].map(order => (
                <Row className="mt-3" key={order._id}>
                  <Col md={12}>
                    <Card>
                      <Card.Body>
                        <Card.Title>Order ID: {order.transactionId}</Card.Title>
                        <p className="text-muted">Status: <span className={`badge ${
                          order.status === 'Successful' ? 'bg-success' : 
                          order.status === 'Pending' ? 'bg-warning' : 
                          order.status === 'Cancelled' ? 'bg-danger' : 'bg-secondary'
                        }`}>{order.status}</span></p>
                        
                        <ListGroup variant="flush">
                          {order.items.map(item => (
                            <ListGroup.Item key={item._id}>
                              <Row>
                                <Col md={2}>
                                  <img 
                                    src={item.product.image} 
                                    className="img-fluid" 
                                    alt={item.product.productName}
                                    style={{ maxHeight: '80px', objectFit: 'cover' }}
                                  />
                                </Col>
                                <Col md={6}>
                                  <strong>{item.product.productName}</strong>
                                </Col>
                                <Col md={2}>Rp {item.product.price.toLocaleString()}</Col>
                                <Col md={2}>x {item.quantity}</Col>
                              </Row>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>

                        <div className="mt-3">
                          <strong>Total: Rp {order.total.toLocaleString()}</strong>
                        </div>

                        <Accordion className="mt-3">
                          <Accordion.Item eventKey="0">
                            <Accordion.Header 
                              onClick={() => fetchOrderDetails(order.transactionId)}
                            >
                              View Details
                            </Accordion.Header>
                            <Accordion.Body>
                              {loadingDetails[order.transactionId] ? (
                                <div className="text-center">
                                  <div className="spinner-border spinner-border-sm" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                  </div>
                                  <p className="mt-2">Loading details...</p>
                                </div>
                              ) : selectedOrderDetails[order.transactionId] ? (
                                <Card className="mt-2">
                                  <Card.Body>
                                    <Card.Title>Order Details</Card.Title>
                                    <ListGroup variant="flush">
                                      <ListGroup.Item>
                                        <Row>
                                          <Col sm={4}><strong>Nama:</strong></Col>
                                          <Col sm={8}>{selectedOrderDetails[order.transactionId].user?.username || 'Unknown User'}</Col>
                                        </Row>
                                      </ListGroup.Item>
                                      <ListGroup.Item>
                                        <Row>
                                          <Col sm={4}><strong>Alamat:</strong></Col>
                                          <Col sm={8}>{selectedOrderDetails[order.transactionId].address}</Col>
                                        </Row>
                                      </ListGroup.Item>
                                      <ListGroup.Item>
                                        <Row>
                                          <Col sm={4}><strong>Payment Method:</strong></Col>
                                          <Col sm={8}>
                                            {selectedOrderDetails[order.transactionId].midtransStatus?.payment_type || 'Pending'}
                                          </Col>
                                        </Row>
                                      </ListGroup.Item>
                                      <ListGroup.Item>
                                        <Row>
                                          <Col sm={4}><strong>Payment Status:</strong></Col>
                                          <Col sm={8}>
                                            <span className={`badge ${
                                              selectedOrderDetails[order.transactionId].midtransStatus?.transaction_status === 'settlement' ? 'bg-success' : 
                                              selectedOrderDetails[order.transactionId].midtransStatus?.transaction_status === 'pending' ? 'bg-warning' : 
                                              selectedOrderDetails[order.transactionId].midtransStatus?.transaction_status === 'cancel' ? 'bg-danger' : 'bg-secondary'
                                            }`}>
                                              {selectedOrderDetails[order.transactionId].midtransStatus?.transaction_status || 'Pending'}
                                            </span>
                                          </Col>
                                        </Row>
                                      </ListGroup.Item>
                                      <ListGroup.Item>
                                        <Row>
                                          <Col sm={4}><strong>Total Pembayaran:</strong></Col>
                                          <Col sm={8}>
                                            <strong>Rp {selectedOrderDetails[order.transactionId].total.toLocaleString()}</strong>
                                          </Col>
                                        </Row>
                                      </ListGroup.Item>
                                      <ListGroup.Item>
                                        <Row>
                                          <Col sm={4}><strong>Order Date:</strong></Col>
                                          <Col sm={8}>
                                            {new Date(selectedOrderDetails[order.transactionId].createdAt).toLocaleString()}
                                          </Col>
                                        </Row>
                                      </ListGroup.Item>
                                      <ListGroup.Item>
                                        <Row>
                                          <Col>
                                            <strong>Pemberitahuan:</strong> Jika Sudah Melakukan Pemesanan/Transaksi Harapan Hubungi Kontak atau Sosial Media Kami, Agar Pemesanan Dapat Cepat di Proses Oleh Admin Terima Kasih Hormat Kami Travel Mata Elang.
                                          </Col>
                                        </Row>
                                      </ListGroup.Item>
                                    </ListGroup>

                                    <div className="mt-3">
                                      {selectedOrderDetails[order.transactionId].paymentLink && (
                                        <Button
                                          variant="info"
                                          className="w-100 mb-2"
                                          onClick={() => checkPaymentStatus(selectedOrderDetails[order.transactionId].paymentLink)}
                                          disabled={isCheckingPayment}
                                        >
                                          {isCheckingPayment ? (
                                            <>
                                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                              Checking...
                                            </>
                                          ) : (
                                            'Check Payment Status'
                                          )}
                                        </Button>
                                      )}

                                      {selectedOrderDetails[order.transactionId].whatsappLink && (
                                        <Button
                                          variant="success"
                                          className="w-100"
                                          as="a"
                                          href={selectedOrderDetails[order.transactionId].whatsappLink}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          Confirm Order on WhatsApp
                                        </Button>
                                      )}
                                    </div>
                                  </Card.Body>
                                </Card>
                              ) : (
                                <p className="text-muted">Click to load order details</p>
                              )}
                            </Accordion.Body>
                          </Accordion.Item>
                        </Accordion>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              ))}
            </div>
          ))
        )}
      </Container>
      <Footer />
    </>
  );
};

export default MyOrder;