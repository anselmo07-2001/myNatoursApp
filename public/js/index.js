import "@babel/polyfill"
import { login, logout } from "./login"
import { displayMap } from "./mapbox.js"
import { updateSettings } from "./updateSettings.js"

const form = document.querySelector(".form--login")
const formSettings = document.querySelector(".form-user-data")
const map = document.getElementById("map")
const logoutBtn = document.querySelector(".nav__el--logout")
const formPasswordSettings = document.querySelector(".form-user-password-settings")

if (form) {
    form.addEventListener("submit", (e) => {
        e.preventDefault()
        const email = document.getElementById("email").value
        const password = document.getElementById("password").value
    
        login(email,password)
    })
}

if (map) {
    const locations = JSON.parse(map.dataset.locations)
    displayMap(locations)
}

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        logout()
    })
}

if (formSettings) {
    formSettings.addEventListener("submit", (e) => {
        e.preventDefault()
        const form = new FormData()
        form.append("name", document.getElementById("name").value)
        form.append("email", document.getElementById("email").value)
        form.append("photo", document.getElementById("photo").files[0])
        console.log(form)

        updateSettings(form, "data")
    })
}

if (formPasswordSettings) {
    formPasswordSettings.addEventListener("submit", async (e) => {
        e.preventDefault()
        
		document.querySelector(".btn-save-password").textContent = "Updating..."
		const currentPassword = document.getElementById("password-current").value
		const newPassword = document.getElementById("password").value
		const newPasswordConfirm = document.getElementById("password-confirm").value
		
		await updateSettings({currentPassword,newPassword,newPasswordConfirm}, "password")
		currentPassword.value = ""
		newPassword.value = ""
		newPasswordConfirm.value = ""
		document.querySelector(".btn-save-password").textContent = "SAVE PASSWORD"
    })
}

