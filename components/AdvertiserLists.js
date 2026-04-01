import {
  VStack,
  Text,
  Alert,
  AlertIcon,
  Flex,
  Box,
  Switch,
  Badge,
} from "@chakra-ui/react";
import Header from "./Header";
import SectionBox from "./SectionBox";

export default function AdvertiserLists({ advertisers, onToggleAdvertiser }) {
  const advertisersList = [...(advertisers?.advertisers_list || [])].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  const selectedCount = advertisersList.filter((advertiser) => advertiser.selected).length;

  return (
    <SectionBox mt={5}>
      <Header
        title="Merchant watchlist"
        subtitle="Choose which merchants should be monitored during manual sync"
        eyebrow="Selection"
      />
      <Text mt={4} fontSize="sm" color="ink.600">
        Merchant selection is where you stop the queue from becoming a junk drawer.
      </Text>
      <Flex
        mt={4}
        px={4}
        py={3}
        borderRadius="20px"
        bg="rgba(15,17,23,0.04)"
        justify="space-between"
        align="center"
      >
        <Box>
          <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="brand.500">
            Watch coverage
          </Text>
          <Text fontSize="sm" color="ink.700">
            {selectedCount} of {advertisersList.length} merchants selected
          </Text>
        </Box>
        <Badge bg="rgba(255,66,122,0.10)" color="brand.700" px={3} py={1.5} borderRadius="full">
          Active feed
        </Badge>
      </Flex>

      {advertisers ? (
        advertisersList.length !== 0 ? (
          <VStack align="stretch" justifyContent="center" mt={5} spacing={0}>
            {advertisersList.map((advertiser) => (
              <Flex
                key={advertiser.id}
                py={4}
                px={2}
                borderTop="1px solid rgba(15, 17, 23, 0.08)"
                align="center"
                gap={4}
              >
                <Box>
                  <Text fontSize="md" fontWeight="700" color="ink.900">
                    {advertiser.name}
                  </Text>
                  <Badge mt={1} bg="rgba(15, 17, 23, 0.06)" color="ink.700">
                    #{advertiser.id}
                  </Badge>
                </Box>

                <Switch
                  colorScheme="green"
                  ml="auto"
                  isChecked={advertiser.selected}
                  onChange={() => onToggleAdvertiser(advertiser.id)}
                />
              </Flex>
            ))}
          </VStack>
        ) : (
          <Alert status="info" mt={5} borderRadius={18}>
            <AlertIcon />
            Save valid connector credentials to load affiliated merchants here
          </Alert>
        )
      ) : (
        <Alert status="error" mt={5} borderRadius={18}>
          <AlertIcon />
          Oops, Please check your information.
        </Alert>
      )}
    </SectionBox>
  );
}
