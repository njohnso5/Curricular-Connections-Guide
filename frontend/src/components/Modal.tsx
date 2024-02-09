import '../css/Modal.css'
import SemesterService from '../services/SemesterService';
import PeriodService from '../services/PeriodService';
import CourseService from '../services/CourseServices';
import themesService from '../services/themes-service';
import { SemesterForm, Course } from '../CourseModels/courseModels';
import { Theme } from '../models/programModels';
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
          setSemesters((prevSemesters) =>
            prevSemesters ? prevSemesters.filter((semester) => semester.id !== selectedSemesterId) : null
          );
          setSelectedSemesterId(null);
        })
        .catch((error) => {
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
    id: -1,
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

export {
  Modal,
  ModalButton,
  ModalNewSemesterBody,
  DeleteSemesterModalButton,
  DeleteSemesterBody,
  DeleteThemeBody,
  ModalNewThemeBody,
  DeleteThemeModalButton
}
