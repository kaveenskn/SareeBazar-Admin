import { Plus, Star, Pencil, Trash2, Upload, Check } from "lucide-react";

export default function CollectionsPage() {
  const collections = [
    {
      id: 1,
      title: "Wedding Couture",
      products: 48,
      updatedAt: "2 days ago",
      featured: true,
      gradient: "from-[#8B4A6A] to-[#6C3453]",
    },
    {
      id: 2,
      title: "Festive Glow",
      products: 36,
      updatedAt: "2 days ago",
      featured: true,
      gradient: "from-[#A14777] to-[#7B2E57]",
    },
    {
      id: 3,
      title: "Silk Sanctuary",
      products: 64,
      updatedAt: "2 days ago",
      featured: false,
      gradient: "from-[#8B5F4A] to-[#6C4434]",
    },
    {
      id: 4,
      title: "Traditional Heritage",
      products: 52,
      updatedAt: "2 days ago",
      featured: false,
      gradient: "from-[#4A6A51] to-[#344E39]",
    },
    {
      id: 5,
      title: "Pastel Whisper",
      products: 28,
      updatedAt: "2 days ago",
      featured: true,
      gradient: "from-[#e2ccd6] to-[#ceb2c0]",
    },
    {
      id: 6,
      title: "Party Edit",
      products: 41,
      updatedAt: "2 days ago",
      featured: false,
      gradient: "from-[#7e4f9b] to-[#60357d]",
    },
  ];

  return (
    <div className="flex flex-col xl:flex-row gap-8 h-full min-h-[800px] w-full max-w-[1400px] mx-auto">
      {/* Left Area - Collections Grid */}
      <div className="w-full xl:flex-1">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-[28px] font-serif text-gray-900 mb-1">Your Collections</h2>
            <p className="text-gray-500 text-[15px]">6 curated edits</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-[#d93097] text-white rounded-full text-sm font-semibold hover:bg-[#a1005b] transition-colors shadow-[0_4px_14px_rgba(217,48,151,0.25)]">
            <Plus size={18} strokeWidth={2.5} />
            New Collection
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {collections.map((col) => (
            <div key={col.id} className="rounded-[28px] border border-gray-100 bg-white overflow-hidden shadow-sm flex flex-col group h-[320px] transition-transform hover:-translate-y-1">
              {/* Card Top / Image Area */}
              <div className={`relative flex-1 bg-gradient-to-br ${col.gradient} p-6 flex flex-col justify-between`}>
                <div>
                  {col.featured && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-semibold tracking-wide">
                      <Star size={12} className="fill-white" />
                      Featured
                    </div>
                  )}
                </div>
                <div className="mt-auto">
                  <h3 className="text-[26px] font-serif text-white mb-0.5 shadow-sm">{col.title}</h3>
                  <p className="text-white/85 text-sm font-medium">{col.products} products</p>
                </div>
              </div>
              
              {/* Card Bottom Area */}
              <div className="h-[72px] px-6 flex items-center justify-between bg-white border-t border-gray-50">
                <span className="text-[13px] text-gray-500 font-medium">Updated {col.updatedAt}</span>
                <div className="flex items-center gap-4">
                  <button className="w-8 h-8 flex items-center justify-center rounded-full text-[#d93097] hover:bg-pink-50 transition-colors">
                    <Pencil size={17} strokeWidth={2} />
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-full text-[#d93097] hover:bg-red-50 hover:text-red-600 transition-colors">
                    <Trash2 size={17} strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Area - Create Collection Sidebar */}
      <div className="w-full xl:w-[380px] xl:flex-shrink-0">
        <div className="bg-[#fffaff] rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-pink-50/50 p-8 xl:sticky xl:top-0">
          <div className="mb-7">
            <h2 className="text-[26px] font-serif text-gray-900 mb-1">Create Collection</h2>
            <p className="text-gray-500 text-[15px]">Add a curated edit</p>
          </div>

          <div className="space-y-7">
            {/* Image Upload */}
            <button className="w-full h-32 border-2 border-dashed border-[#ffb3df] rounded-3xl flex flex-col items-center justify-center gap-3 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-pink-50/50 to-white hover:bg-pink-50/80 transition-all group">
              <div className="w-10 h-10 bg-white shadow-sm rounded-full flex items-center justify-center text-[#d93097] group-hover:-translate-y-1 transition-transform">
                <Upload size={18} strokeWidth={2} />
              </div>
              <span className="text-[13px] font-semibold text-gray-600">Upload banner image</span>
            </button>

            {/* Title Input */}
            <div className="space-y-2.5">
              <label className="text-[11px] font-bold text-gray-400 tracking-[0.1em]">TITLE</label>
              <input 
                type="text" 
                defaultValue="Wedding Couture" 
                className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-full text-gray-800 text-[15px] font-medium focus:outline-none focus:border-[#d93097] focus:ring-2 focus:ring-[#d93097]/20 transition-all shadow-sm"
              />
            </div>

            {/* Description Textarea */}
            <div className="space-y-2.5">
              <label className="text-[11px] font-bold text-gray-400 tracking-[0.1em]">DESCRIPTION</label>
              <textarea 
                rows={3} 
                defaultValue="Heirloom pieces for the most special day..." 
                className="w-full px-5 py-4 bg-white border border-gray-200 rounded-3xl text-gray-800 text-[15px] font-medium focus:outline-none focus:border-[#d93097] focus:ring-2 focus:ring-[#d93097]/20 transition-all resize-none shadow-sm leading-relaxed"
              ></textarea>
            </div>

            {/* Featured Toggle */}
            <div className="flex items-center justify-between p-5 bg-[#fdf2f8] rounded-3xl border border-pink-100/80 shadow-sm">
              <div>
                <h4 className="text-[15px] font-bold text-gray-900">Featured Collection</h4>
                <p className="text-[13px] text-gray-500 mt-0.5">Show on homepage hero</p>
              </div>
              <div className="w-[26px] h-[26px] bg-[#d93097] rounded-md flex items-center justify-center cursor-pointer shadow-sm shadow-[#d93097]/30 ring-[3px] ring-white">
                <Check size={16} className="text-white" strokeWidth={3} />
              </div>
            </div>

            {/* Assigned Products */}
            <div className="space-y-4">
              <label className="text-[12px] font-bold text-[#6D6367] tracking-widest uppercase">ASSIGNED PRODUCTS</label>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-[#fceaf4] text-[#ca1c87] text-[14px] font-bold">
                  Banarasi Silk Royale
                </span>
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-[#fceaf4] text-[#ca1c87] text-[14px] font-bold">
                  Kanjivaram Aurora
                </span>
                <button className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-[#f7f3f5] text-[#6d6367] hover:bg-[#efeaf0] transition-colors text-[14px] font-bold">
                  + Add
                </button>
              </div>
            </div>
            
            <div className="pt-4">
              <button className="w-full py-4 bg-gradient-to-r from-[#d22d99] to-[#f447b5] text-white rounded-full text-[17px] font-bold hover:shadow-lg hover:shadow-pink-500/30 transition-all">
                Save Collection
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
