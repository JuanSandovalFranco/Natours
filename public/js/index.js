import { login, logout } from './login';
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { showAlert } from './alert';

const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const updateForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookButton = document.querySelector('#book-tour');

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;

    login(email, password);
  });
}

if (logoutBtn) logoutBtn.addEventListener('click', logout);

if (updateForm) {
  updateForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const form = new FormData();

    form.append('name', document.querySelector('#name').value);
    form.append('email', document.querySelector('#email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateSettings(form, 'data');
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    document.querySelector('.btn-save-password').textContent = 'Updating...';

    const passwordCurrent = document.querySelector('#password-current').value;
    const password = document.querySelector('#password').value;
    const passwordConfirm = document.querySelector('#password-confirm').value;

    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    document.querySelector('.btn-save-password').textContent = 'Save Password';

    document.querySelector('#password-current').value = '';
    document.querySelector('#password').value = '';
    document.querySelector('#password-confirm').value = '';
  });
}

if (bookButton) {
  bookButton.addEventListener('click', (e) => {
    e.target.textContent = 'Procesing...';
    const { tourId } = e.target.dataset;

    bookTour(tourId);
  });
}

const alertMessage = document.querySelector('body').dataset.alert;

if (alertMessage) showAlert('success', alertMessage, 20);
