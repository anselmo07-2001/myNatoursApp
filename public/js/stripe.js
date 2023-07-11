import axios from "axios"
import { loadStripe } from "@stripe/stripe-js"
import { showAlert } from "./alert"
// const stripe = Stripe('pk_test_51NQm0yFlgDZqZzgN65vVtxf6rLocuRRvvBQxMOeH2WxJb2DojQXV5bug5FQryvh9ExZ1AbkLDDwGpbz2RSOTyNaU00zf7lzYyW')

export const bookTour = async (tourId) => {
    try {
        const stripe = await loadStripe('pk_test_51NQm0yFlgDZqZzgN65vVtxf6rLocuRRvvBQxMOeH2WxJb2DojQXV5bug5FQryvh9ExZ1AbkLDDwGpbz2RSOTyNaU00zf7lzYyW')

        const sessions = await axios.get(`/api/v1/bookings/checkout-session/${tourId}`)
       
        await stripe.redirectToCheckout({
            sessionId: sessions.data.sessions.id
        })
    }
    catch(err) {
        console.log(err)
        showAlert("error", err)
    }
}