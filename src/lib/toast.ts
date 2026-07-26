import Toast, { ToastShowParams } from 'react-native-toast-message';

export const showAppToast = (params: ToastShowParams) => {
  Toast.show({
    position: 'bottom',
    visibilityTime: 2500,
    ...params,
  });
};

export const showSuccessToast = (message: string, title = 'Success') => {
  showAppToast({
    type: 'success',
    text1: title,
    text2: message,
  });
};

export const showErrorToast = (message: string, title = 'Error') => {
  showAppToast({
    type: 'error',
    text1: title,
    text2: message,
  });
};

export const showWarningToast = (message: string, title = 'Warning') => {
  showAppToast({
    type: 'info',
    text1: title,
    text2: message,
  });
};
