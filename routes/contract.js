import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import {
  createContract,
  getAllContractsByUser,
  getContractById,
  getContractsByStatus,
  changeStatus,
  getContractsExpiringSoon,
  getDashboardData,
  getExpiredContracts,
  getContractsAddedToday,
  askQuery,
} from "../controllers/contract.js";
import { singleUpload } from "../middleware/multer.js";

const router = express.Router();

router.get("/", isAuthenticated, getAllContractsByUser);

router.post("/", isAuthenticated, singleUpload, createContract);

router.post("/status", isAuthenticated, getContractsByStatus);
router.put("/status/:id", isAuthenticated, changeStatus);

router.get("/added-today", isAuthenticated, getContractsAddedToday);

router.get("/expiring-soon", isAuthenticated, getContractsExpiringSoon);
router.get("/expired", isAuthenticated, getExpiredContracts);

router.get("/dashboard-data", isAuthenticated, getDashboardData);
router.post("/query/:num", isAuthenticated, askQuery);

router.get("/:num", isAuthenticated, getContractById);

export default router;
