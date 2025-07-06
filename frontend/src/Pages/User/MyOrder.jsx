import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, ListGroup, Breadcrumb, Button, Accordion } from 'react-bootstrap';
import Header from "../../Components/User/Header";
import Footer from "../../Components/User/Footer";
import api from '../../api';

const MyOrder = () => {
  const [orders, setOrders] = useState({}); // Grouped orders by date
  const [selectedOrder, setSelectedOrder] = useState(null); // Store order details
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

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await api.get(`/order/orderid/${orderId}`);
      setSelectedOrder(response.data);
    } catch (error) {
      console.error('Error fetching order details:', error);
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

        {Object.keys(orders).map(date => (
          <div key={date} className="mb-4">
            <h5 className="text-primary">Orders on {date}</h5>
            {orders[date].map(order => (
              <Row className="mt-3" key={order._id}>
                <Col md={12}>
                  <Card>
                    <Card.Body>
                      <Card.Title>Order ID: {order._id}</Card.Title>
                      <ListGroup variant="flush">
                        {order.items.map(item => (
                          <ListGroup.Item key={item._id}>
                            <Row>

                              <Col md={2}>
                                <img src={item.product.image} className= "detail-product-image" alt={item.product.image} />
                              </Col>
                              <Col md={6}>{item.product?.productName ?? "-"}</Col>
                              <Col md={2}>Rp {item.product?.price?.toLocaleString?.() ?? "-"}</Col>
                              <Col md={2}>x {item.quantity}</Col>
                            </Row>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>

                      <Accordion className="mt-3">
                        <Accordion.Item eventKey="0">
                          <Accordion.Header onClick={() => fetchOrderDetails(order.transactionId)}>
                            View Details
                          </Accordion.Header>
                          <Accordion.Body>
                            {selectedOrder && selectedOrder._id === order._id ? (
                              <>
                                <Card className="mt-4">
                                  <Card.Body>
                                    <Card.Title>Order Details</Card.Title>
                                    <ListGroup variant="flush">
                                      <ListGroup.Item>
                                        <Row>
                                          <Col><b>Nama : </b></Col>
                                          <Col>{selectedOrder.user?.username  || 'Unknown User'}</Col>
                                        </Row>
                                      </ListGroup.Item>
                                      <ListGroup.Item>
                                        <Row>
                                          <Col><b>Alamat : </b></Col>
                                          <Col>{selectedOrder.address}</Col>
                                        </Row>
                                      </ListGroup.Item>
                                      <ListGroup.Item>
                                        <Row>
                                          <Col><b>Payment Method : </b></Col>
                                          <Col>{selectedOrder.midtransStatus?.payment_type || 'Pending'}</Col>
                                        </Row>
                                      </ListGroup.Item>
                                      <ListGroup.Item>
                                        <Row>
                                          <Col><b>Payment Status : </b></Col>
                                          <Col>{selectedOrder.midtransStatus?.transaction_status || 'Pending'}</Col>
                                        </Row>
                                      </ListGroup.Item>
                                      <ListGroup.Item>
                                        <Row>
                                          <Col><b>Total Pembayaran : </b></Col>
                                          <Col>Rp {selectedOrder.total.toLocaleString()}</Col>
                                        </Row>
                                      </ListGroup.Item>
                                      <ListGroup.Item>
                                        <Row>
                                          <Col><b>Pemberitahuan :</b> Jika Sudah Melakukan Pemesanan/Transaksi Harapan Hubungi Kontak atau Sosial Media Kami, Agar Pemesanan Dapat Cepat di Proses Oleh Admin Terima Kasih Hormat Kami Travel Mata Elang.</Col>
                                        </Row>
                                      </ListGroup.Item>
                                    </ListGroup>

                                    {selectedOrder.paymentLink && (
                                      <Button
                                        variant="info"
                                        className="w-100 mt-3"
                                        onClick={() => checkPaymentStatus(selectedOrder.paymentLink)}
                                        disabled={isCheckingPayment}
                                      >
                                        {isCheckingPayment ? 'Checking...' : 'Check Payment Status'}
                                      </Button>
                                    )}

                                    {selectedOrder.whatsappLink && (
                                      <Button
                                        variant="success"
                                        className="w-100 mt-3"
                                        as="a"
                                        href={selectedOrder.whatsappLink}
                                        target="_blank"
                                      >
                                        Confirm Order on WhatsApp
                                      </Button>
                                    )}
                                  </Card.Body>
                                </Card>
                              </>
                            ) : (
                              <p>Loading details...</p>
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
        ))}
      </Container>
      <Footer />
    </>
  );
};

export default MyOrder;
