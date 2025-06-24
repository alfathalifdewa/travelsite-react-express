import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";
import { put, del } from '@vercel/blob';

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("id_category", "categoryName");
    res.json({ success: true, products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get product by ID
export const getProductsById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("id_category", "categoryName");
    if (!product) return res.status(404).json({ success: false, message: "Product Not Found" });

    res.json({ success: true, product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Create product
export const postProducts = async (req, res) => {
  try {
    const { productName, id_category, desc, price, images } = req.body;
    
    if (!productName || !id_category || !price) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Validate images array
    const imageUrls = Array.isArray(images) ? images : [];

    const newProduct = new Product({
      productName,
      id_category,
      desc,
      price: parseFloat(price),
      images: imageUrls,
    });
    
    const saved = await newProduct.save();
    await saved.populate("id_category", "categoryName");

    res.status(201).json({ success: true, message: "Product created", product: saved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { productName, id_category, desc, price, images, removeImages } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product Not Found" });
    }

    // Handle image removal from Vercel Blob
    if (removeImages && Array.isArray(removeImages)) {
      try {
        // Delete images from Vercel Blob
        const deletePromises = removeImages.map(async (imageUrl) => {
          try {
            await del(imageUrl);
            console.log(`Deleted image: ${imageUrl}`);
          } catch (deleteError) {
            console.error(`Failed to delete image ${imageUrl}:`, deleteError);
          }
        });
        
        await Promise.all(deletePromises);
        
        // Remove URLs from product.images array
        product.images = product.images.filter(img => !removeImages.includes(img));
      } catch (error) {
        console.error('Error removing images:', error);
      }
    }

    // Add new images (already uploaded from frontend)
    if (images && Array.isArray(images)) {
      product.images = [...product.images, ...images];
    }

    // Update fields
    if (productName) product.productName = productName;
    if (id_category) product.id_category = id_category;
    if (desc !== undefined) product.desc = desc;
    if (price) product.price = parseFloat(price);

    const updated = await product.save();
    await updated.populate("id_category", "categoryName");

    res.json({ success: true, message: "Product updated", product: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product Not Found" });
    }

    // Delete all images from Vercel Blob
    if (product.images && product.images.length > 0) {
      try {
        const deletePromises = product.images.map(async (imageUrl) => {
          try {
            await del(imageUrl);
            console.log(`Deleted image: ${imageUrl}`);
          } catch (deleteError) {
            console.error(`Failed to delete image ${imageUrl}:`, deleteError);
          }
        });
        
        await Promise.all(deletePromises);
      } catch (error) {
        console.error('Error deleting product images:', error);
      }
    }

    await product.deleteOne();
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get products by category
export const getProductsByCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id_category);
    if (!category) {
      return res.json({ success: true, message: "Category Not Found", products: [], count: 0 });
    }

    const products = await Product.find({ id_category: category._id }).populate("id_category", "categoryName");

    res.json({ success: true, products, count: products.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};