import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../Components/User/Header";
import Footer from "../../Components/User/Footer";
import FloatingCart from '../../Components/User/FloatingCart';
import api from "../../api";
import "../../assets/css/Home.css";

// Import gambar destinasi wisata
import baliImage from "../../assets/img/bali.jpg";
import borobudurImage from "../../assets/img/borobudur.jpg";
import rajaAmpatImage from "../../assets/img/rajaAmpat.jpg";
import labuanBajoImage from "../../assets/img/labuanBajo.jpg";
import mataElangBanner from "../../assets/img/travelbanner.jpg";

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        setProducts(response.data.products);
      } catch (error) {
        console.error("Terjadi kesalahan saat mengambil data produk!", error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/category');
        setCategories(response.data.category);
      } catch (error) {
        console.error("Terjadi kesalahan saat mengambil data kategori!", error);
      }
    };

    fetchCategories();
  }, []);

  const travelDestinations = [
    {
      image: "https://pulauseribu.jakarta.go.id/img/877952.jpg",
      name: "Pulau Pramuka",
      path: "https://id.wikipedia.org/wiki/Pulau_Pramuka",
    },
    {
      image: "https://static.promediateknologi.id/crop/0x0:0x0/750x500/webp/photo/p1/593/2025/01/12/pantaipasirperawan-1084375902.jpg",
      name: "Pulau Pari",
      path: "https://id.wikipedia.org/wiki/Pulau_Pari,_Kepulauan_Seribu_Selatan,_Kepulauan_Seribu",
    },
    {
      image: "https://assets.promediateknologi.id/crop/0x0:0x0/750x500/webp/photo/2023/02/03/3357793103.jpg",
      name: "Pulau Harapan",
      path: "https://id.wikipedia.org/wiki/Pulau_Harapan,_Kepulauan_Seribu_Utara,_Kepulauan_Seribu",
    },
    {
      image: "https://static.promediateknologi.id/crop/0x0:0x0/0x0/webp/photo/p2/212/2024/06/30/IMG-20240630-WA0012-2991586499.jpg",
      name: "Labuan Tidung",
      path: "https://id.wikipedia.org/wiki/Pulau_Tidung_Besar",
    },
  ];

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  const handleProductClick = (product) => {
    navigate(`/products/detail-product/${product._id}`);
  };

  // Function to render product image (first image from array or fallback to single image)
  const renderProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return product.image;
  };

  return (
    <>
      <Header />
      <FloatingCart />

      {/* BANNER IMAGE */}
      <div className="banner-container mt-0">
        <img
          className="d-block w-100 banner-image"
          src={"https://images.pexels.com/photos/1021073/pexels-photo-1021073.jpeg"}
          alt="Banner Image"
          style={{ height: '600px', objectFit: 'cover' }}
        />
      </div>

      {/* KATEGORI */}
      <Container className="py-3 py-md-5 py-xl-8 pb-xxl-0 bsb-section-pt-xxl-1 category-container">
        <Row className="justify-content-center category-box border-0">
          <Col xs={12}>
            <Row className="align-items-center justify-content-between">
              <Col>
                <h5>Kategori</h5>
              </Col>
            </Row>
            <Row
              className="g-3 justify-content-center"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "1rem",
              }}
            >
              {categories.map((category) => (
                <div key={category.id_category} className="d-flex justify-content-center">
                  <Card className="h-100 category-card border-0">
                    <Link to={`/products/${category.id_category}`} className="text-decoration-none text-dark">
                      <Card.Body className="d-flex flex-column align-items-center">
                        <div className="display-6 category-icon">
                          {category.icon || "📦"}
                        </div>
                        <Card.Title className="mt-3 category-name">
                          {category.categoryName}
                        </Card.Title>
                      </Card.Body>
                    </Link>
                  </Card>
                </div>
              ))}
            </Row>
          </Col>
        </Row>
      </Container>

      {/* DESTINASI WISATA */}
      <Container className="py-3 py-md-5 py-xl-8 pb-xxl-0 bsb-section-pt-xxl-1 diagnosis-container">
        <Row className="diagnosis-box justify-content-center">
          <Col xs={12}>
            <Row className="align-items-center justify-content-between">
              <Col>
                <h5> Artikel Pulau Seribu</h5>
              </Col>
              <Col xs="auto">
                <Button 
                  variant="link" 
                  className="see-all-button" 
                  as="a"
                  href="https://www.indonesia.travel/id/id/home"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Lihat Semua
                </Button>
              </Col>
            </Row>
            <Row
              className="g-3 justify-content-center"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "1rem",
              }}
            >
              {travelDestinations.map((item, index) => (
                <div key={index} className="d-flex justify-content-center">
                  <Card className="diagnosis-card h-100 border-0">
                    <a href={item.path} rel="noopener noreferrer">
                      <Card.Img variant="top" src={item.image} className="diagnosis-card-img" />
                      <Card.ImgOverlay className="d-flex flex-column justify-content-end">
                        <Card.Title className="diagnosis-name p-2">{item.name}</Card.Title>
                      </Card.ImgOverlay>
                    </a>
                  </Card>
                </div>
              ))}
            </Row>
          </Col>
        </Row>
      </Container>

      {/* PRODUK */}
      <Container className="py-3 py-md-5 py-xl-8 pb-xxl-0 bsb-section-pt-xxl-1 product-container">
        <Row className="product-box justify-content-center">
          <Col xs={12}>
            <Row className="align-items-center justify-content-between">
              <Col>
                <h5>Produk Populer</h5>
              </Col>
              <Col xs="auto">
                <Button variant="link" className="see-all-button" as={Link} to="/products">
                  Lihat Semua
                </Button>
              </Col>
            </Row>
            <Row
              className="g-1 justify-content-center"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "1rem",
              }}
            >
              {products.length > 0 ? (
                products.slice(0, 4).map((product) => (
                  <div key={product._id} className="d-flex justify-content-center">
                    <Card className="product-card h-100 border-0" onClick={() => handleProductClick(product)}>
                      <Card.Img 
                        variant="top" 
                        src={renderProductImage(product)} 
                        className="product-card-img" 
                        style={{ height: '200px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.onerror = null; // Prevent infinite loop
                          e.target.src = '/assets/placeholder-image.png'; // Fallback image
                        }}
                      />
                      <Card.Body className="d-flex flex-column justify-content-between">
                        <Card.Title className="product-name">{product.productName}</Card.Title>
                        <Card.Text className="product-price">{formatRupiah(product.price)}</Card.Text>
                        <Button variant="outline-primary" className="pe-3 ps-3">
                          Detail
                        </Button>
                      </Card.Body>
                    </Card>
                  </div>
                ))
              ) : (
                <div style={{ gridColumn: "1 / -1", textAlign: "center" }}>
                  <p>Tidak ada produk tersedia.</p>
                </div>
              )}
            </Row>
          </Col>
        </Row>
      </Container>
      <Footer />
    </>
  );
};

export default Home;