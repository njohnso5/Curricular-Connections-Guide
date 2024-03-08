import React, { useState, useEffect } from 'react';
import CourseService from "../services/CourseServices.tsx"
import SemesterService from '../services/SemesterService';
import "../css/CoursePage.css"
import { Course, SemesterForm } from "../CourseModels/courseModels.tsx";
import { Modal, ModalButton, ModalNewSemesterBody, DeleteSemesterModalButton, DeleteSemesterBody, ModalAddCourseBody, ModalEditCourseBody, ModalDeleteCourseBody, SemesterUploadProgressBar, SemesterUploadComplete } from "../components/Modal.tsx";
import CourseModal from './Program/CourseModal.tsx';

interface TableBodyRowsProps {
    id: number;
}



const NewSemesterTab: React.FC = () => {

    const [id, setId] = useState<number | null>(null);
    const [semesters, setSemesters] = useState<SemesterForm[] | null>();

    useEffect(() => {

        SemesterService.getSemesters()
            .then((response) => {
                setSemesters(response.data);
            })

    }, []);

    const handleSemesterUpload = (semester: SemesterForm) => {
        setSemesters((previous) => {
            return [semester, ...previous ?? []];
        })
    }

    const handleClick = (id: number) => {
        setId(id);
    
    };




    return (
        <div className="container-fluid">
            <div className='d-flex align-items-center justify-content-between w-100'>
                <div className="btn-group" role="toolbar">
                    <ModalButton modalTarget="uploadModal" buttonMessage="Add a semester" />
                    <Modal modalTarget="uploadModal" modalTitle="CREATE A NEW SEMESTER" modalBody={<ModalNewSemesterBody handleUpload={handleSemesterUpload} />}></Modal>
                    <Modal modalTarget="progressBarModal" modalBody={<SemesterUploadProgressBar />} modalTitle="REQUEST IN PROGRESS">Your request is in process. Please wait.</Modal>
                    <Modal modalTarget="progressBarCompleteModal" modalBody={<SemesterUploadComplete />} modalTitle="REQUEST COMPLETED">Thank you for waiting.</Modal>
                    {semesters ? semesters.map((semester) => (
                        <button type="button" className={`btn btn-default ${id === semester.id ? 'selected' : ''}`} value={semester.id} onClick={() => handleClick(semester.id)}>{semester.period.period} {semester.year}</button>
                    )) : null}
                </div>
                <div className="delete-button-wrapper">
                    <DeleteSemesterModalButton modalTarget="DeleteSemesterModal" buttonMessage="Delete a semester" />
                    <Modal modalTarget="DeleteSemesterModal" modalTitle="DELETE A SEMESTER" modalBody={<DeleteSemesterBody />} />
                </div>
            </div>
            {id !== null && <TableBodyRows id={id}/>}
        </div >
    )
}

