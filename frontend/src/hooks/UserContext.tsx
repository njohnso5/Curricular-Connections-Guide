import { createContext, useState, PropsWithChildren, useContext } from 'react'
import { User } from '../types/models'

const UserContext = createContext<User | null>(null)
const UserUpdateContext = createContext<(user: User | null) => void>(() => null)

export function useUser() {
    return useContext(UserContext)
}

export function useUserUpdate() {
    return useContext(UserUpdateContext)
}

export function UserProvider(props : PropsWithChildren ) {

    const [user, setUser] = useState<User | null>(null)

    return(
        <UserContext.Provider value={user}>
            <UserUpdateContext.Provider value={setUser}>
                {props.children}
            </UserUpdateContext.Provider>
        </UserContext.Provider>
    )
}
