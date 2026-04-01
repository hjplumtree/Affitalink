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

  return (
    <SectionBox mt={5}>
      <Header
        title="Advertisers"
        subtitle="Choose which merchants should be monitored during manual sync"
        eyebrow="Selection"
      />

      {advertisers ? (
        advertisersList.length !== 0 ? (
          <VStack align="stretch" justifyContent="center" mt={5} spacing={0}>
            {advertisersList.map((advertiser) => (
              <Flex
                key={advertiser.id}
                py={4}
                borderTop="1px solid rgba(103, 77, 55, 0.1)"
                align="center"
                gap={4}
              >
                <Box>
                  <Text fontSize="md" fontWeight="700" color="ink.900">
                    {advertiser.name}
                  </Text>
                  <Badge mt={1} bg="rgba(24, 34, 47, 0.06)" color="ink.700">
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
