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
    <SectionBox bg="rgba(255,255,255,0.96)">
      <Header
        title="Link pull workspace"
        subtitle="Choose a source, pull the latest links, and copy what you need without hunting through the network UI."
        eyebrow="Links"
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
                variant="accent"
                onClick={handleClick}
              >
                Pull links
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
              Connect a network source before trying to pull links.
            </AlertDescription>
            <RouterLink
              mt={7}
              border="1px solid rgba(139, 77, 255, 0.16)"
              to="/networks"
              fontSize="md"
              fontWeight="bold"
            >
              Connect a source
            </RouterLink>
          </Alert>
        </VStack>
      )}
    </SectionBox>
  );
}
