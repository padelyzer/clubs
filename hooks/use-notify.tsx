'use client'
import toast from 'react-hot-toast'

export const useNotify = () => {
  return {
    success: (message: string) => {
      toast.success(message, {
        duration: 4000,
        position: 'top-right',
      })
    },
    error: (message: string) => {
      toast.error(message, {
        duration: 6000,
        position: 'top-right',
      })
    },
    info: (message: string) => {
      toast(message, {
        icon: 'ℹ️',
        duration: 4000,
        position: 'top-right',
      })
    },
    warning: (message: string) => {
      toast(message, {
        icon: '⚠️',
        duration: 5000,
        position: 'top-right',
        style: {
          background: '#FEF3C7',
          color: '#92400E',
          borderLeft: '4px solid #F59E0B',
        }
      })
    },
    loading: (message: string) => {
      return toast.loading(message, {
        position: 'top-right',
      })
    },
    dismiss: (toastId?: string) => {
      toast.dismiss(toastId)
    }
  }
}