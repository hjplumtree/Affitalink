import uppercaseFirstLetter from "../lib/uppercase";
import { fetchLinks } from "../lib/fetch";
import { fetchRakutenLinks } from "../lib/fetchRakuten";
import { Box, Heading, Text, Button, Select, Flex } from "@chakra-ui/react";

export default function LinksHeader({
  networkSites,
  setData,
  selectedNetwork,
  setSelectedNetwork,
}) {
  const handleClick = () => {
    const { name, info: network_info } = selectedNetwork;
    // if (name === "cj") {
    //   fetchLinks({ info: network_info, network: name }).then((data) => {
    //     setData(data);
    //   });
    // } else if (name === "rakuten") {
    //   fetchRakutenLinks({ info: network_info }).then((data) => {
    //     setData(data);
    //   });
    // }
    fetchLinks({ info: network_info, network: name }).then((data) => {
      setData(data);
    });
  };

  const handleChange = (e) => {
    setSelectedNetwork(networkSites[e.target.selectedIndex]);
  };

  return (
    <Box p="60px 20px 30px" w="100%" bg="#fff">
      <Box maxWidth="1000px" margin="0 auto">
        <Box>
          <Flex justifyContent="space-between" alignItems="center">
            <Box>
              <Heading>
                {selectedNetwork && uppercaseFirstLetter(selectedNetwork.name)}
              </Heading>
              <Text>last update : 2022-03-27</Text>
            </Box>
            <Button background="#4895EF" color="#fff" onClick={handleClick}>
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
    </Box>
  );
}
