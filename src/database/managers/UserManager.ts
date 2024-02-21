import { User } from "../../types/database.js";
import BaseManager from "../BaseManager.js";

class UserManager extends BaseManager<User> {
	public constructor(mysql: BaseManager.MySql) {
		super("users", mysql);
	}
}

export default UserManager;
