import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  BookmarkIcon,
  TrashIcon,
  PencilIcon,
  BriefcaseIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolidIcon } from "@heroicons/react/24/solid";

const Bookmarks = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editNotes, setEditNotes] = useState("");

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/bookmarks");

      if (response.success) {
        setBookmarks(response.data);
      }
    } catch (error) {
      toast.error("Failed to load bookmarks");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (id) => {
    if (!confirm("Are you sure you want to remove this bookmark?")) return;

    try {
      const response = await api.delete(`/api/bookmarks/${id}`);

      if (response.success) {
        toast.success("Bookmark removed");
        setBookmarks(bookmarks.filter((b) => b._id !== id));
      }
    } catch (error) {
      toast.error("Failed to remove bookmark");
      console.error(error);
    }
  };

  const handleSaveNotes = async (id) => {
    try {
      const response = await api.put(`/api/bookmarks/${id}`, {
        notes: editNotes,
      });

      if (response.success) {
        toast.success("Notes saved");
        setBookmarks(
          bookmarks.map((b) => (b._id === id ? { ...b, notes: editNotes } : b))
        );
        setEditingId(null);
        setEditNotes("");
      }
    } catch (error) {
      toast.error("Failed to save notes");
      console.error(error);
    }
  };

  const startEditing = (bookmark) => {
    setEditingId(bookmark._id);
    setEditNotes(bookmark.notes || "");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditNotes("");
  };

  const filteredBookmarks = bookmarks.filter((bookmark) =>
    bookmark.careerTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <BookmarkSolidIcon className="w-8 h-8 text-indigo-600" />
            <span>Saved Careers</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Your bookmarked career paths and opportunities
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-indigo-600">
            {bookmarks.length}
          </p>
          <p className="text-sm text-gray-600">Saved Careers</p>
        </div>
      </div>

      {/* Search */}
      {bookmarks.length > 0 && (
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search bookmarked careers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      )}

      {/* Bookmarks List */}
      {filteredBookmarks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
          <BookmarkIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? "No matching bookmarks" : "No bookmarks yet"}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery
              ? "Try a different search term"
              : "Start bookmarking careers you're interested in"}
          </p>
          {!searchQuery && (
            <button
              onClick={() => navigate("/assessment")}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Take Assessment
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookmarks.map((bookmark) => (
            <div
              key={bookmark._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">
                      {bookmark.careerTitle}
                    </h3>
                    {bookmark.matchPercentage && (
                      <div className="flex items-center space-x-2">
                        <div className="bg-white/20 px-2 py-1 rounded text-xs font-medium text-white">
                          {bookmark.matchPercentage}% Match
                        </div>
                      </div>
                    )}
                  </div>
                  <BookmarkSolidIcon className="w-6 h-6 text-white flex-shrink-0" />
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3">
                {bookmark.careerDescription && (
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {bookmark.careerDescription}
                  </p>
                )}

                {bookmark.category && (
                  <div className="flex items-center space-x-2 text-xs">
                    <BriefcaseIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{bookmark.category}</span>
                  </div>
                )}

                {/* Notes Section */}
                <div className="border-t border-gray-200 pt-3">
                  {editingId === bookmark._id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="Add your notes..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleSaveNotes(bookmark._id)}
                          className="flex-1 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="flex-1 px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-gray-700">
                          Notes
                        </p>
                        <button
                          onClick={() => startEditing(bookmark)}
                          className="text-indigo-600 hover:text-indigo-700"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 min-h-[3rem]">
                        {bookmark.notes || "No notes yet"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {bookmark.tags && bookmark.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {bookmark.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Timestamp */}
                <p className="text-xs text-gray-500">
                  Saved on{" "}
                  {new Date(bookmark.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {/* Card Footer */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={() => handleRemoveBookmark(bookmark._id)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">Remove Bookmark</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;
