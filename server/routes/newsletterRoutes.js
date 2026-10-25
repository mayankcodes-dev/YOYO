import express from 'express';
import { body, validationResult } from 'express-validator';
import { subscribe, unsubscribe, subscribeLimit } from '../controllers/newsletterController.js';

const newsletterRouter = express.Router();

const emailRule = [
    body('email').normalizeEmail().isEmail().withMessage('Valid email required'),
];

const validate = (req, res, next) => {
    const errs = validationResult(req);
    if (!errs.isEmpty())
        return res.status(422).json({ success: false, message: errs.array()[0].msg });
    next();
};

newsletterRouter.post('/subscribe',   subscribeLimit, emailRule, validate, subscribe);
newsletterRouter.post('/unsubscribe', emailRule, validate, unsubscribe);

export default newsletterRouter;
