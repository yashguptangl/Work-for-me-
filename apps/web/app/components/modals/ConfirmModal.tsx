"use client"
import * as React from 'react'
import { Button } from '../../components/ui/button'

export function ConfirmModal({ title, description, confirmText = 'Confirm', onConfirm, children }:{
  title: string
  description?: string
  confirmText?: string
  onConfirm: () => Promise<void> | void
  children?: React.ReactNode
}){
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  return (
    <>
      <span onClick={() => setOpen(true)}>{children}</span>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded-lg p-6 w-full max-w-sm shadow-lg">
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            {description && <p className="text-sm text-muted-foreground mb-4">{description}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={async() => { setLoading(true); await onConfirm(); setLoading(false); setOpen(false) }} disabled={loading}>{confirmText}</Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}