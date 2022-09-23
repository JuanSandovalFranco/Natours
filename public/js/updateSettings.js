import { showAlert } from './alert';

export const updateSettings = async (data, type) => {
  try {
    const baseUrl = `${location.protocol}//${location.host}/api/v1/users`;
    const url =
      type === 'password'
        ? `${baseUrl}/updateMyPassword`
        : `${baseUrl}/updateMe`;

    const updateData = data;

    const response = await fetch(url, {
      method: 'PATCH',
      body: updateData,
    });

    const dataResponse = await response.json();

    if (dataResponse.status === 'success') {
      showAlert(`success ${type.toUpperCase()}`, 'Data changed succesfully');
    }
  } catch (error) {
    showAlert('error', error.message);
  }
};
