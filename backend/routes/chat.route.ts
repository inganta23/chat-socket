import express from 'express';
import { accessChat, addToGroup, createGroupChat, fetchChats, removeFromGroup, renameGroup } from '../controllers/chat.controller';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').post(protect, accessChat).get(protect, fetchChats);
router.route('/group').post(protect, createGroupChat);
router.route('/rename').put(protect, renameGroup);
router.route('/groupadd').put(protect, addToGroup);
router.route('/groupremove').put(protect, removeFromGroup);

export default router;
