import express from 'express';
import { allUsers, authUser, registerUser } from '../controllers/user.contoller';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').post(registerUser).get(protect, allUsers);
router.post('/login', authUser);

export default router;
