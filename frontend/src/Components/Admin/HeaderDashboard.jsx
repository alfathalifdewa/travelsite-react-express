// src/Components/Admin/HeaderDashboard.js
import { Link } from "react-router-dom";
import React from "react";
import { Navbar, Container, Nav, Dropdown, Offcanvas } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';

function HeaderDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/logout');
  };

  return (
    <Navbar expand="lg" className="mb-3 navbar-container" sticky="top">
      <Container fluid>
        <Navbar.Toggle aria-controls={`offcanvasNavbarLabel-expand-lg`} />
        <Navbar.Brand as={Link} to="/dashboard" className="d-flex align-items-center">
          <h1 className="fw-bold">
            MATA<span>ELANG</span>
          </h1>
        </Navbar.Brand>
        <Navbar.Offcanvas
          id={`offcanvasNavbarLabel-expand-lg`}
          aria-labelledby={`offcanvasNavbarLabel-expand-lg`}
          placement="start"
          className="offcanvas-animation"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title
              id={`offcanvasNavbarLabel-expand-lg`}
              className="d-flex align-items-center"
            >
              <h3 className="fw-bold">
                MATA<span style={{ color: "rgba(226,23,70,0.8)" }}>ELANG</span>
              </h3>
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Nav className="justify-content-center w-100 fs-5">
              <Nav.Link as={Link} to="/dashboard">
                Dashboard
              </Nav.Link>
              <Nav.Link as={Link} to="/dashboard/user-list">
                User List
              </Nav.Link>
              <Nav.Link as={Link} to="/dashboard/product-list">
                Produk 
              </Nav.Link>
              <Nav.Link as={Link} to="/dashboard/category-list">
                Katagory
              </Nav.Link>
              <Nav.Link as={Link} to="/dashboard/order-list">
                Orderan
              </Nav.Link>
            </Nav>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
        <Nav className="ms-auto">
          <Dropdown align="end">
            <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
              Profile
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item as={Link} to="/dashboard/my-profile">My Profile</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </Container>
    </Navbar>
  );
}

export default HeaderDashboard;
