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
                    <Container maxW="8xl"></Container>
                </Box>
            </main>
            <Footer />
        </div>
    );
}
