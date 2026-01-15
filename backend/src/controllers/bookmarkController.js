import Bookmark from "../models/Bookmark.js";

/**
 * @desc    Get all bookmarks for the authenticated user
 * @route   GET /api/bookmarks
 * @access  Private
 */
export const getBookmarks = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const bookmarks = await Bookmark.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: bookmarks,
    });
  } catch (error) {
    console.error("Get bookmarks error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookmarks",
      error: error.message,
    });
  }
};

/**
 * @desc    Add a new bookmark
 * @route   POST /api/bookmarks
 * @access  Private
 */
export const addBookmark = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { careerTitle, careerDescription, matchPercentage, category, tags } =
      req.body;

    // Check if bookmark already exists
    const existingBookmark = await Bookmark.findOne({
      user: userId,
      careerTitle,
    });

    if (existingBookmark) {
      return res.status(400).json({
        success: false,
        message: "This career is already bookmarked",
      });
    }

    const bookmark = await Bookmark.create({
      user: userId,
      careerTitle,
      careerDescription,
      matchPercentage,
      category,
      tags: tags || [],
    });

    res.status(201).json({
      success: true,
      message: "Career bookmarked successfully",
      data: bookmark,
    });
  } catch (error) {
    console.error("Add bookmark error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add bookmark",
      error: error.message,
    });
  }
};

/**
 * @desc    Update bookmark notes
 * @route   PUT /api/bookmarks/:id
 * @access  Private
 */
export const updateBookmark = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { notes, tags } = req.body;

    const bookmark = await Bookmark.findOne({ _id: id, user: userId });

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: "Bookmark not found",
      });
    }

    if (notes !== undefined) bookmark.notes = notes;
    if (tags !== undefined) bookmark.tags = tags;

    await bookmark.save();

    res.status(200).json({
      success: true,
      message: "Bookmark updated successfully",
      data: bookmark,
    });
  } catch (error) {
    console.error("Update bookmark error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update bookmark",
      error: error.message,
    });
  }
};

/**
 * @desc    Remove a bookmark
 * @route   DELETE /api/bookmarks/:id
 * @access  Private
 */
export const removeBookmark = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const bookmark = await Bookmark.findOneAndDelete({ _id: id, user: userId });

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: "Bookmark not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Bookmark removed successfully",
    });
  } catch (error) {
    console.error("Remove bookmark error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove bookmark",
      error: error.message,
    });
  }
};

/**
 * @desc    Remove bookmark by career title
 * @route   DELETE /api/bookmarks/career/:title
 * @access  Private
 */
export const removeBookmarkByTitle = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { title } = req.params;

    const bookmark = await Bookmark.findOneAndDelete({
      user: userId,
      careerTitle: title,
    });

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: "Bookmark not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Bookmark removed successfully",
    });
  } catch (error) {
    console.error("Remove bookmark by title error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove bookmark",
      error: error.message,
    });
  }
};

/**
 * @desc    Check if a career is bookmarked
 * @route   GET /api/bookmarks/check/:title
 * @access  Private
 */
export const checkBookmark = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { title } = req.params;

    const bookmark = await Bookmark.findOne({
      user: userId,
      careerTitle: title,
    });

    res.status(200).json({
      success: true,
      isBookmarked: !!bookmark,
      data: bookmark,
    });
  } catch (error) {
    console.error("Check bookmark error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check bookmark",
      error: error.message,
    });
  }
};
