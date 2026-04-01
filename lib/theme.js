import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  fonts: {
    heading: "'Space Grotesk', 'Avenir Next', 'Segoe UI', sans-serif",
    body: "'Plus Jakarta Sans', 'Avenir Next', 'Segoe UI', sans-serif",
  },
  colors: {
    brand: {
      50: "#fff0f4",
      100: "#ffd7e2",
      200: "#ffadc4",
      300: "#ff759d",
      400: "#ff427a",
      500: "#f51660",
      600: "#cb0c4a",
      700: "#9d0738",
      800: "#700326",
      900: "#470117",
    },
    aqua: {
      50: "#ecffff",
      100: "#cdfcfd",
      200: "#9cf7fa",
      300: "#63edf4",
      400: "#1cd8e7",
      500: "#0ab2c6",
      600: "#08889b",
      700: "#0d6874",
      800: "#104d56",
      900: "#10363c",
    },
    lime: {
      50: "#f7ffe7",
      100: "#ebffbd",
      200: "#dcff8b",
      300: "#c6f95a",
      400: "#ace82c",
      500: "#89c514",
      600: "#69980f",
      700: "#4f720f",
      800: "#38510d",
      900: "#253608",
    },
    ink: {
      50: "#f7f7fa",
      100: "#ebecf1",
      200: "#d6d8e2",
      300: "#b1b5c8",
      400: "#8a91a8",
      500: "#6c7389",
      600: "#4f5569",
      700: "#363b4b",
      800: "#1e2230",
      900: "#0f1117",
    },
  },
  styles: {
    global: {
      "html, body": {
        bg: "radial-gradient(circle at top left, #fff1f5 0%, #ffffff 30%, #eefcff 65%, #f8fff1 100%)",
        color: "ink.900",
      },
      body: {
        minHeight: "100vh",
      },
      "::selection": {
        bg: "brand.200",
        color: "#0f1117",
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: "999px",
        fontWeight: "700",
        letterSpacing: "-0.01em",
      },
      variants: {
        solid: {
          bg: "ink.900",
          color: "white",
          boxShadow: "0 10px 24px rgba(15, 17, 23, 0.18)",
          _hover: { bg: "#1b1f2a", transform: "translateY(-1px)" },
          _active: { bg: "#0f1117", transform: "translateY(0)" },
        },
        outline: {
          borderColor: "rgba(15, 17, 23, 0.14)",
          color: "ink.800",
          bg: "rgba(255,255,255,0.74)",
          _hover: { bg: "white" },
        },
        ghost: {
          color: "ink.700",
          _hover: { bg: "rgba(15, 17, 23, 0.05)" },
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
            borderColor: "rgba(15, 17, 23, 0.12)",
            bg: "whiteAlpha.900",
            borderRadius: "18px",
            _hover: { borderColor: "rgba(15, 17, 23, 0.24)" },
            _focusVisible: {
              borderColor: "brand.400",
              boxShadow: "0 0 0 2px rgba(255, 66, 122, 0.28)",
            },
          },
        },
      },
    },
    Select: {
      variants: {
        outline: {
          field: {
            borderColor: "rgba(15, 17, 23, 0.12)",
            bg: "whiteAlpha.900",
            _hover: { borderColor: "rgba(15, 17, 23, 0.24)" },
            _focusVisible: {
              borderColor: "brand.400",
              boxShadow: "0 0 0 2px rgba(255, 66, 122, 0.28)",
            },
          },
        },
      },
    },
    Textarea: {
      variants: {
        outline: {
          borderColor: "rgba(15, 17, 23, 0.12)",
          bg: "whiteAlpha.900",
        },
      },
    },
  },
});

export default theme;
