const express = require("express");
const router = express.Router();
const productUserApi = require("../controller/productcontroller");
const Auth = require("../middleware/authCheck");
const userOnly = require("../middleware/userOnly");
const upload = require("../helper/multerimage"); // your multer config
const productDetails = require("../controller/productDetails");
router.get("/products", productUserApi.getProductData);
// ADD THIS ROUTE - This is what's missing!
router.get("/product/add", Auth, userOnly, (req, res) => {
  res.render("addproduct", {
    success: false,
    message: "",
    user: req.user,
  });
});

router.post(
  "/products/create",
  Auth,
  userOnly,
  upload.single("image"),
  productUserApi.createProductData
);

router.post(
  "/products/update/:id",
  Auth,
  userOnly,
  upload.single("image"),
  productUserApi.updateProduct
);
router.get(
  "/products/update/:id",
  Auth,
  userOnly,
  productUserApi.updateProductfor
);

router.get(
  "/products/delete/:id",
  Auth,
  userOnly,
  productUserApi.deleteProduct
);

// for show product details page
router.get("/product/:id", productDetails.ProductsDetailsWIthID);

module.exports = router;
