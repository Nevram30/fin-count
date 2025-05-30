'use client'
import React from 'react'
import { useSession } from 'next-auth/react'
import MainContent from './main.signin'

declare module "next-auth" {
    interface Session {
        user: {
            name: string
            email: string
            userType: 'admin' | 'staff'
        }
    }
}

const SignIn = () => {
    const session = useSession()
    const users = session.data?.user

    return (
        <>
            <div>
                <MainContent status={session.status} userType={users?.userType} />
            </div>
        </>
    )
}

export default SignIn
