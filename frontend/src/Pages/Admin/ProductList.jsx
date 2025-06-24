// ProductList.js
import React, { useState, useEffect } from "react";
import {
  Container, Table, Button, Modal, Form,
  Row, Col, Alert, Image, Badge
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
    const maxSize = 10 * 1024 * 1024;
    const valid = files.filter(file => {
      if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
        setError(`Invalid type: ${file.name}`);
        return false;
      }
      if (file.size > maxSize) {
        setError(`File too large: ${file.name}`);
        return false;
      }
      return true;
    });
    if (valid.length < files.length) return;

    if (selectedFiles.length + valid.length > 10) {
      setError("Max 10 images allowed");
      return;
    }

    const blobs = valid.map(f => URL.createObjectURL(f));
    setSelectedFiles(prev => [...prev, ...valid]);
    setPreviewImages(prev => [...prev, ...blobs]);
    setError("");
  };

  const removeImage = idx => {
    const existingCount = newProduct.images.length;
    if (idx < existingCount) {
      // remove existing URL
      setNewProduct(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== idx)
      }));
    } else {
      const fi = idx - existingCount;
      URL.revokeObjectURL(previewImages[idx]);
      setSelectedFiles(prev => prev.filter((_, i) => i !== fi));
    }
    setPreviewImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      let uploadedUrls = [];
      if (selectedFiles.length > 0) {
        uploadedUrls = await uploadImagesToBlob(selectedFiles);
      }

      const payload = {
        productName: newProduct.productName,
        id_category: newProduct.id_category,
        desc: newProduct.desc,
        price: newProduct.price,
        images: [...newProduct.images, ...uploadedUrls],
      };

      if (selectedProduct) {
        await api.put(`/products/${selectedProduct._id}`, payload);
        setSuccess("Product updated!");
      } else {
        await api.post("/products", payload);
        setSuccess("Product created!");
      }
      fetchProducts();
      setTimeout(() => closeModal(), 1000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async pr => {
    if (!window.confirm(`Delete "${pr.productName}"?`)) return;
    setLoading(true);
    try {
      await api.delete(`/products/${pr._id}`);
      setSuccess("Deleted!");
      fetchProducts();
    } catch (err) {
      console.error(err);
      setError("Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  const catName = c =>
    typeof c === "object" ? c.categoryName : (categories.find(x => x._id === c)?.categoryName || "-");

  return (
    <>
      <HeaderDashboard />
      <Container className="mt-5">
        <div className="d-flex justify-content-between">
          <h3>Products</h3>
          <Button onClick={() => openModal()} disabled={loading}>Add</Button>
        </div>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        <Table striped hover className="mt-3">
          <thead>
            <tr>
              <th>#</th><th>Images</th><th>Name</th><th>Category</th><th>Price</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {(!products.length && loading) && (
              <tr><td colSpan={6} className="text-center">Loading...</td></tr>
            )}
            {products.length ? products.map((p,i) => (
              <tr key={p._id}>
                <td>{i+1}</td>
                <td>
                  <div className="d-flex">
                    {p.images?.[0] ? (
                      <>
                        <Image src={p.images[0]} width={60} height={60} rounded />
                        {p.images.length > 1 && <Badge bg="secondary ms-1">+{p.images.length-1}</Badge>}
                      </>
                    ) : <span className="text-muted">No Images</span>}
                  </div>
                </td>
                <td>{p.productName}</td>
                <td>{catName(p.id_category)}</td>
                <td>{new Intl.NumberFormat('id-ID', { style:'currency', currency:'IDR' }).format(p.price)}</td>
                <td>
                  <Button size="sm" variant="info" onClick={() => openModal(p)} disabled={loading}>Edit</Button>{' '}
                  <Button size="sm" variant="danger" onClick={() => deleteProduct(p)} disabled={loading}>Delete</Button>
                </td>
              </tr>
            )) : (
              !loading && <tr><td colSpan={6} className="text-center">No products</td></tr>
            )}
          </tbody>
        </Table>
      </Container>

      {/* Modal */}
      <Modal show={showModal} onHide={closeModal} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>{selectedProduct ? "Edit Product" : "Add Product"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group controlId="name">
                  <Form.Label>Name *</Form.Label>
                  <Form.Control name="productName" value={newProduct.productName} onChange={handleInput} required />
                </Form.Group>
                <Form.Group controlId="cat" className="mt-2">
                  <Form.Label>Category *</Form.Label>
                  <Form.Select name="id_category" value={newProduct.id_category} onChange={handleInput} required>
                    <option value="">-- Select --</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.categoryName}</option>)}
                  </Form.Select>
                </Form.Group>
                <Form.Group controlId="price" className="mt-2">
                  <Form.Label>Price (IDR) *</Form.Label>
                  <Form.Control type="number" name="price" value={newProduct.price} onChange={handleInput} required min="0" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="desc">
                  <Form.Label>Description</Form.Label>
                  <Form.Control as="textarea" name="desc" rows={4} value={newProduct.desc} onChange={handleInput} />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mt-3">
              <Col>
                <Form.Group>
                  <Form.Label>Images (max 10)</Form.Label>
                  <Form.Control type="file" accept="image/*" multiple onChange={handleFileChange} />
                </Form.Group>
                {previewImages.length > 0 && (
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {previewImages.map((url, idx) => (
                      <div key={idx} className="position-relative">
                        <Image src={url} width={100} height={100} rounded />
                        <Button size="sm" variant="danger" className="position-absolute top-0 end-0"
                          onClick={() => removeImage(idx)}>×</Button>
                      </div>
                    ))}
                  </div>
                )}
              </Col>
            </Row>

            <div className="mt-3 d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={closeModal} disabled={loading}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? "Saving..." : selectedProduct ? "Update" : "Add"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ProductList;
