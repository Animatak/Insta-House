/** @format */

const GameCulture = new NativeClass('Terraria.Localization', 'GameCulture');

 /*
 * I made this system to translate for all players.
 * I like to do things well to please everyone ^^
 */

const translations = {
	Portuguese: {
		wrongUsageItem: 'Não é possível construir aqui.\nO espaço está inválido devido à presença de blocos.'
	},
	Spanish: {
		wrongUsageItem: 'No se puede construir aquí.\nEl espacio es inválido debido a la presencia de bloques.'
	},
	Italian: {
		wrongUsageItem: 'Impossibile costruire qui.\nLo spazio è invalido a causa della presenza di blocchi.'
	},
	French: {
		wrongUsageItem: "Impossible de construire ici.\nL'espace est invalide en raison de la présence de blocs."
	},
	German: {
		wrongUsageItem: 'Kann hier nicht bauen.\nDer Platz ist ungültig aufgrund der Blockierung.'
	},
	Russian: {
		wrongUsageItem: 'Невозможно построить здесь.\nПространство недействительно из-за наличия блоков.'
	},
	Default: {
		wrongUsageItem: 'Cannot build here.\nThe space is invalid due to the presence of blocks.'
	}
};

function getCurrentCulture() {
	const cultures = GameCulture.CultureName;
	for (let cultureName in cultures) {
		if (GameCulture.FromCultureName(cultures[cultureName]).IsActive) {
			return cultureName;
		}
	}
	return 'Default';
}

const translate = {
	wrongUsageItem() {
		const culture = getCurrentCulture();
		return translations[culture]?.wrongUsageItem || translations.Default.wrongUsageItem;
	}
};

export { translate };
