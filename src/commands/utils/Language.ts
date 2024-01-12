import { SlashCommandBuilder } from "discord.js";
import Command from "../Command.js";
import i18next from "i18next";

class Language extends Command {
	public constructor() {
		super({
			name: "language",
			description: "Language.",
			aliases: ["lang"],
		});
	}

	public initialize() {
		this.applicationCommands.push(
			new SlashCommandBuilder()
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption((option) =>
					option.setName("language").setDescription("Language to set."),
				)
				.toJSON(),
		);
	}

	public async executeHybrid(ctx: Command.HybridContext, args: Command.Args) {
		const { guilds } = this.client.managers;

		const languageToSet = (
			args.entries[0] || ctx.interaction?.options.getString("language")
		)
			?.split(/ +/g)[0]
			.toLowerCase();

		if (languageToSet && ctx.member.permissions.has("ManageGuild")) {
			if (!(i18next.options.preload as string[])?.includes(languageToSet)) {
				await ctx.send({
					content: i18next.t(
						"commands.language.messages.unsupported_language",
						{ lng: args.language },
					),
					ephemeral: true,
				});

				return;
			}

			await guilds.update(ctx.guild.id, { language: languageToSet });

			await ctx.send({
				content: i18next.t("commands.language.messages.set_language", {
					lng: languageToSet,
				}),
			});
		} else {
			await ctx.send({
				content: i18next.t("commands.language.messages.current_language", {
					lng: args.language,
				}),
			});
		}
	}
}

export default Language;
