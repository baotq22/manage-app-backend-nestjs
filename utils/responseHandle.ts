import { Response } from "express"

export const responseSuccess = (
    res: Response,
    data: any,
    status: number = 200,
    message: string = "Success",
    error: boolean = false
): Response => {
    return res.status(status).json({
        status,
        error,
        message,
        data
    })
}

export const responseError = (
    res: Response,
    status: number = 400,
    type: string = "",
    message: string = "Error",
    error: boolean = true
): Response => {
    return res.status(status).json({
        status,
        type,
        error,
        message
    })
}
