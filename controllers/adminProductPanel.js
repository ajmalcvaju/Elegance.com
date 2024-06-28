const Product = require("../model/productModel");
const Category = require("../model/categoryModel");
const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.CLOUDAPIKEY,
  api_secret: process.env.CLOUDINARYSECRET,
});

const adminProduct = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;

    const totalProducts = await Product.countDocuments({});
    const totalPages = Math.ceil(totalProducts / limit);

    const products = await Product.find({})
      .skip((page - 1) * limit)
      .limit(limit);


    res.render("admin/product", { products,
      currentPage: page,
      totalPages });
  } catch {
    console.log(error.message);
    res.redirect("/admin/error");
  }
};

const ProductExist = async (req, res) => {
  try {
    const { pname, productId } = req.body;
    if (productId) {
      const product = await Product.findOne({ _id: productId });
      if (pname != product.pname) {
        const products = await Product.findOne({ pname });
        res.json({ exists: !!products });
      }
    } else {
      const products = await Product.findOne({ pname });
      res.json({ exists: !!products });
    }
  } catch {
    console.log(error.message);
    res.redirect("/admin/error");
  }
};

const addProduct = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.render("admin/addProduct", { categories });
  } catch {
    console.log(error.message);
    res.redirect("/admin/error");
  }
};

const updateProduct = async (req, res) => {
  try {
    const{pname,description,price,discount,purchase,category}=req.body
    const products = await Product.findOne({ pname });
    if (products) {
      const categories = await Category.find({});
      res.render("admin/addProduct", { exist: true, categories });
    } else {
      let cname = category;
      const categories = await Category.findOne({ cname });
      let actualDiscount;
      let productDiscount = discount;
      let categoryDiscount = categories.discount;
      if (productDiscount >= categoryDiscount) {
        actualDiscount = productDiscount;
      } else {
        actualDiscount = categoryDiscount;
      }
      DiscountedPrice = price * (1 - actualDiscount / 100);
      const files = req.files;
      console.log(files);

      const uploadedImages = [];

      try {
        for (const file of files) {
          const result = await cloudinary.uploader.upload(file.path);
          uploadedImages.push(result.url);
        }
        console.log(uploadedImages);
      } catch (error) {
        console.error("Error uploading images: ", error);
      }
                      
      const product = new Product({
        pname: pname,
        image: uploadedImages,
        description: description,
        price: price,
        discount: discount,
        actualDiscount: actualDiscount,
        purchase: purchase,
        category: category,
        discountedPrice: DiscountedPrice,
      });
      console.log(req.body);
      const productData = await product.save();
      res.redirect("/admin/product");
    }
  } catch (error) {
    console.log(error.message);
    res.redirect("/admin/error");
  }
};
const updateProductStatus = async (req, res) => {
  try {
    let proId = req.query.id;
    let status = req.query.status; 

    let isDeleted = status === 'delete' ? 1 : 0;

    const updatedInfo = await Product.updateOne(
      { _id: proId },
      { $set: { is_deleted: isDeleted } }
    );
    res.redirect("/admin/product");
  } catch (error) {
    console.log(error.message);
    res.redirect("/admin/error");
  }
};

const editProduct = async (req, res) => {
  try {
    let proId = req.query.id;
    const product = await Product.findOne({ _id: proId });
    const categories = await Category.find({});
    res.render("admin/editProduct", { product, categories });
  } catch (error) {
    console.log(error.message);
    res.redirect("/admin/error");
  }
};

const updatingProduct = async (req, res) => {
  try {
    const proId = req.query.id;
    const { pname, description, category, price, discount, purchase } =
      req.body;
      const products = await Product.findOne({ pname });
      const categories = await Category.findOne({ cname:category });
      let actualDiscount;
      let productDiscount = discount;
      let categoryDiscount = categories.discount;
      if (productDiscount >= categoryDiscount) {
        actualDiscount = productDiscount;
      } else {
        actualDiscount = categoryDiscount;
      }
      const DiscountedPrice = price * (1 - actualDiscount / 100);
      const files = req.files;
      console.log(files);

      const uploadedImages = [];

      try {
        for (const file of files) {
          const result = await cloudinary.uploader.upload(file.path);
          uploadedImages.push(result.url);
        }
        console.log(uploadedImages);
      } catch (error) {
        console.error("Error uploading images: ", error);
      }
    await Product.updateOne(
      { _id: proId },
      { $set: { pname, description, price, category, discount, purchase,image: uploadedImages,actualDiscount: actualDiscount,discountedPrice: DiscountedPrice } }
    );
    res.redirect("/admin/product");
  } catch (error) {
    console.log(error.message);
    res.redirect("/admin/error");
  }
};

module.exports = {
  adminProduct,
  addProduct,
  updateProduct,
  updateProductStatus,
  editProduct,
  updatingProduct,
  ProductExist,
};
