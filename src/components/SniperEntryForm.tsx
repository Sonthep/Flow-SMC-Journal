"use client"

import { useState, useMemo } from "react"
import { Target, CheckSquare, Square, Lock, CloudUpload, Trophy, Loader2, X as XIcon, ImageIcon } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function SniperEntryForm({ className = "" }: { className?: string }) {
  const [direction, setDirection] = useState("BUY")
  const [risk, setRisk] = useState("0.5")
  const [tags, setTags] = useState({
    extSweep: true,
    intSweep: false,
    chochWick: false,
    microChoch: true,
    freshOb: false,
    fvgMitigation: true
  })
  const [checklist, setChecklist] = useState({
    candleClosed: true,
    solidBody: true,
    premiumDiscount: true
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  
  // Image Upload State
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile))
    }
  }

  const removeImage = () => {
    setFile(null)
    setPreviewUrl(null)
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const pastedFile = items[i].getAsFile();
        if (pastedFile) {
          setFile(pastedFile);
          setPreviewUrl(URL.createObjectURL(pastedFile));
        }
        break;
      }
    }
  }

  // Auto Tier Logic
  const setupTier = useMemo(() => {
    const checkedTagsCount = Object.values(tags).filter(Boolean).length;
    const checkedChecklistCount = Object.values(checklist).filter(Boolean).length;
    const totalConfluences = checkedTagsCount + checkedChecklistCount;

    if (totalConfluences >= 6) return { grade: "S-Tier", desc: "A+ High Probability", color: "text-purple-600", bg: "bg-purple-100", border: "border-purple-200" };
    if (totalConfluences >= 4) return { grade: "A-Tier", desc: "Solid Setup", color: "text-emerald-600", bg: "bg-emerald-100", border: "border-emerald-200" };
    if (totalConfluences >= 2) return { grade: "B-Tier", desc: "Moderate Risk", color: "text-sky-600", bg: "bg-sky-100", border: "border-sky-200" };
    return { grade: "C-Tier", desc: "Low Probability / Scalp", color: "text-amber-600", bg: "bg-amber-100", border: "border-amber-200" };
  }, [tags, checklist]);

  const toggleTag = (key: keyof typeof tags) => setTags(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleChecklist = (key: keyof typeof checklist) => setChecklist(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Capture form data synchronously before any async operations
    const formData = new FormData(e.currentTarget);
    
    setIsSubmitting(true);
    setSubmitSuccess(false);

    let imageUrl = null;

    // Upload image to Supabase if exists
    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('trade-images')
        .upload(`public/${fileName}`, file);

      if (uploadError) {
        console.error("Image upload failed:", uploadError);
        alert(`Image upload failed: ${uploadError.message}`);
        setIsSubmitting(false);
        return;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('trade-images')
        .getPublicUrl(`public/${fileName}`);
        
      imageUrl = publicUrlData.publicUrl;
    }

    const data = {
      asset: "XAUUSD", // Currently hardcoded in the precision section header
      direction,
      riskPercent: risk,
      lotSize: formData.get("lotSize"),
      session: formData.get("session"),
      entryPrice: formData.get("entryPrice"),
      stopLoss: formData.get("stopLoss"),
      takeProfit: formData.get("takeProfit"),
      narrative: formData.get("narrative"),
      tags,
      checklist,
      imageUrl
    };

    try {
      const res = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        setSubmitSuccess(true);
        // Optionally reset form here
        setTimeout(() => setSubmitSuccess(false), 3000);
      } else {
        const errData = await res.json();
        alert(`Failed to save trade: ${errData.error}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting trade.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={`bg-white rounded-[1.5rem] p-6 h-full flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <Target className="size-5 text-sky-500" strokeWidth={2.5} />
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">LOG NEW SNIPER ENTRY</h2>
      </div>

      <form onSubmit={handleSubmit} onPaste={handlePaste} className="flex-1 flex flex-col gap-6">
        
        {/* Transaction Setup */}
        <div>
          <h3 className="text-[11px] font-bold text-slate-500 mb-3 uppercase tracking-wider">TRANSACTION SETUP</h3>
          <div className="flex items-center gap-2 mb-3">
            <button 
              type="button"
              onClick={() => setDirection("BUY")}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg border transition-colors ${direction === "BUY" ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"}`}
            >
              BUY / LONG
            </button>
            <button 
              type="button"
              onClick={() => setDirection("SELL")}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg border transition-colors ${direction === "SELL" ? "bg-rose-50 border-rose-200 text-rose-600" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"}`}
            >
              SELL / SHORT
            </button>
            <div className="flex items-center gap-2 ml-2">
              <span className="text-xs font-medium text-slate-500">Lot Size:</span>
              <input name="lotSize" type="text" defaultValue="10.00" className="w-16 bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-500 text-center" />
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-xs">
            <span className="font-medium text-slate-500">Risk:</span>
            {[ "1", "0.5", "0.25" ].map(val => (
              <label key={val} className="flex items-center gap-1.5 cursor-pointer" onClick={() => setRisk(val)}>
                <div className={`size-3.5 rounded-full border flex items-center justify-center ${risk === val ? "border-sky-500" : "border-slate-300"}`}>
                  {risk === val && <div className="size-2 rounded-full bg-sky-500"></div>}
                </div>
                <span className={`font-medium ${risk === val ? "text-slate-800" : "text-slate-500"}`}>{val}%</span>
              </label>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <span className="font-medium text-slate-500">Session:</span>
              <select name="session" className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-800 focus:outline-none focus:border-sky-500 cursor-pointer">
                <option value="LONDON">London</option>
                <option value="NY">New York</option>
                <option value="ASIA">Asia</option>
              </select>
            </div>
          </div>
        </div>

        {/* Precision Entry Data */}
        <div>
          <h3 className="text-[11px] font-bold text-slate-500 mb-3 uppercase tracking-wider">PRECISION ENTRY DATA (XAUUSD 4K+)</h3>
          <div className="grid grid-cols-[auto_1fr_auto] gap-x-3 gap-y-3 items-center text-xs">
            <span className="font-medium text-slate-500 text-right">Entry:</span>
            <input name="entryPrice" type="text" defaultValue="4445.50" className="bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-slate-800 focus:outline-none focus:border-sky-500" />
            <span></span>
            
            <span className="font-medium text-slate-500 text-right">SL:</span>
            <input name="stopLoss" type="text" defaultValue="4444.30" className="bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-slate-800 focus:outline-none focus:border-sky-500" />
            <span className="text-slate-500">&rarr; (1.2 pips)</span>
            
            <span className="font-medium text-slate-500 text-right">TP:</span>
            <input name="takeProfit" type="text" defaultValue="4451.30" className="bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-slate-800 focus:outline-none focus:border-sky-500" />
            <span className="text-slate-500">&rarr; (Target: 4.83R)</span>
          </div>
        </div>

        {/* Setup Tier & SMC Tags (Combined visual block) */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200/60">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Trophy className="size-3.5 text-slate-400" />
              SMC STRATEGY TAGS
            </h3>
            {/* Auto Tier Badge */}
            <div className={`flex items-center gap-2 px-2.5 py-1 rounded border ${setupTier.bg} ${setupTier.border}`}>
              <span className={`text-[10px] font-black uppercase tracking-wider ${setupTier.color}`}>{setupTier.grade}</span>
              <span className={`text-[9px] font-semibold uppercase ${setupTier.color} opacity-80 border-l border-current pl-2`}>{setupTier.desc}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer group" onClick={() => toggleTag("extSweep")}>
              {tags.extSweep ? <CheckSquare className="size-4 text-sky-500" /> : <Square className="size-4 text-slate-300 group-hover:text-slate-400" />}
              <span className="text-xs text-slate-700">External Sweep</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group" onClick={() => toggleTag("intSweep")}>
              {tags.intSweep ? <CheckSquare className="size-4 text-sky-500" /> : <Square className="size-4 text-slate-300 group-hover:text-slate-400" />}
              <span className="text-xs text-slate-700">Internal Sweep</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group" onClick={() => toggleTag("chochWick")}>
              {tags.chochWick ? <CheckSquare className="size-4 text-sky-500" /> : <Square className="size-4 text-slate-300 group-hover:text-slate-400" />}
              <span className="text-xs text-slate-700">CHOCH (Wick)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group" onClick={() => toggleTag("microChoch")}>
              {tags.microChoch ? <CheckSquare className="size-4 text-sky-500" /> : <Square className="size-4 text-slate-300 group-hover:text-slate-400" />}
              <span className="text-xs text-slate-700">Micro-CHOCH (Body)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group" onClick={() => toggleTag("freshOb")}>
              {tags.freshOb ? <CheckSquare className="size-4 text-sky-500" /> : <Square className="size-4 text-slate-300 group-hover:text-slate-400" />}
              <span className="text-xs text-slate-700">Fresh OB</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group" onClick={() => toggleTag("fvgMitigation")}>
              {tags.fvgMitigation ? <CheckSquare className="size-4 text-sky-500" /> : <Square className="size-4 text-slate-300 group-hover:text-slate-400" />}
              <span className="text-xs text-slate-700">FVG Mitigation</span>
            </label>
          </div>

          <div className="pt-3 border-t border-slate-200/60 space-y-2.5">
            <h3 className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">DISCIPLINE CHECKLIST</h3>
            <label className="flex items-start gap-2 cursor-pointer group" onClick={() => toggleChecklist("candleClosed")}>
              <div className="mt-0.5">
                {checklist.candleClosed ? <CheckSquare className="size-4 text-sky-500" /> : <Square className="size-4 text-slate-300 group-hover:text-slate-400" />}
              </div>
              <span className="text-xs text-slate-700 font-medium leading-relaxed">Did the setup candle fully close before pulling the trigger?</span>
            </label>
            <label className="flex items-start gap-2 cursor-pointer group" onClick={() => toggleChecklist("solidBody")}>
              <div className="mt-0.5">
                {checklist.solidBody ? <CheckSquare className="size-4 text-sky-500" /> : <Square className="size-4 text-slate-300 group-hover:text-slate-400" />}
              </div>
              <span className="text-xs text-slate-700 font-medium leading-relaxed">Solid body close (No ambiguity)?</span>
            </label>
            <label className="flex items-start gap-2 cursor-pointer group" onClick={() => toggleChecklist("premiumDiscount")}>
              <div className="mt-0.5">
                {checklist.premiumDiscount ? <CheckSquare className="size-4 text-sky-500" /> : <Square className="size-4 text-slate-300 group-hover:text-slate-400" />}
              </div>
              <span className="text-xs text-slate-700 font-medium leading-relaxed">Entry is in the correct Premium / Discount zone?</span>
            </label>
          </div>
        </div>

        {/* Trade Narrative / Notes */}
        <div>
          <h3 className="text-[11px] font-bold text-slate-500 mb-3 uppercase tracking-wider">TRADE NARRATIVE / NOTES</h3>
          <textarea 
            name="narrative"
            rows={3}
            placeholder="Document your thought process, emotions, and execution details..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all resize-none placeholder:text-slate-400"
          ></textarea>
        </div>

        {/* Add Image Section */}
        <div>
          <h3 className="text-[11px] font-bold text-slate-500 mb-3 uppercase tracking-wider">CHART SETUP IMAGE</h3>
          
          {previewUrl ? (
            <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-100 group">
              <img src={previewUrl} alt="Setup Preview" className="w-full h-auto max-h-[300px] object-cover" />
              <button 
                type="button" 
                onClick={removeImage}
                className="absolute top-3 right-3 bg-white/90 backdrop-blur text-rose-500 hover:text-rose-600 p-2 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XIcon className="size-4" />
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 hover:border-sky-300 transition-colors bg-white group">
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <CloudUpload className="size-6 text-sky-400 mb-2 group-hover:scale-110 transition-transform" strokeWidth={2} />
              <p className="text-xs font-semibold text-slate-700">Click to upload or drag screenshot</p>
              <p className="text-[10px] text-slate-400 mt-1">PNG, JPG or WebP up to 10MB</p>
            </label>
          )}
        </div>

        <div className="mt-auto pt-2">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`w-full text-white font-bold py-3.5 px-4 rounded-xl transition-colors focus:outline-none shadow-md flex items-center justify-center gap-2 text-xs tracking-wide ${submitSuccess ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' : 'bg-sky-500 hover:bg-sky-600 shadow-sky-500/20'} disabled:opacity-70`}
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : submitSuccess ? (
              <CheckSquare className="size-4" />
            ) : (
              <Lock className="size-4" />
            )}
            {isSubmitting ? 'SAVING TO SUPABASE...' : submitSuccess ? 'SAVED SUCCESSFULLY!' : 'SAVE ACTIVE (RUN POSITION)'}
          </button>
        </div>
      </form>
    </div>
  )
}
