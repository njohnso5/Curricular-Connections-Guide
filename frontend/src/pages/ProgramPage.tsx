import React, { useState, useEffect } from 'react';
import ProgramService from "../services/programs-services";
import { Modal, ModalButton } from "../components/Modal";
import { Showing, Theme, ProgramData, ProgramFormShowing, ProgramForm } from "../models/programModels";

import styles from "../css/ProgramPage.module.css";

const TimeTabBar: React.FC<{updatePrograms: Function}> = ({updatePrograms}) => {
  const tabs = document.querySelectorAll(".nav-link");

  function handleClick(event: any) {
    event.preventDefault();
    tabs.forEach(tab => {
      tab.classList.remove("active");
    });
    event.target.classList.add("active");

    // Call the right refresh
    if (event.target.text == "Upcoming") {
      updatePrograms("upcoming");
    } else if (event.target.text == "Past") {
      updatePrograms("past");
    } else {
      updatePrograms();
    }
  }

  return(
    <ul className="nav nav-tabs" role="toolbar">
      <li className="nav-item">
        <a href="#" className="nav-link active" onClick={handleClick}>All</a>
      </li>
      <li className="nav-item">
        <a href="#" className="nav-link" onClick={handleClick}>Upcoming</a>
      </li>
      <li className="nav-item">
        <a href="#" className="nav-link" onClick={handleClick}>Past</a>
      </li>
    </ul>
  );
}

function convertToShortDate(dateString: string) {
  const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const originalDate = new Date(dateString);
  const weekday = WEEKDAYS[originalDate.getDay()];
  const month = MONTHS[originalDate.getMonth()];
  const dayNumber = originalDate.getDate();
  const year = originalDate.getFullYear();
  const formattedDate = weekday + ", " + month + " " + dayNumber + ", " + year;

  return formattedDate;
}

function listShowingDates(showings: Showing[]) {
  let dateString = ""
  if (showings.length > 0) {
    let len = showings.length;
    dateString = convertToShortDate(showings[0].datetime);
    if (len > 1) {
      showings.slice(1, len).forEach(showing => {
        dateString = dateString.concat("; " + convertToShortDate(showing.datetime));
      });
    }
  } else {
    dateString = "No showings at this time";
  }

  return dateString;
}

const ProgramDisplayModalBody: React.FC<{program: ProgramData | undefined, updatePrograms: Function}> = ({program, updatePrograms}) => {
  function handleDelete(event: any) {
    event.preventDefault();
    if (program) {
      ProgramService.deleteProgram(program.id)
      .then(() => {
        updatePrograms((prev: ProgramData[]) => prev.filter(item => item !== program));
        window.$("#programDisplay").modal("hide");
      })
      .catch(() => {
        console.error("Error deleting program")
      });
    } else {
      console.log("There was an error finding the program you want to delete. Try refreshing the page.")
    }
  }
  
  if (program == null) {
    return (
    <>
      <p>Could not find program with the requested ID :/</p>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
      </div>
    </>);
  } else {
    return (
      <>
        {program.image_filename != null ? (
          <div className="form-group align-items-center gap-1">
            <span className={styles.programDisplayLabel}>Image:</span>
            <img className="img-fluid" src={`/api/v1/program/${program.id}/image/`} />
          </div>
          ) : null}
        {program.link != null && program.link != undefined && program.link != '' ? (
          <div className="form-group align-items-center gap-1">
            <span className={styles.programDisplayLabel}>Link:</span>
            <p><a href={program.link} target="_blank">{program.link}</a></p>
          </div>
          ) : null}
        <div className="form-group align-items-center gap-1">
          <span className={styles.programDisplayLabel}>Department:</span>
          <p>{program.department}</p>
        </div>
        <div className="form-group align-items-center gap-1">
          <span className={styles.programDisplayLabel}>Description:</span>
          <p>{program.description}</p>
        </div>
        <div className="form-group align-items-center gap-1">
          <span className={styles.programDisplayLabel}>Tags:</span>
          <p className={styles.themeList}>
            {program.themes.length > 0 ? program.themes.map((theme: Theme) => {
              return (
                <span key={theme.id} className={`badge badge-pill badge-primary ${styles.tag}`}>{theme.name}</span>
              );
            }) : <p>No themes at this time</p>}
          </p>
        </div>
        <div>
          <span className={styles.programDisplayLabel}>Showings:</span>
          {program.showings.length > 0 ? program.showings.map((showing: Showing, index: number) => {
            return (
              <div key={index} className={`${styles.showing} d-flex flex-column gap-1`}>
                <p className="m-0"><span className={styles.programDisplayLabel}>Date:</span> {convertToShortDate(showing.datetime)}</p>
                <p className="m-0"><span className={styles.programDisplayLabel}>Location:</span> {showing.location}</p>
                <p className="m-0"><span className={styles.programDisplayLabel}>Price:</span> {showing.price}</p>
              </div>
            );
          }) : <p>No showings at this time</p>}
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={handleDelete}>Delete Program</button>
          <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
        </div>
      </>);
  }
};

