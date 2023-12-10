import { IsNotEmpty, IsString } from "class-validator"

export class CreateProductDto {
    @IsNotEmpty()
    @IsString()
    readonly productName: string

    @IsNotEmpty()
    readonly price: number

    @IsNotEmpty()
    readonly quantity: number

    @IsNotEmpty()
    readonly ratingPoint: number

    @IsNotEmpty()
    readonly discount: number

    @IsNotEmpty()
    readonly special: number

    @IsNotEmpty()
    @IsString()
    readonly description: string

    @IsNotEmpty()
    readonly soldQuantity: number

    image: string
}
