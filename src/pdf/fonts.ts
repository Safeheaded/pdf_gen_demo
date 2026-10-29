import { Font } from '@react-pdf/renderer';

export const PDF_FONT = 'Roboto';

export const registerFonts = (baseUrl: string): void => {
  Font.register({
    family: PDF_FONT,
    fonts: [
      { src: `${baseUrl}Roboto-Regular.ttf`, fontWeight: 400 },
      { src: `${baseUrl}Roboto-Bold.ttf`, fontWeight: 700 },
    ],
  });
  Font.registerHyphenationCallback((word) => [word]);
};
