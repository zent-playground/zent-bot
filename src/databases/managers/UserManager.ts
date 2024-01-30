import { User } from "../../types/database.js";
import BaseManager from "../BaseManager.js";

class UserManager extends BaseManager<User> {
	public constructor(mysql: BaseManager.MySql, redis: BaseManager.Redis) {
		super("users", mysql, redis);
	}
}

export default UserManager;
