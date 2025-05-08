"use client";
import { useState } from "react";

import { useAuth } from "@/contexts/Auth";
import { InputField } from "@/components/InputField";
import { useT } from "@/i18n/client";

import styles from "./styles.module.scss";

export default function SignupPage() {
    const { t } = useT("signup-page")
    const { signup } = useAuth();
    const [formErrors, setFormErrors] = useState({
        passwordMismatch: false,
        emailExists: false,
        weakPassword: false,
        invalidEmailFormat: false
    });

    const validateForm = (formData: FormData) => {
        const password = formData.get("password") as string
        const confirmationPassword = formData.get("confirmationPassword") as string
        if (password !== confirmationPassword) {
            setFormErrors(prev => ({ ...prev, passwordMismatch: true }));
            return false;
        }

        return true;
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);

        if (!validateForm(formData)) return;

        try {
            await signup(
                formData.get("name") as string,
                formData.get("email") as string,
                formData.get("password") as string
            );
        } catch (error: any) {
            if (error.response?.status === 400 || error.response?.status === 409) {
                const message = error?.response?.data?.message;
                setFormErrors(prev => ({
                    ...prev,
                    emailExists: message.includes("email already exists"),
                    weakPassword: message.includes("password must be"),
                    invalidEmailFormat: message.includes("Invalid email")
                }));
            }
        }
    }

    const getErrorMessage = (inputName: string): string => {
        const { passwordMismatch, emailExists, weakPassword, invalidEmailFormat } = formErrors;

        if (passwordMismatch) {
            if (inputName === "password") return t("field.password.password-mismatch-error");
            if (inputName === "confirmationPassword") return " ";
        }
        if (weakPassword) {
            if (inputName === "password") {
                return t("field.password.weak-password-error");
            }
            if (inputName === "confirmationPassword") return " ";
        }
        if (emailExists && inputName === "email") return t("field.email.already-exists-error");
        if (invalidEmailFormat && inputName === "email") return t("field.email.invalid-format-error");

        return "";
    }

    const resetError = (inputName: string) => {
        setFormErrors(prev => ({
            ...prev,
            passwordMismatch: inputName === "password" || inputName === "confirmationPassword" ? false : prev.passwordMismatch,
            emailExists: inputName === "email" ? false : prev.emailExists,
            weakPassword: inputName === "password" ? false : prev.weakPassword,
        }))
    }

    return (
        <div className={styles.signupPage}>
            <div className={styles.container}>
                <form className={styles.signupForm} onSubmit={handleSubmit}>
                    <h1 className={styles.title}>{t("title")}</h1>
                    <InputField
                        inputId='name'
                        testId='name'
                        title={t("field.name.name")}
                        name="name"
                        type='text'
                        placeholder={t("field.name.placeholder")}
                        required
                    />
                    <InputField
                        inputId='email'
                        testId='email'
                        title={t("field.email.name")}
                        name="email"
                        type='email'
                        placeholder={t("field.email.placeholder")}
                        errorMessage={getErrorMessage("email")}
                        onChange={() => resetError("email")}
                        required
                    />
                    <InputField
                        title={t("field.password.name")}
                        type="password"
                        inputId='password'
                        testId='password'
                        name='password'
                        placeholder="••••••••"
                        className={styles.fieldInput}
                        errorMessage={getErrorMessage("password")}
                        onChange={() => resetError("password")}
                    />

                    <InputField
                        inputId='confirmationPassword'
                        testId='confirmationPassword'
                        title={t("field.confirmation-password.name")}
                        name="confirmationPassword"
                        type='password'
                        placeholder='••••••••'
                        required
                        errorMessage={getErrorMessage("confirmationPassword")}
                        onChange={() => resetError("confirmationPassword")}
                    />
                    <button type='submit' className={styles.submitBtn}>{t("signup-btn")}</button>
                    <span className={styles.signupLinkBox}>
                        {t("account-question")}
                        <a href='/login' className={styles.link}>{t("login-link")}</a>
                    </span>
                </form>
            </div>
        </div>
    )

}