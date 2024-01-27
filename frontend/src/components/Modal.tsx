import '../css/Modal.css'
import SemesterService from '../services/SemesterService';
import PeriodService from '../services/PeriodService';
import CourseService from '../services/CourseServices';
import { SemesterForm, Course } from '../CourseModels/courseModels';
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
}


const ModalButton: React.FC<ModalButtonProps> = ({ modalTarget, buttonMessage }) => {
  return (
      <button type="button" className="btn btn-primary" data-toggle="modal" data-target={"#" + modalTarget}>
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
 * enter course ID, description short, title, description long, subject, catalog number, instructors, and emails. 
 * @returns 
 */
const ModalAddCourseBody: React.FC = () => {
  return (
    <React.Fragment>
      <form>
        <div className="form-group">
          <label htmlFor="exampleFormControlFile1">Enter course ID</label>
          <input type="text" className="form-control" id="exampleFormControlFile1" />
        </div>
        <div className="form-group">
          <label htmlFor="exampleFormControlFile1">Enter course subject</label>
          <input type="text" className="form-control" id="exampleFormControlFile1" />
          <label htmlFor="exampleFormControlFile1">Enter course catalog number</label>
          <input type="text" className="form-control" id="exampleFormControlFile1" />
        </div>
        <div className="form-group">
          <label htmlFor="exampleFormControlFile1">Enter course title</label>
          <input type="text" className="form-control" id="exampleFormControlFile1" />
        </div>
        <div className="form-group">
          <label htmlFor="exampleFormControlFile1">Enter course description short</label>
          <input type="text" className="form-control" id="exampleFormControlFile1" />
        </div>
        <div className="form-group">
          <label htmlFor="exampleFormControlFile1">Enter course description long</label>
          <input type="text" className="form-control" id="exampleFormControlFile1" />
        </div>
        
        <div className="form-group">
          <label htmlFor="exampleFormControlFile1">Enter course instructors</label>
          <input type="text" className="form-control" id="exampleFormControlFile1" />
        </div>
        <div className="form-group">
          <label htmlFor="exampleFormControlFile1">Enter course emails</label>
          <input type="text" className="form-control" id="exampleFormControlFile1" />
        </div>

        <button type="button" className="btn btn-primary">Save changes</button>
      </form>
    </React.Fragment>
  )

}

const ModalEditCourseBody: React.FC = () => {
  return (
    <React.Fragment>
      <form>
        <div className="form-group">
          <label htmlFor="exampleFormControlFile1">Enter course ID</label>
          <input type="text" className="form-control" id="exampleFormControlFile1" />
        </div>
        <div className="form-group">
          <label htmlFor="exampleFormControlFile1">Enter course subject</label>
          <input type="text" className="form-control" id="exampleFormControlFile1" />
          <label htmlFor="exampleFormControlFile1">Enter course catalog number</label>
          <input type="text" className="form-control" id="exampleFormControlFile1" />
        </div>
        <div className="form-group">
          <label htmlFor="exampleFormControlFile1">Enter course title</label>
          <input type="text" className="form-control" id="exampleFormControlFile1" />
        </div>
        <div className="form-group">
          <label htmlFor="exampleFormControlFile1">Enter course description short</label>
          <input type="text" className="form-control" id="exampleFormControlFile1" />
        </div>
        <div className="form-group">
          <label htmlFor="exampleFormControlFile1">Enter course description long</label>
          <input type="text" className="form-control" id="exampleFormControlFile1" />
        </div>
        
        <div className="form-group">
          <label htmlFor="exampleFormControlFile1">Enter course instructors</label>
          <input type="text" className="form-control" id="exampleFormControlFile1" />
        </div>
        <div className="form-group">
          <label htmlFor="exampleFormControlFile1">Enter course emails</label>
          <input type="text" className="form-control" id="exampleFormControlFile1" />
        </div>

        <button type="button" className="btn btn-primary">Save changes</button>
        <button type="button" className="btn btn-danger">Cancel</button>
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
    console.log("inside handle delete function");
    console.log(courseIds);
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
        <button type="button" className="btn btn-danger" data-dismiss="modal" onClick={handleDelete}>Yes</button>
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
  ModalAddCourseBody,
  ModalEditCourseBody,
  ModalDeleteCourseBody
}
