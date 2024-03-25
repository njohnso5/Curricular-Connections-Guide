import {render, screen, fireEvent} from '@testing-library/react';
import { it, expect, test } from 'vitest';
import ProgramPage from '../src/pages/ProgramPage';

test("Test Program Add Modal Loads", () => {
    render(<ProgramPage />);
})

test("Test Table Renders Programs", () => {
    render(<ProgramPage />);
})

test("Test Program View Modal", () => {
    const { container } = render(<ProgramPage />);

    const button = container.getElementsByClassName("program-display-entry")[0];
})

test("Test Program Generates Data", () => {
    render(<ProgramPage />);
})

