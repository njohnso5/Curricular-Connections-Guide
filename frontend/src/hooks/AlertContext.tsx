import { useContext, createContext, PropsWithChildren, useState } from 'react';

interface Alert {
    open: boolean,
    status: string | undefined,
    message: string | undefined
}

interface IAlertContext {
    alert: Alert
    showAlert: (status: string, message: string) => void,
    hideAlert: () => void,
}

export enum AlertType {
    SUCCESS = 'success',
    WARNING = 'warning',
    ERROR = 'error'
}

const AlertContext = createContext<IAlertContext | null>(null);

export function useAlert() { return useContext(AlertContext) }


export function AlertProvider(props: PropsWithChildren) {
    const [alert, setAlert] = useState<Alert>({open: false, status: 'warning', message: 'testing...'});

    const showAlert = (status: string, message: string, ) => {
        setAlert({open: true, status: status, message: message});
    }

    const hideAlert = () => {
        setAlert({open: false, status: undefined, message: undefined})
    }

    return(
        <AlertContext.Provider value={{alert, showAlert, hideAlert}}>
            {props.children}
        </AlertContext.Provider>
    )
}



