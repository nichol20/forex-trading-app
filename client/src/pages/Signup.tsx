import { useEffect, useState } from "react"
import { useNavigate } from 'react-router-dom'

import { useAuth } from "../contexts/Auth"
import { InputField } from "../components/InputField"
import styles from "../styles/Signup.module.scss"

export default function SignupPage() {
    const { signup, user } = useAuth()
    const navigate = useNavigate()
    const [formErrors, setFormErrors] = useState({
        passwordMismatch: false,
        emailExists: false,
        weakPassword: false,
    })

    const validateForm = (formData: FormData) => {
        const password = formData.get("password") as string
        const confirmationPassword = formData.get("confirmationPassword") as string
        if (password !== confirmationPassword) {
            setFormErrors(prev => ({ ...prev, passwordMismatch: true }))
            return false
        }

        return true
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const formData = new FormData(event.currentTarget)

        if (!validateForm(formData)) return

        try {
            await signup(
                formData.get("name") as string,
                formData.get("email") as string,
                formData.get("password") as string
            )
        } catch (error: any) {
            if (error.response?.status === 400 || error.response?.status === 409) {
                const message = error?.response?.data?.message
                console.log(message)
                setFormErrors(prev => ({
                    ...prev,
                    emailExists: message.includes("email already exists"),
                    weakPassword: message.includes("password must be")
                }))
            }
        }
    }

    const getErrorMessage = (inputName: string): string => {
        const { passwordMismatch, emailExists, weakPassword } = formErrors

        if (passwordMismatch) {
            if (inputName === "password") return "Passwords must be the same"
            if (inputName === "confirmationPassword") return " "
        }
        if (weakPassword) {
            if (inputName === "password") {
                return "Password must be at least 6 characters"
            }
            if (inputName === "confirmationPassword") return " "
        }
        if (emailExists && inputName === "email") return "This email already exists!"

        return ""
    }

    const resetError = (inputName: string) => {
        setFormErrors(prev => ({
            ...prev,
            passwordMismatch: inputName === "password" || inputName === "confirmationPassword" ? false : prev.passwordMismatch,
            emailExists: inputName === "email" ? false : prev.emailExists,
            weakPassword: inputName === "password" ? false : prev.weakPassword,
        }))
    }


    useEffect(() => {
        if (user) {
            navigate("/")
        }
    }, [user, navigate])

    return (
        <div className={styles.signupPage}>
            <div className={styles.container}>
                <form className={styles.signupForm} onSubmit={handleSubmit}>
                    <h1 className={styles.title}>Sign Up</h1>
                    <InputField
                        inputId='name'
                        title='Name'
                        name="name"
                        type='text'
                        placeholder='Type your name'
                        required
                    />
                    <InputField
                        inputId='email'
                        title='E-mail'
                        name="email"
                        type='email'
                        placeholder='Type your e-mail'
                        errorMessage={getErrorMessage("email")}
                        onChange={() => resetError("email")}
                        required
                    />
                    <InputField
                        title="Password"
                        type="password"
                        inputId='password'
                        name='password'
                        placeholder="••••••••"
                        className={styles.fieldInput}
                        errorMessage={getErrorMessage("password")}
                        onChange={() => resetError("password")}
                    />

                    <InputField
                        inputId='confirmationPassword'
                        title='Confirm password'
                        name="confirmationPassword"
                        type='password'
                        placeholder='••••••••'
                        required
                        errorMessage={getErrorMessage("confirmationPassword")}
                        onChange={() => resetError("confirmationPassword")}
                    />
                    <button type='submit' className={styles.submitBtn}>Login</button>
                    <span className={styles.signupLinkBox}>
                        {"Don't have an account? "}
                        <a href='/signup' className={styles.link}>sign up</a>
                    </span>
                </form>
            </div>
        </div>
    )

}