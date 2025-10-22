import { signAccessJwt, verifyPassword } from "../../../utils/crypto.js";
import { getUserByEmail } from "../../repositories/authRepository/authRepo.js"

export default async function loginUsecase(email, password) {

    if (!email || !password) {
        return {
            ok: false,
            status: 400,
            message: "Email and password are required"
        }
    }

    const { data, error } = await getUserByEmail(email);

    console.log("Fetched user:", data);

    if (error || !data) {
        return {
            ok: false,
            status: 404,
            message: "User not found"
        }
    }

    const isPasswordValid = await verifyPassword(password, data.user_password);

    console.log("Password valid:", isPasswordValid);

    if (!isPasswordValid) {
        return {
            ok: false,
            status: 401,
            message: "Invalid login credentials"
        }
    }

    const userPayload = { uid: data.user_id, email: data.user_email_address, role: data.user_role, name: data.user_first_name };
    const accessToken = signAccessJwt(userPayload, '1h');

    if (!accessToken) {
        return {
            ok: false,
            status: 500,
            message: "Something went wrong, Please try again later"
        }
    }

    return {
        ok: true,
        status: 200,
        message: "Login successful",
        data: {
            role: data.user_role,
            accessToken
        }
    }
}