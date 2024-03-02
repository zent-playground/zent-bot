import { Client } from "discord.js";

import { User } from "../../types/database.js";
import BaseManager from "../BaseManager.js";

class UserManager extends BaseManager<User> {
	public constructor(client: Client) {
		super(client, "users");
	}

	public async get(id: string) {
		return await super._get({ id });
	}

	public async delete(id: string) {
		return await super._del({ id });
	}

	public async set(id: string, values: Partial<User> = {}) {
		return await super._set({ id }, values);
	}

	public async update(id: string, values: Partial<User> = {}) {
		return await super._upd({ id }, values);
	}
}

export default UserManager;
