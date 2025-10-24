import { Router } from "express";
import { sendResponse, SUCCESS } from "../../libs/response.js";
import { _get_user_card_details, _insert_new_user_card } from "../controller/userCard/userCard.controller.js";

const user_card_router = Router();

user_card_router.get('/health', (req, res) => {
    return sendResponse(res, 200, SUCCESS( 'User Card Details API is healthy' ));
});

user_card_router.get('/details/:user_id', _get_user_card_details);
user_card_router.post('/add-new', _insert_new_user_card);

export default user_card_router;