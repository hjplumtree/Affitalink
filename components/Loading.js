import { Modal, ModalOverlay, ModalContent, Spinner } from "@chakra-ui/react";

export default function Loading({ loading }) {
  return (
    <Modal isOpen={loading} isCentered>
      <ModalOverlay />
      <ModalContent width="fit-content" bg="transparent" boxShadow="none">
        <Spinner thickness="3px" speed="0.7s" color="purple.700" size="xl" />
      </ModalContent>
    </Modal>
  );
}
