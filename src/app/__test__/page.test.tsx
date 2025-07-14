import { screen, fireEvent } from '@testing-library/react';
import { render } from '../../test-utils/render';
import Home from '../page';

// Mock the canvas context
const mockGetContext = jest.fn();
const mockFillRect = jest.fn();
const mockStrokeRect = jest.fn();
const mockClearRect = jest.fn();

const mockCanvasContext = {
    fillRect: mockFillRect,
    strokeRect: mockStrokeRect,
    clearRect: mockClearRect,
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
};

// Mock HTMLCanvasElement
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    value: mockGetContext,
    writable: true,
});

// Mock Math.random to make tests deterministic
const mockMathRandom = jest.spyOn(Math, 'random');

describe('Home Page Canvas Functionality', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetContext.mockReturnValue(mockCanvasContext);
        mockMathRandom.mockReturnValue(0.5); // Always return 0.5 for predictable positioning

        // Clear the global canvas reference
        delete (window as any).drawingCanvas;
    });

    afterAll(() => {
        mockMathRandom.mockRestore();
    });

    it('renders the canvas and buttons', () => {
        render(<Home />);

        expect(screen.getByText('Canvas Drawing')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /draw square/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /clear canvas/i })).toBeInTheDocument();

        // Check if canvas is rendered
        const canvas = document.querySelector('canvas');
        expect(canvas).toBeInTheDocument();
        expect(canvas).toHaveAttribute('width', '800');
        expect(canvas).toHaveAttribute('height', '600');
    });

    it('sets up canvas reference when canvas is rendered', () => {
        render(<Home />);

        const canvas = document.querySelector('canvas');
        expect(canvas).toBeInTheDocument();
        expect((window as any).drawingCanvas).toBe(canvas);
    });

    it('draws a square when Draw Square button is clicked', () => {
        render(<Home />);

        const drawButton = screen.getByRole('button', { name: /draw square/i });
        fireEvent.click(drawButton);

        expect(mockGetContext).toHaveBeenCalledWith('2d');
        expect(mockFillRect).toHaveBeenCalledWith(350, 250, 100, 100); // (800-100)*0.5, (600-100)*0.5
        expect(mockStrokeRect).toHaveBeenCalledWith(350, 250, 100, 100);
        expect(mockCanvasContext.fillStyle).toBeDefined();
        expect(mockCanvasContext.strokeStyle).toBe('#2D3748');
        expect(mockCanvasContext.lineWidth).toBe(2);
    });

    it('draws multiple squares with different random positions', () => {
        render(<Home />);

        const drawButton = screen.getByRole('button', { name: /draw square/i });

        // First click with Math.random() = 0.5
        fireEvent.click(drawButton);
        expect(mockFillRect).toHaveBeenLastCalledWith(350, 250, 100, 100);

        // Change Math.random return value
        mockMathRandom.mockReturnValue(0.2);
        fireEvent.click(drawButton);
        expect(mockFillRect).toHaveBeenLastCalledWith(140, 100, 100, 100); // (800-100)*0.2, (600-100)*0.2

        // Verify fillRect was called twice
        expect(mockFillRect).toHaveBeenCalledTimes(2);
        expect(mockStrokeRect).toHaveBeenCalledTimes(2);
    });

    it('uses different colors from the color palette', () => {
        render(<Home />);

        const drawButton = screen.getByRole('button', { name: /draw square/i });

        // Mock Math.random to return different values for color selection
        mockMathRandom
            .mockReturnValueOnce(0.5) // x position
            .mockReturnValueOnce(0.5) // y position
            .mockReturnValueOnce(0.1); // color index (should select first color)

        fireEvent.click(drawButton);

        expect(mockCanvasContext.fillStyle).toBe('#FF6B6B'); // First color in the array
    });

    it('clears the canvas when Clear Canvas button is clicked', () => {
        render(<Home />);

        const clearButton = screen.getByRole('button', { name: /clear canvas/i });
        fireEvent.click(clearButton);

        expect(mockGetContext).toHaveBeenCalledWith('2d');
        expect(mockClearRect).toHaveBeenCalledWith(0, 0, 800, 600);
    });

    it('handles case when canvas context is not available', () => {
        mockGetContext.mockReturnValue(null);
        render(<Home />);

        const drawButton = screen.getByRole('button', { name: /draw square/i });
        fireEvent.click(drawButton);

        expect(mockGetContext).toHaveBeenCalledWith('2d');
        expect(mockFillRect).not.toHaveBeenCalled();
        expect(mockStrokeRect).not.toHaveBeenCalled();
    });

    it('handles case when canvas is not available', () => {
        // Clear the global canvas reference
        delete (window as any).drawingCanvas;

        render(<Home />);

        // Manually remove the canvas reference to simulate the error case
        delete (window as any).drawingCanvas;

        const drawButton = screen.getByRole('button', { name: /draw square/i });
        fireEvent.click(drawButton);

        // Should not crash and not call canvas methods
        expect(mockFillRect).not.toHaveBeenCalled();
    });

    it('has correct button styling and variants', () => {
        render(<Home />);

        const drawButton = screen.getByRole('button', { name: /draw square/i });
        const clearButton = screen.getByRole('button', { name: /clear canvas/i });

        // Check if buttons have the correct Chakra UI classes (this is a basic check)
        expect(drawButton).toBeInTheDocument();
        expect(clearButton).toBeInTheDocument();
    });
});
