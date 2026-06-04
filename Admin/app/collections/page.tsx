"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Star,
  Pencil,
  Trash2,
  Upload,
  Check,
  X,
  Loader2,
  ImageIcon,
  Package,
} from "lucide-react";
import {
  fetchCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  ApiCollection,
} from "../products/api";
import { uploadFiles } from "../../utils/uploadthing";

export default function CollectionsPage() {
  const [collections, setCollections] = useState<ApiCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCoverImage, setFormCoverImage] = useState("");
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingTitle, setDeletingTitle] = useState("");

  const loadCollections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCollections();
      setCollections(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load collections";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  const resetForm = () => {
    setEditingId(null);
    setFormTitle("");
    setFormDescription("");
    setFormCoverImage("");
    setFormIsFeatured(false);
    setCoverImageFile(null);
  };

  const openEdit = (col: ApiCollection) => {
    setEditingId(col._id);
    setFormTitle(col.title);
    setFormDescription(col.description);
    setFormCoverImage(col.coverImage);
    setFormIsFeatured(col.isFeatured);
    setCoverImageFile(null);
  };

  const handleSave = async () => {
    if (!formTitle.trim()) {
      setError("Collection title is required");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      let finalCoverImage = formCoverImage;

      // Upload cover image if a new file was selected
      if (coverImageFile) {
        setIsUploading(true);
        try {
          const res = await uploadFiles("imageUploader", {
            files: [coverImageFile],
          });
          if (res && res.length > 0) {
            finalCoverImage =
              (res[0] as Record<string, string>).ufsUrl || res[0].url;
          }
        } catch (uploadErr) {
          console.error("Upload failed:", uploadErr);
          setError("Failed to upload cover image. Please try again.");
          setIsUploading(false);
          setSaving(false);
          return;
        }
        setIsUploading(false);
      }

      const payload = {
        title: formTitle.trim(),
        description: formDescription.trim(),
        coverImage: finalCoverImage,
        isFeatured: formIsFeatured,
      };

      if (editingId) {
        await updateCollection(editingId, payload);
      } else {
        await createCollection(payload);
      }

      await loadCollections();
      resetForm();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to save collection";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      setSaving(true);
      setError(null);
      await deleteCollection(deletingId);
      await loadCollections();
      setDeletingId(null);
      setDeletingTitle("");
      // If we were editing this collection, reset form
      if (editingId === deletingId) resetForm();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete collection";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      setFormCoverImage(URL.createObjectURL(file));
    }
  };

  // Gradient palette for cards without cover images
  const gradients = [
    "from-[#8B4A6A] to-[#6C3453]",
    "from-[#A14777] to-[#7B2E57]",
    "from-[#8B5F4A] to-[#6C4434]",
    "from-[#4A6A51] to-[#344E39]",
    "from-[#e2ccd6] to-[#ceb2c0]",
    "from-[#7e4f9b] to-[#60357d]",
    "from-[#4A5A6A] to-[#344453]",
    "from-[#6A4A8B] to-[#533468]",
  ];

  return (
    <div className="flex flex-col xl:flex-row gap-8 h-full min-h-[800px] w-full max-w-[1400px] mx-auto">
      {/* Left Area - Collections Grid */}
      <div className="w-full xl:flex-1">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-[28px] font-serif text-gray-900 mb-1">
              Your Collections
            </h2>
            <p className="text-gray-500 text-[15px]">
              {loading
                ? "Loading..."
                : `${collections.length} curated edit${collections.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button
            onClick={resetForm}
            className="flex items-center gap-2 px-6 py-3 bg-[#d93097] text-white rounded-full text-sm font-semibold hover:bg-[#a1005b] transition-colors shadow-[0_4px_14px_rgba(217,48,151,0.25)]"
          >
            <Plus size={18} strokeWidth={2.5} />
            New Collection
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between mb-6">
            <span className="text-sm text-red-600">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 text-sm font-medium"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-[#d93097]" />
            <span className="ml-3 text-gray-500">Loading collections...</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && collections.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Package size={48} strokeWidth={1.5} />
            <p className="mt-4 text-lg font-medium">No collections yet</p>
            <p className="mt-1 text-sm">
              Create your first collection using the form →
            </p>
          </div>
        )}

        {/* Collections Grid */}
        {!loading && collections.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {collections.map((col, idx) => (
              <div
                key={col._id}
                className="rounded-[28px] border border-gray-100 bg-white overflow-hidden shadow-sm flex flex-col group h-[320px] transition-transform hover:-translate-y-1"
              >
                {/* Card Top / Image Area */}
                <div
                  className={`relative flex-1 ${col.coverImage ? "" : `bg-gradient-to-br ${gradients[idx % gradients.length]}`} p-6 flex flex-col justify-between`}
                >
                  {col.coverImage && (
                    <img
                      src={col.coverImage}
                      alt={col.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                  {/* Overlay for readability when cover image exists */}
                  {col.coverImage && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  )}
                  <div className="relative z-10">
                    {col.isFeatured && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-semibold tracking-wide">
                        <Star size={12} className="fill-white" />
                        Featured
                      </div>
                    )}
                  </div>
                  <div className="mt-auto relative z-10">
                    <h3 className="text-[26px] font-serif text-white mb-0.5 drop-shadow-sm">
                      {col.title}
                    </h3>
                    <p className="text-white/85 text-sm font-medium">
                      {col.productCount} product
                      {col.productCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {/* Card Bottom Area */}
                <div className="h-[72px] px-6 flex items-center justify-between bg-white border-t border-gray-50">
                  <span className="text-[13px] text-gray-500 font-medium">
                    {col.description
                      ? col.description.length > 40
                        ? col.description.slice(0, 40) + "..."
                        : col.description
                      : "No description"}
                  </span>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => openEdit(col)}
                      className="w-8 h-8 flex items-center justify-center rounded-full text-[#d93097] hover:bg-pink-50 transition-colors"
                    >
                      <Pencil size={17} strokeWidth={2} />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingId(col._id);
                        setDeletingTitle(col.title);
                      }}
                      className="w-8 h-8 flex items-center justify-center rounded-full text-[#d93097] hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={17} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Area - Create/Edit Collection Sidebar */}
      <div className="w-full xl:w-[380px] xl:flex-shrink-0">
        <div className="bg-[#fffaff] rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-pink-50/50 p-8 xl:sticky xl:top-0">
          <div className="mb-7">
            <h2 className="text-[26px] font-serif text-gray-900 mb-1">
              {editingId ? "Edit Collection" : "Create Collection"}
            </h2>
            <p className="text-gray-500 text-[15px]">
              {editingId ? "Update your curated edit" : "Add a curated edit"}
            </p>
          </div>

          <div className="space-y-7">
            {/* Image Upload */}
            <label className="w-full h-32 border-2 border-dashed border-[#ffb3df] rounded-3xl flex flex-col items-center justify-center gap-3 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-pink-50/50 to-white hover:bg-pink-50/80 transition-all group cursor-pointer relative overflow-hidden">
              {formCoverImage ? (
                <>
                  <img
                    src={formCoverImage}
                    alt="Cover"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload className="text-white" size={24} />
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 bg-white shadow-sm rounded-full flex items-center justify-center text-[#d93097] group-hover:-translate-y-1 transition-transform">
                    <Upload size={18} strokeWidth={2} />
                  </div>
                  <span className="text-[13px] font-semibold text-gray-600">
                    Upload banner image
                  </span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>
            {formCoverImage && (
              <button
                onClick={() => {
                  setFormCoverImage("");
                  setCoverImageFile(null);
                }}
                className="text-xs text-red-500 hover:text-red-700 font-medium -mt-4 flex items-center gap-1"
              >
                <Trash2 size={12} /> Remove image
              </button>
            )}

            {/* Title Input */}
            <div className="space-y-2.5">
              <label className="text-[11px] font-bold text-gray-400 tracking-[0.1em]">
                TITLE
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Wedding Couture"
                className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-full text-gray-800 text-[15px] font-medium focus:outline-none focus:border-[#d93097] focus:ring-2 focus:ring-[#d93097]/20 transition-all shadow-sm"
              />
            </div>

            {/* Description Textarea */}
            <div className="space-y-2.5">
              <label className="text-[11px] font-bold text-gray-400 tracking-[0.1em]">
                DESCRIPTION
              </label>
              <textarea
                rows={3}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Heirloom pieces for the most special day..."
                className="w-full px-5 py-4 bg-white border border-gray-200 rounded-3xl text-gray-800 text-[15px] font-medium focus:outline-none focus:border-[#d93097] focus:ring-2 focus:ring-[#d93097]/20 transition-all resize-none shadow-sm leading-relaxed"
              ></textarea>
            </div>

            {/* Featured Toggle */}
            <div
              onClick={() => setFormIsFeatured(!formIsFeatured)}
              className="flex items-center justify-between p-5 bg-[#fdf2f8] rounded-3xl border border-pink-100/80 shadow-sm cursor-pointer select-none"
            >
              <div>
                <h4 className="text-[15px] font-bold text-gray-900">
                  Featured Collection
                </h4>
                <p className="text-[13px] text-gray-500 mt-0.5">
                  Show on homepage hero
                </p>
              </div>
              <div
                className={`w-[26px] h-[26px] rounded-md flex items-center justify-center cursor-pointer shadow-sm ring-[3px] ring-white transition-colors ${
                  formIsFeatured
                    ? "bg-[#d93097] shadow-[#d93097]/30"
                    : "bg-gray-300 shadow-gray-200/30"
                }`}
              >
                {formIsFeatured && (
                  <Check size={16} className="text-white" strokeWidth={3} />
                )}
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              {editingId && (
                <button
                  onClick={resetForm}
                  className="flex-1 py-4 bg-white border border-gray-200 text-gray-700 rounded-full text-[15px] font-bold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={saving || isUploading}
                className={`flex-1 py-4 bg-gradient-to-r from-[#d22d99] to-[#f447b5] text-white rounded-full text-[17px] font-bold hover:shadow-lg hover:shadow-pink-500/30 transition-all ${
                  saving || isUploading
                    ? "opacity-60 cursor-not-allowed"
                    : ""
                }`}
              >
                {saving
                  ? "Saving..."
                  : isUploading
                    ? "Uploading..."
                    : editingId
                      ? "Update Collection"
                      : "Save Collection"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              setDeletingId(null);
              setDeletingTitle("");
            }}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8 animate-[scaleIn_0.2s_ease-out]">
            <button
              onClick={() => {
                setDeletingId(null);
                setDeletingTitle("");
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <X size={18} className="text-gray-400" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <Trash2 size={28} className="text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Delete Collection
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-700">
                  &quot;{deletingTitle}&quot;
                </span>
                ? Products in this collection will become uncategorized. This
                action cannot be undone.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => {
                    setDeletingId(null);
                    setDeletingTitle("");
                  }}
                  className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className={`flex-1 py-3 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors ${
                    saving ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  {saving ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
