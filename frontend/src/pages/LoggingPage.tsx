import React, { useState, useEffect } from 'react';
import { Modal, ModalButton } from "../components/Modal";
import { AdminLog, UserLog } from "../models/loggingModels";
import LoggingService from '../services/logging-services';

const TableBodyRowsLog: React.FC = ({log}) => {
    const [adminLogs, setAdminLogs] = useState<AdminLog[] | null>();
    const [userLogs, setUserLogs] = useState<UserLog[] | null>();
    /** The ids of the courses that are selected */
    const [selectedCourseIds, setSelectedCourseIds] = useState([]);
    /** Whether all courses are selected */
    const [selectedAll, setSelectedAll] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const coursesPerPage = 10;
    const pageNeighbours = 3;
    // Calculate the total number of pages
    const totalPages = Math.ceil((adminLogs ? adminLogs.length : 0) / coursesPerPage);

    // Calculate the page numbers to show
    const startPage = Math.max(1, currentPage - pageNeighbours);
    const endPage = Math.min(totalPages, currentPage + pageNeighbours);
    const pagesToShow = [...Array((endPage - startPage) + 1)].map((_, i) => startPage + i);

    // Get the courses for the current page
    const currentCourses = adminLogs ? adminLogs.slice((currentPage - 1) * coursesPerPage, currentPage * coursesPerPage) : [];
    
    useEffect(() => {
        // Set selected all to false when the id changes, so the radio and checkboxes are unchecked
        setSelectedAll(false);
        setSelectedCourseIds([]);
        setCurrentPage(1);
        LoggingService.getAdminLogs()
            .then((response) => {
                setAdminLogs(response.data);
            });
        LoggingService.getUserLogs()
            .then((response) => {
                setUserLogs(response.data)
            });
    }, []);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    }
    if (log === "Admin Log" && adminLogs.length > 0) {
    return (
        <div>
            <table className="table">
                <thead>
                    <tr>
                        <th scope="col">Unity Id</th>
                        <th scope="col">API Call</th>
                        <th scope="col">Date</th>
                    </tr>
                </thead>
                <tbody>
                {adminLogs && currentCourses.map(adminLog => (
                        
                        <tr key={adminLog.id} value={adminLog.id} data-toggle="modal" data-target="#courseInfoDisplay">
                            <td >{adminLog.unity_id} </td>
                            <td >{adminLog.call}</td>
                            <td>{adminLog.datetime}</td>
                        </tr>
                    ))}
                    
                </tbody>
            </table>
            <div>
                <nav>
                    <ul className="pagination">
                        {startPage > 1 && <li className="page-item"><a className="page-link" onClick={() => handlePageChange(1)}>1</a></li>}
                        {startPage > 2 && <li className="page-item"><span className="page-link">...</span></li>}
                        {pagesToShow.map(page => (
                            <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
                                <a className="page-link" onClick={() => handlePageChange(page)}>{page}</a>
                            </li>
                        ))}
                        {endPage < totalPages - 1 && <li className="page-item"><span className="page-link">...</span></li>}
                        {endPage < totalPages && <li className="page-item"><a className="page-link" onClick={() => handlePageChange(totalPages)}>{totalPages}</a></li>}
                    </ul>
                </nav>
            </div>
        </div>
    );
    }
    else if (log === "User Log"&& userLogs.length > 0) {
        return (
            <div>
            <table className="table">
                <thead>
                    <tr>
                        <th scope="col">Query</th>
                        <th scope="col">Date</th>
                    </tr>
                </thead>
                <tbody>
                {userLogs && currentCourses.map(userLog => (
                        
                        <tr key={userLog.id} value={userLog.id} data-toggle="modal" data-target="#courseInfoDisplay">
                            <td >{userLog.query} </td>
                            <td>{userLog.datetime}</td>
                        </tr>
                    ))}
                    
                </tbody>
            </table>
            <div>
                <nav>
                    <ul className="pagination">
                        {startPage > 1 && <li className="page-item"><a className="page-link" onClick={() => handlePageChange(1)}>1</a></li>}
                        {startPage > 2 && <li className="page-item"><span className="page-link">...</span></li>}
                        {pagesToShow.map(page => (
                            <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
                                <a className="page-link" onClick={() => handlePageChange(page)}>{page}</a>
                            </li>
                        ))}
                        {endPage < totalPages - 1 && <li className="page-item"><span className="page-link">...</span></li>}
                        {endPage < totalPages && <li className="page-item"><a className="page-link" onClick={() => handlePageChange(totalPages)}>{totalPages}</a></li>}
                    </ul>
                </nav>
            </div>
        </div>
        );
    }

};

const LoggingPage: React.FC = () => {
    const [logType, setLogType] = useState<String | undefined>();
    const logs = ["Admin Log", "User Log"];

    const handleClick = (log: string) => {
        setLogType(log);
    };
    
    return (
    <div className="container-fluid">
    <div className='d-flex align-items-center justify-content-between w-100'>
        <div className="btn-group" role="toolbar">
        {logs ? logs.map((log) => (
        <button type="button" className={`btn btn-default ${log === logType ? 'selected' : ''}`} value={log.toString()} onClick={() => handleClick(log)}>{log}</button>
        )) : null}
        </div>
    </div>
    {logType !== undefined && <TableBodyRowsLog log={logType}/>}
</div >
)
}

export default LoggingPage;