function makeToast(toastText) {
  let toast = document.querySelector('.toast-message');

  if (!toast) {
    toast = document.createElement('div');
    document.querySelector('body').appendChild(toast);
    toast.classList.add('toast-message');
  } else {
    while (toast.firstChild)
      toast.removeChild(toast.lastChild);
  }

  toast.appendChild(document.createTextNode(toastText));

  toast.classList.remove("toast-message");
  void toast.offsetWidth;
  toast.classList.add("toast-message");
}