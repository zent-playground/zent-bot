import {} from "discord.js";
import { PermissionFlagsBits } from "discord-api-types/v10";

import Component from "../../Component.js";
import { TempVoiceCreator } from "../../../types/database.js";

class TempVoice extends Component {
	public constructor() {
		super("voice", {
			memberPermissions: PermissionFlagsBits.ManageChannels,
		});
	}

	public override async execute(
		interaction: Component.Modal,
		args: Component.Args,
	): Promise<void> {
		const [choice, id] = args.references!;

		const name = interaction.fields.getTextInputValue("name");
		let limit: string | number | undefined = interaction.fields.fields.get("limit")?.value;
		const values: Partial<TempVoiceCreator> = {};

		switch (choice) {
			case "generic":
				if (limit) {
					if (isNaN(Number(limit))) {
						return;
					}

					limit = Number(limit);

					if (limit < 1 || limit > 99) {
						return;
					}

					values.generic_limit = limit;
				}

				await this.client.managers.voices.creators.upd(
					{ id: id, guild_id: interaction.guild!.id },
					{
						generic_name: name,
						...values,
					},
				);

				break;
			case "affix":
				await this.client.managers.voices.creators.upd(
					{ id: id, guild_id: interaction.guild!.id },
					{ affix: name },
				);

				break;
		}
	}
}

export default TempVoice;
