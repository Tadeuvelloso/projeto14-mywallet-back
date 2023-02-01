import { Router } from "express";
import { signIn, signUp, logOut } from "../controllers/authController.js";
import { checkAuthObj, checkUserExistInDb, passwordValidation } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/sign-up",checkAuthObj, checkUserExistInDb, signUp);
router.post("/sign-in",passwordValidation , signIn);
router.post("/logout", logOut);

export default router;