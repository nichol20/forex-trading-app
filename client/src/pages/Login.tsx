import { useEffect, useState } from "react"
import { useNavigate } from 'react-router'

import { useAuth } from "../contexts/Auth"
import { ErrorMessage } from "../components/ErrorMessage"
import { InputField } from "../components/InputField"
import styles from "../styles/Login.module.scss"

export default function LoginPage() {
    const [invalidCredentials, setInvalidCredentials] = useState(false)
    const { login, user } = useAuth()
    const navigate = useNavigate()

    const resetErrors = () => {
        setInvalidCredentials(false)
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);

        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            await login(email, password)
        } catch (error: any) {
            if (error.response?.status === 404 || error.response?.status === 401) {
                setInvalidCredentials(true)
            }
        }
    }

    useEffect(() => {
        if (user) {
            navigate("/")
        }
    }, [user, navigate])

    return (
        <div className={styles.loginPage}>
            <div className={styles.container}>
                <form className={styles.loginForm} onSubmit={handleSubmit}>
                    <h1 className={styles.title}>Login</h1>
                    <InputField
                        title='E-mail'
                        name="email"
                        type='email'
                        inputId='email'
                        testId="email"
                        placeholder='Type your e-mail'
                        required
                    />
                    <InputField
                        title="Password"
                        name='password'
                        type="password"
                        inputId='password'
                        testId="password"
                        placeholder="••••••••"
                        className={styles.fieldInput}
                        onChange={resetErrors}
                        required
                    />
                    {invalidCredentials && <ErrorMessage message='invalid email or password' />}
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