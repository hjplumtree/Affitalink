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
          bg="linear-gradient(135deg, rgba(255, 66, 122, 0.18), rgba(28, 216, 231, 0.16))"
          color="ink.900"
          border="1px solid rgba(255, 66, 122, 0.22)"
        >
          {children}
        </ChakraLink>
      </Link>
    );
  }

  return (
    <Link href={to} passHref>
      <ChakraLink {...styles} color="ink.700" _hover={{ bg: "rgba(15,17,23,0.04)" }}>
        {children}
      </ChakraLink>
    </Link>
  );
}
