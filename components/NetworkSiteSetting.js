import { useState, useRef } from "react";
import { isEmpty } from "../lib/validate";

import {
  Box,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  VStack,
  FormControl,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  FormLabel,
  Alert,
  AlertIcon,
  Text,
  HStack,
} from "@chakra-ui/react";
import SectionBox from "./SectionBox";
import Header from "./Header";

export default function NetworkInput({
  networkName,
  auth,
  setAuth,
  fetchAdvertiserList,
  deleteDB,
  connectorStatus,
  helperText,
  actionLabel = "Save and test",
}) {
  const [show, setShow] = useState(false);
  const [inputError, setInputError] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  const handleInputChange = (e) => {
    setAuth((prevState) => {
      const newState = { ...prevState };
      newState[e.target.dataset.name] = e.target.value;
      return newState;
    });
  };

  const handleShow = () => {
    setShow(!show);
  };

  const inputs = Object.entries(auth);

  const handleConnect = () => {
    if (isEmpty(inputs)) {
      setInputError(false);
      fetchAdvertiserList();
    } else {
      setInputError(true);
    }
  };

  const handleDelete = () => {
    deleteDB();
  };

  return (
    <SectionBox>
      <Header
        title={networkName}
        subtitle={helperText || `Enter credentials to connect ${networkName}.`}
        eyebrow="Source settings"
      />
      <FormControl isRequired mt={5}>
        <Text fontSize="sm" color="ink.600" mb={4}>
          Save the credentials, test the connection, then choose merchants below.
        </Text>
        {inputs.map((input) => (
          <Box key={input[0]}>
            <FormLabel htmlFor={input[0]}>
              {input[0].split("_").join(" ").toUpperCase()}
            </FormLabel>

            {input[0] === "token" ? (
              <InputGroup>
                <Input
                  id={input[0]}
                  onChange={handleInputChange}
                  type={show ? "text" : "password"}
                  placeholder="Paste token"
                  value={auth["token"]}
                  data-name="token"
                  mb={3}
                />
                <InputRightElement width="4.5rem">
                  <Button h="1.75rem" size="sm" onClick={handleShow}>
                    {show ? "Hide" : "Show"}
                  </Button>
                </InputRightElement>
              </InputGroup>
            ) : (
                <Input
                  id={input[0]}
                  onChange={handleInputChange}
                  type="text"
                  placeholder={`Paste ${input[0].split("_").join(" ")}`}
                  value={auth[input[0]]}
                  data-name={input[0]}
                  mb={3}
              />
            )}
          </Box>
        ))}
        {inputError && (
          <Alert status="error" borderRadius={20}>
            <AlertIcon />
            Fill in every field, then try again.
          </Alert>
        )}
        {connectorStatus && (
          <Alert
            status={connectorStatus.status === "connected" ? "success" : "warning"}
            borderRadius={20}
            mt={3}
          >
            <AlertIcon />
            {connectorStatus.message}
          </Alert>
        )}
        <VStack mt={5} spacing={3} align="stretch">
          <HStack spacing={3} align="stretch" flexDirection={{ base: "column", md: "row" }}>
            <Button onClick={handleConnect} flex="1" variant="accent">
              {actionLabel}
            </Button>

            <Button variant="outline" colorScheme="red" onClick={onOpen} flex="1">
              Delete source
            </Button>
          </HStack>

          <AlertDialog
            isOpen={isOpen}
            LeastDestructiveRef={cancelRef}
            onClose={onClose}
          >
            <AlertDialogOverlay>
              <AlertDialogContent>
                <AlertDialogHeader fontSize="lg" fontWeight="bold">
                  Delete source
                </AlertDialogHeader>

                <AlertDialogBody>
                  Delete the saved settings for {networkName}?
                </AlertDialogBody>

                <AlertDialogFooter>
                  <Button ref={cancelRef} onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    colorScheme="red"
                    onClick={() => {
                      onClose();
                      handleDelete();
                    }}
                    ml={3}
                  >
                    Delete
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>
        </VStack>
        <Alert status="warning" fontSize="sm" mt={5} borderRadius={20}>
          <AlertIcon />
          <Text>
            Credentials are stored on the backend so manual sync can run on the server.
            Remove them when you no longer want this source feeding the queue.
          </Text>
        </Alert>
      </FormControl>
    </SectionBox>
  );
}
