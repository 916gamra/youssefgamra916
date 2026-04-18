import { toast } from 'sonner';

export const useNotifications = () => {
  const showSuccess = (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 3000,
      position: 'top-right'
    });
  };
  
  const showError = (message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 5000,
      position: 'top-right'
    });
  };
  
  const showWarning = (message: string, description?: string) => {
    toast.warning(message, {
      description,
      duration: 4000,
      position: 'top-right'
    });
  };

  const showInfo = (message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 3000,
      position: 'top-right'
    });
  };
  
  return { showSuccess, showError, showWarning, showInfo };
};
