import {render, screen, fireEvent} from '@testing-library/react';
import { it, expect } from 'vitest';
import PageContent from '../src/components/PageContent';
import ProgramPage from '../src/pages/ProgramPage';

it("Test Page Load", () => {
    render(<PageContent page={<ProgramPage />} pageTitle={"Hello World"} />);
})

it("Test Page Title", () => {
    render(<PageContent page={<ProgramPage />} pageTitle={"Hello World"} />);
})

it("Test Page Content", () => {
    render(<PageContent page={<ProgramPage />} pageTitle={"Hello World"} />);
})