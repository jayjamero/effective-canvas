'use client';

import { Button, HStack, VStack, Text, Box, Container, Flex } from '@chakra-ui/react';

import Header from '@/layout/Header';
import Footer from '@/layout/Footer';

import styles from './page.module.css';

export default function Home() {
    return (
        <div className={styles.page}>
            <Header />
            <main className={styles.main}>
                <Box
                    bg={{ base: 'rgba(255, 255, 255, 0.8)', _dark: 'rgba(0, 0, 0, 0.8)' }}
                    display="flex"
                    justifyContent="center"
                    padding={{ base: '6', md: '10' }}
                    margin={{ base: '0', md: '0' }}
                >
                    <Container maxW="8xl">
                        <VStack spacing={6} align="center">
                            <Text fontSize="2xl" fontWeight="bold" textAlign="center">
                                Canvas Drawing
                            </Text>
                            
                            <canvas
                                ref={(canvas) => {
                                    if (canvas) {
                                        // Set canvas size
                                        canvas.width = 800;
                                        canvas.height = 600;
                                        
                                        // Store canvas reference for drawing functions
                                        (window as any).drawingCanvas = canvas;
                                    }
                                }}
                                style={{
                                    border: '2px solid #CBD5E0',
                                    borderRadius: '8px',
                                    backgroundColor: 'white',
                                    maxWidth: '100%',
                                    height: 'auto'
                                }}
                                width={800}
                                height={600}
                            />
                            
                            <Button
                                colorScheme="blue"
                                size="lg"
                                onClick={() => {
                                    const canvas = (window as any).drawingCanvas;
                                    if (canvas) {
                                        const ctx = canvas.getContext('2d');
                                        if (ctx) {
                                            // Generate random position for the square
                                            const x = Math.random() * (canvas.width - 100);
                                            const y = Math.random() * (canvas.height - 100);
                                            
                                            // Generate random color
                                            const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
                                            const color = colors[Math.floor(Math.random() * colors.length)];
                                            
                                            // Draw square
                                            ctx.fillStyle = color;
                                            ctx.fillRect(x, y, 100, 100);
                                            
                                            // Add border
                                            ctx.strokeStyle = '#2D3748';
                                            ctx.lineWidth = 2;
                                            ctx.strokeRect(x, y, 100, 100);
                                        }
                                    }
                                }}
                            >
                                Draw Square
                            </Button>
                            
                            <Button
                                colorScheme="red"
                                variant="outline"
                                onClick={() => {
                                    const canvas = (window as any).drawingCanvas;
                                    if (canvas) {
                                        const ctx = canvas.getContext('2d');
                                        if (ctx) {
                                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                                        }
                                    }
                                }}
                            >
                                Clear Canvas
                            </Button>
                        </VStack>
                    </Container>
                </Box>
            </main>
            <Footer />
        </div>
    );
}
