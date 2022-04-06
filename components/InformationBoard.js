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

export default function Token({
  cjInfo,
  setCjInfo,
  networkName,
  storageName,
  initialState,
}) {
  const [show, setShow] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  useEffect(() => {
    if (localStorage.getItem(storageName)) {
      setCjInfo(JSON.parse(localStorage.getItem(storageName)));
    }
  }, []);

  const handleInputChange = (e) => {
    setCjInfo((prevState) => {
      const newState = { ...prevState };
      newState[e.target.dataset.name] = e.target.value;
      return newState;
    });
  };

  const handleSave = () => {
    if (cjInfo || localStorage.getItem(storageName)) {
      localStorage.setItem(storageName, JSON.stringify(cjInfo));
    }
  };

  const handleDelete = () => {
    setCjInfo(initialState);
    localStorage.removeItem(storageName);
  };

  const handleShow = () => {
    setShow(!show);
  };

  return (
    <Box>
      <Heading>{networkName}</Heading>

      <FormControl>
        <Text>TOKEN:</Text>
        <InputGroup>
          <Input
            onChange={handleInputChange}
            type={show ? "text" : "password"}
            placeholder="Enter token"
            value={cjInfo["token"]}
            data-name="token"
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleShow}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
        <Box>
          <Text>Requestor id:</Text>

          <Input
            onChange={handleInputChange}
            type="text"
            placeholder="Enter requestor id"
            value={cjInfo["requestorId"]}
            data-name="requestorId"
          />
        </Box>
        <Box>
          <Text>website id:</Text>

          <Input
            onChange={handleInputChange}
            type="text"
            placeholder="Enter website id"
            value={cjInfo["websiteId"]}
            data-name="websiteId"
          />
        </Box>
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
