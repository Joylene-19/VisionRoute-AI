import { useState, useEffect } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

const QuestionManagement = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const categories = [
    { value: "", label: "All Categories" },
    { value: "interest", label: "Interest" },
    { value: "aptitude", label: "Aptitude" },
    { value: "personality", label: "Personality" },
    { value: "academic", label: "Academic Performance" },
  ];

  const questionTypes = [
    { value: "MCQ", label: "Multiple Choice" },
    { value: "rating", label: "Rating Scale" },
    { value: "yesno", label: "Yes/No" },
    { value: "ranking", label: "Ranking" },
  ];

  useEffect(() => {
    fetchQuestions();
  }, [categoryFilter]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (categoryFilter) params.category = categoryFilter;

      const response = await api.get("/api/admin/questions", { params });

      if (response.success) {
        setQuestions(response.data);
      }
    } catch (error) {
      toast.error("Failed to fetch questions");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (questionId) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      const response = await api.delete(`/api/admin/questions/${questionId}`);
      if (response.success) {
        toast.success("Question deleted successfully");
        fetchQuestions();
      }
    } catch (error) {
      toast.error("Failed to delete question");
      console.error(error);
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingQuestion(null);
    setShowModal(true);
  };

  const filteredQuestions = questions.filter((q) =>
    q.questionText.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryBadgeColor = (category) => {
    const colors = {
      interest: "bg-blue-100 text-blue-800",
      aptitude: "bg-purple-100 text-purple-800",
      personality: "bg-green-100 text-green-800",
      academic: "bg-orange-100 text-orange-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const getTypeBadgeColor = (type) => {
    const colors = {
      MCQ: "bg-indigo-100 text-indigo-800",
      rating: "bg-pink-100 text-pink-800",
      yesno: "bg-teal-100 text-teal-800",
      ranking: "bg-amber-100 text-amber-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Questions
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by question text..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Add Question Button */}
          <div className="flex items-end">
            <button
              onClick={handleCreate}
              className="w-full flex items-center justify-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Add Question</span>
            </button>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Questions ({filteredQuestions.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredQuestions.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">No questions found</p>
            </div>
          ) : (
            filteredQuestions.map((question) => (
              <div
                key={question._id}
                className="px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-gray-500">
                        Q{question.orderNumber}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadgeColor(
                          question.category
                        )}`}
                      >
                        {question.category}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(
                          question.type
                        )}`}
                      >
                        {question.type}
                      </span>
                    </div>

                    <p className="text-gray-800 font-medium mb-2">
                      {question.questionText}
                    </p>

                    {question.subcategory && (
                      <p className="text-sm text-gray-500 mb-2">
                        Subcategory: {question.subcategory}
                      </p>
                    )}

                    {question.options && question.options.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Options:</p>
                        <div className="flex flex-wrap gap-2">
                          {question.options.map((option, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                            >
                              {option.text}
                              {option.weight !== undefined && (
                                <span className="ml-1 text-gray-500">
                                  ({option.weight})
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(question)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(question._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Question Modal */}
      {showModal && (
        <QuestionModal
          question={editingQuestion}
          onClose={() => setShowModal(false)}
          onSave={fetchQuestions}
          categories={categories}
          questionTypes={questionTypes}
        />
      )}
    </div>
  );
};

// Question Modal Component
const QuestionModal = ({
  question,
  onClose,
  onSave,
  categories,
  questionTypes,
}) => {
  const [formData, setFormData] = useState({
    questionText: question?.questionText || "",
    category: question?.category || "interest",
    subcategory: question?.subcategory || "",
    type: question?.type || "MCQ",
    orderNumber: question?.orderNumber || 1,
    options: question?.options || [],
    helpText: question?.helpText || "",
  });

  const [newOption, setNewOption] = useState({ text: "", weight: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;
      if (question) {
        // Update existing question
        response = await api.put(
          `/api/admin/questions/${question._id}`,
          formData
        );
      } else {
        // Create new question
        response = await api.post("/api/admin/questions", formData);
      }

      if (response.success) {
        toast.success(
          question
            ? "Question updated successfully"
            : "Question created successfully"
        );
        onSave();
        onClose();
      }
    } catch (error) {
      toast.error(
        question ? "Failed to update question" : "Failed to create question"
      );
      console.error(error);
    }
  };

  const addOption = () => {
    if (!newOption.text.trim()) return;

    setFormData({
      ...formData,
      options: [
        ...formData.options,
        {
          text: newOption.text,
          weight: parseFloat(newOption.weight) || 0,
        },
      ],
    });
    setNewOption({ text: "", weight: "" });
  };

  const removeOption = (index) => {
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-800">
            {question ? "Edit Question" : "Create Question"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Question Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Text *
            </label>
            <textarea
              value={formData.questionText}
              onChange={(e) =>
                setFormData({ ...formData, questionText: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows="3"
              required
            />
          </div>

          {/* Category and Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                {categories.slice(1).map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                {questionTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subcategory and Order */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategory
              </label>
              <input
                type="text"
                value={formData.subcategory}
                onChange={(e) =>
                  setFormData({ ...formData, subcategory: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Number *
              </label>
              <input
                type="number"
                value={formData.orderNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    orderNumber: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="1"
                required
              />
            </div>
          </div>

          {/* Help Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Help Text
            </label>
            <textarea
              value={formData.helpText}
              onChange={(e) =>
                setFormData({ ...formData, helpText: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows="2"
            />
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Options
            </label>

            {/* Existing Options */}
            <div className="space-y-2 mb-3">
              {formData.options.map((option, idx) => (
                <div
                  key={idx}
                  className="flex items-center space-x-2 bg-gray-50 p-2 rounded"
                >
                  <span className="flex-1 text-sm">{option.text}</span>
                  <span className="text-xs text-gray-500">
                    Weight: {option.weight}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeOption(idx)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Option */}
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Option text"
                  value={newOption.text}
                  onChange={(e) =>
                    setNewOption({ ...newOption, text: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="w-24">
                <input
                  type="number"
                  placeholder="Weight"
                  value={newOption.weight}
                  onChange={(e) =>
                    setNewOption({ ...newOption, weight: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  step="0.1"
                />
              </div>
              <button
                type="button"
                onClick={addOption}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              {question ? "Update" : "Create"} Question
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionManagement;
