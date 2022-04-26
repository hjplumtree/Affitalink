import { useEffect, useState, useRef } from "react";
import { fecthAdvertisers } from "../lib/fetch";
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
import Loading from "./Loading";
import Header from "./Header";
export default function NetworkInput({
  networkName,
  storageName,
  deleteLocal,
  setAdvertisers,
  saveAuthToDB,
  auth,
  setAuth,
  advertisers_initialState,
}) {
  const [show, setShow] = useState(false);
  const [inputError, setInputError] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  useEffect(() => {
    if (validate(inputs)) {
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

  const validate = (arr) => {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i][1] === "") {
        return false;
      }
    }
    return true;
  };

  const handleConnect = () => {
    if (validate(inputs)) {
      setLoading(true);
      setInputError(false);

      fecthAdvertisers({ network: storageName, info: auth }).then((data) => {
        setAdvertisers(data);
        setLoading(false);
      });
    } else {
      setInputError(true);
    }
  };

  const handleDelete = () => {
    deleteLocal();
    setAdvertisers(advertisers_initialState);
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
          <Alert status="warning" borderRadius={5}>
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
      <Loading loading={loading} />
    </SectionBox>
  );
}
