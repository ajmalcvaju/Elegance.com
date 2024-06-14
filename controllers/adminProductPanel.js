const Product = require("../model/productModel");
const Category = require("../model/categoryModel");

const adminProduct = async (req, res) => {
  try {
    const products = await Product.find({});
    res.render("admin/product", { products });
  } catch {
    console.log(error.message);
    res.redirect("/admin/error");
  }
};

const ProductExist=async (req, res) => {
  try {
   const {pname,productId}=req.body
   if(productId){
    const product = await Product.findOne({ _id:productId })
    if(pname!=product.pname){
      const products = await Product.findOne({pname})
      res.json({ exists: !!products });
    }
   }else{
    const products = await Product.findOne({pname})
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
    const pname = req.body.pname;
    const products = await Product.findOne({ pname });
    if (products) {
      const categories = await Category.find({});
      res.render("admin/addProduct", { exist: true, categories });
    } else {
      let cname = req.body.category;
      const categories = await Category.findOne({ cname });
      let actualDiscount;
      let productDiscount = req.body.discount;
      let categoryDiscount = categories.discount;
      if (productDiscount >= categoryDiscount) {
        actualDiscount = productDiscount;
      } else {
        actualDiscount = categoryDiscount;
      }
      DiscountedPrice = req.body.price * (1 - actualDiscount / 100);
      const imageFiles = req.files.map((file) => file.filename);
      const product = new Product({
        pname: req.body.pname,
        image: imageFiles,
        description: req.body.description,
        price: req.body.price,
        discount: req.body.discount,
        actualDiscount: actualDiscount,
        purchase: req.body.purchase,
        category: req.body.category,
        discountedPrice: DiscountedPrice,
      });
      console.log(req.body);
      const productData = await product.save();
      if (productData) {
        const products = await Product.find({});
        res.render("admin/product", { products });
      } else {
        res.redirect("admin/addProduct");
      }
    }
  } catch (error) {
    console.log(error.message);
    res.redirect("/admin/error");
  }
};
const deleteUser = async (req, res) => {
  let proId = req.query.id;
  const updatedInfo = await Product.updateOne(
    { _id: proId },
    { $set: { is_deleted: 1 } }
  );
  res.redirect("/admin/product");
};

const restoreUser = async (req, res) => {
  let proId = req.query.id;
  const updatedInfo = await Product.updateOne(
    { _id: proId },
    { $set: { is_deleted: 0 } }
  );
  res.redirect("/admin/product");
};
const editProduct = async (req, res) => {
  let proId = req.query.id;
  const product = await Product.findOne({ _id: proId });
  const categories = await Category.find({});
  res.render("admin/editProduct", { product, categories });
};
const updatingProduct = async (req, res) => {
  const proId = req.query.id;
  const { pname, description, price, discount, purchase } = req.body;

  await Product.updateOne(
    { _id: proId },
    { $set: { pname, description, price, discount, purchase } }
  );
  res.redirect("/admin/product");
};

module.exports = {
  adminProduct,
  addProduct,
  updateProduct,
  deleteUser,
  restoreUser,
  editProduct,
  updatingProduct,
  ProductExist
};
