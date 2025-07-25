import { createGlobalStyle } from "styled-components";
import { theme } from "./theme";

export const GlobalStyle = createGlobalStyle`
  /* Yeni fontlar: Plus Jakarta Sans (başlık) ve Figtree (gövde) */
  @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600&family=Plus+Jakarta+Sans:wght@700;800&display=swap');

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
    font-family: ${theme.fonts.heading};
    color: ${theme.colors.text};
    font-weight: 800; /* Daha belirgin başlıklar */
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
