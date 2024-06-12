const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const adminUserPanel = require("../controllers/adminUserPanel");
const adminProductPanel = require("../controllers/adminProductPanel");
const adminCategoryPanel = require("../controllers/adminCategoryPanel");
const adminOrderPanel = require("../controllers/adminOrderPanel");
const adminCouponPanel = require("../controllers/adminCouponPanel");
const adminsalesReportPanel = require("../controllers/adminsalesReportPanel");
const multer = require("multer");
const path = require("path");
const middleware = require("../middlewares/middlewares");

router.get("/", middleware.checkSession3, adminController.loginLoad);

router.get("/adminLogin", adminController.loginLoad);
router.post("/adminLogin", adminController.verifyLogin);

router.get("/orders", adminOrderPanel.adminOrder);
router.get("/block-user", adminUserPanel.blockUser);
router.get("/unblock-user", adminUserPanel.unBlockUser);

router.get("/product", adminProductPanel.adminProduct);
router.get("/addProduct", adminProductPanel.addProduct);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/productImages"));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});
const upload = multer({ storage: storage });
router.post(
  "/addProduct",
  upload.array("image", 4),
  adminProductPanel.updateProduct
);

router.get("/user", adminUserPanel.adminUser);
router.get("/addUser", adminUserPanel.addUser);

const storage2 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/userImages"));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});
const upload2 = multer({ storage: storage2 });
router.post("/addUser", upload2.single("image"), adminUserPanel.updateUser);
router.post("/UserExist", adminUserPanel.UserExist);

router.get("/category", adminCategoryPanel.adminCategory);
router.get("/addcategory", adminCategoryPanel.addCategory);
const storage3 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/categoryImages"));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});
const upload3 = multer({ storage: storage3 });
router.post(
  "/addCategory",
  upload3.single("image"),
  adminCategoryPanel.updateCategory
);

router.get("/delete-product", adminProductPanel.deleteUser);
router.get("/restore-product", adminProductPanel.restoreUser);

router.get("/delete-category", adminCategoryPanel.deleteCategory);
router.get("/restore-category", adminCategoryPanel.restoreCategory);

router.get("/edit-user", adminUserPanel.editUser);
router.get("/edit-product", adminProductPanel.editProduct);
router.get("/edit-category", adminCategoryPanel.editCategory);

router.post("/edit-user",upload.none(),adminUserPanel.updatingUser);
router.post("/edit-product", adminProductPanel.updatingProduct);
router.post("/edit-category", adminCategoryPanel.updatingCategory);

router.get("/manage", adminOrderPanel.manageOrder);
router.post("/manage", adminOrderPanel.updateOrder);

router.get("/coupons", adminCouponPanel.manageCoupon);
router.get("/edit-coupon", adminCouponPanel.editCoupon);
router.post("/edit-coupons", adminCouponPanel.editingCoupon);
router.get("/delete-coupon", adminCouponPanel.deleteCoupon);
router.get("/addCoupon", adminCouponPanel.addCoupon);
router.post("/addCoupons", adminCouponPanel.addingCoupon);
router.get("/orderDetails", adminOrderPanel.orderDetails);
router.get("/salesReport", adminsalesReportPanel.salesReport);
router.get("/dashboard", adminsalesReportPanel.dashboard);

router.get("/error", adminOrderPanel.error);

module.exports = router;
