import React from "react";
import styles from '../../css/authorization/AddAdminModal.module.css'
import { Role, User } from "../../types/models";

interface EditRoleModalProps {
    user: User | null
    roles: Role[] | null
    updateUserRole: (user: User, role: Role) => void
}

const EditRoleModal: React.FC<EditRoleModalProps> = (props) => {

    const [selection, setSelection] = React.useState<number | undefined>(props.user?.role.id);

    const handleCloseModal = () => {
        setSelection(props.user?.role.id)
    }

    const updateRole = () => {
        const role = props.roles?.find(role => role.id === selection);

        if(props.user && role) {
            props.updateUserRole(props.user, role)
        }
    }

    return(
        <form>
            <div className="modal edit-role" tabIndex={-1} role="dialog" >
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                    <div className={`modal-header ${styles.lightGray}`}>
                        <h5 className={`modal-title ${styles.bold}`} >{props.user?.unity_id}</h5>
                        <button type="button" className={`close`} data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="mr-sm-2" htmlFor="role">Role</label>
                            <select className={`custom-select mr-sm-2 ${styles.input}`} value={selection ?? props.user?.role.id} onChange={(e) => setSelection(Number.parseInt(e.target.value))} id="role" required>
                                {props.roles?.map(role => { return <option value={role.id}>{role.role}</option> })}
                            </select>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className={`btn btn-secondary ${styles.btn}`} onClick={handleCloseModal} data-dismiss="modal">Close</button>
                        <button type="button" className={`btn btn-primary ${styles.btn}`} onClick={updateRole} data-dismiss="modal">Update Role</button>
                    </div>
                    </div>
                </div>
                </div>
        </form>
    )
}

export default EditRoleModal;