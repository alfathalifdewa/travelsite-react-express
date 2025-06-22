import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../api";
import { Container, Row, Col, Card, Button, Alert, Spinner } from "react-bootstrap";
import Header from "../../Components/User/Header";
import Footer from "../../Components/User/Footer";
import FloatingCart from '../../Components/User/FloatingCart';

const ProductsByCategory = () => {
  const { id_category } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products based on category or all products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      let response;
      if (id_category) {
        // Try different possible endpoints for category products
        try {
          response = await api.get(`/products/category/${id_category}`);
        } catch (err) {
          // Fallback: try alternative endpoint
          console.log("Trying alternative endpoint for products by category");
          response = await api.get(`/products?category=${id_category}`);
        }
      } else {
        // Fetch all products
        response = await api.get('/products');
      }
      
      // Handle different response structures
      const productsData = response.data.products || response.data.data || response.data || [];
      setProducts(Array.isArray(productsData) ? productsData : []);
      
    } catch (error) {
      console.error("Error fetching products", error);
      setError("Gagal memuat produk. Silakan coba lagi.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch category information
  const fetchCategoryInfo = async () => {
    try {
      if (id_category) {
        let response;
        try {
          response = await api.get(`/category/${id_category}`);
        } catch (err) {
          // Fallback: try getting from categories list
          console.log("Trying to get category from categories list");
          const categoriesResponse = await api.get('/category');
          const allCategories = categoriesResponse.data.category || categoriesResponse.data.data || categoriesResponse.data || [];
          const foundCategory = allCategories.find(cat => cat.id_category === id_category || cat._id === id_category);
          if (foundCategory) {
            setCategory(foundCategory);
            return;
          }
          throw err;
        }
        
        // Handle different response structures
        const categoryData = response.data.category || response.data.data || response.data;
        setCategory(categoryData);
      } else {
        setCategory(null);
      }
    } catch (error) {
      console.error("Error fetching category info", error);
      setCategory(null);
    }
  };

  // Fetch all categories for the sidebar
  const fetchAllCategories = async () => {
    try {
      const response = await api.get('/category');
      // Handle different response structures
      const categoriesData = response.data.category || response.data.data || response.data || [];
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error("Error fetching categories", error);
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategoryInfo();
    fetchAllCategories();
  }, [id_category]);

  // Navigate to product detail page
  const handleProductClick = (product) => {
    navigate(`/products/detail-product/${product._id}`);
  };

  // Handle category selection
  const handleCategoryClick = (selectedCategoryId) => {
    console.log("Category clicked:", selectedCategoryId); // Debug log
    // If the selected category is already the current category, navigate to all products
    if (id_category === selectedCategoryId) {
      navigate('/products');
    } else {
      navigate(`/products/${selectedCategoryId}`);
    }
  };

  // Format IDR currency
  const formatIDR = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Function to render product image (handle both single image and image array)
  const renderProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return product.image || '/assets/placeholder-image.png';
  };

  // Handle "All Products" button click
  const handleAllProductsClick = () => {
    navigate('/products');
  };

  return (
    <>
      <Header />
      <FloatingCart />
      <Container fluid className="product-container py-4">
        <Row>
          {/* Products Section - Left Side */}
          <Col md={9}>
            {/* Category Header */}
            <Row className="category-header justify-content-between align-items-center mb-4">
              <Col>
                <h4 className="mb-0">
                  {category 
                    ? `${category.categoryName || category.name}` 
                    : 'Semua Produk'}
                </h4>
                <p className="text-muted mt-1">
                  {products.length} produk ditemukan
                </p>
              </Col>
              {id_category && (
                <Col xs="auto">
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={handleAllProductsClick}
                  >
                    Lihat Semua Produk
                  </Button>
                </Col>
              )}
            </Row>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-5">
                <Spinner animation="border" role="status" variant="primary">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-2 text-muted">Memuat produk...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <Alert variant="danger" className="text-center">
                {error}
                <div className="mt-2">
                  <Button variant="outline-danger" size="sm" onClick={fetchProducts}>
                    Coba Lagi
                  </Button>
                </div>
              </Alert>
            )}

            {/* Product Cards */}
            {!loading && !error && (
              <>
                {products.length === 0 ? (
                  <Alert variant="info" className="text-center py-5">
                    <h5>Tidak ada produk tersedia</h5>
                    <p className="mb-3">
                      {category 
                        ? `Belum ada produk dalam kategori "${category.categoryName || category.name}".` 
                        : 'Belum ada produk yang tersedia saat ini.'}
                    </p>
                    <Button variant="primary" onClick={handleAllProductsClick}>
                      Jelajahi Semua Produk
                    </Button>
                  </Alert>
                ) : (
                  <Row className="g-4">
                    {products.map((item) => (
                      <Col
                        key={item._id}
                        xs={12}
                        sm={6}
                        md={4}
                        lg={3}
                      >
                        <Card
                          className="product-card h-100 border-0 shadow-sm"
                          style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                          onClick={() => handleProductClick(item)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                          }}
                        >
                          <div style={{ height: '200px', overflow: 'hidden' }}>
                            <Card.Img
                              variant="top"
                              src={renderProductImage(item)}
                              className="product-card-img"
                              style={{ 
                                height: '100%', 
                                objectFit: 'cover',
                                transition: 'transform 0.3s'
                              }}
                              onError={(e) => {
                                e.target.onerror = null; // Prevent infinite loop
                                e.target.src = '/assets/placeholder-image.png';
                              }}
                            />
                          </div>
                          <Card.Body className="d-flex flex-column">
                            <Card.Title 
                              className="product-name mb-2" 
                              style={{ 
                                fontSize: '1rem',
                                fontWeight: '600',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                            >
                              {item.productName}
                            </Card.Title>
                            <Card.Text 
                              className="product-price mb-3" 
                              style={{ 
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                color: '#007bff'
                              }}
                            >
                              {formatIDR(item.price)}
                            </Card.Text>
                            <Button 
                              variant="outline-primary" 
                              className="w-100 mt-auto"
                              size="sm"
                            >
                              Lihat Detail
                            </Button>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </>
            )}
          </Col>

          {/* Categories Section - Right Side */}
          <Col md={3} className="bg-light py-4" style={{ borderRadius: '10px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="mb-0">Kategori</h5>
              <Button
                variant={!id_category ? "primary" : "outline-primary"}
                size="sm"
                onClick={handleAllProductsClick}
              >
                Semua
              </Button>
            </div>
            
            <div className="d-grid gap-2">
              {categories.length > 0 ? (
                categories.map((categoryItem) => (
                  <Card 
                    key={categoryItem.id_category || categoryItem._id}
                    className="category-card border-0 mb-2"
                    style={{ 
                      backgroundColor: (id_category === categoryItem.id_category || id_category === categoryItem._id) ? '#e3f2fd' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      border: (id_category === categoryItem.id_category || id_category === categoryItem._id) ? '2px solid #2196f3' : '1px solid #e0e0e0'
                    }}
                    onClick={() => handleCategoryClick(categoryItem.id_category || categoryItem._id)}
                    onMouseEnter={(e) => {
                      if (id_category !== categoryItem.id_category && id_category !== categoryItem._id) {
                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (id_category !== categoryItem.id_category && id_category !== categoryItem._id) {
                        e.currentTarget.style.backgroundColor = 'white';
                      }
                    }}
                  >
                    <Card.Body className="d-flex align-items-center py-3">
                      <div 
                        className="me-3" 
                        style={{ 
                          fontSize: '1.5rem',
                          minWidth: '40px',
                          textAlign: 'center'
                        }}
                      >
                        {categoryItem.icon || "📦"}
                      </div>
                      <div className="flex-grow-1">
                        <Card.Title 
                          className="mb-0" 
                          style={{ 
                            fontSize: '0.95rem',
                            fontWeight: (id_category === categoryItem.id_category || id_category === categoryItem._id) ? '600' : '500',
                            color: (id_category === categoryItem.id_category || id_category === categoryItem._id) ? '#1976d2' : '#333'
                          }}
                        >
                          {categoryItem.categoryName || categoryItem.name}
                        </Card.Title>
                      </div>
                      {(id_category === categoryItem.id_category || id_category === categoryItem._id) && (
                        <div className="text-primary">
                          <i className="fas fa-check-circle"></i>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                ))
              ) : (
                <div className="text-center py-3">
                  <p className="text-muted mb-0">Tidak ada kategori tersedia</p>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Container>
      <Footer />
    </>
  );
};

export default ProductsByCategory;