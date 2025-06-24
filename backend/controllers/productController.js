import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";
import fs from "fs";
import path from "path";

// Utility function to ensure uploads folder exists
const ensureUploadsFolder = () => {
  const folder = path.join(process.cwd(), "uploads/products");
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
  return folder;
};

// Move uploaded files
const uploads = async (files) => {
  const folder = ensureUploadsFolder();
  return Promise.all(
    files.map((file) => {
      const dest = path.join(folder, file.filename);
      return new Promise((resolve, reject) => {
        fs.rename(file.path, dest, (err) => {
          if (err) return reject(err);
          resolve(`/uploads/products/${file.filename}`);
        });
      });
    })
  );
};

// Delete uploaded files (cleanup)
const deleteFiles = async (files) => {
  for (const file of files) {
    fs.unlink(file.path, (err) => {
      if (err) console.error("Error deleting file:", err);
    });
  }
};

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("id_category", "categoryName");
    const mapped = products.map((p) => ({
      ...p._doc,
      images: (p.images || []).map((img) => `${req.protocol}://${req.get("host")}${img}`),
    }));
    res.json({ success: true, products: mapped });
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

    res.json({
      success: true,
      product: {
        ...product._doc,
        images: (product.images || []).map((img) => `${req.protocol}://${req.get("host")}${img}`),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Create product
export const postProducts = async (req, res) => {
  try {
    const { productName, id_category, desc, price } = req.body;
    if (!productName || !id_category || !price)
      return res.status(400).json({ success: false, message: "Missing required fields" });

    const images = req.files?.length ? await uploads(req.files) : [];

    const newProduct = new Product({
      productName,
      id_category,
      desc,
      price: parseFloat(price),
      images,
    });
    const saved = await newProduct.save();
    await saved.populate("id_category", "categoryName");

    res.status(201).json({ success: true, message: "Product created", product: saved });
  } catch (err) {
    console.error(err);
    if (req.files) await deleteFiles(req.files);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { productName, id_category, desc, price, removeImages } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product Not Found" });

    // Remove images if requested
    if (removeImages) {
      const removeList = JSON.parse(removeImages);
      removeList.forEach((url) => {
        const relative = url.replace(`${req.protocol}://${req.get("host")}`, "");
        const fullPath = path.join(process.cwd(), relative);
        fs.unlink(fullPath, (err) => {
          if (err) console.error("Error deleting image:", err);
        });
        product.images = product.images.filter((img) => img !== relative);
      });
    }

    // Add new images
    const newImages = req.files?.length ? await uploads(req.files) : [];
    product.images = [...product.images, ...newImages];

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
    if (req.files) await deleteFiles(req.files);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product Not Found" });

    product.images.forEach((img) => {
      const fullPath = path.join(process.cwd(), img);
      fs.unlink(fullPath, (err) => {
        if (err) console.error("Error deleting image:", err);
      });
    });

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
    if (!category)
      return res.json({ success: true, message: "Category Not Found", products: [], count: 0 });

    const products = await Product.find({ id_category: category._id }).populate("id_category", "categoryName");
    const mapped = products.map((p) => ({
      ...p._doc,
      images: (p.images || []).map((img) => `${req.protocol}://${req.get("host")}${img}`),
    }));

    res.json({ success: true, products: mapped, count: mapped.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
