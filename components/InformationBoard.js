import { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  ButtonGroup,
  VStack,
  FormControl,
} from "@chakra-ui/react";

export default function Token({
  cjInfo,
  setCjInfo,
  networkName,
  storageName,
  initialState,
}) {
  const [show, setShow] = useState(false);

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
            required
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
          <Button variant="outline" colorScheme="red" onClick={handleDelete}>
            Delete
          </Button>
        </VStack>
      </FormControl>
    </Box>
  );
}
