import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"

@Schema({
    timestamps: true
})
export class Product {
    @Prop()
    productName: string

    @Prop()
    price: number

    @Prop()
    quantity: number

    @Prop()
    ratingPoint: number

    @Prop()
    discount: number

    @Prop()
    special: number

    @Prop()
    description: string

    @Prop()
    soldQuantity: number

    @Prop()
    image: string
}

export const ProductSchema = SchemaFactory.createForClass(Product)
