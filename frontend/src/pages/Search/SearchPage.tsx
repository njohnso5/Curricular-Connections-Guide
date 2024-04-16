import React, { useEffect } from 'react';
import SearchNavBar from './SearchNavBar';
import { ProgramData } from '../../models/programModels'
import ProgramCard from './ProgramCard';
import styles from "../../css/SearchNavBar.module.css"
import { Course, isCourse, SemesterForm } from '../../CourseModels/courseModels';
import programsServices from '../../services/programs-services';
import SemesterService from '../../services/SemesterService';
import { AxiosResponse } from 'axios';

const SearchPage: React.FC = () => {
    const [results, setResults] = React.useState<ProgramData[] | Course[]>([]);

    const displayResults = (results: ProgramData[] | Course[]) => {
        if (results.length > 0) {
            if (isCourse(results[0])) {
                <p className={`${styles.emptySearch}`}>Returning courses is not yet implemented.</p>
            } else {
                return (results as ProgramData[]).map((program: ProgramData) => {
                    return (<ProgramCard program={program} />)
                })
            }
        } else {
            return <p className={`${styles.emptySearch}`}>Make a search!</p>
        }
    }
    
    useEffect(() => {
        SemesterService.getActiveSemester()
            .then((response: AxiosResponse<SemesterForm>) => {
                programsServices.getProgramsBySemester(response.data.id)
                    .then((response: AxiosResponse<ProgramData[]>) => {
                    setResults(response.data);
                })
            })
        .catch(error => {
            console.log(error);
        })
    }, [])

    return(
        <React.Fragment>
            <nav className={`navbar fixed-top navbar-light bg-light ${styles.navbar}`}>
                <button className={`btn btn-sm btn-primary ${styles.floatRight}`} onClick={(_) => document.location = '/admin/'}>Login</button>
            </nav>
            <div className={`container-fluid rounded-1`}>
                <h1 className={`${styles.floatMiddle}`}>Curricular Connections Guide</h1>
                <p className={`${styles.floatMiddleText}`}>
                Welcome to the Curricular Connection Guide (CCG) Web Application. The CCG is designed to find content connections between the courses you teach and the art programs offered at NC State. It is updated each semester and is managed by the Arts NC State office of Outreach and Engagement.<br></br><br></br>

                Select a program and/or a theme that is relevant to your course. You can select as many themes as you like.<br></br><br></br>

                Have questions or feedback? Please email Amy Sawyers-Williams acsawyer@ncsu.edu<br></br><br></br>

                This web application was designed in partnership by NC State computer science senior design students, Arts NC State, and DASA Tech. You can learn more about the Curricular Connections Guide <a href="https://arts.ncsu.edu/about/for-nc-state-faculty/">here.</a>
                </p>
                <hr></hr>
                <SearchNavBar setResults={setResults}/>
                <div className="row">
                    {displayResults(results)}
                </div>
            </div>
        </React.Fragment>
    )

}

export default SearchPage;