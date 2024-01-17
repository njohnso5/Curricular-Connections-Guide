import React from "react";
import { useAlert } from "../hooks/AlertContext";

const Alert: React.FC = () => {

    const alert = useAlert();

    return(
        <div className="container fixed-bottom">
            <div className="d-flex justify-content-center">
                <div className={`alert alert-${alert?.alert.status} alert-dismissible fade show`} role="alert">
                    {alert?.alert.message ?? "Alert element is null"}
                    <button onClick={alert?.hideAlert} type="button" className="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Alert;