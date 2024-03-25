import {render, screen, fireEvent} from '@testing-library/react';
import { it, expect, test } from 'vitest';
import PageContent from '../src/components/PageContent';
import ProgramPage from '../src/pages/ProgramPage';

test("Test Page Load", () => {
    render(<PageContent page={<ProgramPage />} pageTitle={"Hello World"} />);
})

test("Test Page Title", () => {
    render(<PageContent page={<ProgramPage />} pageTitle={"Hello World"} />);
})

test("Test Page Content", () => {
    render(<PageContent page={<ProgramPage />} pageTitle={"Hello World"} />);
})