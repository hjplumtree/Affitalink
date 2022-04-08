import {
  HStack,
  VStack,
  Heading,
  Text,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import { CopyIcon } from "@chakra-ui/icons";
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
    border: "1px solid #99AAB5",
    width: "100%",
    p: 1,
  };

  return (
    <VStack align="baseline" marginTop={8} width="100%">
      <Heading size="xs">{title}</Heading>

      {/* When 'No Code Needed' received */}
      {children === "No Code Needed" ? (
        <HStack {...styles}>
          <Text whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
            {children}
          </Text>
        </HStack>
      ) : (
        <Tooltip label="Click to copy">
          <HStack onClick={handleClick} cursor="pointer" {...styles}>
            <CopyIcon color="#99AAB5" />
            <Text whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
              {children}
            </Text>
          </HStack>
        </Tooltip>
      )}
    </VStack>

    // <Box
    //   onClick={handleClick}
    //   cursor="pointer"
    //   p={1}
    //   border="2px dashed #4895EF"
    //   bg="#e1e1e1"
    // >
    // <Tooltip label="Click to copy">
    //   <Text
    //     width="170px"
    //     whiteSpace="nowrap"
    //     overflow="hidden"
    //     textOverflow="ellipsis"
    //   >
    //     {children}
    //   </Text>
    // </Tooltip>
    // </Box>
  );
}
