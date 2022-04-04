import { Flex } from "@chakra-ui/react";
import RouterLink from "./RouterLink";

export default function Navigator() {
  const menus = [
    { name: "Home", to: "/" },
    { name: "Network Sites", to: "/networks" },
    { name: "Connect Network", to: "/networks/add" },
    { name: "Links", to: "/links" },
  ];

  return (
    <Flex direction="column">
      {menus.map((menu) => (
        <RouterLink to={menu.to} key={menu.name}>
          {menu.name}
        </RouterLink>
      ))}
    </Flex>
  );
}
