import { screen } from '@testing-library/react';
import { render } from '../../../test-utils/render';
import Header from '../';

describe('Header', () => {
    beforeEach(() => {
        render(<Header />);
    });

    it('renders the logo and name text', () => {
        expect(screen.getByAltText(/Canva logo/)).toBeInTheDocument();
        expect(screen.getByText(/interview for: Jay Jamero/i)).toBeInTheDocument();
    });

    it('renders the color mode button', () => {
        const colorModeButton = screen.getByRole('button');
        expect(colorModeButton).toBeInTheDocument();
    });
});
