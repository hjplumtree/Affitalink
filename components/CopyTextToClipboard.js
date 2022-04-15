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
    border: "2px solid #99AAB5",
    width: "100%",
    p: 1,
  };

  return (
    <VStack align="baseline" marginTop={8} width="100%">
      <Heading size="xs">{title}</Heading>

      {/* When 'No Code Needed' or "No Image" received */}
      {children === "No Code Needed" || children === "No Image" ? (
        <HStack {...styles} bg="#F0F0F0">
          <Text whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
            {children}
          </Text>
        </HStack>
      ) : (
        <Tooltip label={children}>
          <HStack onClick={handleClick} cursor="pointer" {...styles}>
            <Icon as={FaCopy} color="#99AAB5" />
            <Text whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
              {children}
            </Text>
          </HStack>
        </Tooltip>
      )}
    </VStack>
  );
}
