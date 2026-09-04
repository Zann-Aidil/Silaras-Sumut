import Swal from 'sweetalert2';

// Custom themed SweetAlert2 instance matching SILARAS design system
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
  customClass: {
    popup: 'swal-toast-popup',
  },
});

/** Toast success notification */
export const toastSuccess = (message) => {
  return Toast.fire({
    icon: 'success',
    title: message,
  });
};

/** Toast error notification */
export const toastError = (message) => {
  return Toast.fire({
    icon: 'error',
    title: message,
  });
};

/** Toast info notification */
export const toastInfo = (message) => {
  return Toast.fire({
    icon: 'info',
    title: message,
  });
};

/** Toast warning notification */
export const toastWarning = (message) => {
  return Toast.fire({
    icon: 'warning',
    title: message,
  });
};

/** Success popup (centered, with icon) — for major successes like form submission */
export const alertSuccess = (title, text) => {
  return Swal.fire({
    icon: 'success',
    title,
    text,
    confirmButtonText: 'OK',
    confirmButtonColor: '#1E40AF',
    customClass: {
      popup: 'swal-custom-popup',
    },
  });
};

/** Error popup (centered, with icon) */
export const alertError = (title, text) => {
  return Swal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonText: 'OK',
    confirmButtonColor: '#1E40AF',
    customClass: {
      popup: 'swal-custom-popup',
    },
  });
};

/** Confirmation dialog — replaces window.confirm() */
export const confirmDialog = (title, text, confirmText = 'Ya, Lanjutkan', cancelText = 'Batal') => {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#EF4444',
    cancelButtonColor: '#6B7280',
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
    customClass: {
      popup: 'swal-custom-popup',
    },
  });
};

/** Delete confirmation — preset for destructive actions */
export const confirmDelete = (itemName = 'data ini') => {
  return Swal.fire({
    title: 'Hapus Data?',
    text: `Apakah Anda yakin ingin menghapus ${itemName}? Tindakan ini tidak dapat dibatalkan.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#EF4444',
    cancelButtonColor: '#6B7280',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal',
    reverseButtons: true,
    customClass: {
      popup: 'swal-custom-popup',
    },
  });
};

/** Logout confirmation */
export const confirmLogout = () => {
  return Swal.fire({
    title: 'Keluar dari Sistem?',
    text: 'Anda akan keluar dari akun SILARAS.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#1E40AF',
    cancelButtonColor: '#6B7280',
    confirmButtonText: 'Ya, Logout',
    cancelButtonText: 'Batal',
    reverseButtons: true,
    customClass: {
      popup: 'swal-custom-popup',
    },
  });
};

export default Swal;
