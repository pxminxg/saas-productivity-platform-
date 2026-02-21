import express from "express";
import { requireAuth } from "../middleware/auth.js";

import {
  createTask,
  getMyTasks,
  updateTask,
  deleteTask,
} from "../controllers/tasks.js";

const router = express.Router();

// ✅ All task routes need login
router.use(requireAuth);

router.post("/", createTask);
router.get("/", getMyTasks);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
