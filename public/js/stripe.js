import Axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe('pk_test_KlLSAl09QPD1hUxhXrWr0Wbp00mfy8JvSl');

export const bookTour = async (tourId) => {
  try {
    //1) get checkout session form api
    const session = await Axios(`/api/v1/bookings/checkout-session/${tourId}`);

    //2) Create Checkout form  + charge card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    showAlert('error', err);
  }
};
