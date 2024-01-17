import {render, screen} from '@testing-library/react';
import { it, expect } from 'vitest';
import App from '../src/App';

it("Test Manage Programs page is rendered", async () => {
    render(<App />);
    const programPage = await screen.findByText("Login");
    expect(programPage).toBeInTheDocument();
})


