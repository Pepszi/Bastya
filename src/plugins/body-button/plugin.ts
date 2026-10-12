/** Adds a button block to the portable text editor used by the Leírás field. */

import { definePlugin } from 'emdash';

export function createPlugin() {
	return definePlugin({
		id: 'body-button',
		version: '1.0.0',
		admin: {
			portableTextBlocks: [
				{
					type: 'button',
					label: 'Gomb',
					icon: 'link',
					description: 'Gomb a leírás szövegében',
					category: 'Tartalom',
					fields: [
						{ type: 'text_input', action_id: 'text', label: 'Felirat' },
						{
							type: 'text_input',
							action_id: 'url',
							label: 'Link',
							placeholder: 'https://',
						},
						{
							type: 'select',
							action_id: 'variant',
							label: 'Változat',
							initial_value: 'primary',
							options: [
								{ label: 'Elsődleges', value: 'primary' },
								{ label: 'Másodlagos', value: 'secondary-accent' },
								{ label: 'Másodlagos fehér', value: 'secondary-white' },
							],
						},
						{ type: 'toggle', action_id: 'blank', label: 'Új lapon nyílik' },
					],
				},
			],
		},
	});
}
