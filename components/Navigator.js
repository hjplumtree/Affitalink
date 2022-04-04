import { VStack } from "@chakra-ui/react";
import RouterLink from "./RouterLink";
import { createElement } from "react";

export default function Navigator() {
  const menus = [
    { name: "Home", to: "/", icon: "LinkIcon" },
    { name: "Network Sites", to: "/networks", icon: "LinkIcon" },
    { name: "Connect Network", to: "/networks/add", icon: "LinkIcon" },
    { name: "Links", to: "/links", icon: "LinkIcon" },
  ];

  return (
    <VStack outline="none" p={3} align="stretch" spacing={3}>
      {menus.map((menu) => (
        <RouterLink to={menu.to} key={menu.name}>
          {menu.name}
        </RouterLink>
      ))}
    </VStack>
  );
}
