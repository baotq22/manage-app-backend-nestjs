import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { User } from "./schemas/user.schema"
import mongoose, { Model } from "mongoose"
import { Query } from "express-serve-static-core"
import * as bcrypt from "bcryptjs"
import { JwtService } from "@nestjs/jwt"
import { SignUpDto } from "./dto/signup.dto"
import { SignInDto } from "./dto/signin.dto"

export interface FindAllResponse {
    total: number
    page: number
    page_size: number
    users: User[]
}

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<User>,
        private jwtService: JwtService
    ) {}

    async findAll(query: Query): Promise<FindAllResponse> {
        // eslint-disable-next-line prefer-const
        let { search, sort_by, sort_order, page, page_size, number_user, compare_user } = query

        const sRegex = search
            ? {
                  username: {
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
        const numberUser = Number(number_user) > 0 ? Number(number_user) : 0
        const compareUser = String(compare_user) ? String(compare_user) : "$gt"

        const result = await this.userModel
            .aggregate([
                {
                    $match: {
                        deleted_at: null,
                        ...sRegex,
                        ...(numberUser && compareUser && { total: { [compareUser]: numberUser } })
                    }
                },
                { $sort: { [sortBy]: sortOrder } },
                {
                    $facet: {
                        users: [
                            { $skip: skip },
                            { $limit: pageSize },
                            {
                                $project: {
                                    _id: 1,
                                    email: 1,
                                    username: 1,
                                    fullname: 1,
                                    password: 1,
                                    image: { $concat: ["http://localhost:3001/api/auth/img/", "$image"] },
                                    imageMain: { $concat: ["http://localhost:3001/api/auth/img/", "$imageMain"] },
                                    description: 1,
                                    phone: 1,
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

        const usersTotal = result[0].total.length > 0 ? result[0].total[0].value : 0

        return {
            total: usersTotal,
            page: pageNumber,
            page_size: pageSize,
            users: result[0].users
        }
    }

    async findById(id: string): Promise<User> {
        const isValidId = mongoose.isValidObjectId(id)
        if (!isValidId) {
            throw new BadRequestException("Invalid ID.")
        }
        const user = await this.userModel.findById(id)
        if (!user) {
            throw new NotFoundException("Unavailable.")
        }
        return user
    }

    async signUp(signUpDto: SignUpDto): Promise<{ token: string }> {
        const { email, username, fullname, password, image, imageMain, description, phone } = signUpDto

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await this.userModel.create({
            email,
            username,
            fullname,
            password: hashedPassword,
            image,
            imageMain,
            description,
            phone
        })

        const token = this.jwtService.sign({ id: user._id })

        return { token }
    }

    async signIn(signInDto: SignInDto): Promise<{ token: string }> {
        const { username, password } = signInDto

        const user = await this.userModel.findOne({ username })

        if (!user) {
            throw new UnauthorizedException("Invalid usernames or passwords")
        }

        const isPasswordMatched = await bcrypt.compare(password, user.password)

        if (!isPasswordMatched) {
            throw new UnauthorizedException("Invalid usernames or passwords")
        }

        const token = this.jwtService.sign({ id: user._id })

        return { token }
    }

    async create(user: User): Promise<User> {
        const res = await this.userModel.create(user)
        return res.save()
    }

    async findbyId(id: string): Promise<User> {
        const isValidId = mongoose.isValidObjectId(id)
        if (!isValidId) {
            throw new BadRequestException("Invalid ID.")
        }
        const user = await this.userModel.findById({ _id: id })
        if (!user) {
            throw new NotFoundException("Unavailable.")
        }
        return user
    }

    async updateById(id: string, user: User): Promise<User> {
        return await this.userModel.findByIdAndUpdate(id, user, {
            new: true,
            runValidators: true
        })
    }

    async deleteById(id: string): Promise<User> {
        return await this.userModel.findByIdAndDelete(id)
    }

    async searchUser(key: string) {
        const keyword = key
            ? {
                  $or: [{ username: { $regex: key, $options: "i" } }]
              }
            : {}
        return this.userModel.find(keyword)
    }
}
