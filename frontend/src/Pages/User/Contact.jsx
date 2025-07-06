import React, { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import {
  Envelope,
  Geo,
  TelephoneOutbound,
  ClockHistory,
} from "react-bootstrap-icons";
import Header from "../../Components/User/Header";
import Footer from "../../Components/User/Footer";

const Contact = () => {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const whatsappMessage = `Nama Lengkap: ${fullname}%0AEmail: ${email}%0ANomor Telepon: ${phone}%0APesan: ${message}`;
    const whatsappURL = `https://api.whatsapp.com/send?phone=+6281584353432&text=${whatsappMessage}`;
    window.open(whatsappURL, "_blank");
  };

  return (
    <>
      <Header />
      <section
        id="scrollspyContact"
        className="py-4 py-md-4 py-xl-8 pb-xxl-0 bsb-section-pt-xxl-1"
      >
        <Container>
          <Row>
            <Col xs={12} md={10} lg={8}>
              <h3 className="fs-4 mb-3 text-secondary text-uppercase">
                Masukkan Ulang Pesanan Anda Disini
              </h3>
            </Col>
          </Row>
        </Container>

        <Container>
          <Row className="gy-4 gy-md-5 gy-lg-0 align-items-md-center">
            <Col xs={12} lg={6}>
              <div className="bg-accent shadow border-0 overflow-hidden">
                <Form onSubmit={handleSubmit}>
                  <Row className="gy-4 gy-xl-5 p-4 p-xl-5">
                    <Col xs={12}>
                      <Form.Group controlId="fullname">
                        <Form.Label>
                          Nama Lengkap<span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          required
                          value={fullname}
                          onChange={(e) => setFullname(e.target.value)}
                          placeholder="Masukkan nama lengkap Anda"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group controlId="email">
                        <Form.Label>
                          Email <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="contoh@email.com"
                        />
                      </Form.Group>

                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group controlId="phone">
                        <Form.Label>Nomor Telepon</Form.Label>
                        <Form.Control
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="08xxxxxxxxxx"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12}>
                      <Form.Group controlId="message">
                        <Form.Label>
                          Pesan <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          required
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Masukkan Deskripsi Pesanan..."
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12}>
                      <div className="d-grid">
                        <Button variant="primary" size="lg" type="submit">
                          Kirim Pesan
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Form>
              </div>
            </Col>

            <Col xs={12} lg={6}>
              <Row className="justify-content-xl-center">
                <Col xs={12} xl={11}>
                  <div className="mb-4 mb-md-5">
                    <div className="mb-3 text-primary">
                      <Geo size={32} />
                    </div>
                    <div>
                      <h4 className="mb-2">Kantor Kami</h4>
                      <hr className="w-50 mb-3 border-dark-subtle" />
                      <address className="m-0 text-secondary">
                        Pulau Pramuka<br />
                        Jakarta Pusat, DKI Jakarta 10220<br />
                        Indonesia
                      </address>
                    </div>
                  </div>
                  <div className="row mb-sm-4 mb-md-5">
                    <Col xs={12} sm={6}>
                      <div className="mb-4 mb-sm-0">
                        <div className="mb-3 text-primary">
                          <TelephoneOutbound size={32} />
                        </div>
                        <div>
                          <h4 className="mb-2">Customer Service</h4>
                          <hr className="w-50 my-3 border-dark-subtle" />
                          <p className="mb-0 text-secondary">
                            +62 21 1234 5678
                          </p>
                          <p className="mb-0 text-secondary">
                            +62 851 1171 1281 (WhatsApp)
                          </p>
                        </div>
                      </div>
                    </Col>
                    <Col xs={12} sm={6}>
                      <div>
                        <div className="mb-3 text-primary">
                          <Envelope size={32} />
                        </div>
                        <div>
                          <h4 className="mb-2">Email</h4>
                          <hr className="w-50 my-3 border-dark-subtle" />
                          <p className="mb-0 text-secondary">
                            info@mataelangtravel.com
                          </p>
                          <p className="mb-0 text-secondary">
                            booking@mataelangtravel.com
                          </p>
                        </div>
                      </div>
                    </Col>
                  </div>
                  <div>
                    <div className="mb-3 text-primary">
                      <ClockHistory size={32} />
                    </div>
                    <div>
                      <h4 className="mb-2">Jam Operasional Kerja</h4>
                      <hr className="w-50 my-3 border-dark-subtle" />
                      <p className="mb-2 text-secondary">
                        Senin - Jumat: 08:00 - 18:00 WIB
                      </p>
                      <p className="mb-2 text-secondary">
                        Sabtu: 08:00 - 15:00 WIB
                      </p>
                      <p className="m-0 text-secondary">
                        Minggu & Hari Libur: 24/7 Emergency Support
                      </p>
                    </div>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </section>
      <Footer />
    </>
  );
};

export default Contact;