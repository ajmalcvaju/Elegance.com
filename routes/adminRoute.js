const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const adminUserPanel = require("../controllers/adminUserPanel");
const adminProductPanel = require("../controllers/adminProductPanel");
const adminCategoryPanel = require("../controllers/adminCategoryPanel");
const adminOrderPanel = require("../controllers/adminOrderPanel");
const adminCouponPanel = require("../controllers/adminCouponPanel");
const adminsalesReportPanel = require("../controllers/adminsalesReportPanel");
const middleware = require("../middlewares/middlewares");


router.get("/",middleware.notlogged, adminController.loginLoad);
router.get("/adminLogin",middleware.notlogged, adminController.loginLoad);
router.post("/adminLogin",middleware.notlogged, adminController.verifyLogin);
router.get("/orders",middleware.loggedIn, adminOrderPanel.adminOrder);
router.get("/block-user",middleware.loggedIn, adminUserPanel.updateUserBlockStatus);
router.get("/unblock-user",middleware.loggedIn, adminUserPanel.updateUserBlockStatus);
router.get("/product",middleware.loggedIn, adminProductPanel.adminProduct);
router.get("/addProduct",middleware.loggedIn, adminProductPanel.addProduct);
router.post("/ProductExist",middleware.loggedIn, adminProductPanel.ProductExist);
router.post("/addProduct",middleware.loggedIn,middleware.productImage,adminProductPanel.updateProduct);
router.get("/user",middleware.loggedIn, adminUserPanel.adminUser);
router.get("/addUser",middleware.loggedIn, adminUserPanel.addUser);
router.post("/addUser",middleware.loggedIn, middleware.userImage, adminUserPanel.updateUser);
router.post("/UserExist",middleware.loggedIn, adminUserPanel.UserExist);
router.get("/category",middleware.loggedIn, adminCategoryPanel.adminCategory);
router.post("/CategoryExist",middleware.loggedIn, adminCategoryPanel.CategoryExist);
router.get("/addcategory",middleware.loggedIn, adminCategoryPanel.addCategory);
router.post("/addCategory",middleware.loggedIn, middleware.categoryImage,adminCategoryPanel.updateCategory);
router.get("/delete-product",middleware.loggedIn, adminProductPanel.updateProductStatus);
router.get("/restore-product",middleware.loggedIn, adminProductPanel.updateProductStatus);
router.get("/delete-category",middleware.loggedIn, adminCategoryPanel.updateCategoryStatus);
router.get("/restore-category",middleware.loggedIn, adminCategoryPanel.updateCategoryStatus);
router.get("/edit-user",middleware.loggedIn, adminUserPanel.editUser);
router.get("/edit-product",middleware.loggedIn, adminProductPanel.editProduct);
router.get("/edit-category",middleware.loggedIn, adminCategoryPanel.editCategory);
router.post("/edit-user", middleware.loggedIn,middleware.uploadNone,adminUserPanel.updatingUser);
router.post("/edit-product", middleware.loggedIn,middleware.productImage, adminProductPanel.updatingProduct);
router.post("/edit-category", middleware.loggedIn,adminCategoryPanel.updatingCategory);
router.get("/manage", middleware.loggedIn,adminOrderPanel.manageOrder);
router.post("/manage", middleware.loggedIn, adminOrderPanel.updateOrder);
router.post("/returnItem", middleware.loggedIn,adminOrderPanel.returnItem);
router.post("/cancelItem", middleware.loggedIn,adminOrderPanel.cancelItem);
router.get("/coupons", middleware.loggedIn,adminCouponPanel.manageCoupon);
router.get("/edit-coupon", middleware.loggedIn,adminCouponPanel.editCoupon);
router.post("/edit-coupons", middleware.loggedIn,adminCouponPanel.editingCoupon);
router.get("/delete-coupon", middleware.loggedIn,adminCouponPanel.deleteCoupon);
router.get("/addCoupon", middleware.loggedIn,adminCouponPanel.addCoupon);
router.post("/addCoupons", middleware.loggedIn,adminCouponPanel.addingCoupon);
router.post("/CouponExist", middleware.loggedIn,adminCouponPanel.CouponExist);
router.get("/orderDetails", middleware.loggedIn,adminOrderPanel.orderDetails);
router.get("/salesReport", middleware.loggedIn,adminsalesReportPanel.salesReport);
router.get("/dashboard", middleware.loggedIn,adminsalesReportPanel.dashboard);
router.get("/error", adminOrderPanel.error);



module.exports = router;
