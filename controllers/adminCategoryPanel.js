const Category = require("../model/categoryModel");

const adminCategory = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.render("admin/category", { categories });
  } catch {
    console.log(error.message);
    res.redirect("/admin/error");
  }
};
const CategoryExist = async (req, res) => {
  try {
    const { cname, categoryId } = req.body;
    if (categoryId) {
      const category = await Category.findOne({ _id: categoryId });
      if (cname != category.cname) {
        const categories = await Category.findOne({ cname });
        res.json({ exists: !!categories });
      }
    } else {
      const categories = await Category.findOne({ cname });
      res.json({ exists: !!categories });
    }
  } catch {
    console.log(error.message);
    res.redirect("/admin/error");
  }
};

const addCategory = async (req, res) => {
  try {
    res.render("admin/addCategory");
  } catch {
    console.log(error.message);
    res.redirect("/admin/error");
  }
};
const updateCategory = async (req, res) => {
  try {
    const cname = req.body.cname;
    const category1 = await Category.find({ cname });
    if (category1[0]) {
      res.render("admin/addCategory", { exist: true });
    } else {
      console.log(req.body);
      console.log(req.file);
      const category = new Category({
        cname: req.body.cname,
        discount: req.body.discount,
        Type: req.body.Type,
        image: req.file.filename,
      });
      const categoryData = await category.save();
      if (categoryData) {
        const categories = await Category.find({});
        res.render("admin/category", { categories });
      } else {
        res.redirect("admin/addProduct");
      }
    }
  } catch (error) {
    console.log(error.message);
    res.redirect("/admin/error");
  }
};
const deleteCategory = async (req, res) => {
  try {
    let proId = req.query.id;
    const updatedInfo = await Category.updateOne(
      { _id: proId },
      { $set: { is_deleted: 1 } }
    );
    res.redirect("/admin/category");
  } catch (error) {
    console.log(error.message);
    res.redirect("/admin/error");
  }
};

const restoreCategory = async (req, res) => {
  try {
    let proId = req.query.id;
    const updatedInfo = await Category.updateOne(
      { _id: proId },
      { $set: { is_deleted: 0 } }
    );
    res.redirect("/admin/category");
  } catch (error) {
    console.log(error.message);
    res.redirect("/admin/error");
  }
};

const editCategory = async (req, res) => {
  try {
    let proId = req.query.id;
    const category = await Category.findOne({ _id: proId });
    res.render("admin/editCategory", { category });
  } catch (error) {
    console.log(error.message);
    res.redirect("/admin/error");
  }
};

const updatingCategory = async (req, res) => {
  try {
    const proId = req.query.id;
    console.log(req.query);
    const { cname, discount, Type } = req.body;
    await Category.updateOne(
      { _id: proId },
      { $set: { cname, discount, Type } }
    );
    res.redirect("/admin/category");
  } catch (error) {
    console.log(error.message);
    res.redirect("/admin/error");
  }
};

module.exports = {
  adminCategory,
  updateCategory,
  addCategory,
  deleteCategory,
  restoreCategory,
  editCategory,
  updatingCategory,
  CategoryExist,
};
