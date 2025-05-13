"use client"
import { createContext, useContext, useEffect, useState } from "react";

import { User } from "../types/user";
import { http } from "../lib/api";
import * as api from "../utils/api";
import { usePathname, useRouter } from "next/navigation";

interface AuthContextProps {
    user: User | null
    updateUser: () => Promise<void>
    login: (email: string, password: string) => Promise<void>
    signup: (name: string, email: string, password: string) => Promise<void>
    logout: () => Promise<void>
}

interface AuthProviderProps {
    children: React.ReactNode
}

export const AuthContext = createContext({} as AuthContextProps)

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const login = async (email: string, password: string) => {
        const user = await api.login(email, password)
        setUser(user)
    }

    const signup = async (name: string, email: string, password: string) => {
        const user = await api.signup({ email, name, password });
        setUser(user);
    }

    const logout = async () => {
        setUser(null);
        await api.logout();
        router.push("/login");
    }

    const updateUser = async () => {
        const user = await api.getUser();
        setUser(user);
    }

    useEffect(() => {
        const refreshUser = async () => {
            try {
                const user = await api.getUser()
                setUser(user)
            }
            catch (error: any) {
                if([403, 401].includes(error?.response?.status) 
                    && !pathname.includes("/signup") 
                    && !pathname.includes("/login")
                ) {
                    router.push("/login");
                    return;
                }
                if(![403, 401].includes(error?.response?.status)) {
                    console.error(error)
                }
            }
            finally {
                setIsLoading(false)
            }
        }

        refreshUser()
    }, [])

    useEffect(() => {
        const responseIntercept = http.interceptors.response.use(
            response => response,
            async error => {
                if ([403, 401].includes(error?.response?.status)) {
                    router.push("/login")
                }
                return Promise.reject(error)
            }
        )

        return () => {
            http.interceptors.response.eject(responseIntercept)
        }
    }, [router])

    if (isLoading) return <>Loading...</>

    return (
        <AuthContext.Provider value={{ user, signup, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    )
}