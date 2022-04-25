import uppercaseFirstLetter from "../lib/uppercase";
import { fetchLinks } from "../lib/fetch";
import { Box, Heading, Text, Button, Select, Flex } from "@chakra-ui/react";
import SectionBox from "./SectionBox";

export default function LinksHeader({
  networkSites,
  fetchOffers,
  selectedNetwork,
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
      <Box margin="0 auto">
        <Box>
          <Flex justifyContent="space-between" alignItems="center">
            <Box>
              <Heading>
                {selectedNetwork && uppercaseFirstLetter(selectedNetwork.name)}
              </Heading>
              <Text>last update : 2022-03-27</Text>
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
          <Select onChange={handleChange}>
            {networkSites.map((advertiser) => (
              <option
                data-name={advertiser.name}
                key={advertiser.name}
                value={advertiser.token}
              >
                {uppercaseFirstLetter(advertiser.name)}
              </option>
            ))}
          </Select>
        </Box>
      </Box>
    </SectionBox>
  );
}
