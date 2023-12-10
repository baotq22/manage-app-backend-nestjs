import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Product } from "./schemas/product.schema"
import * as mongoose from "mongoose"
import { Query } from "express-serve-static-core"

export interface FindAllResponse {
    total: number
    page: number
    page_size: number
    products: Product[]
}

@Injectable()
export class ProductService {
    constructor(
        @InjectModel(Product.name)
        private productModel: mongoose.Model<Product>
    ) {}

    async findAll(query: Query): Promise<FindAllResponse> {
        // eslint-disable-next-line prefer-const
        let { search, sort_by, sort_order, page, page_size, number_product, compare_product } = query
        const sRegex = search
            ? {
                  productName: {
                      $regex: query.search,
                      $options: "i"
                  }
              }
            : null
        const pageSize = Number(page_size) ? Number(page_size) : 8
        const pageNumber = Number(page) > 0 ? Number(page) : 1
        const skip = pageSize * (pageNumber - 1)
        const sortBy = String(sort_by ? sort_by : "asc")
        const sortOrder = sort_order === "asc" ? 1 : -1
        const numberProduct = Number(number_product) > 0 ? Number(number_product) : 0
        const compareProduct = String(compare_product) ? String(compare_product) : "$gt"

        const result = await this.productModel
            .aggregate([
                {
                    $match: {
                        deleted_at: null,
                        ...sRegex,
                        ...(numberProduct && compareProduct && { total: { [compareProduct]: numberProduct } })
                    }
                },
                { $sort: { [sortBy]: sortOrder } },
                {
                    $facet: {
                        products: [
                            { $skip: skip },
                            { $limit: pageSize },
                            {
                                $project: {
                                    _id: 1,
                                    productName: 1,
                                    price: 1,
                                    quantity: 1,
                                    ratingPoint: 1,
                                    discount: 1,
                                    special: 1,
                                    description: 1,
                                    soldQuantity: 1,
                                    image: { $concat: ["http://localhost:3001/api/product/img/", "$image"] },
                                    createdAt: 1,
                                    updatedAt: 1
                                }
                            }
                        ],

                        total: [{ $count: "value" }]
                    }
                }
            ])
            .exec()

        const productsTotal = result[0].total.length > 0 ? result[0].total[0].value : 0

        return {
            total: productsTotal,
            page: pageNumber,
            page_size: pageSize,
            products: result[0].products
        }
    }

    async create(product: Product): Promise<Product> {
        const res = await this.productModel.create(product)
        return res.save()
    }

    async findById(id: string): Promise<Product> {
        const isValidId = mongoose.isValidObjectId(id)
        if (!isValidId) {
            throw new BadRequestException("Invalid ID.")
        }
        const product = await this.productModel.findById(id)
        if (!product) {
            throw new NotFoundException("Unavailable.")
        }
        product.image = `http://localhost:3001/api/product/img/${product.image}`
        return product
    }

    async updateById(id: string, product: Product): Promise<Product> {
        return await this.productModel.findByIdAndUpdate(id, product, {
            new: true,
            runValidators: true
        })
    }

    async deleteById(id: string): Promise<Product> {
        return await this.productModel.findByIdAndDelete(id)
    }
}
