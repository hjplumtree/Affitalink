import { Box, Text, Tooltip, useToast } from "@chakra-ui/react";

export default function CopyTextToClipboard({ Title, children }) {
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

  return (
    <Box
      onClick={handleClick}
      cursor="pointer"
      p={1}
      border="2px dashed #4895EF"
      bg="#e1e1e1"
    >
      <Tooltip label="Click to copy">
        <Text
          width="170px"
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
        >
          {children}
        </Text>
      </Tooltip>
    </Box>
  );
}
