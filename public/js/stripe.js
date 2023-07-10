import axios from "axios"
import { loadStripe } from "@stripe/stripe-js"
import { showAlert } from "./alert"
// const stripe = Stripe('pk_test_51NQm0yFlgDZqZzgN65vVtxf6rLocuRRvvBQxMOeH2WxJb2DojQXV5bug5FQryvh9ExZ1AbkLDDwGpbz2RSOTyNaU00zf7lzYyW')

export const bookTour = async (tourId) => {
    try {
        const stripe = await loadStripe('pk_test_51NQm0yFlgDZqZzgN65vVtxf6rLocuRRvvBQxMOeH2WxJb2DojQXV5bug5FQryvh9ExZ1AbkLDDwGpbz2RSOTyNaU00zf7lzYyW')

        const sessions = await axios.get(`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`)
        console.log("id ->",sessions.data.sessions.id)
        console.log(sessions)
        await stripe.redirectToCheckout({
            sessionId: sessions.data.sessions.id
        })
    }
    catch(err) {
        console.log(err)
        showAlert("error", err)
    }
}