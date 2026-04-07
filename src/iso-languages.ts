/**
 * ISO 639-1 language list with flag emoji icons.
 * Used by the admin UI for the language picker.
 */

export interface ISOLanguage {
  code: string;
  label: string;
  icon: string;
}

export const ISO_LANGUAGES: ISOLanguage[] = [
  { code: "en", label: "English", icon: "🇬🇧" },
  { code: "es", label: "Spanish", icon: "🇪🇸" },
  { code: "fr", label: "French", icon: "🇫🇷" },
  { code: "de", label: "German", icon: "🇩🇪" },
  { code: "it", label: "Italian", icon: "🇮🇹" },
  { code: "pt", label: "Portuguese", icon: "🇵🇹" },
  { code: "nl", label: "Dutch", icon: "🇳🇱" },
  { code: "ru", label: "Russian", icon: "🇷🇺" },
  { code: "zh", label: "Chinese", icon: "🇨🇳" },
  { code: "ja", label: "Japanese", icon: "🇯🇵" },
  { code: "ko", label: "Korean", icon: "🇰🇷" },
  { code: "ar", label: "Arabic", icon: "🇸🇦" },
  { code: "hi", label: "Hindi", icon: "🇮🇳" },
  { code: "bn", label: "Bengali", icon: "🇧🇩" },
  { code: "pl", label: "Polish", icon: "🇵🇱" },
  { code: "uk", label: "Ukrainian", icon: "🇺🇦" },
  { code: "cs", label: "Czech", icon: "🇨🇿" },
  { code: "sv", label: "Swedish", icon: "🇸🇪" },
  { code: "da", label: "Danish", icon: "🇩🇰" },
  { code: "fi", label: "Finnish", icon: "🇫🇮" },
  { code: "no", label: "Norwegian", icon: "🇳🇴" },
  { code: "el", label: "Greek", icon: "🇬🇷" },
  { code: "tr", label: "Turkish", icon: "🇹🇷" },
  { code: "th", label: "Thai", icon: "🇹🇭" },
  { code: "vi", label: "Vietnamese", icon: "🇻🇳" },
  { code: "id", label: "Indonesian", icon: "🇮🇩" },
  { code: "ms", label: "Malay", icon: "🇲🇾" },
  { code: "he", label: "Hebrew", icon: "🇮🇱" },
  { code: "fa", label: "Persian", icon: "🇮🇷" },
  { code: "ro", label: "Romanian", icon: "🇷🇴" },
  { code: "hu", label: "Hungarian", icon: "🇭🇺" },
  { code: "bg", label: "Bulgarian", icon: "🇧🇬" },
  { code: "hr", label: "Croatian", icon: "🇭🇷" },
  { code: "sk", label: "Slovak", icon: "🇸🇰" },
  { code: "sl", label: "Slovenian", icon: "🇸🇮" },
  { code: "sr", label: "Serbian", icon: "🇷🇸" },
  { code: "lt", label: "Lithuanian", icon: "🇱🇹" },
  { code: "lv", label: "Latvian", icon: "🇱🇻" },
  { code: "et", label: "Estonian", icon: "🇪🇪" },
  { code: "ca", label: "Catalan", icon: "🏴" },
  { code: "gl", label: "Galician", icon: "🏴" },
  { code: "eu", label: "Basque", icon: "🏴" },
  { code: "af", label: "Afrikaans", icon: "🇿🇦" },
  { code: "sw", label: "Swahili", icon: "🇰🇪" },
  { code: "tl", label: "Filipino", icon: "🇵🇭" },
  { code: "ur", label: "Urdu", icon: "🇵🇰" },
  { code: "ta", label: "Tamil", icon: "🇮🇳" },
  { code: "ml", label: "Malayalam", icon: "🇮🇳" },
  { code: "te", label: "Telugu", icon: "🇮🇳" },
];
