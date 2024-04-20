import {render, screen} from '@testing-library/react';
import { it, expect, test } from 'vitest';
import ThemePage from '../src/pages/ThemePage';

test("Load Modal Add Theme", () => {
    render (<ThemePage />)
})

test("Load Modal Delete Theme", () => {
    render (<ThemePage />)
})