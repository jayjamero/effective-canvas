'use client';

import { Box, Container, Flex, Text, Link, Image, Button, Stack } from '@chakra-ui/react';
import { ColorModeButton } from '../../components/ui/ColorMode';

const Header = () => {
    return (
        <Box bg={{ base: 'white', _dark: 'black' }} w="full" boxShadow="md" display="flex" justifyContent="center">
            <Container maxW="7xl" padding={{ base: '2', md: '4' }}>
                <Flex justify="space-between" align="stretch">
                    {/* Logo */}
                    <Link href="/">
                        <Flex gap={2} align="center" justify="flex-start">
                            <Box position="relative">
                                <Image
                                    src="/logo.svg"
                                    alt="Canva logo"
                                    padding={{ base: '2', md: '4' }}
                                    width={{ base: 100 }}
                                />
                            </Box>
                            <Text display={{ smDown: 'none' }} fontSize={{ base: 'sm', md: 'md' }} fontWeight="bold">
                                interview for: Jay Jamero
                            </Text>
                        </Flex>
                    </Link>
                    {/* Menu items */}
                    <Flex gap={3} align="center" justify="flex-end">
                        <ColorModeButton />
                    </Flex>
                </Flex>
            </Container>
        </Box>
    );
};

export default Header;
