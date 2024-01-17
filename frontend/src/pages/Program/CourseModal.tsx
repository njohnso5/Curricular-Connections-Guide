import React from 'react';
import { Course } from '../../CourseModels/courseModels';
import styles from '../../css/authorization/AddAdminModal.module.css'

interface CourseModalProps {
    course: Course
}

const CourseModal: React.FC<CourseModalProps> = ({course}) => {

    const getEmails = () => course.faculty.map(faculty => faculty.email).join(", ");
    const getThemes = () => course.themes.map(theme => theme.name).join(", ");

    return(
        <div className="modal course-inspect" tabIndex={-1} role="dialog" >
            <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                <div className="modal-content">
                <div className={`modal-header ${styles.lightGray}`}>
                    <h5 className={`modal-title ${styles.bold}`}>
                        {course.title_long}
                        <small className="text-muted ml-2">- {course.subject.subject}{course.catalog_number}</small>
                    </h5>
                    <button type="button" className={`close`} data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div className="modal-body">
                        <h6><strong>Description: </strong> {course.description}</h6>
                        <h6><strong>Emails: </strong>{getEmails()}</h6>
                        <h6><strong>Themes: </strong>{getThemes()}</h6>
                </div>
                <div className="modal-footer">
                    <button type="button" className={`btn btn-primary ${styles.btn}`} data-dismiss="modal">Close</button>
                </div>
                </div>
            </div>
        </div>
    )
}

export default CourseModal;