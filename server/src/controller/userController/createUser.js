import { okay, fail } from '../../../libs/response.js';
import createUserUsecase from '../../usecase/userUsecase/createUserUsecase.js';

export default async function createUser(req, res) {
    try {

        console.log('createUser controller invoked with body:', req.body);
        const { ok, status, message, data, errors } = await createUserUsecase(req.body);

        if (!ok) {
            // structured validation or conflict errors
            return fail(res, message, status, errors ? { fields: errors } : {});
        }

        return okay(res, data, message, status);
    } catch (err) {
        console.error('createUser controller error:', err);
        return fail(res, 'Internal Server Error', 500);
    }
}
