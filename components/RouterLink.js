import { Link as ChakraLink } from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function RouterLink({ to, children, ...props }) {
  const router = useRouter();
  const isActive = router.pathname === to;
  const styles = {
    padding: "5px",
  };

  if (isActive) {
    return (
      <Link href={to} passHref>
        <ChakraLink bg="yellow">{children}</ChakraLink>
      </Link>
    );
  }

  return (
    <Link href={to} passHref>
      <ChakraLink>{children}</ChakraLink>
    </Link>
  );
}
