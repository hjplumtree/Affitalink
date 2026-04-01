import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  fonts: {
    heading: "'IBM Plex Sans', 'Avenir Next', 'Segoe UI', sans-serif",
    body: "'IBM Plex Sans', 'Avenir Next', 'Segoe UI', sans-serif",
  },
  colors: {
    brand: {
      50: "#edf7f4",
      100: "#d7ebe4",
      200: "#b1d5ca",
      300: "#86bcad",
      400: "#4f9887",
      500: "#1f6a5b",
      600: "#175346",
      700: "#133f36",
      800: "#102f29",
      900: "#0d231e",
    },
    ink: {
      50: "#f5f7f8",
      100: "#e6ebee",
      200: "#cad3da",
      300: "#a6b4bf",
      400: "#708190",
      500: "#4f6070",
      600: "#36424e",
      700: "#27313a",
      800: "#1b222a",
      900: "#12181f",
    },
    sand: {
      50: "#fcfbf8",
      100: "#f6f1e8",
      200: "#eadfce",
      300: "#dcc8ab",
      400: "#c4a780",
      500: "#a27f5a",
      600: "#836447",
      700: "#674d37",
      800: "#4a3727",
      900: "#32251c",
    },
  },
  styles: {
    global: {
      "html, body": {
        bg: "linear-gradient(180deg, #f8f4ed 0%, #f1ece2 100%)",
        color: "ink.900",
      },
      body: {
        minHeight: "100vh",
      },
      "::selection": {
        bg: "brand.200",
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: "999px",
        fontWeight: "600",
      },
      variants: {
        solid: {
          bg: "brand.600",
          color: "white",
          _hover: { bg: "brand.700" },
          _active: { bg: "brand.800" },
        },
        outline: {
          borderColor: "ink.200",
          color: "ink.800",
          _hover: { bg: "whiteAlpha.700" },
        },
        ghost: {
          color: "ink.700",
          _hover: { bg: "whiteAlpha.700" },
        },
      },
      defaultProps: {
        variant: "solid",
      },
    },
    Input: {
      variants: {
        outline: {
          field: {
            borderColor: "sand.200",
            bg: "whiteAlpha.900",
            _hover: { borderColor: "sand.300" },
            _focusVisible: {
              borderColor: "brand.500",
              boxShadow: "0 0 0 1px #1f6a5b",
            },
          },
        },
      },
    },
    Select: {
      variants: {
        outline: {
          field: {
            borderColor: "sand.200",
            bg: "whiteAlpha.900",
            _hover: { borderColor: "sand.300" },
            _focusVisible: {
              borderColor: "brand.500",
              boxShadow: "0 0 0 1px #1f6a5b",
            },
          },
        },
      },
    },
    Textarea: {
      variants: {
        outline: {
          borderColor: "sand.200",
          bg: "whiteAlpha.900",
        },
      },
    },
  },
});

export default theme;
