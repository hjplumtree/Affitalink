import { Link as ChakraLink } from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function RouterLink({ to, children, ...props }) {
  const router = useRouter();
  const isActive = router.pathname === to;
  const { color, _hover, ...rest } = props;
  const styles = {
    padding: 3,
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    gap: 3,
    fontWeight: "600",
    transition: "all 180ms ease",
    ...rest,
  };

  if (isActive) {
    return (
      <Link href={to} passHref>
        <ChakraLink
          {...styles}
          bg="rgba(139, 77, 255, 0.16)"
          color={color || "ink.900"}
          border="1px solid rgba(139, 77, 255, 0.28)"
          boxShadow="0 14px 32px rgba(139, 77, 255, 0.14)"
        >
          {children}
        </ChakraLink>
      </Link>
    );
  }

  return (
    <Link href={to} passHref>
      <ChakraLink
        {...styles}
        color={color || "ink.700"}
        _hover={{ bg: "rgba(15,17,23,0.04)", transform: "translateY(-1px)", ..._hover }}
      >
        {children}
      </ChakraLink>
    </Link>
  );
}
