import { Box, Text } from "@chakra-ui/react";
import Report from "../components/Report";

const HomePage = () => {

    return (
        <Box>
            <Text fontSize="6xl" textAlign='center'>Welcome to CloudWalk Challege app</Text>
            <Report></Report>
        </Box>
    );
}

export default HomePage;