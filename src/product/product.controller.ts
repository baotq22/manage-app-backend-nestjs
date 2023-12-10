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
import { FindAllResponse, ProductService } from "./product.service"
import { Product } from "./schemas/product.schema"
import { CreateProductDto } from "./dto/create-product.dto"
import { UpdateProductDto } from "./dto/update-product.dto"
import { Query as ExpressQuery } from "express-serve-static-core"
import { responseSuccess, responseError } from "utils/responseHandle"
import { Response } from "express"
import * as path from "path"
import { FileInterceptor } from "@nestjs/platform-express"
import { storageConfig } from "utils/config"

@Controller("api/product")
export class ProductController {
    constructor(private productService: ProductService) {}

    @Get("get-all")
    async getAllProducts(@Query() query: ExpressQuery, @Res() res: Response): Promise<Response<FindAllResponse>> {
        try {
            const data = await this.productService.findAll(query)
            return responseSuccess(res, data, 200, "Successfully")
        } catch (error) {
            console.log("err", error)
            return responseError(res, 500, "err", "Failed", true)
        }
    }

    @Post("create")
    @UseInterceptors(FileInterceptor("image", { storage: storageConfig("image") }))
    async createProduct(
        @UploadedFile() file,
        @Body() product: CreateProductDto,
        @Res() res: Response
    ): Promise<Response<Product>> {
        try {
            if (file) {
                product.image = file.originalname
            }
            const data = this.productService.create(product)
            return responseSuccess(res, data, 200, "Added New Product Successfully !")
        } catch (err) {
            return responseError(res, 500, "err svr", "Add New Product Failed !", true)
        }
    }

    @Get("details/:id")
    async getProduct(@Param("id") id: string, @Res() res: Response): Promise<Response<Product>> {
        try {
            const data = await this.productService.findById(id)
            if (data) {
                return responseSuccess(res, data, 200, "Display Prodcut Successfully !")
            } else {
                return responseError(res, 404, "unavailable", "The Product is not existed", true)
            }
        } catch (err) {
            return responseError(res, 500, "err svr", "Diaplay Product Failed !", true)
        }
    }

    @Put("update/:id")
    @UseInterceptors(FileInterceptor("image", { storage: storageConfig("image") }))
    async updateProduct(
        @Param("id") id: string,
        @Body() product: UpdateProductDto,
        @UploadedFile() file,
        @Res() res: Response
    ): Promise<Response<Product>> {
        console.log("data", product)
        try {
            if (file) {
                product.image = file.originalname
            }
            const data = await this.productService.updateById(id, product)

            if (data) {
                return responseSuccess(res, data, 200, "Update Prodct Successfully !")
            } else {
                return responseError(res, 404, "unavailable", "The Product is not existed", true)
            }
        } catch (error) {
            console.log("err", error)
            return responseError(res, 500, "err svr", "Update Product Failed !", true)
        }
    }

    @Delete("delete/:id")
    async deleteProduct(@Param("id") id: string, @Res() res: Response): Promise<Response<Product>> {
        try {
            const data = await this.productService.deleteById(id)
            if (data) {
                return responseSuccess(res, data, 200, "Delete Successfully")
            } else {
                return responseError(res, 404, "err", "Unavailable", true)
            }
        } catch (err) {
            return responseError(res, 500, "err", "Failed", true)
        }
    }

    @Get("img/:imageName")
    serveImage(@Param("imageName") imageName: string, @Res() res: Response): void {
        const imagePath = path.join(process.cwd(), "public/uploads/images", imageName)
        res.sendFile(imagePath)
    }
}
