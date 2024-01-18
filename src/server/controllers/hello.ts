import { Controller, Get, Req } from "@nestjs/common";
import { Request } from "express";

@Controller("hello")
class Hello {
	@Get()
	hello(@Req() request: Request) {
		console.log(request.query);
		return "Hello world";
	}
}

export default Hello;
