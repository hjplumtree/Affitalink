import { useEffect, useState, useRef } from "react";
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
} from "@chakra-ui/react";
import SectionBox from "./SectionBox";
import Header from "./Header";

export default function NetworkInput({
  networkName,
  auth,
  setAuth,
  fetchAdvertiserList,
  deleteDB,
}) {
  const [show, setShow] = useState(false);
  const [inputError, setInputError] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  useEffect(() => {
    if (isEmpty(inputs)) {
      setInputError(false);
    }
  }, []);

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
        subtitle={`Enter correct information to Connect ${networkName}!`}
      />
      <FormControl isRequired mt={5}>
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
                  placeholder="Enter token"
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
                placeholder={`Enter ${input[0].split("_").join(" ")}`}
                value={auth[input[0]]}
                data-name={input[0]}
                mb={3}
              />
            )}
          </Box>
        ))}
        {inputError && (
          <Alert status="error" borderRadius={5}>
            <AlertIcon />
            Please fill all the fields and connect again
          </Alert>
        )}
        <VStack mt={5} spacing={3} align="stretch">
          <Button colorScheme="blue" onClick={handleConnect}>
            Connect
          </Button>

          <Button variant="outline" colorScheme="red" onClick={onOpen}>
            Delete
          </Button>

          <AlertDialog
            isOpen={isOpen}
            LeastDestructiveRef={cancelRef}
            onClose={onClose}
          >
            <AlertDialogOverlay>
              <AlertDialogContent>
                <AlertDialogHeader fontSize="lg" fontWeight="bold">
                  DELETE
                </AlertDialogHeader>

                <AlertDialogBody>
                  Are you sure you want to delete {networkName} infomation?
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
        <Alert status="warning" fontSize="xs" mt={5}>
          <AlertIcon />
          Information you provided will be saved in your computer. Make sure to
          delete them if you need.
        </Alert>
      </FormControl>
    </SectionBox>
  );
}
