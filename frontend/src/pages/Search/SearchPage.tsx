import React, { useEffect } from 'react';
import SearchNavBar from './SearchNavBar';
import { ProgramData } from '../../models/programModels'
import ProgramCard from './ProgramCard';
import styles from "../../css/SearchNavBar.module.css"
import { Course, isCourse } from '../../CourseModels/courseModels';
import programsServices from '../../services/programs-services';
import { AxiosResponse } from 'axios';

const SearchPage: React.FC = () => {
    const [results, setResults] = React.useState<ProgramData[] | Course[]>([])

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
        programsServices.getAllPrograms().then((response: AxiosResponse<ProgramData[]>) => {
            setResults(response.data);
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
                <SearchNavBar setResults={setResults}/>
                <div className="row">
                    {displayResults(results)}
                </div>
            </div>
        </React.Fragment>
    )

}

export default SearchPage;