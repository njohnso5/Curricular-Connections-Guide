import {render, screen} from '@testing-library/react';
import { it, expect } from 'vitest';
import AuthorizationPage from '../src/pages/Authorization/AuthorizationPage';
import { MemoryRouter } from 'react-router-dom';
import NotFound from '../src/components/NotFound';

test('it renders the 404 page', () => {
    render(
      <MemoryRouter initialEntries={['/unknown-route']}>
        <NotFound />
      </MemoryRouter>
    );
  
    const headingElement = screen.getByTestId('page-not-found');
    expect(headingElement).toBeInTheDocument();
  });