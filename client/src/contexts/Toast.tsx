import { v4 as uuidv4 } from 'uuid';
import { createContext, useContext, useState } from 'react'

import { blueCheckMarkIcon, redXIcon } from '../assets';

import styles from '../styles/Toast.module.scss'

export interface ToastData {
    message: string
    status: 'success' | 'error'
    icon: string
    id: string
}

export type Toast = Omit<ToastData, "id" | "icon">

type ToastFunction = (toast: Toast) => void

export interface ToastContextProps {
    toast: ToastFunction
}

interface ToastProviderProps {
    children: React.ReactNode
}

export const ToastContext = createContext({} as ToastContextProps)

export const useToast = () => {
    const { toast } = useContext(ToastContext)
    return toast
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
    const [list, setList] = useState<ToastData[]>([])

    const toast: ToastFunction = ({ message, status }) => {
        const id = 'toast-' + uuidv4()
        setList([...list, {
            message,
            status,
            id,
            icon: status === "success" ? blueCheckMarkIcon : redXIcon
        }])

        setTimeout(() => {
            deleteToast(id)
        }, 4000)
    }

    const deleteToast = (id: string) => {
        const toastEl = document.getElementById(id)
        toastEl?.classList.remove(styles.active)
        setTimeout(() => {
            toastEl?.remove()
        }, 300)
    }


    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className={styles.toastContainer} >
                {
                    list.map((t, index) => (
                        <div
                            id={t.id}
                            className={`${styles.toast} ${styles.active}`}
                            data-status={t.status}
                            onClick={() => deleteToast(t.id)}
                            key={index}
                        >
                            <img src={t.icon} alt="icon" />
                            <span>{t.message}</span>
                        </div>
                    ))
                }
            </div>
        </ToastContext.Provider>
    )
}