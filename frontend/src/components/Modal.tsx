import '../css/Modal.css'
import SemesterService from '../services/SemesterService';
import PeriodService from '../services/PeriodService';
import CourseService from '../services/CourseServices';
import themesService from '../services/themes-service';
import { Theme } from '../models/programModels';
import { SemesterForm, Course, CourseForm } from '../CourseModels/courseModels';
import React, { useState, useEffect } from 'react';
import CourseTable from '../pages/CoursePage';
import { AxiosResponse } from 'axios';

interface TableBodyRowsProps {
  id: number;
}

interface ModalProps {
  modalTarget: string;
  modalTitle?: string;
  modalBody: React.ReactNode;
}

interface ModalButtonProps {
  modalTarget: string;
  buttonMessage: string;
  disabled?:boolean;
}


const ModalButton: React.FC<ModalButtonProps> = ({ modalTarget, buttonMessage, disabled = false }) => {
  return (
      <button disabled={disabled} type="button" className="btn btn-primary" data-toggle="modal" data-target={"#" + modalTarget}>
        {buttonMessage}
      </button>
  );
}

const DeleteSemesterModalButton: React.FC<ModalButtonProps> = ({ modalTarget, buttonMessage }) => {
  return (
      <button type="button" className="btn btn-primary" data-toggle="modal" data-target={"#" + modalTarget}>
        {buttonMessage}
      </button>
  );
}

const DeleteThemeModalButton: React.FC<ModalButtonProps> = ({modalTarget, buttonMessage}) => {
  return (
      <button type="button" className="btn btn-primary" data-toggle="modal" data-target={"#" + modalTarget}>
        {buttonMessage}
      </button>
  );
}

const DeleteSemesterBody: React.FC = () => {

  const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(null);
  const [semesters, setSemesters] = useState<SemesterForm[] | null>();

  useEffect(() => {
    SemesterService.getSemesters()
      .then((response) => {
        setSemesters(response.data);
      })
  }, []);

  const handleDelete = () => {
    console.log("inside handle delete function");
    console.log(selectedSemesterId);
    if (selectedSemesterId !== null) {
      // Call the SemesterService or your API function to delete the selected semester
      SemesterService.removeSemester(selectedSemesterId)
        .then(() => {
          // Handle successful deletion (e.g., refresh the list of semesters)
          setSemesters((prevSemesters: SemesterForm[] | null) =>
            prevSemesters ? prevSemesters.filter((semester) => semester.id !== selectedSemesterId) : null
          );
          setSelectedSemesterId(null);
        })
        .catch((error: any) => {
          console.error('Error deleting semester:', error);
        });
    }
  };

  return (
    <form>
      <div className="row">
        <div className="col-md-6">
          <div className="dropdown">
            <label className="chooseSeason">Semester : </label>
            <select className="chooseSeason" value={selectedSemesterId || ''}
              onChange={(e) => setSelectedSemesterId(parseInt(e.target.value, 10))}>
              <option className="dropdown-item"></option>
              {semesters ? semesters.map((semester) => (
                <option className="dropdown-item" key={semester.semesterId} value={semester.id} name="SemesterId">{semester.period.period} {semester.year}</option>
              )) : null}
            </select>
          </div>
        </div>
      </div>
      <div className="col-md-6">
        <button type="button" className="btn btn-danger" data-dismiss="modal" onClick={handleDelete}>
          Delete Semester
        </button>
      </div>
    </form>
  )
}

const DeleteThemeBody: React.FC = () => {
  const [selectedThemeId, setSelectedThemeId] = useState<Number | null>(null);
  const [themes, setThemes] = useState<Theme[] | null>();

  useEffect(() => {
    themesService.getTags().then((response) => {setThemes(response.data)});
  }, []);

  const handleDelete = () => {
    console.log("inside handle delete function");
    console.log(selectedThemeId);

    if(selectedThemeId != null) {
      themesService.removeTheme(selectedThemeId)
        .then(() => {
          setThemes((prevThemes) => prevThemes ? prevThemes.filter((theme) => theme.id !== selectedThemeId) : null);
        })
        .catch((error) => {
          console.log("Error deleting theme", error);
        });
    }
  };

  return (
    <form>
      <div className="row">
        <div className="col-md-6">
          <div className="dropdown">
            <label className="chooseSeason">Theme : </label>
            <select className="chooseSeason" value={selectedThemeId || ''}
              onChange={(e) => setSelectedThemeId(parseInt(e.target.value, 10))}>
              <option className="dropdown-item"></option>
              {themes ? themes.map((theme) => (
                <option className="dropdown-item" key={theme.themeId} value={theme.id} name="ThemeId">{theme.name}</option>
              )) : null}
            </select>
          </div>
        </div>
      </div>
      <div className="col-md-6">
        <button type="button" className="btn btn-danger" data-dismiss="modal" onClick={handleDelete}>
          Delete Theme
        </button>
      </div>
    </form>
  )

}