const TableBodyRows: React.FC<TableBodyRowsProps> = ({ id}) => {
    const [course, setCourse] = useState<Course | undefined>(undefined);
    const [courseId, setCourseId] = useState<number | null>(null);
    const [courses, setCourses] = useState<Course[] | null>();
    const [courseTitle, setCourseTitle] = useState<string | undefined>();
    /** The ids of the courses that are selected */
    const [selectedCourseIds, setSelectedCourseIds] = useState([]);
    /** Whether all courses are selected */
    const [selectedAll, setSelectedAll] = useState(false);


    
    useEffect(() => {
        
        // Set selected all to false when the id changes, so the radio and checkboxes are unchecked
        setSelectedAll(false);
        setSelectedCourseIds([]);

        SemesterService.getCourses(id)
            .then((response) => {
                setCourses((prevCourses) => {
                    console.log(prevCourses);
                    return response.data;
                });
            });
    }, [id]);


    const handleClick = (courseId: number) => {
        setCourseId(courseId);
        
    };

    const setCourseType = (courseId: number) => {
        if (courses) {
            courses.forEach((course) => {
                if (course.id === courseId) {
                    setCourse(course);
                }
            });
        }

    }

    const setCourseTitleClick = (courseId: number) => {
        if (courses) {
            courses.forEach((course) => {
                if (course.id === courseId) {
                    setCourseTitle(course.title_long);
                }
            });
        }
    };
    /**
     * Handle the click event for the checkbox in the table header
     */
    const handleSelectedAll = () => {
        setSelectedAll(!selectedAll);
        if (selectedAll) {
            // If all courses are selected, then unselect all courses
            setSelectedCourseIds([]);
        } else {
            setSelectedCourseIds(courses.map(course => course.id));
        }
    }
    /**
     * Handle the click event for the checkbox in the table body
     * @param e event object
     * @param courseId id of the course
     */
    const handleClickCheckbox = (e: React.MouseEvent, courseId: number) => {

        // This stops the event from propagating to the parent element
        e.stopPropagation();
        // If the course is already selected, then unselect it
        if (selectedCourseIds.includes(courseId)) {
            setSelectedCourseIds(selectedCourseIds.filter((id: number) => id !== courseId));
        } else {
            // If the course is not selected, then select it
            setSelectedCourseIds([...selectedCourseIds, courseId]);
            // Set the course type to the newly selected course
            setCourseType(courseId);
            
        }
        console.log(course);
        
    }
    
    /**
     * Update the courses list after a course is added, edited, or deleted
     */
    const updateCoursesList = () => {
        SemesterService.getCourses(id)
            .then((response) => {
                setCourses((prevCourses) => {
                    // console.log(prevCourses);
                    return response.data;
                });
            });

        // Update the selected courses
        setSelectedCourseIds([]);
      };


    return (
        <div>
            <table className="table">
                <thead>
                    <tr>
                        <th><input type="radio" class="radio"
                            checked={selectedAll}
                            onClick={() => {handleSelectedAll()}}
                        onChange={()=> {}}></input></th>
                        <th scope="col">Course Subject & Number</th>
                        <th scope="col">Course Title</th>
                        <th scope="col">Tags</th>
                    </tr>
                </thead>
                <tbody>
                    
                    {courses && courses.map((course) => (
                        
                        <tr key={course.id} value={course.id} data-toggle="modal" data-target="#courseInfoDisplay">
                            <th onClick={(e) => {handleClickCheckbox(e, course.id)}}>
                                <input type="checkbox" 
                                className="round-checkbox"
                                checked={selectedCourseIds.includes(course.id)}
                                onChange={() => {}}
                                />
                            </th>
                            <td onClick={() => { handleClick(course.id); setCourseTitleClick(course.id); setCourseType(course.id) }}>{course.subject.subject} {course.catalog_number}</td>
                            <td onClick={() => { handleClick(course.id); setCourseTitleClick(course.id); setCourseType(course.id) }}>{course.title_long}</td>
                            <td onClick={() => { handleClick(course.id); setCourseTitleClick(course.id); setCourseType(course.id) }}>{course.catalog_number}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="btn-group justify-content-between d-flex justify-content-end" role="toolbar" >
                <div>
                    <ModalButton modalTarget="addCourseModal" buttonMessage="Add a course" />
                    <Modal modalTarget="addCourseModal" modalTitle="ADD A COURSE" modalBody={<ModalAddCourseBody  semesterId={id} updateCoursesList={updateCoursesList}/>} />
                </div>
                <div>
                    <ModalButton disabled={selectedCourseIds.length !== 1} modalTarget="editCourseModal" buttonMessage="Edit course" />
                    <Modal modalTarget="editCourseModal" modalTitle="EDIT A COURSE" modalBody={<ModalEditCourseBody course={course} updateCoursesList={updateCoursesList} />} />
                </div>
                <div>
                    <ModalButton disabled={selectedCourseIds.length < 1} modalTarget="deleteCourseModal" buttonMessage="Delete course" />
                    <Modal modalTarget="deleteCourseModal" modalTitle="DELETE A COURSE" modalBody={<ModalDeleteCourseBody courseIds={selectedCourseIds} updateCoursesList={updateCoursesList} />} />
                </div>

            </div>
            <div>
                <nav aria-label="...">
                    <ul class="pagination">
                        <li class="page-item disabled">
                            <span class="page-link">Previous</span>
                        </li>
                        <li class="page-item"><a class="page-link" href="#">1</a></li>
                        <li class="page-item active">
                            <span class="page-link">
                                2
                                <span class="sr-only">(current)</span>
                            </span>
                        </li>
                        <li class="page-item"><a class="page-link" href="#">3</a></li>
                        <li class="page-item">
                            <a class="page-link" href="#">Next</a>
                        </li>
                    </ul>
                </nav>
            </div>
            {course && (<Modal modalTarget="courseInfoDisplay" modalTitle={courseTitle} modalBody={<ShowClassInfo course={course} />} />)}
        </div>
    );

};

const ShowClassInfo: React.FC<{ course: Course }> = ({ course }) => {

    const getEmails = () => course.faculty.map(faculty => faculty.email).join(", ");
    const getThemes = () => course.themes.map(theme => theme.name).join(", ");
    // if (!course.name.includes("Special Topics")) {
    if (!course.title_long.includes("Special Topics")) {
        return (
            <div className="modal-body">
                <h6><strong>Description: </strong>{course.description}</h6>
                <h6><strong>Emails: </strong>{getEmails()}</h6>
                <h6><strong>Themes: </strong>{getThemes() || "No themes"}</h6>
            </div>     
        )
    }
    else {
        return (
            <div className="modal-body">
                <h6><strong>Special Topics Course </strong></h6>
                <h6><strong>Description: </strong>{course.description}</h6>
                <h6><strong>Special Topics Description: </strong>{course.topics_description}</h6>
                {/* <h6><strong>Short Special Topics Description: </strong>{course.topics_description_s}</h6>
                <h6><strong>Full Special Topics Description: </strong>{course.topics_description_f}</h6> */}
                <h6><strong>Emails: </strong>{getEmails()}</h6>
                <h6><strong>Themes: </strong>{getThemes() || "No themes"}</h6>
            </div>     
        )
    }
}


const CoursePage: React.FC = () => {


    return (
        <>
            <NewSemesterTab />
        </>
    );
}

export default CoursePage;
