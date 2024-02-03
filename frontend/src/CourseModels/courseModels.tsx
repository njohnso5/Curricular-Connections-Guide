import { Theme } from "../models/programModels";

// set a type Course that contains all the data relevant to a course for displaying in rows for table
export type Faculty = {
    id: number;
    name: string;
    email: string;
}

export type Subject = {
    id: number;
    subject: string;
}

export type Course = {
    catalog_number: string;
    description: string;
    faculty: Faculty[];
    id: number;
    semester_id: number;
    subject: Subject;
    themes: Theme[];
    title_long: string;
    title_short: string;
}

/**
 * This is the format of the data that is sent to the server when adding a course
 */
export type CourseForm = {
    id: number | null;
    title_short: string;
    title_long: string;
    description: string;
    subject: string;
    catalog_number:number;
    faculty: string;
    email: string;
    semester_id: number;
}

export type CourseInfo = {
    title: string;  
    description: string;
}

export type SemesterForm = {
    id: number
    year: number;
    active: boolean;
    period_id: number;
    catalog: File | null;
}

export function isCourse(obj: any): obj is Course {
    return 'subject' in obj &&
           'catalog_number' in obj &&
           'title_long' in obj &&
           'description' in obj;
}