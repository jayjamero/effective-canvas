'use client';

import { Button, VStack, Text, Box, Container, HStack, Stack } from '@chakra-ui/react';
import { useState, useRef, useEffect } from 'react';

import Header from '../layout/Header';
import Footer from '../layout/Footer';

interface Square {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
}

export default function Home() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [squares, setSquares] = useState<Square[]>([]);
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [dragState, setDragState] = useState<{
        isDragging: boolean;
        squareId: string | null;
        offsetX: number;
        offsetY: number;
    }>({
        isDragging: false,
        squareId: null,
        offsetX: 0,
        offsetY: 0,
    });

    // Colors array
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];

    // Function to redraw all squares
    const redrawCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw all squares
        squares.forEach((square) => {
            ctx.fillStyle = square.color;
            ctx.fillRect(square.x, square.y, square.width, square.height);

            // Add border
            ctx.strokeStyle = '#2D3748';
            ctx.lineWidth = 2;
            ctx.strokeRect(square.x, square.y, square.width, square.height);
        });
    };

    // Function to find which square is at given coordinates
    const findSquareAt = (x: number, y: number): Square | null => {
        // Check from last to first (top to bottom)
        for (let i = squares.length - 1; i >= 0; i--) {
            const square = squares[i];
            if (x >= square.x && x <= square.x + square.width && y >= square.y && y <= square.y + square.height) {
                return square;
            }
        }
        return null;
    };

    // Function to get mouse position relative to canvas
    const getMousePos = (canvas: HTMLCanvasElement, e: MouseEvent): { x: number; y: number } => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
        };
    };

    // Mouse event handlers
    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const mousePos = getMousePos(canvas, e.nativeEvent);
        const clickedSquare = findSquareAt(mousePos.x, mousePos.y);

        if (clickedSquare) {
            if (isDeleteMode) {
                // Delete the clicked square
                deleteSquare(clickedSquare.id);
                return;
            }

            setDragState({
                isDragging: true,
                squareId: clickedSquare.id,
                offsetX: mousePos.x - clickedSquare.x,
                offsetY: mousePos.y - clickedSquare.y,
            });
            canvas.style.cursor = 'grabbing';
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const mousePos = getMousePos(canvas, e.nativeEvent);

        if (dragState.isDragging && dragState.squareId && !isDeleteMode) {
            // Update the position of the dragged square
            setSquares((prevSquares) =>
                prevSquares.map((square) =>
                    square.id === dragState.squareId
                        ? {
                              ...square,
                              x: Math.max(0, Math.min(canvas.width - square.width, mousePos.x - dragState.offsetX)),
                              y: Math.max(0, Math.min(canvas.height - square.height, mousePos.y - dragState.offsetY)),
                          }
                        : square
                )
            );
        } else {
            // Change cursor based on whether mouse is over a square and current mode
            const hoveredSquare = findSquareAt(mousePos.x, mousePos.y);
            if (hoveredSquare) {
                canvas.style.cursor = isDeleteMode ? 'crosshair' : 'grab';
            } else {
                canvas.style.cursor = 'default';
            }
        }
    };

    const handleMouseUp = () => {
        if (dragState.isDragging) {
            setDragState({
                isDragging: false,
                squareId: null,
                offsetX: 0,
                offsetY: 0,
            });
            const canvas = canvasRef.current;
            if (canvas) {
                canvas.style.cursor = 'default';
            }
        }
    };

    // Function to add a new square
    const addSquare = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const newSquare: Square = {
            id: Date.now().toString(),
            x: Math.random() * (canvas.width - 100),
            y: Math.random() * (canvas.height - 100),
            width: 100,
            height: 100,
            color: colors[Math.floor(Math.random() * colors.length)],
        };

        setSquares((prevSquares) => [...prevSquares, newSquare]);
    };

    // Function to clear all squares
    const clearCanvas = () => {
        setSquares([]);
    };

    // Function to delete a specific square
    const deleteSquare = (squareId: string) => {
        setSquares((prevSquares) => prevSquares.filter((square) => square.id !== squareId));
    };

    // Effect to redraw canvas whenever squares change
    useEffect(() => {
        redrawCanvas();
    }, [squares]);

    return (
        <div style={{ fontFamily: 'var(--font-geist-sans)' }}>
            <Header />
            <main style={{ minHeight: '100vh', padding: '20px', backgroundColor: '#f7f9fb' }}>
                <Box
                    bg={{ base: 'rgba(255, 255, 255, 0.8)', _dark: 'rgba(0, 0, 0, 0.8)' }}
                    display="flex"
                    justifyContent="center"
                    padding={{ base: '6', md: '10' }}
                    margin={{ base: '0', md: '0' }}
                >
                    <Container maxW="8xl">
                        <Stack gap={6} align="center">
                            <Text fontSize="2xl" fontWeight="bold" textAlign="center">
                                Canvas Drawing -{' '}
                                {isDeleteMode ? 'Click squares to delete them!' : 'Drag the squares around!'}
                            </Text>

                            <canvas
                                ref={canvasRef}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                                style={{
                                    border: '2px solid #CBD5E0',
                                    borderRadius: '8px',
                                    backgroundColor: 'white',
                                    maxWidth: '100%',
                                    height: 'auto',
                                    cursor: 'default',
                                }}
                                width={800}
                                height={600}
                            />

                            <Stack direction="row" gap={4} flexWrap="wrap" justify="center">
                                <Button colorScheme="blue" size="lg" onClick={addSquare}>
                                    Draw Square
                                </Button>

                                <Button
                                    colorScheme={isDeleteMode ? 'red' : 'orange'}
                                    variant={isDeleteMode ? 'solid' : 'outline'}
                                    size="lg"
                                    onClick={() => setIsDeleteMode(!isDeleteMode)}
                                >
                                    {isDeleteMode ? 'Exit Delete Mode' : 'Delete Mode'}
                                </Button>

                                <Button colorScheme="red" variant="outline" onClick={clearCanvas}>
                                    Clear Canvas
                                </Button>
                            </Stack>
                        </Stack>
                    </Container>
                </Box>
            </main>
            <Footer />
        </div>
    );
}
