import { showAlert } from './alert';

const stripe = Stripe(
  'pk_test_51LkrxWEpFVJfquSbg1RuJhFKHeiBFxmR30w2Pc9XEFTMKJ0imjjjnDNXGwZmzIZDOyFHcBVCO76RTiQG9vFX3Cia00hDF909wo'
);

export const bookTour = async (tourId) => {
  try {
    const session = await fetch(
      `${location.protocol}//${location.host}/api/v1/bookings/checkout-session/${tourId}`
    );

    const sessionResponse = await session.json();

    location.assign(sessionResponse.session.url);
  } catch (error) {
    showAlert('error', error);
  }
};
