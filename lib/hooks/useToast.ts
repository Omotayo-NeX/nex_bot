import { toast as sonnerToast } from 'sonner';

/**
 * Custom toast hook with NeX AI branding
 * Built on top of sonner for consistent notifications
 */

export function useToast() {
  return {
    success: (message: string, description?: string) => {
      sonnerToast.success(message, {
        description,
        duration: 4000,
        className: 'bg-white border-l-4 border-green-500',
      });
    },

    error: (message: string, description?: string) => {
      sonnerToast.error(message, {
        description,
        duration: 5000,
        className: 'bg-white border-l-4 border-red-500',
      });
    },

    info: (message: string, description?: string) => {
      sonnerToast.info(message, {
        description,
        duration: 4000,
        className: 'bg-white border-l-4 border-blue-500',
      });
    },

    warning: (message: string, description?: string) => {
      sonnerToast.warning(message, {
        description,
        duration: 4000,
        className: 'bg-white border-l-4 border-nex-yellow',
      });
    },

    loading: (message: string, description?: string) => {
      return sonnerToast.loading(message, {
        description,
        className: 'bg-white border-l-4 border-gray-400',
      });
    },

    promise: <T,>(
      promise: Promise<T>,
      {
        loading,
        success,
        error,
      }: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: any) => string);
      }
    ) => {
      return sonnerToast.promise(promise, {
        loading,
        success,
        error,
        className: 'bg-white',
      });
    },

    dismiss: (toastId?: string | number) => {
      sonnerToast.dismiss(toastId);
    },

    custom: (component: React.ReactNode, options?: any) => {
      sonnerToast.custom(component as any, options);
    },
  };
}

// Export individual toast functions for direct usage
export const toast = {
  success: (message: string, description?: string) => {
    sonnerToast.success(message, {
      description,
      duration: 4000,
      className: 'bg-white border-l-4 border-green-500',
    });
  },

  error: (message: string, description?: string) => {
    sonnerToast.error(message, {
      description,
      duration: 5000,
      className: 'bg-white border-l-4 border-red-500',
    });
  },

  info: (message: string, description?: string) => {
    sonnerToast.info(message, {
      description,
      duration: 4000,
      className: 'bg-white border-l-4 border-blue-500',
    });
  },

  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, {
      description,
      duration: 4000,
      className: 'bg-white border-l-4 border-nex-yellow',
    });
  },

  loading: (message: string, description?: string) => {
    return sonnerToast.loading(message, {
      description,
      className: 'bg-white border-l-4 border-gray-400',
    });
  },

  promise: sonnerToast.promise,
  dismiss: sonnerToast.dismiss,
  custom: sonnerToast.custom,
};
