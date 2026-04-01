import { useState } from "react";
import { useRouter } from "next/router";
import { Alert, AlertIcon, Button, Box, FormControl, FormLabel, HStack, Input, Stack, Text, VStack, SimpleGrid, Grid } from "@chakra-ui/react";
import SectionBox from "../components/SectionBox";
import { useAuth } from "../components/AuthProvider";
import Header from "../components/Header";

export default function LoginPage() {
  const router = useRouter();
  const { supabase } = useAuth();
  const [mode, setMode] = useState("sign_in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const next = typeof router.query.next === "string" ? router.query.next : "/links";

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response =
        mode === "sign_in"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password });

      if (response.error) {
        throw response.error;
      }

      if (mode === "sign_up") {
        setMessage("Account created. If email confirmation is enabled, verify first.");
      } else {
        router.replace(next);
      }
    } catch (nextError) {
      setError(nextError.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack align="stretch" spacing={5}>
      <SectionBox bg="rgba(255,255,255,0.98)">
        <Header
          eyebrow="Authentication"
          title="Sign in to your workspace"
          subtitle="Use your account to open the review queue and manage source settings for this workspace."
        />
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3} mt={7}>
          <Box p={4} borderRadius="20px" bg="rgba(15,17,23,0.04)">
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="brand.500">
              Fast
            </Text>
            <Text mt={2} fontSize="sm" color="ink.700">
              Log in, land in the queue, move through decisions.
            </Text>
          </Box>
          <Box p={4} borderRadius="20px" bg="rgba(15,17,23,0.04)">
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="brand.500">
              Scoped
            </Text>
            <Text mt={2} fontSize="sm" color="ink.700">
              Membership decides which workspace and APIs you can touch.
            </Text>
          </Box>
          <Box p={4} borderRadius="20px" bg="rgba(15,17,23,0.04)">
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="lime.700">
              Safe
            </Text>
            <Text mt={2} fontSize="sm" color="ink.700">
              Review actions stay tied to the right workspace, not browser-local guesswork.
            </Text>
          </Box>
        </SimpleGrid>
      </SectionBox>
      <SectionBox bg="rgba(255,255,255,0.98)">
        <Grid templateColumns={{ base: "1fr", lg: "0.9fr 1.1fr" }} gap={6}>
          <Box
            p={{ base: 5, lg: 6 }}
            borderRadius="28px"
            bg="#11141d"
            color="white"
          >
            <Text fontSize="11px" letterSpacing="0.22em" textTransform="uppercase" color="whiteAlpha.600">
              Access
            </Text>
            <VStack align="stretch" spacing={4} mt={4}>
              <Box>
                <Text fontWeight="700">Auth decides API access</Text>
                <Text fontSize="sm" color="whiteAlpha.700" mt={1}>
                  Queue actions and connector writes are tied to the signed-in workspace.
                </Text>
              </Box>
              <Box>
                <Text fontWeight="700">One user, one clear scope</Text>
                <Text fontSize="sm" color="whiteAlpha.700" mt={1}>
                  This is an operations tool, not a public landing page with vague states.
                </Text>
              </Box>
              <Box>
                <Text fontWeight="700">No extra steps</Text>
                <Text fontSize="sm" color="whiteAlpha.700" mt={1}>
                  Sign in and get back to work.
                </Text>
              </Box>
            </VStack>
          </Box>
          <Stack spacing={5}>
            <HStack spacing={2}>
            <Button
              variant={mode === "sign_in" ? "solid" : "outline"}
              onClick={() => setMode("sign_in")}
            >
              Sign in
            </Button>
            <Button
              variant={mode === "sign_up" ? "solid" : "outline"}
              onClick={() => setMode("sign_up")}
            >
              Create account
            </Button>
            </HStack>
            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input value={email} onChange={(event) => setEmail(event.target.value)} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </FormControl>
            {error ? (
              <Alert status="error" borderRadius={18}>
                <AlertIcon />
                {error}
              </Alert>
            ) : null}
            {message ? (
              <Alert status="success" borderRadius={18}>
                <AlertIcon />
                {message}
              </Alert>
            ) : null}
            <Button onClick={handleSubmit} isLoading={loading} variant="accent">
              {mode === "sign_in" ? "Enter workspace" : "Create account"}
            </Button>
            <Box>
              <Text fontSize="sm" color="ink.600">
                {mode === "sign_in"
                  ? "Need an account? Switch to create account."
                  : "Already have an account? Switch back to sign in."}
              </Text>
            </Box>
          </Stack>
        </Grid>
      </SectionBox>
    </VStack>
  );
}
