import React from 'react';
import { Link } from 'react-router-dom'

 const AdminHomePage: React.FC = () => {

    const pages = [
        {title: "Manage Courses", link: "/admin/courses"},
        {title: "Manage Programs", link: "/admin/programs"},
        {title: "Administrators", link: "/admin/administrators"},
    ]

    return(
        <div className="container mt-5">
            <div className="row mx-auto">
                {pages.map(page => {
                    return (
                        <div className="col-md-4">
                            <Link to={page.link}>
                                <div className="card" style={{height: '150px'}}>
                                    <div className="card-body d-flex align-items-center justify-content-center">
                                    {page.title}
                                    </div>
                                </div>
                            </Link>
                        </div>
                    )
                })}
            </div>
        </div>
    )
 }

 export default AdminHomePage;