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

export default function AdvertiserLists({ data, setData }) {
  const { page, advertisers } = data;
  const alphabetical_advertisers = advertisers.sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  const handleToggle = (index) => {
    advertisers[index].isChecked = !advertisers[index].isChecked;
    setData({
      ...data,
      ...advertisers,
    });
  };
  return (
    <SectionBox mt={5}>
      <Header
        title="Advertisers"
        subtitle="Choose advertisers to see only their links"
        size="lg"
      />

      {advertisers.length !== 0 ? (
        <VStack align="stretch" justifyContent="center" mt={5}>
          {advertisers.map((advertiser, index) => (
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
      )}
    </SectionBox>
  );
}
