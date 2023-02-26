import { Request, Response, NextFunction } from 'express';

const notFound = (req: Request, res: Response, next: NextFunction) => {
    return res.status(400).send('Not Found - ' + req.originalUrl);
};

const errorHandler = (err: any, req: Request, res: Response) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);

    res.json({
        message: err.messsage,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};

export { notFound, errorHandler };
