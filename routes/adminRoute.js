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


router.get("/", middleware.checkSession3, adminController.loginLoad);
router.get("/adminLogin", adminController.loginLoad);
router.post("/adminLogin", adminController.verifyLogin);
router.get("/orders", adminOrderPanel.adminOrder);
router.get("/block-user", adminUserPanel.blockUser);
router.get("/unblock-user", adminUserPanel.unBlockUser);
router.get("/product", adminProductPanel.adminProduct);
router.get("/addProduct", adminProductPanel.addProduct);
router.post("/ProductExist", adminProductPanel.ProductExist);
router.post("/addProduct",middleware.productImage,adminProductPanel.updateProduct);
router.get("/user", adminUserPanel.adminUser);
router.get("/addUser", adminUserPanel.addUser);
router.post("/addUser", middleware.userImage, adminUserPanel.updateUser);
router.post("/UserExist", adminUserPanel.UserExist);
router.get("/category", adminCategoryPanel.adminCategory);
router.post("/CategoryExist", adminCategoryPanel.CategoryExist);
router.get("/addcategory", adminCategoryPanel.addCategory);
router.post("/addCategory", middleware.categoryImage,adminCategoryPanel.updateCategory);
router.get("/delete-product", adminProductPanel.deleteUser);
router.get("/restore-product", adminProductPanel.restoreUser);
router.get("/delete-category", adminCategoryPanel.deleteCategory);
router.get("/restore-category", adminCategoryPanel.restoreCategory);
router.get("/edit-user", adminUserPanel.editUser);
router.get("/edit-product", adminProductPanel.editProduct);
router.get("/edit-category", adminCategoryPanel.editCategory);
router.post("/edit-user",middleware.uploadNone,adminUserPanel.updatingUser);
router.post("/edit-product",middleware.productImage, adminProductPanel.updatingProduct);
router.post("/edit-category", adminCategoryPanel.updatingCategory);
router.get("/manage", adminOrderPanel.manageOrder);
router.post("/manage", adminOrderPanel.updateOrder);
router.post("/returnItem", adminOrderPanel.returnItem);
router.post("/cancelItem", adminOrderPanel.cancelItem);
router.get("/coupons", adminCouponPanel.manageCoupon);
router.get("/edit-coupon", adminCouponPanel.editCoupon);
router.post("/edit-coupons", adminCouponPanel.editingCoupon);
router.get("/delete-coupon", adminCouponPanel.deleteCoupon);
router.get("/addCoupon", adminCouponPanel.addCoupon);
router.post("/addCoupons", adminCouponPanel.addingCoupon);
router.post("/CouponExist", adminCouponPanel.CouponExist);
router.get("/orderDetails", adminOrderPanel.orderDetails);
router.get("/salesReport", adminsalesReportPanel.salesReport);
router.get("/dashboard", adminsalesReportPanel.dashboard);
router.get("/error", adminOrderPanel.error);



module.exports = router;
