"use client"

import { useAuth } from '@/contexts/Auth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { user } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (user) {
            router.push("/dashboard")
        }
    }, [user, router])

    return children
}