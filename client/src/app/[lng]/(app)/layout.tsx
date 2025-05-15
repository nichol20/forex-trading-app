"use client"

import { useAuth } from '@/contexts/Auth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';

export default function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { user } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!user) {
            router.push("/login")
        }
    }, [user, router])

    if (!user) return "Loading..."

    return <>
        <Header />
        {children}
    </>
}