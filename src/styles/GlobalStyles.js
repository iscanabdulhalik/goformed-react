import { createGlobalStyle } from "styled-components";
import { theme } from "./theme";

export const GlobalStyle = createGlobalStyle`
  /* Google Fonts'tan Poppins, Inter ve yeni Lora fontunu ekliyoruz */
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Lora:wght@600;700&family=Poppins:wght@600;700;800&display=swap');

  html {
    scroll-behavior: smooth;
  }

  body {
    font-family: ${theme.fonts.body};
    background-color: ${theme.colors.background};
    color: ${theme.colors.text};
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }

  /* Başlıklar için yeni zarif fontumuzu atıyoruz */
  h1, h2, h3, h4, h5, h6 {
    font-family: 'Lora', serif;
    color: ${theme.colors.text};
    font-weight: 700;
  }
  h1 { font-size: ${theme.fontSizes.h1}; }
  h2 { font-size: ${theme.fontSizes.h2}; }
  h3 { font-size: ${theme.fontSizes.h3}; }

  a {
    text-decoration: none;
    color: inherit;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
`;
