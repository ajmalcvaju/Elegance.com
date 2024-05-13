const Product = require("../model/productModel");
const Category = require("../model/categoryModel");

const adminProduct = async (req, res) => {
  try {
    const products = await Product.find({});
    res.render("admin/product", { products });
  } catch {
    console.log(error.message);
  }
};
const addProduct = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.render("admin/addProduct", { categories });
  } catch {
    console.log(error.message);
  }
};
const updateProduct = async (req, res) => {
  try {
    const pname = req.body.pname;
    const products1 = await Product.find({ pname });
    console.log(products1[0]);
    if (products1[0]) {
      const categories = await Category.find({});
      res.render("admin/addProduct", { exist: true, categories });
    } else {
      const DiscountedPrice = req.body.price * (1 - req.body.discount / 100);
      const imageFiles = req.files.map((file) => file.filename);
      const product = new Product({
        pname: req.body.pname,
        image: imageFiles,
        description: req.body.description,
        price: req.body.price,
        discount: req.body.discount,
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
};
