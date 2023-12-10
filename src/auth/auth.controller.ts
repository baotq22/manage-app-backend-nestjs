import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    Res,
    UploadedFile,
    UseInterceptors
} from "@nestjs/common"
import { AuthService, FindAllResponse } from "./auth.service"
import { SignUpDto } from "./dto/signup.dto"
import { SignInDto } from "./dto/signin.dto"
import { Query as ExpressQuery } from "express-serve-static-core"
import { User } from "./schemas/user.schema"
import { responseError, responseSuccess } from "utils/responseHandle"
import { Response } from "express"
import * as path from "path"
import { CreateUserDto } from "./dto/create-user.dto"
import { UpdateUserDto } from "./dto/update-user.dto"
import { FileInterceptor } from "@nestjs/platform-express"
import { storageConfig } from "utils/config"

@Controller("api/auth")
export class AuthController {
    constructor(private authService: AuthService) {}

    @Get("get-all")
    async getAllUsers(@Query() query: ExpressQuery, @Res() res: Response): Promise<Response<FindAllResponse>> {
        try {
            const data = await this.authService.findAll(query)
            return responseSuccess(res, data, 200, "Successfully")
        } catch (error) {
            return responseError(res, 500, "err", "Failed", true)
        }
    }

    @Post("/signup")
    signUp(@Body() signUpDto: SignUpDto): Promise<{ token: string }> {
        return this.authService.signUp(signUpDto)
    }

    @Get("/signin")
    signin(@Body() signInDto: SignInDto): Promise<{ token: string }> {
        return this.authService.signIn(signInDto)
    }

    @Post("create")
    @UseInterceptors(FileInterceptor("image", { storage: storageConfig("image") }))
    @UseInterceptors(FileInterceptor("imageMain", { storage: storageConfig("imageMain") }))
    async createUser(@UploadedFile() file, @Body() user: CreateUserDto, @Res() res: Response): Promise<Response<User>> {
        console.log("123", user)
        try {
            if (file) {
                console.log("Received file:", file)
                user.image = file.originalname
                user.imageMain = file.originalname
            }
            const data = this.authService.create(user)
            return responseSuccess(res, data, 200, "Added New User Successfully !")
        } catch (err) {
            return responseError(res, 500, "err svr", "Add New User Failed !", true)
        }
    }

    @Get("details/:id")
    async getUser(@Param("id") id: string, @Res() res: Response): Promise<Response<User>> {
        try {
            const data = await this.authService.findById(id)
            if (data) {
                return responseSuccess(res, data, 200, "Display User Successfully !")
            } else {
                return responseError(res, 404, "unavailable", "The User is not existed", true)
            }
        } catch (err) {
            return responseError(res, 500, "err svr", "Diaplay User Failed !", true)
        }
    }

    @Put("update/:id")
    @UseInterceptors(FileInterceptor("image", { storage: storageConfig("image") }))
    @UseInterceptors(FileInterceptor("imageMain", { storage: storageConfig("imageMain") }))
    async updateUser(
        @Param("id") id: string,
        @Body() user: UpdateUserDto,
        @UploadedFile() file,
        @Res() res: Response
    ): Promise<Response<User>> {
        console.log("data", user)
        try {
            if (file) {
                user.image = file.originalname
                user.imageMain = file.originalname
            }
            const data = await this.authService.updateById(id, user)

            if (data) {
                return responseSuccess(res, data, 200, "Update User Successfully !")
            } else {
                return responseError(res, 404, "unavailable", "The User is not existed", true)
            }
        } catch (error) {
            console.log("err", error)
            return responseError(res, 500, "err svr", "Update User Failed !", true)
        }
    }

    @Post("/search")
    async searchUser(@Query("key") key) {
        return this.authService.searchUser(key)
    }

    @Get("img/:imageName")
    serveImage(@Param("imageName") imageName: string, @Res() res: Response): void {
        const imagePath = path.join(process.cwd(), "public/uploads/images/", imageName)
        res.sendFile(imagePath)
    }

    @Delete("delete/:id")
    async deleteUser(@Param("id") id: string, @Res() res: Response): Promise<Response<User>> {
        try {
            const data = await this.authService.deleteById(id)
            if (data) {
                return responseSuccess(res, data, 200, "Delete Successfully")
            } else {
                return responseError(res, 404, "err", "Unavailable", true)
            }
        } catch (err) {
            return responseError(res, 500, "err", "Failed", true)
        }
    }
}
