import { cspellConfig } from '@kitschpatrol/cspell-config'

export default cspellConfig({
	ignorePaths: ['**/changelog.md'],
	import: ['@kitschpatrol/cspell-config', '@kitschpatrol/dict-en-wiktionary/cspell-ext.json'],
	words: ['chagent', 'cherryd', 'Nominatim'],
})
