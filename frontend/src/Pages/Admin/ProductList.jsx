// ProductList.js
import React, { useState, useEffect } from "react";
import {
  Container, Table, Button, Modal, Form,
  Row, Col, Alert, Image, Badge, ProgressBar
} from "react-bootstrap";
import api from "../../api";
import HeaderDashboard from "../../Components/Admin/HeaderDashboard";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [newProduct, setNewProduct] = useState({
    productName: "",
    id_category: "",
    images: [],
    desc: "",
    price: 0,
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [imagesToRemove, setImagesToRemove] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products");
      if (res.data.success) setProducts(res.data.products);
      else setError("Failed to fetch products");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/category");
      setCategories(res.data.category || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch categories");
    }
  };

  const validateFiles = (files) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const errors = [];

    for (let file of files) {
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: Invalid file type. Only JPEG, PNG, and WebP are allowed.`);
      }
      if (file.size > maxSize) {
        errors.push(`${file.name}: File size too large. Maximum 10MB allowed.`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const resetForm = () => {
    setSelectedProduct(null);
    setNewProduct({ productName: "", id_category: "", images: [], desc: "", price: 0 });
    setSelectedFiles([]);
    setPreviewImages([]);
    setImagesToRemove([]);
    setUploadProgress(0);
    setError("");
    setSuccess("");
  };

  const openModal = (product = null) => {
    resetForm();
    if (product) {
      setSelectedProduct(product);
      setNewProduct({
        productName: product.productName,
        id_category: product.id_category?._id || product.id_category,
        images: product.images || [],
        desc: product.desc || "",
        price: product.price,
      });
      // Set existing images as preview
      setPreviewImages(product.images || []);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
    // Clean up object URLs to prevent memory leaks
    previewImages.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
  };

  const handleInput = e => {
    const { name, value } = e.target;
    setNewProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = e => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // Validate files
    const validation = validateFiles(files);
    if (!validation.isValid) {
      setError(validation.errors.join(' '));
      return;
    }
    
    // Check total file limit including existing images
    const totalFiles = previewImages.length + files.length;
    if (totalFiles > 10) {
      setError(`Maximum 10 images allowed. You currently have ${previewImages.length} images and trying to add ${files.length} more.`);
      return;
    }

    // Create preview URLs for new files
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    
    setSelectedFiles(prev => [...prev, ...files]);
    setPreviewImages(prev => [...prev, ...newPreviewUrls]);
    setError("");
  };

  const removeImage = idx => {
    const existingImagesCount = newProduct.images.length;
    
    if (idx < existingImagesCount) {
      // Remove existing image (add to removal list)
      const imageToRemove = previewImages[idx];
      setImagesToRemove(prev => [...prev, imageToRemove]);
      setNewProduct(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== idx)
      }));
    } else {
      // Remove new file
      const fileIndex = idx - existingImagesCount;
      const previewUrl = previewImages[idx];
      
      // Revoke object URL to prevent memory leak
      if (previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      
      setSelectedFiles(prev => prev.filter((_, i) => i !== fileIndex));
    }
    
    setPreviewImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    setUploadProgress(0);

    try {
      // Validation
      if (!newProduct.productName.trim()) {
        throw new Error("Product name is required");
      }
      
      if (!newProduct.id_category) {
        throw new Error("Category is required");
      }
      
      if (!newProduct.price || newProduct.price <= 0) {
        throw new Error("Valid price is required");
      }

      setUploadProgress(20);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('productName', newProduct.productName.trim());
      formData.append('id_category', newProduct.id_category);
      formData.append('desc', newProduct.desc.trim());
      formData.append('price', parseFloat(newProduct.price));

      // Add images to remove (for updates)
      if (selectedProduct && imagesToRemove.length > 0) {
        formData.append('removeImages', JSON.stringify(imagesToRemove));
      }

      // Add new image files
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });

      setUploadProgress(50);

      console.log('Submitting form data...');

      // Submit form
      if (selectedProduct) {
        await api.put(`/products/${selectedProduct._id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(50 + (progress * 0.4)); // 50% to 90%
          }
        });
        setSuccess("Product updated successfully!");
      } else {
        await api.post("/products", formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(50 + (progress * 0.4)); // 50% to 90%
          }
        });
        setSuccess("Product created successfully!");
      }
      
      setUploadProgress(100);
      
      // Refresh products list
      await fetchProducts();
      
      // Close modal after delay
      setTimeout(() => {
        closeModal();
      }, 1500);
      
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.response?.data?.message || err.message || "Failed to save product");
    } finally {
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  const deleteProduct = async pr => {
    if (!window.confirm(`Are you sure you want to delete "${pr.productName}"?`)) return;
    
    setLoading(true);
    try {
      await api.delete(`/products/${pr._id}`);
      setSuccess("Product deleted successfully!");
      await fetchProducts();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = categoryId => {
    if (typeof categoryId === "object" && categoryId.categoryName) {
      return categoryId.categoryName;
    }
    const category = categories.find(c => c._id === categoryId);
    return category?.categoryName || "-";
  };

  const formatPrice = price => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR' 
    }).format(price);
  };

  return (
    <>
      <HeaderDashboard />
      <Container className="mt-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3>Product Management</h3>
          <Button 
            variant="primary" 
            onClick={() => openModal()} 
            disabled={loading}
          >
            Add New Product
          </Button>
        </div>
        
        {error && <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>}
        {success && <Alert variant="success" dismissible onClose={() => setSuccess("")}>{success}</Alert>}
        
        <Table striped hover responsive className="mt-3">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Images</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && products.length === 0 && (
              <tr><td colSpan={6} className="text-center py-4">Loading products...</td></tr>
            )}
            
            {products.length > 0 ? products.map((product, index) => (
              <tr key={product._id}>
                <td>{index + 1}</td>
                <td>
                  <div className="d-flex align-items-center">
                    {product.images && product.images.length > 0 ? (
                      <>
                        <Image 
                          src={product.images[0]} 
                          width={60} 
                          height={60} 
                          rounded 
                          className="object-fit-cover"
                          onError={(e) => {
                            e.target.src = '/placeholder-image.png'; // fallback image
                          }}
                        />
                        {product.images.length > 1 && (
                          <Badge bg="secondary" className="ms-2">
                            +{product.images.length - 1}
                          </Badge>
                        )}
                      </>
                    ) : (
                      <span className="text-muted">No Images</span>
                    )}
                  </div>
                </td>
                <td>
                  <strong>{product.productName}</strong>
                  {product.desc && (
                    <div className="text-muted small">
                      {product.desc.length > 50 
                        ? `${product.desc.substring(0, 50)}...` 
                        : product.desc
                      }
                    </div>
                  )}
                </td>
                <td>{getCategoryName(product.id_category)}</td>
                <td className="fw-bold">{formatPrice(product.price)}</td>
                <td>
                  <div className="d-flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline-primary" 
                      onClick={() => openModal(product)} 
                      disabled={loading}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline-danger" 
                      onClick={() => deleteProduct(product)} 
                      disabled={loading}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            )) : (
              !loading && (
                <tr><td colSpan={6} className="text-center py-4">No products found</td></tr>
              )
            )}
          </tbody>
        </Table>
      </Container>

      {/* Product Modal */}
      <Modal show={showModal} onHide={closeModal} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedProduct ? "Edit Product" : "Add New Product"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>}
          {success && <Alert variant="success" dismissible onClose={() => setSuccess("")}>{success}</Alert>}
          
          {uploadProgress > 0 && (
            <div className="mb-3">
              <div className="d-flex justify-content-between mb-1">
                <small>Upload Progress</small>
                <small>{uploadProgress}%</small>
              </div>
              <ProgressBar now={uploadProgress} />
            </div>
          )}
          
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Name *</Form.Label>
                  <Form.Control 
                    type="text"
                    name="productName" 
                    value={newProduct.productName} 
                    onChange={handleInput} 
                    required 
                    placeholder="Enter product name"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Category *</Form.Label>
                  <Form.Select 
                    name="id_category" 
                    value={newProduct.id_category} 
                    onChange={handleInput} 
                    required
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map(category => (
                      <option key={category._id} value={category._id}>
                        {category.categoryName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Price (IDR) *</Form.Label>
                  <Form.Control 
                    type="number" 
                    name="price" 
                    value={newProduct.price} 
                    onChange={handleInput} 
                    required 
                    min="0" 
                    placeholder="Enter price"
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control 
                    as="textarea"
                    rows={3}
                    name="desc" 
                    value={newProduct.desc} 
                    onChange={handleInput} 
                    placeholder="Enter product description"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Product Images</Form.Label>
                  <Form.Control 
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileChange}
                    disabled={loading}
                  />
                  <Form.Text className="text-muted">
                    Select up to 10 images. Supported formats: JPEG, PNG, WebP. Max size: 10MB per image.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            
            {/* Image Preview */}
            {previewImages.length > 0 && (
              <div className="mb-3">
                <Form.Label>Image Preview ({previewImages.length}/10)</Form.Label>
                <Row className="g-2">
                  {previewImages.map((url, idx) => (
                    <Col key={idx} xs={6} sm={4} md={3} lg={2}>
                      <div className="position-relative">
                        <Image 
                          src={url} 
                          fluid 
                          rounded 
                          className="w-100"
                          style={{ 
                            height: '100px', 
                            objectFit: 'cover',
                            border: '1px solid #dee2e6'
                          }}
                          onError={(e) => {
                            e.target.src = '/placeholder-image.png';
                          }}
                        />
                        <Button 
                          variant="danger" 
                          size="sm" 
                          className="position-absolute top-0 end-0 rounded-circle"
                          style={{ 
                            width: '25px', 
                            height: '25px', 
                            padding: '0',
                            fontSize: '12px',
                            transform: 'translate(25%, -25%)'
                          }}
                          onClick={() => removeImage(idx)}
                          disabled={loading}
                        >
                          ×
                        </Button>
                        {idx < newProduct.images.length && (
                          <Badge 
                            bg="info" 
                            className="position-absolute bottom-0 start-0"
                            style={{ fontSize: '10px' }}
                          >
                            Existing
                          </Badge>
                        )}
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            )}
            
            <div className="d-flex justify-content-end gap-2">
              <Button 
                variant="secondary" 
                onClick={closeModal}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary"
                disabled={loading}
              >
                {loading ? "Saving..." : selectedProduct ? "Update Product" : "Create Product"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ProductList;