import {
  VStack,
  Text,
  Alert,
  AlertIcon,
  Flex,
  Box,
  Switch,
  Heading,
} from "@chakra-ui/react";
import Header from "./Header";
import SectionBox from "./SectionBox";

export default function AdvertiserLists({ advertisers, setAdvertisers }) {
  const { page, advertisers_list } = advertisers;

  const alphabetical_sort = (arr) => {
    return arr.sort((a, b) => a.name.localeCompare(b.name));
  };

  const handleToggle = (index) => {
    advertisers_list[index].isChecked = !advertisers_list[index].isChecked;
    setAdvertisers({
      ...advertisers,
    });
  };
  return (
    <SectionBox mt={5}>
      <Header
        title="Advertisers"
        subtitle="Choose advertisers and see only selected links"
        size="lg"
      />

      {advertisers ? (
        advertisers_list.length !== 0 ? (
          <VStack align="stretch" justifyContent="center" mt={5}>
            {alphabetical_sort(advertisers_list).map((advertiser, index) => (
              <Flex key={advertiser.id}>
                <Box>
                  <Heading fontSize="md">{advertiser.name}</Heading>
                  <Text fontSize="sm" color="#95AFC4">
                    #{advertiser.id}
                  </Text>
                </Box>

                <Switch
                  colorScheme="purple"
                  ml="auto"
                  isChecked={advertiser.isChecked}
                  onChange={() => handleToggle(index)}
                />
              </Flex>
            ))}
          </VStack>
        ) : (
          <Alert status="info" mt={5}>
            <AlertIcon />
            Once Connected, joined advertisers will be shown here
          </Alert>
        )
      ) : (
        <Alert status="error" mt={5}>
          <AlertIcon />
          Oops, Please check your information.
        </Alert>
      )}
    </SectionBox>
  );
}
