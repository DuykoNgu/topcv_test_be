import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authMiddleware, optionalAuth } from "../middleware/auth.middleware";

const router = Router();
const userController = new UserController();

// Auth routes
router.post("/register", userController.register.bind(userController));
router.post("/login", userController.login.bind(userController));
router.post("/refresh-token", userController.refreshToken.bind(userController));
router.post("/logout", authMiddleware, userController.logout.bind(userController));

// User routes
router.get("/", authMiddleware, userController.getAllUsers.bind(userController));
router.get("/:id", authMiddleware, userController.getUserById.bind(userController));

export default router;