import { black, green, grey, red, white, cyan, magenta } from './colors'

const theme = {
  borderRadius: 12,
  breakpoints: {
    mobile: 400,
  },
  color: {
    black,
    grey,
    cyan,
    magenta,
    primary: {
      light: red[200],
      main: black,
      accent: magenta,
    },
    secondary: {
      main: green[500],
    },
    white,
  },
  siteWidth: 1200,
  spacing: {
    1: 4,
    2: 8,
    3: 16,
    4: 24,
    5: 32,
    6: 48,
    7: 64,
  },
  topBarSize: 72
}

export default theme