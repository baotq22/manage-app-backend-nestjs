import { IsOptional, IsString } from "class-validator"

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    readonly email: string

    @IsOptional()
    @IsString()
    readonly username: string

    @IsOptional()
    @IsString()
    readonly fullname: string

    @IsOptional()
    @IsString()
    readonly password: string

    image: string

    imageMain: string

    @IsOptional()
    @IsString()
    readonly description: string

    @IsOptional()
    @IsString()
    readonly phone: string
}
