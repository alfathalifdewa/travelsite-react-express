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

  const getPaymentStatusBadge = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'settlement' || statusLower === 'capture') return 'bg-success';
    if (statusLower === 'pending') return 'bg-warning';
    if (statusLower === 'cancel' || statusLower === 'deny' || statusLower === 'expire') return 'bg-danger';
    return 'bg-secondary';
  };

  const getOrderStatusBadge = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'successful') return 'bg-success';
    if (statusLower === 'pending') return 'bg-warning';
    if (statusLower === 'cancelled' || statusLower === 'failed') return 'bg-danger';
    return 'bg-secondary';
  };

  const getFraudStatusBadge = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'accept') return 'bg-success';
    if (statusLower === 'challenge') return 'bg-warning';
    return 'bg-danger';
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
              <th>Status</th>
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
                  <span className={`badge ${getOrderStatusBadge(order.status)}`}>
                    {order.status || 'Pending'}
                  </span>
                </td>
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
                <Col md={6}>
                  <h5>Transaction ID: {selectedOrder.transactionId}</h5>
                  <h5>Nama: {selectedOrder.user?.username || 'Unknown User'}</h5>
                  <h5>Alamat: {selectedOrder.address}</h5>
                  <h5>Nomor Telpon: {selectedOrder.phone}</h5>
                  <h5>Email: {selectedOrder.email}</h5>
                </Col>
                <Col md={6}>
                  <h5>Order Date: {new Date(selectedOrder.createdAt).toLocaleDateString()}</h5>
                  <h5>Payment Method: {selectedOrder.midtransStatus?.payment_type || 'Pending'}</h5>
                  <h5>Payment Status: 
                    <span className={`badge ms-2 ${getPaymentStatusBadge(selectedOrder.midtransStatus?.transaction_status)}`}>
                      {selectedOrder.midtransStatus?.transaction_status || 'Pending'}
                    </span>
                  </h5>
                  <h5>Order Status: 
                    <span className={`badge ms-2 ${getOrderStatusBadge(selectedOrder.status)}`}>
                      {selectedOrder.status || 'Pending'}
                    </span>
                  </h5>
                  <h5>Total Harga: {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                  }).format(selectedOrder.total)}</h5>
                  {selectedOrder.midtransStatus?.settlement_time && (
                    <h5>Settlement Time: {new Date(selectedOrder.midtransStatus.settlement_time).toLocaleString()}</h5>
                  )}
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
                  {selectedOrder.items?.map((item, idx) => (
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
                        }).format((item.product?.price || 0) * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              
              {/* Additional Payment Information */}
              {selectedOrder.midtransStatus && (
                <>
                  <hr />
                  <h5>Payment Information:</h5>
                  <Row>
                    <Col md={6}>
                      {selectedOrder.midtransStatus.bank && (
                        <p><strong>Bank:</strong> {selectedOrder.midtransStatus.bank}</p>
                      )}
                      {selectedOrder.midtransStatus.va_numbers && selectedOrder.midtransStatus.va_numbers.length > 0 && (
                        <p><strong>VA Number:</strong> {selectedOrder.midtransStatus.va_numbers[0].va_number}</p>
                      )}
                      {selectedOrder.midtransStatus.bill_key && (
                        <p><strong>Bill Key:</strong> {selectedOrder.midtransStatus.bill_key}</p>
                      )}
                      {selectedOrder.midtransStatus.biller_code && (
                        <p><strong>Biller Code:</strong> {selectedOrder.midtransStatus.biller_code}</p>
                      )}
                    </Col>
                    <Col md={6}>
                      {selectedOrder.midtransStatus.gross_amount && (
                        <p><strong>Gross Amount:</strong> {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                        }).format(selectedOrder.midtransStatus.gross_amount)}</p>
                      )}
                      {selectedOrder.midtransStatus.transaction_time && (
                        <p><strong>Transaction Time:</strong> {new Date(selectedOrder.midtransStatus.transaction_time).toLocaleString()}</p>
                      )}
                      {selectedOrder.midtransStatus.fraud_status && (
                        <p><strong>Fraud Status:</strong> 
                          <span className={`badge ms-2 ${getFraudStatusBadge(selectedOrder.midtransStatus.fraud_status)}`}>
                            {selectedOrder.midtransStatus.fraud_status}
                          </span>
                        </p>
                      )}
                    </Col>
                  </Row>
                </>
              )}
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