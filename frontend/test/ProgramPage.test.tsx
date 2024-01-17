import {render, screen, fireEvent} from '@testing-library/react';
import { it, expect } from 'vitest';
import ProgramPage from '../src/pages/ProgramPage';

it("Test Program Add Modal Loads", () => {
    render(<ProgramPage />);
})

it("Test Table Renders Programs", () => {
    render(<ProgramPage />);
})

it("Test Program View Modal", () => {
    const { container } = render(<ProgramPage />);

    const button = container.getElementsByClassName("program-display-entry")[0];
    fireEvent.click(button as any);
})

it("Test Program Generates Data", () => {
    render(<ProgramPage />);
})

