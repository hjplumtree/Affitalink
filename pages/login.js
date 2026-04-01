import { useState } from "react";
import { useRouter } from "next/router";
import {
  Alert,
  AlertIcon,
  Button,
  Box,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
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
      <SectionBox>
        <Header
          eyebrow="Authentication"
          title="Sign in to the workspace"
          subtitle="Use your Supabase account so the API can resolve your workspace membership and keep every review action scoped correctly."
        />
      </SectionBox>
      <SectionBox>
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
            <Alert status="error" borderRadius={8}>
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
          <Button onClick={handleSubmit} isLoading={loading}>
            {mode === "sign_in" ? "Sign in" : "Create account"}
          </Button>
          <Box>
            <Text fontSize="sm" color="ink.600">
              {mode === "sign_in"
                ? "Need an account? Switch to create account."
                : "Already have an account? Switch back to sign in."}
            </Text>
          </Box>
        </Stack>
      </SectionBox>
    </VStack>
  );
}
