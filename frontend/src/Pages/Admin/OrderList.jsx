import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Row, Col } from 'react-bootstrap';
import api from '../../api';
import HeaderDashboard from '../../Components/Admin/HeaderDashboard';

const OrderListPage = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/order/all'); // Fetch all orders
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    }
  };

  const fetchOrderById = async (orderId) => {
    try {
      const response = await api.get(`/order/orderid/${orderId}`);
      setSelectedOrder(response.data);
    } catch (error) {
      console.error('Failed to fetch order details', error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const handleShowModal = (orderId) => {
    fetchOrderById(orderId);
    setShowModal(true);
  };

  return (
    <>
      <HeaderDashboard />
      <Container>
        <div className="d-flex justify-content-between align-items-center mt-5">
          <h3>Order List</h3>
        </div>
        <Table striped bordered hover className="mt-3">
          <thead>
            <tr>
              <th>No</th>
              <th>Transaction ID</th>
              <th>Tanggal Order</th>
              <th>Total Harga</th>
              <th>Nama</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr key={order._id}>
                <td>{index + 1}</td>
                <td>{order.transactionId}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                  }).format(order.total)}
                </td>
                <td>{order.user?.username || 'Unknown User'}</td>
                <td>
                  <Button
                    variant="info"
                    size="sm"
                    onClick={() => handleShowModal(order.transactionId)}
                  >
                    Lihat Selengkapnya
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>

      {/* Order Details Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Order Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <Row>
                <Col>
                  <h5>Transaction ID : {selectedOrder.transactionId}</h5>
                  <h5>Nama : {selectedOrder.user?.username || 'Unknown User'}</h5>
                  <h5>Alamat : {selectedOrder.address}</h5>
                  <h5> Nomor Telpon : {selectedOrder.phone} </h5>
                  <h5> Email : {selectedOrder.email} </h5>
                </Col>
                <Col className="text-right">
                  <h5>Order Date : {new Date(selectedOrder.createdAt).toLocaleDateString()}</h5>
                  <h5>Payment Method : {selectedOrder.midtransStatus?.payment_type || 'Pending'}</h5>
                  <h5>Payment Status : {selectedOrder.midtransStatus?.transaction_status || 'Pending'}</h5>
                  <h5>Total Harga : {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                  }).format(selectedOrder.total)}</h5>
                </Col>
              </Row>
              <hr />
              <h5>Order Items:</h5>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Pesanan</th>
                    <th>Harga</th>
                    <th>Jumlah Pesanan</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>{item.product?.productName || 'Unknown Product'}</td>
                      <td>
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                        }).format(item.product?.price || 0)}
                      </td>
                      <td>{item.quantity}</td>
                      <td>
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                        }).format(item.product?.price * item.quantity || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default OrderListPage;
