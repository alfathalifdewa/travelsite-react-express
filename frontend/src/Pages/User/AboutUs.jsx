import React from "react";
import { Container, Row, Col, Image, Card } from "react-bootstrap";
import { StarFill, Star } from "react-bootstrap-icons";
import about01 from "../../assets/img/about01.jpg";
import about02 from "../../assets/img/about02.jpg";
import testimonials01 from "../../assets/img/testimonial-img-1.png";
import testimonials02 from "../../assets/img/testimonial-img-2.png";
import testimonials03 from "../../assets/img/testimonial-img-3.png";
import testimonials04 from "../../assets/img/testimonial-img-4.png";
import "../../assets/css/About.css";
import Header from "../../Components/User/Header";
import Footer from "../../Components/User/Footer";

const About = () => {
  const StarRating = ({ stars }) => {
    const filledStars = Array(stars).fill(true);
    const emptyStars = Array(5 - stars).fill(false);
    const allStars = [...filledStars, ...emptyStars];

    return (
      <div className="bsb-ratings text-warning mb-3">
        {allStars.map((filled, index) => (
          <span key={index}>{filled ? <StarFill /> : <Star />}</span>
        ))}
      </div>
    );
  };

  return (
    <>
      <Header />
      <section>
        {/* HERO */}
        <div
          className="text-center bg-image"
          style={{
            backgroundImage: `url(${about01})`,
            height: 600,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div
            className="mask"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.3)", height: "100%" }}
          >
            <Container className="h-100">
              <Row className="d-flex justify-content-center align-items-center h-100">
                <Col className="text-white">
                  <h1 className="mb-3">
                    Jelajahi Keindahan Indonesia Bersama Mata Elang Travel
                  </h1>
                  <h4 className="mb-3">
                    Mata Elang Travel adalah partner perjalanan terpercaya untuk 
                    menjelajahi destinasi wisata terbaik di Indonesia dan mancanegara.
                  </h4>
                </Col>
              </Row>
            </Container>
          </div>
        </div>

        {/* ABOUT US */}
        <Container className="mt-5 about-container">
          <Row className="gy-3 gy-md-4 gy-lg-0 align-items-lg-center">
            <Col xs={12} lg={6} xl={5}>
              <Image fluid rounded src={about02} alt="About Mata Elang Travel" loading="lazy" />
            </Col>
            <Col xs={12} lg={6} xl={7}>
              <Row className="justify-content-xl-center">
                <Col xs={12} xl={11}>
                  <h3 className="fs-4 mb-3 text-secondary text-uppercase">
                    Tentang Mata Elang Travel
                  </h3>
                  <p className="lead fs-4 mb-3">
                    Mata Elang Travel adalah agen perjalanan wisata yang berpengalaman 
                    dalam menghadirkan petualangan tak terlupakan ke berbagai destinasi 
                    eksotis di Indonesia dan dunia.
                  </p>
                  <p className="mb-5">
                    Kami adalah perusahaan yang berkembang pesat dengan komitmen tinggi 
                    terhadap kepuasan pelanggan. Dengan pengalaman lebih dari 10 tahun 
                    di industri pariwisata, kami memahami kebutuhan setiap traveler dan 
                    menyediakan layanan tour yang personal, aman, dan berkesan. Tim 
                    profesional kami selalu siap membantu mewujudkan perjalanan impian Anda.
                  </p>
                  <Row className="gy-4 gy-md-0 gx-xxl-5X">
                    <Col xs={12} md={6}>
                      <Card className="border-0 shadow">
                        <Card.Body className="d-flex align-items-start">
                          <div>
                            <h4 className="h4 mb-3">Visi</h4>
                            <p className="text-secondary mb-0">
                              Menjadi agen perjalanan wisata terdepan di Indonesia 
                              yang memberikan pengalaman traveling terbaik dengan 
                              layanan profesional, inovatif, dan terpercaya untuk 
                              setiap pelanggan.
                            </p>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col xs={12} md={6}>
                      <Card className="border-0 shadow">
                        <Card.Body className="d-flex align-items-start">
                          <div>
                            <h4 className="h4 mb-3">Misi</h4>
                            <p className="text-secondary mb-0">
                              Menyediakan paket wisata berkualitas tinggi dengan 
                              harga terjangkau, memberikan pelayanan prima kepada 
                              setiap pelanggan, dan mempromosikan keindahan wisata 
                              Indonesia kepada dunia.
                            </p>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>

        {/* OUR SUCCESS */}
        <Container className="mt-5 penjualan-container">
          <Row className="justify-content-md-center">
            <Col xs={12} md={10} lg={8} xl={7}>
              <h3 className="fs-4 m-4 text-secondary text-center text-uppercase">
                Pencapaian Kami
              </h3>
            </Col>
          </Row>
          <Row className="gy-3 gy-md-4 gy-lg-0 align-items-lg-center">
            <Col xs={12}>
              <Container fluid className="bg-accent border-0 ">
                <Row>
                  <Col xs={12} md={4} className="p-0">
                    <Card border="0" className="bg-transparent">
                      <Card.Body className="text-center p-4 p-xxl-5">
                        <h3 className="display-4 fw-bold mb-2 fs-1">150+</h3>
                        <p className="fs-6 mb-0 text-secondary">Destinasi Wisata</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col xs={12} md={4} className="p-0 border-start border-end">
                    <Card border="0" className="bg-transparent">
                      <Card.Body className="text-center p-4 p-xxl-5">
                        <h3 className="display-4 fw-bold mb-2 fs-1">25rb+</h3>
                        <p className="fs-6 mb-0 text-secondary">
                          Wisatawan Terlayani
                        </p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col xs={12} md={4} className="p-0">
                    <Card border="0" className="bg-transparent">
                      <Card.Body className="text-center p-4 p-xxl-5">
                        <h3 className="display-4 fw-bold mb-2 fs-1">10+</h3>
                        <p className="fs-6 mb-0 text-secondary">Tahun Pengalaman</p>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Container>
            </Col>
          </Row>
        </Container>

        {/* TESTIMONIALS */}
        <Container className="mt-5 testi-container">
          <Row>
            <Col xs={12} md={10} lg={8}>
              <h3 className="fs-4 mb-3 text-secondary text-uppercase">
                Testimoni Wisatawan
              </h3>
            </Col>
          </Row>
        </Container>

        <Container className="overflow-hidden testi-container">
          <Row className="gy-3 gy-lg-4">
            <Col xs={12} lg={6}>
              <Card className="border-0 shadow">
                <Card.Body className="p-4 p-xxl-5">
                  <StarRating stars={5} />
                  <blockquote className="bsb-blockquote-icon mb-3">
                    Mata Elang Travel memberikan pengalaman traveling yang luar biasa! 
                    Trip ke Bali bersama keluarga sangat berkesan. Guide yang profesional, 
                    itinerary yang sempurna, dan pelayanan yang ramah. Pasti akan booking 
                    lagi untuk destinasi lainnya!
                  </blockquote>
                  <figure className="d-flex align-items-center m-0 p-0">
                    <Image
                      className="fluid rounded rounded-circle m-0 border border-5"
                      loading="lazy"
                      src={testimonials01}
                      alt=""
                    />
                    <figcaption className="ms-3">
                      <h4 className="mb-1 h5">Sari Dewi</h4>
                      <h5 className="fs-6 text-secondary mb-0">
                        Travel Enthusiast
                      </h5>
                    </figcaption>
                  </figure>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} lg={6}>
              <Card className="border-0 shadow">
                <Card.Body className="p-4 p-xxl-5">
                  <StarRating stars={4} />
                  <blockquote className="bsb-blockquote-icon mb-3">
                    Paket honeymoon ke Raja Ampat sangat romantis dan berkesan. 
                    Pemandangan bawah laut yang menakjubkan dan fasilitas yang 
                    memuaskan. Hanya saja cuaca kurang mendukung, tapi overall 
                    pelayanan Mata Elang Travel sangat baik.
                  </blockquote>
                  <figure className="d-flex align-items-center m-0 p-0">
                    <Image
                      className="fluid rounded rounded-circle m-0 border border-5"
                      loading="lazy"
                      src={testimonials02}
                      alt=""
                    />
                    <figcaption className="ms-3">
                      <h4 className="mb-1 h5">Andi & Rina</h4>
                      <h5 className="fs-6 text-secondary mb-0">
                        Honeymooner
                      </h5>
                    </figcaption>
                  </figure>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} lg={6}>
              <Card className="border-0 shadow mb-3">
                <Card.Body className="p-4 p-xxl-5">
                  <StarRating stars={5} />
                  <blockquote className="bsb-blockquote-icon mb-3">
                    Trip adventure ke Bromo-Tengger-Semeru bersama teman-teman 
                    sangat seru! Mata Elang Travel mengatur semuanya dengan detail, 
                    dari transportasi, penginapan, hingga pemandu yang berpengalaman. 
                    Recommended banget!
                  </blockquote>
                  <figure className="d-flex align-items-center m-0 p-0">
                    <Image
                      className="fluid rounded rounded-circle m-0 border border-5"
                      loading="lazy"
                      src={testimonials03}
                      alt=""
                    />
                    <figcaption className="ms-3">
                      <h4 className="mb-1 h5">Budi Santoso</h4>
                      <h5 className="fs-6 text-secondary mb-0">
                        Adventure Traveler
                      </h5>
                    </figcaption>
                  </figure>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} lg={6}>
              <Card className="border-0 shadow mb-3">
                <Card.Body className="p-4 p-xxl-5">
                  <StarRating stars={5} />
                  <blockquote className="bsb-blockquote-icon mb-3">
                    Family trip ke Yogyakarta sangat menyenangkan! Anak-anak 
                    senang dengan kunjungan ke Candi Borobudur dan Malioboro. 
                    Mata Elang Travel sangat memahami kebutuhan keluarga dengan 
                    anak kecil. Terima kasih!
                  </blockquote>
                  <figure className="d-flex align-items-center m-0 p-0">
                    <Image
                      className="fluid rounded rounded-circle m-0 border border-5"
                      loading="lazy"
                      src={testimonials04}
                      alt=""
                    />
                    <figcaption className="ms-3">
                      <h4 className="mb-1 h5">Keluarga Wijaya</h4>
                      <h5 className="fs-6 text-secondary mb-0">
                        Family Travelers
                      </h5>
                    </figcaption>
                  </figure>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
      <Footer />
    </>
  );
};

export default About;