import { Link as ChakraLink } from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function RouterLink({ to, children, ...props }) {
  const router = useRouter();
  const isActive = router.pathname === to;
  const styles = {
    padding: 3,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    gap: 3,
    fontWeight: "600",
    ...props,
  };

  if (isActive) {
    return (
      <Link href={to} passHref>
        <ChakraLink
          {...styles}
          bg="rgba(31, 106, 91, 0.12)"
          color="brand.800"
          border="1px solid rgba(31, 106, 91, 0.16)"
        >
          {children}
        </ChakraLink>
      </Link>
    );
  }

  return (
    <Link href={to} passHref>
      <ChakraLink {...styles} color="ink.700" _hover={{ bg: "rgba(255,255,255,0.72)" }}>
        {children}
      </ChakraLink>
    </Link>
  );
}
