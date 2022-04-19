import { useEffect, useState, useRef } from "react";
import { fecthAdvertisers } from "../lib/fetch";
import {
  Box,
  Heading,
  Text,
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

import Header from "./Header";

export default function NetworkInput({
  info,
  setInfo,
  networkName,
  storageName,
  initialState,
}) {
  const [show, setShow] = useState(false);
  const [inputError, setInputError] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  useEffect(() => {
    if (localStorage.getItem(storageName)) {
      setInfo(JSON.parse(localStorage.getItem(storageName)));
    }
    if (validate(inputs)) {
      setInputError(false);
    }
  }, []);

  const handleInputChange = (e) => {
    setInfo((prevState) => {
      const newState = { ...prevState };
      newState[e.target.dataset.name] = e.target.value;
      return newState;
    });
  };

  const handleShow = () => {
    setShow(!show);
  };

  const inputs = Object.entries(info);

  const validate = (arr) => {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i][1] === "") {
        return false;
      }
    }
    return true;
  };

  const handleSave = () => {
    if (validate(inputs)) {
      setInputError(false);
      localStorage.setItem(storageName, JSON.stringify(info));
      fecthAdvertisers({ network: storageName, info: info }).then((data) =>
        console.log(data),
      );
    } else {
      setInputError(true);
    }
  };

  const handleDelete = () => {
    setInfo(initialState);
    localStorage.removeItem(storageName);
  };

  return (
    <Box>
      <Header
        title={networkName}
        subtitle={`Connect ${networkName} and see only selected advertisers`}
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
                  placehodler="Enter token"
                  value={info["token"]}
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
                value={info[input[0]]}
                data-name={input[0]}
                mb={3}
              />
            )}
          </Box>
        ))}
        {inputError && (
          <Alert status="warning" borderRadius={5}>
            <AlertIcon />
            Please fill all the fields and connect again
          </Alert>
        )}
        <VStack mt={5} spacing={3} align="stretch">
          <Button colorScheme="blue" onClick={handleSave}>
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
                  Delete {networkName}
                </AlertDialogHeader>

                <AlertDialogBody>
                  Are you sure you want to delete all infomation?
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
      </FormControl>
    </Box>
  );
}
