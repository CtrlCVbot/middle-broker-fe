"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} className="min-w-[300px]">
            <div className="grid gap-1">
              {title && <ToastTitle className="text-base">{title}</ToastTitle>}
              {description && (
                <ToastDescription className="text-sm">
                  {description}
                </ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport
        className="fixed bottom-4 right-4 z-[100] flex max-h-screen flex-col-reverse gap-2 p-4 md:max-w-[420px]"
      />
    </ToastProvider>
  )
} 