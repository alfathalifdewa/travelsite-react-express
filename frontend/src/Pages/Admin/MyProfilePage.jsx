import React, { useState, useEffect } from "react";
import { Button, Container, Row, Col, Form, Card } from "react-bootstrap";
import HeaderDashboard from "../../Components/Admin/HeaderDashboard";
import api from "../../api";

function MyProfilePage() {
  const [initialValues, setInitialValues] = useState({
    fullName: "",
    username: "",
    email: "",
    phoneNumber: "",
    address: "",
  });

  const [formData, setFormData] = useState({ ...initialValues });
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    // Fetch user data from the server
    const fetchUserData = async () => {
      try {
        const response = await api.get("/users/me");
        const userData = response.data;
        setInitialValues({
          fullName: userData.fullName || "",
          username: userData.username || "",
          email: userData.email || "",
          phoneNumber: userData.phone || "",
          address: userData.address || "",
        });
        setFormData({
          fullName: userData.fullName || "",
          username: userData.username || "",
          email: userData.email || "",
          phoneNumber: userData.phone || "",
          address: userData.address || "",
        });
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const saveProfile = async (event) => {
    event.preventDefault();
    try {
      await api.put("/users/updateUser", formData);
      console.log("Profile updated:", formData);
      setEditMode(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const cancelEdit = () => {
    setFormData({ ...initialValues });
    setEditMode(false);
  };

  return (
    <>
      <HeaderDashboard />
      <Container className="mt-5">
        <Card className="shadow border-0">
          <Card.Body>
            <h2 className="title-profile" style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "30px" }}>
              My Profile
            </h2>
            <Form onSubmit={saveProfile}>
              <Row className="mb-3">
                <Col md={6} className="mb-3">
                  <Form.Group controlId="username">
                    <Form.Label className="fw-semibold">Nama</Form.Label>
                    {editMode ? (
                      <Form.Control
                        type="text"
                        value={formData.username}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                        placeholder="Enter username"
                      />
                    ) : (
                      <div>{formData.username}</div>
                    )}
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group controlId="email">
                    <Form.Label className="fw-semibold">Email</Form.Label>
                    {editMode ? (
                      <Form.Control
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="Enter email address"
                      />
                    ) : (
                      <div>{formData.email}</div>
                    )}
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group controlId="phoneNumber">
                    <Form.Label className="fw-semibold">Nomor Telpon</Form.Label>
                    {editMode ? (
                      <Form.Control
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            phoneNumber: e.target.value,
                          })
                        }
                        placeholder="Enter phone number"
                      />
                    ) : (
                      <div>{formData.phoneNumber}</div>
                    )}
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Group controlId="address">
                    <Form.Label className="fw-semibold">Alamat</Form.Label>
                    {editMode ? (
                      <Form.Control
                        type="text"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        placeholder="Enter address"
                      />
                    ) : (
                      <div>{formData.address}</div>
                    )}
                  </Form.Group>
                </Col>
              </Row>
              {editMode ? (
                <div className="d-flex justify-content-left text-center">
                  <Button type="submit" variant="primary" className="me-3">
                    Update
                  </Button>
                  <Button variant="secondary" onClick={cancelEdit}>
                    Batal
                  </Button>
                </div>
              ) : (
                <Button variant="primary" onClick={() => setEditMode(true)}>
                  Edit
                </Button>
              )}
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}

export default MyProfilePage;
