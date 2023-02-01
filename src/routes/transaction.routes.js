import { Router } from "express";
import { deleteTransactions, getTransactions, postTransactions, putTransactions } from "../controllers/transactionController.js";
import {checkObjTransaction, checkSession} from "../middleware/transactionMiddleware.js";

const router = Router();

router.get("/transactions", checkSession, getTransactions);
router.post("/transactions", checkObjTransaction, checkSession, postTransactions);
router.delete("/transactions/:id",checkSession, deleteTransactions);
router.put("/transactions/:id", checkObjTransaction, checkSession, putTransactions);

export default router;