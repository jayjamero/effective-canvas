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

// Mock getBoundingClientRect for canvas positioning
const mockGetBoundingClientRect = jest.fn();
Object.defineProperty(HTMLCanvasElement.prototype, 'getBoundingClientRect', {
    value: mockGetBoundingClientRect,
    writable: true,
});

// Mock Math.random to make tests deterministic
const mockMathRandom = jest.spyOn(Math, 'random');

// Mock Date.now for deterministic IDs
const mockDateNow = jest.spyOn(Date, 'now');

describe('Home Page Canvas Functionality', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetContext.mockReturnValue(mockCanvasContext);
        mockMathRandom.mockReturnValue(0.5); // Always return 0.5 for predictable positioning
        mockDateNow.mockReturnValue(1234567890); // Fixed timestamp for consistent IDs

        // Mock canvas positioning
        mockGetBoundingClientRect.mockReturnValue({
            left: 0,
            top: 0,
            width: 800,
            height: 600,
        });
    });

    afterAll(() => {
        mockMathRandom.mockRestore();
        mockDateNow.mockRestore();
    });

    it('renders the canvas and buttons', () => {
        render(<Home />);

        expect(screen.getByText('Canvas Drawing - Drag the squares around!')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /draw square/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /delete mode/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /clear canvas/i })).toBeInTheDocument();

        // Check if canvas is rendered
        const canvas = document.querySelector('canvas');
        expect(canvas).toBeInTheDocument();
        expect(canvas).toHaveAttribute('width', '800');
        expect(canvas).toHaveAttribute('height', '600');
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
        mockDateNow.mockReturnValueOnce(1000);
        fireEvent.click(drawButton);
        expect(mockFillRect).toHaveBeenLastCalledWith(350, 250, 100, 100);

        // Change Math.random return value and timestamp
        mockMathRandom.mockReturnValue(0.2);
        mockDateNow.mockReturnValueOnce(2000);
        fireEvent.click(drawButton);
        expect(mockFillRect).toHaveBeenLastCalledWith(140, 100, 100, 100); // (800-100)*0.2, (600-100)*0.2

        // Verify fillRect was called for both squares (redraw calls)
        expect(mockFillRect).toHaveBeenCalledTimes(3); // Initial + redraw after first + redraw after second
    });

    it('clears all squares when Clear Canvas button is clicked', () => {
        render(<Home />);

        const drawButton = screen.getByRole('button', { name: /draw square/i });
        const clearButton = screen.getByRole('button', { name: /clear canvas/i });

        // Draw a square first
        fireEvent.click(drawButton);
        expect(mockFillRect).toHaveBeenCalled();

        // Clear the canvas
        jest.clearAllMocks();
        fireEvent.click(clearButton);

        // Should clear the canvas
        expect(mockClearRect).toHaveBeenCalledWith(0, 0, 800, 600);
    });

    describe('Drag and Drop Functionality', () => {
        it('detects mouse down on a square and starts dragging', () => {
            render(<Home />);

            const canvas = document.querySelector('canvas') as HTMLCanvasElement;
            const drawButton = screen.getByRole('button', { name: /draw square/i });

            // Draw a square at position (350, 250)
            fireEvent.click(drawButton);

            // Simulate mouse down on the square
            fireEvent.mouseDown(canvas, {
                clientX: 400, // Inside the square (350 + 50)
                clientY: 300, // Inside the square (250 + 50)
            });

            // Cursor should change to grabbing when dragging starts
            expect(canvas.style.cursor).toBe('grabbing');
        });

        it('moves square when dragging', () => {
            render(<Home />);

            const canvas = document.querySelector('canvas') as HTMLCanvasElement;
            const drawButton = screen.getByRole('button', { name: /draw square/i });

            // Draw a square at position (350, 250)
            fireEvent.click(drawButton);
            jest.clearAllMocks(); // Clear previous draw calls

            // Start dragging
            fireEvent.mouseDown(canvas, {
                clientX: 400, // Click at center of square
                clientY: 300,
            });

            // Move mouse to new position
            fireEvent.mouseMove(canvas, {
                clientX: 500, // Move 100px right
                clientY: 400, // Move 100px down
            });

            // Square should be redrawn at new position (450, 350)
            // The offset is calculated: newPos - offset = 500 - 50 = 450
            expect(mockFillRect).toHaveBeenCalledWith(450, 350, 100, 100);
            expect(mockStrokeRect).toHaveBeenCalledWith(450, 350, 100, 100);
        });

        it('stops dragging on mouse up', () => {
            render(<Home />);

            const canvas = document.querySelector('canvas') as HTMLCanvasElement;
            const drawButton = screen.getByRole('button', { name: /draw square/i });

            // Draw a square
            fireEvent.click(drawButton);

            // Start dragging
            fireEvent.mouseDown(canvas, {
                clientX: 400,
                clientY: 300,
            });

            expect(canvas.style.cursor).toBe('grabbing');

            // Stop dragging
            fireEvent.mouseUp(canvas);

            // Cursor should reset
            expect(canvas.style.cursor).toBe('default');
        });

        it('stops dragging when mouse leaves canvas', () => {
            render(<Home />);

            const canvas = document.querySelector('canvas') as HTMLCanvasElement;
            const drawButton = screen.getByRole('button', { name: /draw square/i });

            // Draw a square
            fireEvent.click(drawButton);

            // Start dragging
            fireEvent.mouseDown(canvas, {
                clientX: 400,
                clientY: 300,
            });

            expect(canvas.style.cursor).toBe('grabbing');

            // Mouse leaves canvas
            fireEvent.mouseLeave(canvas);

            // Should stop dragging
            expect(canvas.style.cursor).toBe('default');
        });

        it('changes cursor to grab when hovering over square', () => {
            render(<Home />);

            const canvas = document.querySelector('canvas') as HTMLCanvasElement;
            const drawButton = screen.getByRole('button', { name: /draw square/i });

            // Draw a square at position (350, 250)
            fireEvent.click(drawButton);

            // Hover over the square
            fireEvent.mouseMove(canvas, {
                clientX: 400, // Inside square
                clientY: 300,
            });

            expect(canvas.style.cursor).toBe('grab');

            // Move away from square
            fireEvent.mouseMove(canvas, {
                clientX: 100, // Outside square
                clientY: 100,
            });

            expect(canvas.style.cursor).toBe('default');
        });

        it('constrains square movement within canvas boundaries', () => {
            render(<Home />);

            const canvas = document.querySelector('canvas') as HTMLCanvasElement;
            const drawButton = screen.getByRole('button', { name: /draw square/i });

            // Draw a square
            fireEvent.click(drawButton);
            jest.clearAllMocks();

            // Start dragging from center of square
            fireEvent.mouseDown(canvas, {
                clientX: 400,
                clientY: 300,
            });

            // Try to move square beyond left boundary
            fireEvent.mouseMove(canvas, {
                clientX: -50, // Beyond left edge
                clientY: 300,
            });

            // Square should be constrained to x=0
            expect(mockFillRect).toHaveBeenCalledWith(0, 250, 100, 100);

            jest.clearAllMocks();

            // Try to move square beyond right boundary
            fireEvent.mouseMove(canvas, {
                clientX: 850, // Beyond right edge (800 - 100 = 700 max)
                clientY: 300,
            });

            // Square should be constrained to x=700 (canvas width - square width)
            expect(mockFillRect).toHaveBeenCalledWith(700, 250, 100, 100);
        });

        it('handles multiple squares independently', () => {
            render(<Home />);

            const canvas = document.querySelector('canvas') as HTMLCanvasElement;
            const drawButton = screen.getByRole('button', { name: /draw square/i });

            // Draw first square
            mockDateNow.mockReturnValueOnce(1000);
            fireEvent.click(drawButton);

            // Draw second square at different position
            mockMathRandom.mockReturnValue(0.8);
            mockDateNow.mockReturnValueOnce(2000);
            fireEvent.click(drawButton);

            jest.clearAllMocks();

            // Drag the first square (should be at 350, 250)
            fireEvent.mouseDown(canvas, {
                clientX: 400, // Center of first square
                clientY: 300,
            });

            fireEvent.mouseMove(canvas, {
                clientX: 200,
                clientY: 150,
            });

            // Both squares should be redrawn, but only first one moved
            expect(mockFillRect).toHaveBeenCalledWith(150, 100, 100, 100); // First square moved
            expect(mockFillRect).toHaveBeenCalledWith(560, 400, 100, 100); // Second square unchanged
        });
    });

    describe('Delete Functionality', () => {
        it('toggles delete mode when Delete Mode button is clicked', () => {
            render(<Home />);

            const deleteModeButton = screen.getByRole('button', { name: /delete mode/i });

            // Initially should be in normal mode
            expect(screen.getByText('Canvas Drawing - Drag the squares around!')).toBeInTheDocument();
            expect(deleteModeButton).toHaveTextContent('Delete Mode');

            // Click to enter delete mode
            fireEvent.click(deleteModeButton);

            expect(screen.getByText('Canvas Drawing - Click squares to delete them!')).toBeInTheDocument();
            expect(deleteModeButton).toHaveTextContent('Exit Delete Mode');

            // Click to exit delete mode
            fireEvent.click(deleteModeButton);

            expect(screen.getByText('Canvas Drawing - Drag the squares around!')).toBeInTheDocument();
            expect(deleteModeButton).toHaveTextContent('Delete Mode');
        });

        it('deletes a square when clicked in delete mode', () => {
            render(<Home />);

            const canvas = document.querySelector('canvas') as HTMLCanvasElement;
            const drawButton = screen.getByRole('button', { name: /draw square/i });
            const deleteModeButton = screen.getByRole('button', { name: /delete mode/i });

            // Draw a square at position (350, 250)
            fireEvent.click(drawButton);
            expect(mockFillRect).toHaveBeenCalledWith(350, 250, 100, 100);

            // Enter delete mode
            fireEvent.click(deleteModeButton);

            jest.clearAllMocks();

            // Click on the square to delete it
            fireEvent.mouseDown(canvas, {
                clientX: 400, // Inside the square
                clientY: 300,
            });

            // Canvas should be cleared (square deleted)
            expect(mockClearRect).toHaveBeenCalledWith(0, 0, 800, 600);
            // No squares should be redrawn
            expect(mockFillRect).not.toHaveBeenCalled();
        });

        it('does not allow dragging in delete mode', () => {
            render(<Home />);

            const canvas = document.querySelector('canvas') as HTMLCanvasElement;
            const drawButton = screen.getByRole('button', { name: /draw square/i });
            const deleteModeButton = screen.getByRole('button', { name: /delete mode/i });

            // Draw a square
            fireEvent.click(drawButton);

            // Enter delete mode
            fireEvent.click(deleteModeButton);

            jest.clearAllMocks();

            // Try to start dragging
            fireEvent.mouseDown(canvas, {
                clientX: 400,
                clientY: 300,
            });

            // Should not start dragging (cursor should not change to grabbing)
            expect(canvas.style.cursor).not.toBe('grabbing');

            // Move mouse - should not update square position
            fireEvent.mouseMove(canvas, {
                clientX: 500,
                clientY: 400,
            });

            // Square should not be redrawn at new position
            expect(mockFillRect).not.toHaveBeenCalledWith(450, 350, 100, 100);
        });

        it('shows crosshair cursor when hovering over square in delete mode', () => {
            render(<Home />);

            const canvas = document.querySelector('canvas') as HTMLCanvasElement;
            const drawButton = screen.getByRole('button', { name: /draw square/i });
            const deleteModeButton = screen.getByRole('button', { name: /delete mode/i });

            // Draw a square
            fireEvent.click(drawButton);

            // Enter delete mode
            fireEvent.click(deleteModeButton);

            // Hover over the square
            fireEvent.mouseMove(canvas, {
                clientX: 400, // Inside square
                clientY: 300,
            });

            expect(canvas.style.cursor).toBe('crosshair');

            // Move away from square
            fireEvent.mouseMove(canvas, {
                clientX: 100, // Outside square
                clientY: 100,
            });

            expect(canvas.style.cursor).toBe('default');
        });

        it('deletes multiple squares independently', () => {
            render(<Home />);

            const canvas = document.querySelector('canvas') as HTMLCanvasElement;
            const drawButton = screen.getByRole('button', { name: /draw square/i });
            const deleteModeButton = screen.getByRole('button', { name: /delete mode/i });

            // Draw first square
            mockDateNow.mockReturnValueOnce(1000);
            fireEvent.click(drawButton);

            // Draw second square at different position
            mockMathRandom.mockReturnValue(0.8);
            mockDateNow.mockReturnValueOnce(2000);
            fireEvent.click(drawButton);

            // Enter delete mode
            fireEvent.click(deleteModeButton);

            jest.clearAllMocks();

            // Delete the first square (at position 350, 250)
            fireEvent.mouseDown(canvas, {
                clientX: 400, // Center of first square
                clientY: 300,
            });

            // Only second square should be redrawn
            expect(mockClearRect).toHaveBeenCalledWith(0, 0, 800, 600);
            expect(mockFillRect).toHaveBeenCalledWith(560, 400, 100, 100); // Second square still there
            expect(mockFillRect).toHaveBeenCalledTimes(1); // Only one square left
        });

        it('exits delete mode and returns to normal mode', () => {
            render(<Home />);

            const canvas = document.querySelector('canvas') as HTMLCanvasElement;
            const drawButton = screen.getByRole('button', { name: /draw square/i });
            const deleteModeButton = screen.getByRole('button', { name: /delete mode/i });

            // Draw a square
            fireEvent.click(drawButton);

            // Enter delete mode
            fireEvent.click(deleteModeButton);

            // Exit delete mode
            fireEvent.click(deleteModeButton);

            jest.clearAllMocks();

            // Should be able to drag again
            fireEvent.mouseDown(canvas, {
                clientX: 400,
                clientY: 300,
            });

            expect(canvas.style.cursor).toBe('grabbing');

            // Should be able to move the square
            fireEvent.mouseMove(canvas, {
                clientX: 500,
                clientY: 400,
            });

            expect(mockFillRect).toHaveBeenCalledWith(450, 350, 100, 100);
        });
    });
});