const ProgramPreviewTable: React.FC<{programs: ProgramData[], updatePrograms: Function}> = ({programs, updatePrograms}) => {
  const [currentProgram, setCurrentProgram] = useState<ProgramData | undefined>(undefined);

  const handleProgramSelection = (program: ProgramData) => {
    setCurrentProgram(program);
  };

  function findProgramById(programId: number | undefined) {
    if(programId == undefined) {
      return undefined;
    }

    if (programs != null && programs != undefined) {
      for (let i = 0; i < programs.length; i++) {
        if (programs[i].id == programId) {
          return programs[i];
        }
      }
    }

    return undefined;
  }

  return (
    <>
      <div className="table-responsive" id={styles.programTable}>
        <table className="table">
          <thead className="thead-dark">
            <tr>
              <th scope="col">Department</th>
              <th scope="col">Title</th>
              <th scope="col">Calendar Date</th>
              <th scope="col">Themes</th>
            </tr>
          </thead>
          <tbody>
            {programs?.map((program: ProgramData, index: number) => {
              return (
                <tr key={index} onClick={() => handleProgramSelection(program)} className={styles.programDisplayEntry} data-toggle="modal" data-target="#programDisplay">
                  <td>{program.department}</td>
                  <td>{program.title}</td>
                  <td>{listShowingDates(program.showings)}</td>
                  <td>
                    {program.themes.length > 0 ? program.themes.slice(0, 4).map((theme: Theme) => {
                      return (
                        <span key={theme.id} className={`badge badge-pill badge-primary ${styles.tag}`}>{theme.name}</span>
                      );
                    }) : <p>No themes at this time</p>}
                    {program.themes.length > 4 ? <span>...</span> : null}
                </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Modal modalTarget="programDisplay" modalTitle={currentProgram?.title} modalBody={<ProgramDisplayModalBody program={findProgramById(currentProgram?.id)} updatePrograms={updatePrograms} />} />
    </>
  );
}

const initialForm: ProgramForm = {
  title : "",
  department : "",
  description: "",
  link: "",
  showings: [],
  image: undefined
};

const ModalNewProgramBody: React.FC<{updatePrograms: Function}> = ({updatePrograms}) => {
  const [filePreview, setFilePreview] = useState("");
  let imageInput = document.getElementById("image-input") as HTMLInputElement;

  function handleSubmit(event: any) {
    event.preventDefault();

    const formData = new FormData();
    formData.append('title', programData.title.toString());
    formData.append('department', programData.department.toString());
    formData.append('description', programData.description.toString());
    formData.append('showings', JSON.stringify(programData.showings));
    if (programData.link != '' && programData.link != undefined) {
      formData.append('link', programData.link);
    }
    if (programData.image) {
      formData.append('image', programData.image);
    }

    ProgramService.uploadProgram(formData)
    .then((response) => {
      setForm(initialForm);
      setFilePreview("");
      if (imageInput) {
        imageInput.value = ""; 
        imageInput.type = "text"; 
        imageInput.type = "file"; 
      }
      updatePrograms((prev: ProgramData[]) => ([...prev, response.data]));
      window.$("#newProgram").modal("hide");
    })
    .catch(() => {
      console.error("Error submitting program")
    });
  }

  function handleChange(event: any) {
    const {name, value} = event.target;
    setForm((prevValues) => ({...prevValues, [name]: value}));
  }

  function handleShowingChange(event: any, index: number) {
    const updatedShowings = [...programData.showings];
    const {name, value} = event.target;
    updatedShowings[index] = {...updatedShowings[index], [name]: value};
    setForm((prevValues) => ({...prevValues, showings: updatedShowings}));
  }

  function handleImageSelect(event: any) {
    programData.image = event.target.files[0];
    setFilePreview(URL.createObjectURL(event.target.files[0]));
  }

  const addShowing = (event: any) => {
    event.preventDefault();
    const newShowing: ProgramFormShowing = {
      datetime : "",
      location : "",
      price: ""
    };

    setForm({
      ...programData,
      showings: [...programData.showings, newShowing]
    });
  }

  const removeShowing = (event: any) => {
    event.preventDefault();
    const updatedShowings = [...programData.showings];
    updatedShowings.pop();
    setForm({...programData, showings: updatedShowings});
  }

  const [programData, setForm] = useState(initialForm);

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group align-items-center gap-1">
        <span>Image</span>
        <img className="img-fluid" src={filePreview} />
        <input id="image-input" type="file" className="form-control" name="image" onChange={handleImageSelect} required/>
      </div>
      <div className="form-group align-items-center gap-1">
        <span>Title</span>
        <input type="text" className="form-control" name="title" placeholder="Title" value={programData.title} onChange={handleChange} required/>
      </div>
      <div className="form-group align-items-center gap-1">
        <span>Department</span>
        <select className="custom-select" name="department" value={programData.department} onChange={handleChange} required>
          <option value=""></option>
          <option value="Crafts Center">Craft's Center</option>
          <option value="Department of Performing Arts & Technology">Department of Performing Arts & Technology</option>
          <option value="Gregg Museum of Art & Design">Gregg Museum of Art & Design</option>
          <option value="NC State LIVE performing artist series">NC State LIVE performing artist series</option>
          <option value="University Theatre">University Theatre</option>
        </select>
      </div>
      <div className="form-group align-items-center gap-1">
        <span>Description</span>
        <textarea className="form-control" name="description" placeholder="Enter details about the program..." value={programData.description} onChange={handleChange} required></textarea>
      </div>
      <div className="form-group align-items-center gap-1">
        <span>Link</span>
        <input type="text" className="form-control" name="link" placeholder="Link" value={programData.link} onChange={handleChange} />
      </div>
      <h5>Showings</h5>
      {programData.showings.map((showing, index) => {
        return (
          // Must be wrapped in a div so that each entry group can
          // be contained in an object with a unique key
          <div className={styles.showing} key={index}>
            <div className="form-group">
              <span>Date & Time</span>
              <input type="datetime-local" className="form-control" name="datetime" value={showing.datetime} onChange={(event) => handleShowingChange(event, index)} required/>
            </div>
            <div className="form-group">
              <span>Location</span>
              <input type="text" className="form-control" name="location" placeholder="Location" value={showing.location} onChange={(event) => handleShowingChange(event, index)} required/>
            </div>
            <div className="form-group">
              <span>Price</span>
              <input type="text" className="form-control" name="price" placeholder="Price" value={showing.price} onChange={(event) => handleShowingChange(event, index)} required/>
            </div>
          </div>
          );
      })}
      <div id={styles.showingManage}>
        <button className="btn" onClick={addShowing}><span className="fa-solid fa-plus"></span></button>
        <button className="btn" onClick={removeShowing}><span className="fa-solid fa-minus"></span></button>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
        <button type="submit" className="btn btn-primary">Submit</button>
      </div>
    </form>
  );
}

const ProgramPage: React.FC = () => {
  const [programList, setProgramList] = useState<ProgramData[]>([]);

  function refreshPrograms(display?: string) {
    if (display == "upcoming") {
      ProgramService.getUpcomingPrograms()
      .then(response => {
        setProgramList(response.data);
      })
      .catch(() => {
        console.error("Could not fetch the current programs.");
      });
    } else if (display == "past") {
      ProgramService.getPastPrograms()
      .then(response => {
        setProgramList(response.data);
      })
      .catch(() => {
        console.error("Could not fetch the current programs.");
      });
    } else {
      ProgramService.getAllPrograms()
      .then(response => {
        setProgramList(response.data);
        response.data.forEach((program) => {
          console.log(program);
        });
      })
      .catch(() => {
        console.error("Could not fetch the current programs.");
      });
    }
  };

  useEffect(() => {
    refreshPrograms();
  }, []);

  return (
    <>
      <TimeTabBar updatePrograms={refreshPrograms}/>
      <ProgramPreviewTable programs={programList} updatePrograms={setProgramList}/>
      <ModalButton modalTarget="newProgram" buttonMessage="Create Program" />
      <Modal modalTarget="newProgram" modalTitle="Create Program" modalBody={<ModalNewProgramBody updatePrograms={setProgramList} />} />
    </>
  );
}

export default ProgramPage;