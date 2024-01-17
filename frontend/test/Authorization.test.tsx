import {render, screen} from '@testing-library/react';
import { it, expect } from 'vitest';
import AuthorizationPage from '../src/pages/Authorization/AuthorizationPage';


it("Test Authorization page is rendered", async () => {
    render(<AuthorizationPage />);
    const page = screen.getByTestId("administrator-page");
    expect(page).toBeInTheDocument();
})

it("Test Get Administrators", async () => {
    
})

