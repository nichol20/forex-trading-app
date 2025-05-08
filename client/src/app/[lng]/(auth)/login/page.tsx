"use client"
import { useState } from "react"

import { useAuth } from "@/contexts/Auth";
import { ErrorMessage } from "@/components/ErrorMessage";
import { InputField } from "@/components/InputField";
import { useT } from "@/i18n/client";

import styles from "./styles.module.scss";

export default function LoginPage() {
    const { t } = useT("login-page");
    const [invalidCredentials, setInvalidCredentials] = useState(false)
    const { login } = useAuth()

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
            if (
                error.response?.status === 404 
                || error.response?.status === 401 
                || error.response?.status === 400
            ) {
                setInvalidCredentials(true)
                return
            }
        }
    }

    return (
        <div className={styles.loginPage}>
            <div className={styles.container}>
                <form className={styles.loginForm} onSubmit={handleSubmit}>
                    <h1 className={styles.title}>{t("title")}</h1>
                    <InputField
                        title={t("email-field-name")}
                        name="email"
                        type='email'
                        inputId='email'
                        testId="email"
                        placeholder={t("email-field-placeholder")}
                        required

                    />
                    <InputField
                        title={t("password-field-name")}
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
                    <button type='submit' className={styles.submitBtn}>{t("login-btn")}</button>
                    <span className={styles.signupLinkBox}>
                        {t("account-question")}
                        <a href='/signup' className={styles.link}>{t("signup-link")}</a>
                    </span>
                </form>
            </div>
        </div>
    )

}