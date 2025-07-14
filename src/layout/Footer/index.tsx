import { Box, Container, Flex, Text } from '@chakra-ui/react';

const Footer = () => {
    return (
        <Box width="100%" boxShadow="md" bg={{ base: 'white', _dark: 'black' }}>
            <Container fluid>
                <Flex direction="column" align="center" textAlign="center" px="2" py="4">
                    <Text fontSize="sm">
                        Interview Project for Canva
                        <br />
                        by Jay Jamero
                    </Text>
                </Flex>
            </Container>
        </Box>
    );
};

export default Footer;
