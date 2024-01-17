import React from "react";
import styles from '../../css/authorization/AddAdminModal.module.css'
import { Role, User } from "../../types/models";
import AdministratorService from '../../services/administrators-service';
import { AxiosResponse } from "axios";
import { AlertType, useAlert } from "../../hooks/AlertContext";

interface AddAdminModalProps {
    roles: Role[] | null
    administratorAdded: (user: User) => void;
}

const AddAdminModal: React.FC<AddAdminModalProps> = (props) => {

    const [unityID, setUnityID] = React.useState<string>('');
    const [role, setRole] = React.useState<string>('');
    const [canSubmit, setCanSubmit] = React.useState<'disabled' | undefined>('disabled');
    const alert = useAlert();

    React.useEffect(() => {
        if(formIsValid(unityID, role)) { setCanSubmit(undefined) }
        else { setCanSubmit('disabled') }
    }, [unityID, role])

    const handleCloseModal = () => {
        setUnityID('');
        setRole('');
    }

    const formIsValid = (unityID: string, role: string) => {
        return unityID.trim() !== '' && role.trim() !== '';
    }

    const handleCreateAdministrator = () => {
        const selectedRole = props.roles?.find(target => target.id === Number.parseInt(role));

        if(!formIsValid) { return; }
        if(!selectedRole) { return; }

        AdministratorService.createAdministrator(unityID, selectedRole.id).then((response: AxiosResponse<User>) => {
            props.administratorAdded(response.data);

            alert?.showAlert(AlertType.SUCCESS, "Added administrator " + unityID);
        })
        .catch(_ => {
            alert?.showAlert(AlertType.ERROR, "Failed to add administrator. Please retry.");
        })
        .finally(() => {
            handleCloseModal();
        })
    }

    return(
        <form>
            <div className="modal add-administrator" tabIndex={-1} role="dialog" >
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                    <div className={`modal-header ${styles.lightGray}`}>
                        <h5 className={`modal-title ${styles.bold}`} >{"Add new user"}</h5>
                        <button type="button" className={`close`} data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className="form-group">
                            <label htmlFor="unityID">Unity ID</label>
                            <input type="text" value={unityID} onChange={(e) => setUnityID(e.target.value)} className={`form-control ${styles.input}`} id="unityID" placeholder="Unity ID..." required />
                        </div>
                        <div className="form-group">
                            <label className="mr-sm-2" htmlFor="role">Role</label>
                            <select className={`custom-select mr-sm-2 ${styles.input}`} value={role} onChange={(e) => setRole(e.target.value)} id="role" required>
                                <option value="">Choose...</option>
                                {props.roles?.map(role => {return <option value={role.id}>{role.role}</option>})}
                            </select>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className={`btn btn-secondary ${styles.btn}`} data-dismiss="modal" onClick={handleCloseModal}>Close</button>
                        <button type="button" className={`btn btn-primary ${canSubmit} ${styles.btn}`} data-dismiss="modal" onClick={handleCreateAdministrator}>Save changes</button>
                    </div>
                    </div>
                </div>
                </div>
        </form>
    )
}

export default AddAdminModal;