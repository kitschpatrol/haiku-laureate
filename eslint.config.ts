import { eslintConfig } from '@kitschpatrol/eslint-config'

export default eslintConfig(
	{
		ts: {
			overrides: {
				'depend/ban-dependencies': [
					'error',
					{
						allowed: ['lodash', 'dotenv'],
					},
				],
			},
		},
		type: 'lib',
	},
	{
		files: ['readme.md/*.ts'],
		rules: {
			'import/no-unresolved': 'off',
		},
	},
)
