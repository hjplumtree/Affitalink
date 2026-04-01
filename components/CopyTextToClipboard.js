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
      <Heading size="xs" color="ink.900" letterSpacing="-0.02em">
        {title}
      </Heading>

      {/* When 'No Code Needed' or "No Image" received */}
      {children === "No Code Needed" || children === "No Image" ? (
        <HStack
          {...styles}
          bg="rgba(15,17,23,0.05)"
          border="1px solid rgba(15,17,23,0.12)"
          borderRadius="16px"
        >
          <Text
            color="ink.500"
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
            bg="rgba(237, 226, 255, 0.84)"
            border="1px dashed rgba(139, 77, 255, 0.32)"
            borderRadius="16px"
          >
            <Icon as={FaCopy} color="brand.600" />
            <Text
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
              color="brand.700"
            >
              {children}
            </Text>
          </HStack>
        </Tooltip>
      )}
    </VStack>
  );
}
