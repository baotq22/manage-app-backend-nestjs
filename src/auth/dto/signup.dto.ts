import { IsNotEmpty, IsString } from "class-validator"

export class SignUpDto {
    @IsNotEmpty()
    @IsString()
    readonly email: string

    @IsNotEmpty()
    @IsString()
    readonly username: string

    @IsNotEmpty()
    @IsString()
    readonly fullname: string

    @IsNotEmpty()
    @IsString()
    readonly password: string

    image: string

    imageMain: string

    @IsNotEmpty()
    @IsString()
    readonly description: string

    @IsNotEmpty()
    @IsString()
    readonly phone: string
}
