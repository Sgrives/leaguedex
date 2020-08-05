const express = require("express");
const Controller = require("../controllers/User.controller");
const Auth = require("../../lib/Auth");
const { db } = require("../../config/database");

const router = express.Router();
const controller = new Controller({
  model: db.user,
  auth: Auth,
});

router.post("/register", controller.create);
router.post("/login", controller.login);

router.delete("/logout", Auth.validateRefreshToken, controller.destroy);
router.get("/refresh", Auth.validateRefreshToken, controller.refresh);

module.exports = router;