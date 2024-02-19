import {render, screen} from '@testing-library/react';
import { it, expect } from 'vitest';
import ThemePage from '../src/pages/ThemePage';

it("Load Modal Add Theme", () => {
    render (<ThemePage />)
})

it("Load Modal Delete Theme", () => {
    render (<ThemePage />)
})