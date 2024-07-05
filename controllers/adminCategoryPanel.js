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

const adminCategory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const totalcategories = await Category.countDocuments({});
    const totalPages = Math.ceil(totalcategories / limit);
    const categories = await Category.find({})
      .skip((page - 1) * limit)
      .limit(limit);
    res.render("admin/category", { categories, currentPage: page, totalPages });
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
    const { cname, discount, Type } = req.body;
    const category1 = await Category.find({ cname });
    if (category1[0]) {
      res.render("admin/addCategory", { exist: true });
    } else {
      const result = await cloudinary.uploader.upload(req.file.path);
      const category = new Category({
        cname: cname,
        discount: discount,
        Type: Type,
        image: result.url,
      });
      const categoryData = await category.save();
      res.redirect("/admin/category");
    }
  } catch (error) {
    console.log(error.message);
    res.redirect("/admin/error");
  }
};
const updateCategoryStatus = async (req, res) => {
  try {
    let catId = req.query.id;
    let status = req.query.status;
    let isDeleted = status === "delete" ? 1 : 0;

    const updatedInfo = await Category.updateOne(
      { _id: catId },
      { $set: { is_deleted: isDeleted } }
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
  updateCategoryStatus,
  editCategory,
  updatingCategory,
  CategoryExist,
};
