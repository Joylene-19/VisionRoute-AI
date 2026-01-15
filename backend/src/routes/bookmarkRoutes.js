import express from "express";
import {
  getBookmarks,
  addBookmark,
  updateBookmark,
  removeBookmark,
  removeBookmarkByTitle,
  checkBookmark,
} from "../controllers/bookmarkController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/bookmarks
router.get("/", getBookmarks);

// @route   GET /api/bookmarks/check/:title
router.get("/check/:title", checkBookmark);

// @route   POST /api/bookmarks
router.post("/", addBookmark);

// @route   PUT /api/bookmarks/:id
router.put("/:id", updateBookmark);

// @route   DELETE /api/bookmarks/:id
router.delete("/:id", removeBookmark);

// @route   DELETE /api/bookmarks/career/:title
router.delete("/career/:title", removeBookmarkByTitle);

export default router;
