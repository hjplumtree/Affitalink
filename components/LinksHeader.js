import {
  Box,
  Button,
  Select,
  Flex,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  VStack,
} from "@chakra-ui/react";
import SectionBox from "./SectionBox";
import Header from "../components/Header";
import RouterLink from "../components/RouterLink";

export default function LinksHeader({
  networkSites,
  fetchOffers,
  setSelectedNetwork,
}) {
  const handleClick = () => {
    fetchOffers();
  };

  const handleChange = (e) => {
    setSelectedNetwork(networkSites[e.target.selectedIndex]);
  };

  return (
    <SectionBox>
      <Header
        title="LINKS"
        subtitle="1-click copy tracking links, Promo codes!"
      />
      {networkSites.length !== 0 ? (
        <Box margin="0 auto" mt={3}>
          <Box>
            <Flex alignItems="center" gap={1}>
              <Box flexGrow="1">
                <Select onChange={handleChange}>
                  {networkSites.map((advertiser) => (
                    <option
                      data-name={advertiser.name}
                      key={advertiser.name}
                      value={advertiser.token}
                    >
                      {advertiser.name.toUpperCase()}
                    </option>
                  ))}
                </Select>
              </Box>
              <Button
                border="1px solid #3a0ca3"
                color="#3a0ca3"
                onClick={handleClick}
              >
                Fetch Links
              </Button>
            </Flex>
          </Box>
          <Box>
            {/* Fetch date comment out for now */}
            {/* <Text>last update : 2022-03-27</Text> */}
          </Box>
        </Box>
      ) : (
        <VStack>
          <Alert
            status="info"
            flexDirection="column"
            mt={7}
            mb={7}
            p={7}
            borderRadius={5}
          >
            <AlertIcon boxSize="40px" />
            <AlertTitle mt={3} mb={1} fontSize="xl">
              Connect first!
            </AlertTitle>
            <AlertDescription>
              In order to get the links, connect network first!
            </AlertDescription>
            <RouterLink
              mt={7}
              color="#F1ECFE"
              bg="#3A0CA3"
              borderRadius={5}
              padding={3}
              to="/networks"
              fontSize="md"
              fontWeight="bold"
            >
              Click to connect
            </RouterLink>
          </Alert>
        </VStack>
      )}
    </SectionBox>
  );
}
