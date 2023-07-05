import axios from "axios"
import { showAlert } from "./alert"


// type value is either "data" or "password"
export const updateSettings = async (data, type) => {

   const url = type === "data" ? `http://127.0.0.1:3000/api/v1/users/updateMe` : 'http://127.0.0.1:3000/api/v1/users/updatePassword'

   try {
        const result = await axios({
            method: "PATCH",
            url,
            data
        })

        if (result.data.status === "success") {
            showAlert("success",`${type} update successfully`)

            window.setTimeout(() => {
                location.assign("/me")
            },1500)
        }
   }
   catch(err) {
       console.log(err)
       showAlert("error",err.response.data.message)
   }

    
}