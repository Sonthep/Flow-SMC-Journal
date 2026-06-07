"use client"

import { useState, useEffect } from "react"
import Header from "@/components/Header"
import { User, Shield, Sliders, Bell, Database, Trash2, Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"

export default function SettingsPage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Form State
  const [name, setName] = useState("")
  const [baseCurrency, setBaseCurrency] = useState("USD")
  const [accountSize, setAccountSize] = useState("100000")

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user/profile')
        const data = await res.json()
        if (data.success && data.user) {
          setProfile(data.user)
          setName(data.user.name || "")
          setBaseCurrency(data.user.baseCurrency || "USD")
          setAccountSize(data.user.accountSize?.toString() || "100000")
        }
      } catch (err) {
        console.error("Failed to load profile", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          baseCurrency,
          accountSize
        })
      })
      const data = await res.json()
      if (data.success) {
        alert("Settings saved successfully!")
        setProfile(data.user)
      } else {
        alert("Failed to save settings: " + data.error)
      }
    } catch (err) {
      alert("An error occurred while saving.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteData = async () => {
    if (!confirm("Are you sure you want to delete ALL your trading data? This cannot be undone.")) return;
    
    setIsDeleting(true)
    try {
      const res = await fetch('/api/user/profile', { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        alert("All trading data has been deleted.")
      } else {
        alert("Failed to delete data: " + data.error)
      }
    } catch (err) {
      alert("An error occurred while deleting data.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Header />
      <main className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto flex-1 overflow-auto flex flex-col">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
          <p className="text-sm text-slate-500 mt-1">Manage your account settings and trading preferences.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Settings Sidebar */}
          <div className="w-full md:w-64 shrink-0 flex flex-col gap-1">
            <button className="flex items-center gap-3 px-4 py-3 bg-sky-50 text-sky-600 rounded-xl font-bold transition-colors">
              <User className="size-5" />
              Account Settings
            </button>
            <button className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-xl font-medium transition-colors">
              <Sliders className="size-5" />
              Trading Preferences
            </button>
            <button className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-xl font-medium transition-colors">
              <Shield className="size-5" />
              Security & API
            </button>
            <button className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-xl font-medium transition-colors">
              <Bell className="size-5" />
              Notifications
            </button>
            <button className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-xl font-medium transition-colors">
              <Database className="size-5" />
              Data Export
            </button>
          </div>

          {/* Settings Content */}
          <div className="flex-1 bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 w-full min-h-[600px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin text-slate-300 size-8" />
              </div>
            ) : (
              <>
                <section className="mb-10">
                  <h3 className="text-lg font-bold text-slate-800 mb-6">Profile Information</h3>
                  <div className="flex items-center gap-6 mb-8">
                    {profile?.image || session?.user?.image ? (
                      <img src={profile?.image || session?.user?.image} alt="Avatar" className="size-20 rounded-full border-4 border-white shadow-sm object-cover" />
                    ) : (
                      <div className="size-20 rounded-full bg-sky-100 flex items-center justify-center border-4 border-white shadow-sm">
                        <span className="text-2xl font-bold text-sky-500">
                          {name ? name.charAt(0).toUpperCase() : session?.user?.email?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                    <div>
                      <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
                        Upload Avatar
                      </button>
                      <p className="text-xs text-slate-400 mt-2">PNG, JPG or WebP up to 5MB.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Display Name</label>
                      <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-sky-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Email Address</label>
                      <input 
                        type="email" 
                        value={profile?.email || session?.user?.email || ""} 
                        disabled
                        className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-slate-500 text-sm cursor-not-allowed opacity-70" 
                      />
                    </div>
                  </div>
                </section>

                <hr className="border-slate-100 mb-10" />

                <section className="mb-10">
                  <h3 className="text-lg font-bold text-slate-800 mb-6">Account Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Base Currency</label>
                      <select 
                        value={baseCurrency}
                        onChange={(e) => setBaseCurrency(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-sky-500"
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Account Size (Capital)</label>
                      <input 
                        type="number" 
                        value={accountSize}
                        onChange={(e) => setAccountSize(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-sky-500" 
                      />
                    </div>
                  </div>
                </section>

                <hr className="border-slate-100 mb-10" />

                <section>
                  <h3 className="text-lg font-bold text-rose-600 mb-6">Danger Zone</h3>
                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-rose-800 text-sm">Delete Account & Data</h4>
                      <p className="text-rose-600/80 text-xs mt-1">This will permanently delete your trade log, journals, and backtesting data.</p>
                    </div>
                    <button 
                      onClick={handleDeleteData}
                      disabled={isDeleting}
                      className="flex items-center justify-center gap-2 bg-white text-rose-600 border border-rose-200 px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-colors whitespace-nowrap disabled:opacity-50"
                    >
                      {isDeleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                      Delete Data
                    </button>
                  </div>
                </section>

                <div className="mt-10 flex justify-end">
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-md shadow-sky-500/20 flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSaving && <Loader2 className="size-4 animate-spin" />}
                    Save Changes
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
