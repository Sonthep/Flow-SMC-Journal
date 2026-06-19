"use client"

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { CheckCircle, XCircle, Info, X } from "lucide-react"

type ToastType = "success" | "error" | "info"

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Animate in
    const t = setTimeout(() => setVisible(true), 10)
    // Auto-dismiss after 3.5s
    timerRef.current = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onRemove(toast.id), 300)
    }, 3500)
    return () => { clearTimeout(t); if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  const styles = {
    success: { bg: "bg-emerald-500", icon: <CheckCircle className="size-5 shrink-0" /> },
    error:   { bg: "bg-rose-500",    icon: <XCircle    className="size-5 shrink-0" /> },
    info:    { bg: "bg-sky-500",     icon: <Info       className="size-5 shrink-0" /> },
  }[toast.type]

  return (
    <div
      className={`flex items-center gap-3 text-white text-sm font-semibold px-4 py-3 rounded-2xl shadow-xl max-w-sm w-full
        transition-all duration-300 ease-out
        ${styles.bg}
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}
    >
      {styles.icon}
      <span className="flex-1 leading-tight">{toast.message}</span>
      <button
        onClick={() => { setVisible(false); setTimeout(() => onRemove(toast.id), 300) }}
        className="opacity-70 hover:opacity-100 transition-opacity ml-1"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}

function ToastRenderer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return createPortal(
    <div className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-3 items-end pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onRemove={onRemove} />
        </div>
      ))}
    </div>,
    document.body
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type }])
  }, [])

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastRenderer toasts={toasts} onRemove={remove} />
    </ToastContext.Provider>
  )
}
