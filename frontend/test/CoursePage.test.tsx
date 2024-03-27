import {render, screen, fireEvent, async} from '@testing-library/react';
import { it, expect, test } from 'vitest';
import CoursePage from '../src/pages/CoursePage';
import {ModalAddCourseBody, ModalDeleteCourseBody, ModalEditCourseBody} from '../src/components/Modal'

test("Load Modal Upload Catalog", () => {
    render(<CoursePage />);
})

test("View Courses", () => {
    render(<CoursePage />);
    render(<ModalAddCourseBody />)
    render(<ModalDeleteCourseBody />)
    render(<ModalEditCourseBody />)
})

test("Load Modal For Course", () => {
    const {container} = render(<CoursePage />);
    const button = container.getElementsByClassName("btn btn-default")[0];
})
