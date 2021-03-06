import {
  HStack,
  VStack,
  Heading,
  Text,
  Tooltip,
  useToast,
  Icon,
} from "@chakra-ui/react";
import { FaCopy } from "react-icons/fa";
export default function CopyTextToClipboard({ title, children }) {
  const toast = useToast();

  const handleClick = (e) => {
    const text = e.target.firstChild.textContent;
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied successfully",
      status: "info",
      position: "top-right",
      duration: 800,
    });
  };

  const styles = {
    width: "100%",
    p: 1,
  };

  return (
    <VStack align="baseline" marginTop={8} width="100%">
      <Heading size="xs">{title}</Heading>

      {/* When 'No Code Needed' or "No Image" received */}
      {children === "No Code Needed" || children === "No Image" ? (
        <HStack {...styles} bg="#D6E0E8" border="2px solid #99AAB5">
          <Text
            color="#95AFC4"
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
          >
            {children}
          </Text>
        </HStack>
      ) : (
        <Tooltip label={children}>
          <HStack
            onClick={handleClick}
            cursor="pointer"
            {...styles}
            bg="#F1ECFE"
            border="1px dashed #AD8DF7"
          >
            <Icon as={FaCopy} color="#3A0CA3" />
            <Text
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
              color="#3A0CA3"
            >
              {children}
            </Text>
          </HStack>
        </Tooltip>
      )}
    </VStack>
  );
}
