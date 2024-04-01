import {render, screen} from '@testing-library/react';
import { it, expect, test } from 'vitest';
import AuthorizationPage from '../src/pages/Authorization/AuthorizationPage';


test("Test Authorization page is rendered", async () => {
    render(<AuthorizationPage />);
    const page = screen.getByTestId("administrator-page");
    expect(page).toBeInTheDocument();
})

test("Test Get Administrators", async () => {
    
})

