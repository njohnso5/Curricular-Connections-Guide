import React, { useState, useEffect } from 'react';
import SemesterService from '../services/SemesterService';
import "../css/CoursePage.css"
import { Course, SemesterForm } from "../CourseModels/courseModels.tsx";
import { Modal, ModalButton, ModalNewSemesterBody, DeleteSemesterModalButton, DeleteSemesterBody, ModalAddCourseBody, ModalEditCourseBody, ModalDeleteCourseBody, SemesterUploadProgressBar, SemesterUploadComplete, ChangeActiveSemesterBody, EditSemesterModalButton } from "../components/Modal.tsx";
import CourseModal from './Program/CourseModal.tsx';
import { ProgressBar } from 'react-bootstrap';
import EditThemes from '../components/EditThemes.tsx';
interface TableBodyRowsProps {
    id: number;
}



const NewSemesterTab: React.FC = () => {

    const [id, setId] = useState<number | null>(null);
    const [semesters, setSemesters] = useState<SemesterForm[] | null>();
    const [currentActive, setCurrentActive] = useState<SemesterForm | null>();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {

        SemesterService.getSemesters()
            .then((response) => {
                console.log(response.data);
                setSemesters(response.data);
            })
        console.log(semesters);
        SemesterService.getActiveSemester()
            .then((response) => {
                setCurrentActive(response.data);
                if (response.data.id !== undefined) {
                    setId(response.data.id);
                }
            })

    }, []);

    const handleSemesterUpload = (semester: SemesterForm) => {
        setSemesters((previous) => {
            return [semester, ...previous];
        })
    }

    const handleClick = (id: number) => {
        // Set loading to true when a semester is clicked
        setIsLoading(true);
        setId(id);
    };

    const reloadButtons = () => {
        // console.log("Current Active: " + currentActive.id.toString());
        var semesterNum = 0;
        console.log(semesters);
        const buttons = document.querySelectorAll(".semester");
        buttons.forEach((element) => {
            console.log("Current Semester Num: " + semesterNum);
            console.log(semesters[semesterNum].period.period);
            const buttonText = semesters[semesterNum].period.period + " " + semesters[semesterNum].year.toString() + " " + (currentActive.id == semesters[semesterNum].id ? " (Active)" : "");
            console.log(buttonText);
            element.innerHTML = buttonText;
            semesterNum++;
        })
    }

    return (
        <div className="container-fluid">
            <div className='d-flex align-items-center justify-content-between w-100'>
                <div className="btn-group flex-grow-1" role="toolbar">
                    <ModalButton modalTarget="uploadModal" buttonMessage="Add a semester" />
                    <Modal modalTarget="uploadModal" modalTitle="CREATE A NEW SEMESTER" modalBody={<ModalNewSemesterBody handleUpload={handleSemesterUpload} currentActive={currentActive} setCurrentActive={setCurrentActive}/>}></Modal>
                    <Modal modalTarget="progressBarModal" modalBody={<SemesterUploadProgressBar />} modalTitle="REQUEST IN PROGRESS">Your request is in process. Please wait.</Modal>
                    <Modal modalTarget="progressBarCompleteModal" modalBody={<SemesterUploadComplete />} modalTitle="REQUEST COMPLETED">Thank you for waiting.</Modal>
                    {semesters ? semesters.map((semester) => (
                        <button type="button" className={`semester btn btn-default ${id === semester.id ? 'selected' : ''}`} value={semester.id} onClick={() => handleClick(semester.id)}>{semester.period.period} {semester.year}{semester.active ? " (Active)" : ""}</button>
                    )) : null}
                </div>
                <div className="edit-button">
                    <EditSemesterModalButton modalTarget="EditSemesterModal" buttonMessage="Edit the active semester" />
                    <Modal modalTarget="EditSemesterModal" modalTitle="EDIT THE ACTIVE SEMESTER" modalBody={<ChangeActiveSemesterBody handleSemesterChange={reloadButtons} semesters={semesters} setSemesters={setSemesters} currentActive={currentActive} setCurrentActive={setCurrentActive}/>} />
                </div>
                <div>
                    <DeleteSemesterModalButton modalTarget="DeleteSemesterModal" buttonMessage="Delete a semester" />
                    <Modal modalTarget="DeleteSemesterModal" modalTitle="DELETE A SEMESTER" modalBody={<DeleteSemesterBody semesters={semesters} setSemesters={setSemesters} currentActive={currentActive} setCurrentActive={setCurrentActive}/>} />
                </div>
            </div>

            {isLoading && <ProgressBar animated now={75} label={'Loading classes'} />}
            {id !== null && <TableBodyRows id={id} setIsLoading={setIsLoading}/>}
        </div>
    )
}

const TableBodyRows: React.FC<TableBodyRowsProps> = ({id, setIsLoading}) => {
    const [course, setCourse] = useState<Course | undefined>(undefined);
    const [courseId, setCourseId] = useState<number | null>(null);
    const [courses, setCourses] = useState<Course[] | null>();
    const [courseTitle, setCourseTitle] = useState<string | undefined>();
    /** The ids of the courses that are selected */
    const [selectedCourseIds, setSelectedCourseIds] = useState([]);
    /** Whether all courses are selected */
    const [selectedAll, setSelectedAll] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const coursesPerPage = 10;
    const pageNeighbours = 3;
    // Calculate the total number of pages
    const totalPages = Math.ceil((courses ? courses.length : 0) / coursesPerPage);

    // Calculate the page numbers to show
    const startPage = Math.max(1, currentPage - pageNeighbours);
    const endPage = Math.min(totalPages, currentPage + pageNeighbours);
    const pagesToShow = [...Array((endPage - startPage) + 1)].map((_, i) => startPage + i);

    // Get the courses for the current page
    const currentCourses = courses ? courses.slice((currentPage - 1) * coursesPerPage, currentPage * coursesPerPage) : [];
    
    useEffect(() => {
        
        // Set selected all to false when the id changes, so the radio and checkboxes are unchecked
        setSelectedAll(false);
        setSelectedCourseIds([]);
        setCurrentPage(1);
        SemesterService.getCourses(id)
            .then((response) => {
                setCourses((prevCourses) => {
                    // console.log(prevCourses);
                    setIsLoading(false);
                    return response.data;
                });
            });
    }, [id]);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    }

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
        window.$("#editThemesModal").modal("hide");
      };


    return (
        <div>
            <table className="table">
                <thead>
                    <tr>
                        <th><input type="radio" className="radio"
                            checked={selectedAll}
                            onClick={() => {handleSelectedAll()}}
                        onChange={()=> {}}></input></th>
                        <th scope="col">Course Subject & Number</th>
                        <th scope="col">Course Title</th>
                        <th scope="col">Tags</th>
                    </tr>
                </thead>
                <tbody>
                    
                    {courses && currentCourses.map(course => (
                        
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
                    <ModalButton disabled={selectedCourseIds.length !== 1} modalTarget="editThemesModal" buttonMessage="Edit themes" />
                    <Modal modalTarget="editThemesModal" modalTitle="EDIT A THEME" modalBody={<EditThemes obj={course} update={updateCoursesList} />} />
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
