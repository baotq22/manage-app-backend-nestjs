import { IsNotEmpty, IsString } from "class-validator"

export class SignInDto {
    @IsNotEmpty()
    @IsString()
    readonly username: string

    @IsNotEmpty()
    @IsString()
    readonly password: string
}
