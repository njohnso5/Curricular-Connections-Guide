import { useEffect, useRef, useState, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'; 
import styles from '../../css/ProgramDetail.module.css'
import { ProgramData, Theme } from '../../models/programModels';
import Slider from 'react-slick';
import 'slick-carousel';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import ProgramService from '../../services/programs-services';
import { AxiosResponse } from 'axios';
import DateService from '../../services/date-service';
import useRelatedCourseSearch from '../../hooks/useRelatedCourseSearch';
import { Course } from '../../CourseModels/courseModels';
import React from 'react';
import CourseModal from './CourseModal';

const ProgramPageDetail = () => {

    const [program, setProgram] = useState<ProgramData | undefined>(undefined);
    const [course, setCourse] = useState<Course | undefined>(undefined);

    const { id } = useParams();

    const [pageNumber, setPageNumber] = useState<number>(1);
    const observer = useRef<IntersectionObserver | undefined>(undefined);
    const {isLoading, courses, hasMore} = useRelatedCourseSearch(Number.parseInt(id!), pageNumber);
    let uniqueCourses: Course[] = [];
    if(courses) {
        uniqueCourses = courses.filter((course, index, self) =>
            index === self.findIndex((c) => (
                c.id === course.id
            ))
        );
    }
    useEffect(() => {
        ProgramService.getProgram(Number.parseInt(id!)).then((response: AxiosResponse<ProgramData>) => {
            setProgram(response.data);
        })
        .catch(error => {
            console.log(error);
        });
        console.log(courses);
        console.log(uniqueCourses);
        return () => {
            if (observer.current) {
              observer.current.disconnect();
            }
        };
    }, [id]);

    const sliderSettings = {
        dots: false,
        infinite: false,
        speed: 300,
        slidesToShow: 1,
        slidesToScroll: 1,
        variableWidth: true,
        adaptiveHeight: true,
        arrows: false,
    };
    
    const handleInspectCourse = (course: Course) => {
        setCourse(course);
    }

    return(
        <React.Fragment>
            <div className="container p-5">
                <Link to="/">
                    <button className={`${styles.clearButton} ${styles.backButton}`}>
                        <i className={`fa-solid fa-chevron-left ${styles.backIcon}`}></i>
                        Back to page
                    </button>
                </Link>
                <div className='row mt-3'>
                    <img src={`/api/v1/program/${program?.id}/image/`} className={`col-5 ${styles.rounded} img-fluid`} alt="Program" />
                    <div className='col p-5'>
                        <div className='d-flex-inline flex-column'>
                            <h1>{program?.title}</h1>
                            <h6><strong>Location:</strong> {program?.showings[0]?.location ?? "No location at this time"}</h6>
                            <h6><strong>Admission:</strong> {program?.showings[0]?.price ?? "No showings available at this time"}</h6>
                            <h6><strong>Department:</strong> {program?.department}</h6>
                            <a href={program?.link} className={`${styles.clearButton} p-0 mt-3`}>
                                <i className="fa-solid fa-house mr-2"></i>
                                Website
                            </a>
                        </div>
                    </div>
                </div>
                <hr></hr>
                <div className='row'>
                    <div className='col'>
                        <h2>About</h2>
                        <p className={styles['program-description']}>{program?.description}</p>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <h2>Show's Dates</h2>
                        <hr />
                        <Slider {...sliderSettings}>
                            {program?.showings.map((showing, index) => {
                            const showDate = new Date(showing.datetime);
                            return((
                                <div 
                                  key={index} 
                                  className={`date-slide`}>
                                    <div>
                                        <h3 className={'mr-4'}>{DateService.getWeekday(showDate)}</h3>
                                        <h3>{DateService.getMonthDate(showDate)}</h3>
                                    </div>
                                </div>
                            ))})}
                        </Slider>
                        {/* <hr className={styles['dotted-line']} /> */}
                    </div>
                </div>
                <div className="row mt-3">
                    <div className="col">
                        <h2>Themes</h2>
                        <div className='d-flex flex-wrap'>
                            {program?.themes.length ?? 0 > 0 ? program?.themes.map((theme: Theme) => (
                                <span key={theme.id} className={`badge badge-pill badge-primary ${styles.tag}`}>{theme.name}</span>
                            )) : <h5>No themes at this time</h5>}
                        </div>
                    </div>
                </div>
                <div className="row mt-3">
                    <div className="col-12">
                        <h2>Related Courses</h2>
                    </div>
                    {uniqueCourses?.map((course, index) => {
                        return(
                            <div className={`col-lg-4 col-md-6`}>
                                <div className={`card-body p-0 ${styles['card-body']} ${styles.clickable}`} onClick={(_) => handleInspectCourse(course)} data-toggle="modal" data-target=".course-inspect">
                                    <h5 className={`card-title ${styles['card-title']}`}>{course.title_short}</h5>
                                    <h6 className={`card-subtitle mb-2 text-muted ${styles['card-subtitle']}`}>{course.subject.subject.trim()} {course.catalog_number}</h6>
                                </div>

                            </div>
                        )
                    })}
                </div>
            </div>
            {course && <CourseModal course={course} />}
        </React.Fragment>
    )
}

export default ProgramPageDetail;