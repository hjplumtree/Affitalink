import { Modal, ModalOverlay, ModalContent, Spinner } from "@chakra-ui/react";

export default function Loading({ loading }) {
  return (
    <Modal isOpen={loading} isCentered>
      <ModalOverlay bg="rgba(15, 17, 23, 0.16)" backdropFilter="blur(8px)" />
      <ModalContent width="fit-content" bg="transparent" boxShadow="none">
        <Spinner thickness="3px" speed="0.7s" color="brand.500" size="xl" />
      </ModalContent>
    </Modal>
  );
}
