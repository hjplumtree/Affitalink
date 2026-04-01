import { useEffect } from "react";
import { Center, Spinner, Text, VStack } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useAuth } from "./AuthProvider";

export default function RequireAuth({ children }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading || user) return;
    router.replace(`/login?next=${encodeURIComponent(router.asPath)}`);
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <Center minH="60vh">
        <VStack spacing={3}>
          <Spinner />
          <Text color="gray.600">Checking your session…</Text>
        </VStack>
      </Center>
    );
  }

  return children;
}

