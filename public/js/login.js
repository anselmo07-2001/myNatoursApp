import axios from "axios"
import { showAlert } from "./alert"

export const login = async (email, password) => {
    try {
        const res = await axios({
            method: "POST",
            url: "/api/v1/users/login",
            // the data property here, expcted email and password field kasi ito yung need
            // ng login endpoint
            data: {
                email,password
            }
        })

        if (res.data.status === "success") {
            showAlert("success","Login successfully")
            window.setTimeout(() => {
                location.assign("/")
            },1500)
        }
    }
    catch(err) {
        showAlert("error",err.response.data.message)
    }   
}

export const logout = async() => {
    try {
        const res = await axios({
            method: "GET",   // GET because we only want the cookie that overwrite the current cookie
            url: "/api/v1/users/logout",
        })

        if (res.data.status === "success") {
            location.assign("/")
        }
    }
    catch(err) {
        showAlert("error",err.response.data.message)
    }    
}
