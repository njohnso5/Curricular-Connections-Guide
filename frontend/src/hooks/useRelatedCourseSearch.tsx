import { useEffect, useState } from 'react';
import ProgramService from '../services/programs-services';
import { AxiosResponse } from 'axios';
import { Course } from '../CourseModels/courseModels';

export default function useRelatedCourseSearch(programId: number, pageNumber: number) {

    const [courses, setCourses] = useState<Course[] | undefined>(undefined);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        setIsLoading(true);

        ProgramService.getRelatedCourses(programId, pageNumber, 21, 7).then((response: AxiosResponse<Course[]>) => {
            console.log(response.data);
            setCourses((prevCourses) => {
                return prevCourses ? [...prevCourses, ...response.data] : response.data;
            }
            );
            setHasMore(response.data.length > 0)
            setIsLoading(false);
        })
        .catch(error => {
            console.log(error);
        })
    }, [pageNumber, programId])

    return { isLoading, courses, hasMore };
}