import {render, screen, fireEvent} from '@testing-library/react';
import { it, expect } from 'vitest';
import CoursePage from '../src/pages/CoursePage';

it("Load Modal Upload Catalog", () => {
    render(<CoursePage />);
})

it("View Courses", () => {
    render(<CoursePage />);
})

it("Load Modal For Course", () => {
    const {container} = render(<CoursePage />);
    const button = container.getElementsByClassName("btn btn-default")[0];
    fireEvent.click(button as any);
})
