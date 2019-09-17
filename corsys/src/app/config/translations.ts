import { OpaqueToken } from '@angular/core';

// import translations
import { LANG_EN_NAME, LANG_EN_TRANS } from '../config/translate-en';
import { LANG_FR_NAME, LANG_FR_TRANS } from '../config/translate-fr';
import { LANG_DE_NAME, LANG_DE_TRANS } from '../config/translate-de';

// translation token
export const TRANSLATIONS = new OpaqueToken('translations');

// all traslations
export const dictionary = {
	[LANG_EN_NAME]: LANG_EN_TRANS,
	[LANG_FR_NAME]: LANG_FR_TRANS,
	[LANG_DE_NAME]: LANG_DE_TRANS
};

// providers
export const TRANSLATION_PROVIDERS = [
	{ provide: TRANSLATIONS, useValue: dictionary },
];
