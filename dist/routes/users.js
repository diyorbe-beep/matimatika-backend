"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const router = (0, express_1.Router)();
router.get('/:userId', userController_1.UserController.getUser);
router.put('/:userId', userController_1.UserController.updateUser);
router.get('/', userController_1.UserController.getAllUsers);
exports.default = router;
//# sourceMappingURL=users.js.map