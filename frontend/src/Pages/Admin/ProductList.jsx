// ProductList.js
import React, { useState, useEffect } from "react";
import {
  Container, Table, Button, Modal, Form,
  Row, Col, Alert, Image, Badge, ProgressBar
} from "react-bootstrap";
import api from "../../api";
import HeaderDashboard from "../../Components/Admin/HeaderDashboard";
import { uploadImagesToBlob } from "../../utils/uploadBlob";

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

  const resetForm = () => {
    setSelectedProduct(null);
    setNewProduct({ productName: "", id_category: "", images: [], desc: "", price: 0 });
    setSelectedFiles([]);
    setPreviewImages([]);
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
      setPreviewImages(product.images || []);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleInput = e => {
    const { name, value } = e.target;
    setNewProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = e => {
    const files = Array.from(e.target.files);
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    
    // Validasi files
    const validFiles = [];
    const errors = [];
    
    for (let file of files) {
      if (!allowedTypes.includes(file.type)) {
        errors.push(`Invalid file type: ${file.name}. Only JPEG, PNG, and WebP are allowed.`);
        continue;
      }
      
      if (file.size > maxSize) {
        errors.push(`File too large: ${file.name}. Maximum size is 10MB.`);
        continue;
      }
      
      validFiles.push(file);
    }
    
    // Tampilkan error jika ada
    if (errors.length > 0) {
      setError(errors.join(' '));
      return;
    }
    
    // Check total file limit
    const totalFiles = selectedFiles.length + validFiles.length;
    if (totalFiles > 10) {
      setError(`Maximum 10 images allowed. You're trying to add ${totalFiles} images.`);
      return;
    }

    // Create preview URLs
    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
    setPreviewImages(prev => [...prev, ...newPreviewUrls]);
    setError("");
  };

  const removeImage = idx => {
    const existingCount = newProduct.images.length;
    
    if (idx < existingCount) {
      // Remove existing image URL
      setNewProduct(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== idx)
      }));
    } else {
      // Remove new file
      const fileIndex = idx - existingCount;
      // Revoke object URL to prevent memory leak
      URL.revokeObjectURL(previewImages[idx]);
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
      // Validasi input
      if (!newProduct.productName.trim()) {
        throw new Error("Product name is required");
      }
      
      if (!newProduct.id_category) {
        throw new Error("Category is required");
      }
      
      if (!newProduct.price || newProduct.price <= 0) {
        throw new Error("Valid price is required");
      }

      let uploadedUrls = [];
      
      // Upload new images if any
      if (selectedFiles.length > 0) {
        setUploadProgress(25);
        console.log(`Starting upload of ${selectedFiles.length} files...`);
        
        try {
          uploadedUrls = await uploadImagesToBlob(selectedFiles);
          console.log(`Successfully uploaded ${uploadedUrls.length} files`);
          setUploadProgress(75);
        } catch (uploadError) {
          console.error('Upload failed:', uploadError);
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }
      }

      // Prepare payload
      const payload = {
        productName: newProduct.productName.trim(),
        id_category: newProduct.id_category,
        desc: newProduct.desc.trim(),
        price: parseFloat(newProduct.price),
        images: [...newProduct.images, ...uploadedUrls],
      };
      
      console.log('Submitting payload:', payload);
      setUploadProgress(90);

      // Save product
      if (selectedProduct) {
        await api.put(`/products/${selectedProduct._id}`, payload);
        setSuccess("Product updated successfully!");
      } else {
        await api.post("/products", payload);
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
                    step="1000"
                    placeholder="Enter price"
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    name="desc" 
                    rows={5} 
                    value={newProduct.desc} 
                    onChange={handleInput}
                    placeholder="Enter product description"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mt-3">
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Product Images (Maximum 10 images)</Form.Label>
                  <Form.Control 
                    type="file" 
                    accept="image/jpeg,image/jpg,image/png,image/webp" 
                    multiple 
                    onChange={handleFileChange}
                  />
                  <Form.Text className="text-muted">
                    Supported formats: JPEG, PNG, WebP. Maximum size: 10MB per image.
                  </Form.Text>
                </Form.Group>
                
                {previewImages.length > 0 && (
                  <div className="image-preview-container">
                    <h6>Image Preview:</h6>
                    <div className="d-flex flex-wrap gap-3 mt-2">
                      {previewImages.map((url, idx) => (
                        <div key={idx} className="position-relative">
                          <Image 
                            src={url} 
                            width={120} 
                            height={120} 
                            rounded 
                            className="object-fit-cover border"
                          />
                          <Button 
                            size="sm" 
                            variant="danger" 
                            className="position-absolute top-0 end-0 rounded-circle"
                            style={{ width: '30px', height: '30px' }}
                            onClick={() => removeImage(idx)}
                            disabled={loading}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-4">
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
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {selectedProduct ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  selectedProduct ? "Update Product" : "Create Product"
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ProductList;