import { ERROR, fail, okay } from "../../../libs/response.js";
import { setAccessTokenCookie } from "../../../utils/cookies.js";
import loginUsecase from "../../usecase/authUsecase/loginUsecase.js";

export default async function loginController(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return fail(res, "Email and password are required", 400);
        }

        console.log("Login attempt for email:", email);

        const { data, ok, status, message } = await loginUsecase(email, password);

        if (!ok) {
            console.log("Login failed:", message);
            return fail(res, message, status);
        }

        console.log("Login successful for email:", email);

        setAccessTokenCookie(res, data.accessToken);

        return okay(res, { role: data.role }, "Login successful", 200);

    } catch (error) {
        console.error("Error during login:", error);
        return fail(res, message || "Internal Server Error", 500);
    }
}