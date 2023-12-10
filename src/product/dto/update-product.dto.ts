import { IsOptional, IsString } from "class-validator"

export class UpdateProductDto {
    @IsOptional()
    @IsString()
    readonly productName: string

    @IsOptional()
    readonly price: number

    @IsOptional()
    readonly quantity: number

    @IsOptional()
    readonly ratingPoint: number

    @IsOptional()
    readonly discount: number

    @IsOptional()
    readonly special: number

    @IsOptional()
    @IsString()
    readonly description: string

    @IsOptional()
    readonly soldQuantity: number

    image: string
}
