import { User } from "../types/models";
import { Outlet, useNavigate } from "react-router-dom";

const ProtectedRoute = ({ user, redirectPath = '/' } : {user: User | null, redirectPath: string}) => {

    const navigate = useNavigate();
    
    if(!user || user.role.role === "UNAUTHORIZED") {
        navigate(redirectPath);
        return null;
    }

    return <Outlet />;
};

export default ProtectedRoute;