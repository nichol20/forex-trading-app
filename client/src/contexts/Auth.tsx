'use client'
import { createContext, useContext, useEffect, useState } from "react";

import { User } from "../types/user";
import { http } from "../utils/http";
import * as api from "../utils/api";
import { useNavigate } from "react-router-dom";

interface AuthContextProps {
    user: User | null
    updateUser: () => Promise<void>
    login: (email: string, password: string) => Promise<void>
    signup: (name: string, email: string, password: string) => Promise<void>
}

interface AuthProviderProps {
    children: React.ReactNode
}

export const AuthContext = createContext({} as AuthContextProps)

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const navigate = useNavigate()

    const login = async (email: string, password: string) => {
        const user = await api.login(email, password)
        setUser(user)
    }

    const signup = async (name: string, email: string, password: string) => {
        const user = await api.signup({ email, name, password })
        setUser(user)
    }

    const updateUser = async () => {
        const user = await api.getUser()
        setUser(user)
    }

    useEffect(() => {
        const refreshUser = async () => {
            try {
                const user = await api.getUser()
                setUser(user)
            }
            catch (error: any) {
                const status = error?.response?.status
                if (status === 403 || status === 401) {
                    navigate("/login")
                }
                console.error(error)
            }
            finally {
                setIsLoading(false)
            }
        }

        refreshUser()
    }, [navigate])

    useEffect(() => {
        const responseIntercept = http.interceptors.response.use(
            response => response,
            async error => {
                console.log("test")
                if (error?.response?.status === 403 || error?.response?.status === 401) {
                    navigate("/login")
                }
                return Promise.reject(error)
            }
        )

        return () => {
            http.interceptors.response.eject(responseIntercept)
        }
    }, [navigate])

    if (isLoading) return <>Loading...</>

    return (
        <AuthContext.Provider value={{ user, signup, login, updateUser }}>
            {children}
        </AuthContext.Provider>
    )
}