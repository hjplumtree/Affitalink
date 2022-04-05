import { fetchLinks } from "../lib/fetch";
import uppercaseFirstLetter from "../lib/uppercase";
import { Box, Heading, Text, Button, Select, Flex } from "@chakra-ui/react";

export default function LinksHeader({
  networkSites,
  setData,
  selectedNetwork,
  setSelectedNetwork,
}) {
  const handleClick = () => {
    const network_info = selectedNetwork.info;
    fetchLinks({ info: network_info }).then((data) => {
      setData(data);
    });
  };

  const handleChange = (e) => {
    setSelectedNetwork(networkSites[e.target.selectedIndex]);
  };

  return (
    <Box w="100%" margin="10px auto">
      <Box>
        <Flex justifyContent="space-between" alignItems="center">
          <Box>
            <Heading>
              {selectedNetwork && uppercaseFirstLetter(selectedNetwork.name)}
            </Heading>
            <Text>last update : 2022-03-27</Text>
          </Box>
          <Button onClick={handleClick}>Fetch Links</Button>
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
  );
}