interface ModalNewSemesterBodyProps {
  handleUpload: (semester: SemesterForm) => void;
}

// This is the modal that displays when you click the "add a semester button on the courses page"
// React.FC is used for a component that doesn't take in any props
const ModalNewSemesterBody: React.FC<ModalNewSemesterBodyProps> = (props) => {
  // use state to create the semester form.

  const [semesterData, setSemesterData] = useState<SemesterForm>({
    id: -1,
    year: 2024,
    active: false,
    period_id: -1,
    catalog: null
  });

  function handleSubmit(event: React.FormEvent) {
    // do this with axios
    event.preventDefault();

    const formData = new FormData();
    formData.append('year', semesterData.year.toString());
    formData.append('active', semesterData.active.toString());
    formData.append('period_id', semesterData.period_id.toString());
    if (semesterData.catalog) {
      formData.append('catalog', semesterData.catalog);
    }
    console.log(formData);
    SemesterService.createSemester(formData)
      .then((_response: AxiosResponse<SemesterForm>) => {
        props.handleUpload(_response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  const [periods, setPeriods] = useState([]);
  useEffect(() => {
    PeriodService.getPeriods()
      .then((response) => {
        setPeriods(response.data);
      })
      .catch((error) => {
        console.log(error);
      })
  }, []);

  return (
    <div>
      <form id="new-semester-info" method="POST" action="api/v1/semesters/" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="exampleFormControlFile1">Upload a course catalog</label>
          <input
            type="file" className="form-control-file" id="exampleFormControlFile1" onChange={(e) => setSemesterData({ ...semesterData, catalog: e.target.files[0] })}
          />
        </div>
        <div className="row">
          <div className="col-md-6">
            <div className="dropdown">
              <label className="chooseSeason">Season : </label>
              <select className="chooseSeason" value={semesterData.period_id}
                onChange={(e) => setSemesterData({ ...semesterData, period_id: parseInt(e.target.value) })}>
                <option className="dropdown-item"></option>
                {periods.map(period => {
                  return <option className="dropdown-item" name="SemesterId" key={period.id} value={period.id}>{period.period}</option>
                })}
              </select>
            </div>
          </div>

          <div className="col-md-6">
            <div className="input-group input-group-sm mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text" id="inputGroup-sizing-sm">Year</span>
              </div>
              <input type="text" className="form-control" aria-label="Small" aria-describedby="inputGroup-sizing-sm" value={semesterData.year}
                onChange={(e) => setSemesterData({ ...semesterData, year: parseInt(e.target.value) })} />
            </div>
          </div>
        </div>
        <button type="submit" className="btn btn-primary">Save changes</button>
      </form>
    </div>
  );
}

interface ModalNewThemeBodyProps {
  handleUpload: (theme: Theme) => void;
}

const ModalNewThemeBody: React.FC<ModalNewThemeBodyProps> =(props) => {
  const[themeData, setThemeData] = useState<Theme>({
    id: null,
    name: null
  });

  function handleSubmit(event: React.FormEvent) {
    // do this with axios
    event.preventDefault();

    const formData = new FormData();
    formData.append('name', themeData.name.toString());

    themesService.createTheme(formData)
      .then((_response: AxiosResponse<Theme>) => {
        props.handleUpload(_response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  return (
    <div>
      <form id="new-theme-info" method="POST" action="/themes/" onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6">
            <div className="input-group input-group-sm mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text" id="inputGroup-sizing-sm">Name</span>
              </div>
              <input type="text" className="form-control" aria-label="Small" aria-describedby="inputGroup-sizing-sm" value={themeData.name}
                onChange={(e) => setThemeData({ ...themeData, name: String(e.target.value) })} />
            </div>
          </div>
        </div>
        <button type="submit" className="btn btn-primary">Save changes</button>
      </form>
    </div>
  );
}


const Modal: React.FC<ModalProps> = ({ modalTarget, modalTitle, modalBody }) => {

  return (
      <div className="modal fade" id={modalTarget} tabIndex="-1" role="dialog" aria-labelledby={modalTarget} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id={modalTarget}>{modalTitle}</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              {modalBody}
            </div>
          </div>
        </div>
      </div>
  );
};
/**
 * This is the modal that displays when you click the "add a course button on the courses page"
 * It will show a form that allows you to add a course to the database
 * enter course ID, title_short, title_long, description, subject, catalog_number, faculty, and emails. 
 * @returns html form that will be displayed in the modal
 */
const ModalAddCourseBody: React.FC<{ semesterId: number }> = ({ semesterId, updateCoursesList }) => {
  const [courseData, setCourseData] = useState<CourseForm>({
    // id:number;
    // title_short: string;
    // title_long: string;
    // description: string;
    // subject: string;
    // catalog_number:number;
    // faculty: string;
    // email: string;
    // semester_id: number;
    // 
    id: null,
    title_short: "",
    title_long: "",
    description: "",
    subject: "",
    catalog_number: null,
    faculty: "",
    emails: "",
    semester_id: semesterId
  });

  const handleSubmit = (event: React.FormEvent) => {
    // console.log("inside handle add function");
    // console.log(courseData);
    // console.log(semesterId);
    event.preventDefault();

    const formData = new FormData();
    // formData.append('id', courseData.id.toString());
    formData.append('title_short', courseData.title_short.toString());
    formData.append('title_long', courseData.title_long.toString());
    formData.append('description', courseData.description.toString());
    formData.append('subject', courseData.subject.toString());
    formData.append('catalog_number', courseData.catalog_number.toString());
    formData.append('faculty', courseData.faculty.toString());
    formData.append('emails', courseData.emails.toString());
    formData.append('semester_id', semesterId.toString());

    // console.log(formData);
    CourseService.addCourse(formData)
      .then(() => {
        updateCoursesList();

        // Clear the form after adding the course
        setCourseData({
          id: null,
          title_short: "",
          title_long: "",
          description: "",
          subject: "",
          catalog_number: null,
          faculty: "",
          emails: "",
          semester_id: semesterId
        });
      })
      .catch((error) => {
        console.error('Error adding course:', error);
      });
  }
  return (
    <React.Fragment>
      <form id="new-course-info">
        <div className="form-group">
          <label>Enter course ID</label>
          <input type="number" className="form-control" value={courseData.id || ""} onChange={(e) => setCourseData({ ...courseData, id: parseInt(e.target.value) })} />
        </div>
        <div className="form-group">
          <label>Enter course subject</label>
          <input type="text" className="form-control" value={courseData.subject} onChange={(e) => setCourseData({ ...courseData, subject: e.target.value })} />
          <label>Enter course catalog number</label>
          <input type="number" className="form-control" value={courseData.catalog_number || ""} onChange={(e) => setCourseData({ ...courseData, catalog_number: parseInt(e.target.value) })} />
        </div>
        <div className="form-group">
          <label>Enter course title short</label>
          <input type="text" className="form-control" value={courseData.title_short} onChange={(e) => setCourseData({ ...courseData, title_short: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Enter course title long </label>
          <input type="text" className="form-control" value={courseData.title_long} onChange={(e) => setCourseData({ ...courseData, title_long: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Enter course description</label>
          <input type="text" className="form-control" value={courseData.description} onChange={(e) => setCourseData({ ...courseData, description: e.target.value })} />
        </div>
        
        <div className="form-group">
          <label>Enter course instructors</label>
          <input type="text" className="form-control" value={courseData.faculty} onChange={(e) => setCourseData({ ...courseData, faculty: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Enter course emails</label>
          <input type="text" className="form-control" value={courseData.emails} onChange={(e) => setCourseData({ ...courseData, emails: e.target.value })} />
        </div>

        <button type="submit" className="btn btn-primary" data-dismiss="modal" onClick={handleSubmit}>Add Course</button>
      </form>
    </React.Fragment>
  )

}

const ModalEditCourseBody: React.FC< { course: Course, updateCoursesList: ()=> void }> = ({ course, updateCoursesList }) => {

  const [localCourse, setLocalCourse] = useState<Course | undefined>(undefined);
  const [faculty, setFaculty] = useState<string>('');
  const [emails, setEmails] = useState<string>('');

  const updateForm = () => {
    setLocalCourse(undefined);
    updateCoursesList();
  }
  useEffect(() => {
    setLocalCourse(course);
    if (course) {
      setFaculty(course.faculty.map(faculty => faculty.name).join(';'));
      setEmails(course.faculty.map(faculty => faculty.email).join(';'));
    }



  }, [course]);
  if(!localCourse) {
    return null;
  }
  const submitForm = () => {
    if (localCourse) {
      const formData = new FormData();
      formData.append('course_id', localCourse.id.toString());
      formData.append('title_short', localCourse.title_short.toString());
      formData.append('title_long', localCourse.title_long.toString());
      formData.append('description', localCourse.description.toString());
      formData.append('subject', localCourse.subject.subject.toString());
      formData.append('catalog_number', localCourse.catalog_number.toString());
      formData.append('faculty', faculty.toString());
      formData.append('emails', emails.toString());
      formData.append('semester_id', localCourse.semester_id.toString());

      CourseService.updateCourse(formData)
        .then(() => {
          updateForm();
        })
        .catch((error) => {
          window.alert('Please enter valid course information');
        });

    }
  }
  return (
    <React.Fragment>
      <form id="edit-course-info">
        <div className="form-group">
          <label>Enter course ID</label>
          <input type="number" className="form-control" value={localCourse.id} onChange={(e) => setLocalCourse({ ...localCourse, id: parseInt(e.target.value) })} />
        </div>
        <div className="form-group">
          <label>Enter course subject</label>
          <input type="text" className="form-control" value={localCourse.subject.subject} onChange={(e) => setLocalCourse({ ...localCourse, subject: {subject: e.target.value, id: localCourse.subject.id}})} />
          <label>Enter course catalog number</label>
          <input type="number" className="form-control" value={localCourse.catalog_number} onChange={(e) => setLocalCourse({ ...localCourse, catalog_number: parseInt(e.target.value) })} />
        </div>
        <div className="form-group">
          <label>Enter course title short</label>
          <input type="text" className="form-control" value={localCourse.title_short} onChange={(e) => setLocalCourse({ ...localCourse, title_short: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Enter course title long </label>
          <input type="text" className="form-control" value={localCourse.title_long} onChange={(e) => setLocalCourse({ ...localCourse, title_long: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Enter course description</label>
          <input type="text" className="form-control" value={localCourse.description} onChange={(e) => setLocalCourse({ ...localCourse, description: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Enter course instructors</label>
          <input type="text" className="form-control" value={faculty} onChange={(e) => setFaculty(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Enter course emails</label>
          <input type="text" className="form-control" value={emails} onChange={(e) => setEmails(e.target.value)} />
        </div>
        
        <button type="submit" className="btn btn-primary" data-dismiss="modal" onClick={submitForm}>Save Changes</button>
        <button type="button" className="btn btn-danger" data-dismiss="modal" onClick={updateForm}>Cancel</button>
      </form>
    </React.Fragment>
  )
}

/**
 * This modal will handel the deletion of a course from the database
 * This is the modal that displays when you click the "delete a course" button on the courses page"
 * It will show a form that allows you to delete a course from the database
 * @param courseIds courseIds is an array of course ids that will be deleted
 * @param updateCoursesList updateCoursesList is a call back function that will update the list of courses after a course is deleted
 * @returns html form that will be displayed in the modal
 */
const ModalDeleteCourseBody: React.FC<{ courseIds: number []; updateCoursesList: ()=> void }> = ({ courseIds, updateCoursesList }) => {
  const handleDelete = () => {

    // console.log("inside handle delete function");
    // console.log(courseIds);
    if (courseIds !== null && courseIds.length > 0) {
      // Call the CourseService or your API function to delete the selected course
      CourseService.removeCourses(courseIds)
        .then(() => {
          // Handle successful deletion (e.g., refresh the list of courses)
          updateCoursesList();
        })
        .catch((error) => {
          console.error('Error deleting course:', error);
        });
    } else {
      // Return no courses selected error to the frontend
      alert("No courses selected");

    }
  }
  return (
    <React.Fragment>
      <form>
        <div>
          <label htmlFor="exampleFormControlFile1">Are you sure you want to delete this course?</label>
        </div>
        <button type="submit" className="btn btn-danger" data-dismiss="modal" onClick={handleDelete}>Yes</button>
      </form>
    </React.Fragment>
  )
}
export {
  Modal,
  ModalButton,
  ModalNewSemesterBody,
  DeleteSemesterModalButton,
  DeleteSemesterBody,
  DeleteThemeBody,
  ModalNewThemeBody,
  DeleteThemeModalButton,
  ModalAddCourseBody,
  ModalEditCourseBody,
  ModalDeleteCourseBody
}
