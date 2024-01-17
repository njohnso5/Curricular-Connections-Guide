import { Link, Outlet } from 'react-router-dom';
import styles from '../css/authorization/AdministratorNavBar.module.css'
import { useUser, useUserUpdate } from '../hooks/UserContext';
import React from 'react';

const AdministratorNavBar = () => {

    const user = useUser();
    const setUser = useUserUpdate();

    const logout = () => {
        const logoutUrl = '/Shibboleth.sso/Logout?return=' + encodeURIComponent('/');

        window.location.href = logoutUrl;

        setUser(null);
    }

    return(
        <React.Fragment>
            <nav className="navbar navbar-default" style={{backgroundColor: 'white', boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)'}} role="navigation">
                <div className="navbar-header">
                    <Link to="/admin">
                        <img src="/arts_logo.png" height="40" width="40" alt="Arts NCSU Logo" style={{borderRadius: '50%', borderColor: 'white'}}/>
                    </Link>
                </div>
                <div className='d-flex align-items-center justify-content-center'>
                    <p className='mr-3' id={`${styles.username_label}`}>@{user?.unity_id}</p>
                    <span
                        className={`bi bi-person dropdown`}
                        style={{ fontSize: '1.5em', cursor: 'pointer' }}
                        id="dropdownMenu1"
                        aria-haspopup="true"
                        aria-expanded="false"
                    >
                        <i className="fa-solid fa-circle-user fa-lg" data-toggle='dropdown'></i>
                        <ul className={`dropdown-menu dropdown-menu-right ${styles.user_drop_down}`} role="menu">
                            <li className="dropdown-item" role="presentation" onClick={logout}>
                                <i className="fa-solid fa-circle-right fa-lg" />
                                <span className={`${styles.menu_option}`}>Log Out</span>
                            </li>
                        </ul>
                    </span>
                </div>
            </nav>
            <Outlet />
        </React.Fragment>
    )

}

export default AdministratorNavBar;