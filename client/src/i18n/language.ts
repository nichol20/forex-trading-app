export enum LanguageCode {
    PT_BR = "pt-BR",
    ES_PE = "es-PE",
    EN_US = "en-US",
    // JA_JP = "ja-JP"
}

export interface Language {
  code: LanguageCode;
  name: {
    [code in LanguageCode]: string;
  };
}

export type Languages = Language[];

export const supportedLngs: Languages = [
    {
      code: LanguageCode.EN_US,
      name: {
        "pt-BR": "Inglês",
        "en-US": "English",
        // "ja-JP": "英語",
        "es-PE": "Inglés"
      },
    },
    {
      code: LanguageCode.PT_BR,
      name: {
        "pt-BR": "Português",
        "en-US": "Portuguese",
        // "ja-JP": "ポルトガル語",
        "es-PE": "Portugués"
      },
    },
    // {
    //   code: LanguageCode.JA_JP,
    //   name: {
    //     "pt-BR": "Japonês",
    //     "en-US": "Japanese",
    //     "ja-JP": "日本語",
    //     "es-PE": ""
    //   },
    // },
    {
      code: LanguageCode.ES_PE,
      name: {
        "pt-BR": "Espanhol",
        "en-US": "Spanish",
        // "ja-JP": "",
        "es-PE": "Español"
      },
    },
];