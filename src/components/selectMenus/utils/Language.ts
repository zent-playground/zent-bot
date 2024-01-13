import Component from "../../Component.js";
import { PermissionFlagsBits } from "discord-api-types/v10";

export default class extends Component {
	public constructor() {
		super("language", {
			memberPermissions: [PermissionFlagsBits.ManageGuild],
		});
	}
}
