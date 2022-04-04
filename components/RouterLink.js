import { Link as ChakraLink } from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function RouterLink({ to, children, ...props }) {
  const router = useRouter();
  const isActive = router.pathname === to;
  const styles = {
    padding: 2,
    borderRadius: 5,
  };

  if (isActive) {
    return (
      <Link href={to} passHref>
        <ChakraLink {...styles} bg="#4895EF" color="#fff">
          {children}
        </ChakraLink>
      </Link>
    );
  }

  return (
    <Link href={to} passHref>
      <ChakraLink {...styles}>{children}</ChakraLink>
    </Link>
  );
}
