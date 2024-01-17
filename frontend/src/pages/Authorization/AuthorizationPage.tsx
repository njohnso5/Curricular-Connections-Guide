import React from 'react';
import styles from "../../css/authorization/AuthorizationPage.module.css"
import AddAdminModal from './AddAdminModal'
import EditRoleModal from './EditRoleModal'
import { Role, User } from '../../types/models';
import AdministratorService from '../../services/administrators-service'
import RoleService from '../../services/roles-service';
import { AxiosResponse } from 'axios';
import { useUser } from '../../hooks/UserContext';
import { useAlert, AlertType } from '../../hooks/AlertContext';

const AuthorizationPage: React.FC = () => {
    
    const user = useUser();
    const alert = useAlert();
    const [roles, setRoles] = React.useState<Role[] | null>(null);
    const [userToEdit, setUserToEdit] = React.useState<User | null>(null);
    const [administrators, setAdministrators] = React.useState<User[] | null>(null);

    const userIsSuperuser = user?.role.role === "SUPERUSER" ?? false;

    React.useEffect(() => {
        AdministratorService.getAdministrators().then((response: AxiosResponse<User[]>) => {
            setAdministrators(response.data)
        })
        .catch(_ => {
            console.log("Error fetching administrators...");
        })

        RoleService.getRoles().then((response: AxiosResponse<Role[]>) => {
            setRoles(response.data)
        })
        .catch(_ => {
            setRoles(null)
        })
    }, [])

    const handleRoleUpdate = (user: User, role: Role) => {
        AdministratorService.updateAdministratorRole(user.id, role.id).then((_: AxiosResponse<User>) => {
            setAdministrators((prev) => {
                if(role.role === "UNAUTHORIZED") { return prev?.filter(admin => admin.id !== user.id) ?? null }
                return prev?.map((admin) => { 
                    if(admin.id === user.id) { admin.role = role; }

                    return admin; 
                }) ?? null
            })

            alert?.showAlert(AlertType.SUCCESS, "Successfully updated administrator to " + role.role);
        })
        .catch(_ => {
            alert?.showAlert(AlertType.ERROR, "Failed to update administrators role. Please retry.");
        })
    }

    const removeAdministrator = (admin: User) => {
        const role = roles?.find(role => role.role === "UNAUTHORIZED");
        if(role) {  handleRoleUpdate(admin, role); }
    }

    const handleAdministratorAdded = (admin: User) => {
        setAdministrators((prev: User[] | null) => (prev ? [...prev, admin] : [admin]));
    }

    const getTableRows = () => {
        return administrators?.map((admin) => {
            const adminIsSuperUser = admin.role.role === "SUPERUSER";

            return (
                <tr key={admin.unity_id}>
                    <td id={styles.centerMiddle}>{admin.unity_id}</td>
                    <td id={styles.centerMiddle}><span className="badge badge-pill badge-info">{admin.role.role}</span></td>
                    {userIsSuperuser && 
                        <td id={`${styles.actionContainer}`}>
                        {adminIsSuperUser || 
                        <>
                            <button type="button" 
                            className={`btn btn-default btn-outline-light ${styles.rounded} ${styles.gray}`} 
                            data-toggle="modal" 
                            data-target=".edit-role"
                            onClick={(_) => setUserToEdit(admin)}
                            >
                                <i className="fa-solid fa-gear" /> Edit Role
                            </button>
                            <button type="button" 
                                    className={`btn btn-default btn-outline-light ${styles.rounded} ${styles.gray}`} 
                                    onClick={(_) =>  removeAdministrator(admin)}>
                                <i className="fa-solid fa-trash" />Remove User
                            </button>
                            <button type="button" 
                                    className={`btn btn-default btn-outline-light ${styles.rounded} ${styles.gray}`} 
                                    onClick={(_) =>  removeAdministrator(admin)}>
                                <i className="fa-solid fa-arrows-rotate" />Transfer Ownership
                            </button>
                        </>                      
                        }
                    </td>}
                </tr>
            )
        })
    }

    return (
        <React.Fragment>
            <div data-testid={"administrator-page"} className="container-fluid" id={styles.containerFluid}>
                <div className={styles.tableHeader}>
                    <input type="search"  className={`form-control ${styles.searchBar}`} placeholder="Search User..." />
                    <button className={`btn btn-primary ${styles.rounded}`} data-toggle="modal" data-target=".add-administrator">Add Administrator</button>
                </div>   
                <div className="table-responsive" id={styles.tableResponsive}>
                    <table className="table">
                        <thead className='thead-dark'>
                            <tr>
                                <th scope="col">UnityID</th>
                                <th scope="col">User Role</th>
                                {userIsSuperuser && <th scope="col">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {getTableRows()}
                        </tbody>
                    </table>
                </div>
                <ul className="pagination" id={styles.pagination}>
                    <li className="page-item"><a className="page-link">Previous</a></li>
                    <li className="page-item"><a className="page-link">1</a></li>
                    <li className="page-item"><a className="page-link">2</a></li>
                    <li className="page-item"><a className="page-link">3</a></li>
                    <li className="page-item"><a className="page-link">Next</a></li>
                </ul>
            </div>
            <AddAdminModal administratorAdded={handleAdministratorAdded} roles={roles}/>
            <EditRoleModal user={userToEdit} roles={roles} updateUserRole={handleRoleUpdate} />
        </React.Fragment>
        
    )
}

export default AuthorizationPage;