import { redirect } from 'next/navigation'

import FullScreenLoader from '../components/ui/fullscreen.loader'
import LoginPage from './signin.form'

type MainContentProps = {
    status: 'authenticated' | 'unauthenticated' | 'loading'
    userType: string | undefined
    isLoading?: boolean
}

const MainContent: React.FC<MainContentProps> = ({
    status,
    userType,
    isLoading,
}) => {
    if (status === 'loading' || isLoading) {
        return (
            <div className="w-full h-screen flex items-center justify-center">
                <FullScreenLoader />
            </div>
        )
    }

    const page =
        userType === 'admin' ? 'admin' : 'staff'

    if (status === 'authenticated') {
        redirect(`/${page}/dashboard`)
    }

    return (
        <div>
            <LoginPage />
        </div>
    )
}

export default MainContent
