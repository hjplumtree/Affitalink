import { useEffect, useState, useRef } from "react";
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
} from "@chakra-ui/react";

export default function NetworkInput({
  info,
  setInfo,
  networkName,
  storageName,
  initialState,
}) {
  const [show, setShow] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  useEffect(() => {
    if (localStorage.getItem(storageName)) {
      setInfo(JSON.parse(localStorage.getItem(storageName)));
    }
  }, []);

  const handleInputChange = (e) => {
    setInfo((prevState) => {
      const newState = { ...prevState };
      newState[e.target.dataset.name] = e.target.value;
      return newState;
    });
  };

  const handleSave = () => {
    if (info || localStorage.getItem(storageName)) {
      localStorage.setItem(storageName, JSON.stringify(info));
    }
    console.log(localStorage);
  };

  const handleDelete = () => {
    setInfo(initialState);
    localStorage.removeItem(storageName);
  };

  const handleShow = () => {
    setShow(!show);
  };

  const inputs = Object.entries(info);

  return (
    <Box>
      <Heading>{networkName}</Heading>
      <FormControl>
        {inputs.map((input) => (
          <Box key={input[0]}>
            <Text>{input[0].split("_").join(" ").toUpperCase()}</Text>

            {input[0] === "token" ? (
              <InputGroup>
                <Input
                  onChange={handleInputChange}
                  type={show ? "text" : "password"}
                  placehodler="Enter token"
                  value={info["token"]}
                  data-name="token"
                />
                <InputRightElement width="4.5rem">
                  <Button h="1.75rem" size="sm" onClick={handleShow}>
                    {show ? "Hide" : "Show"}
                  </Button>
                </InputRightElement>
              </InputGroup>
            ) : (
              <Box>
                <Input
                  onChange={handleInputChange}
                  type="text"
                  placeholder={`Enter ${input[0].split("_").join(" ")}`}
                  value={info[input[0]]}
                  data-name={input[0]}
                />
              </Box>
            )}
          </Box>
        ))}

        <VStack mt={3} spacing={3} align="stretch">
          <Button variant="outline" colorScheme="blue" onClick={handleSave}>
            Save
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
