import { showAlert } from './alert';

export const login = async (email, password) => {
  const user = {
    email,
    password,
  };
  const request = await fetch(
    `${location.protocol}//${location.host}/api/v1/users/login`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    }
  );

  const response = await request.json();

  if (response.status === 'success') {
    showAlert('success', 'Logged in successfully');
    window.setTimeout(() => {
      location.assign('/');
    }, 1500);
  } else {
    showAlert('error', response.message);
  }
};

export const logout = async () => {
  try {
    const request = await fetch(
      `${location.protocol}//${location.host}/api/v1/users/logout`,
      {
        method: 'GET',
      }
    );

    const response = await request.json();

    if (response.status === 'success') location.reload(true);
  } catch (error) {
    showAlert('error', 'Error logging out! Try again');
  }
};
