import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"

@Schema({
    timestamps: true
})
export class User {
    @Prop()
    email: string

    @Prop()
    username: string

    @Prop()
    fullname: string

    @Prop()
    password: string

    @Prop()
    image: string

    @Prop()
    imageMain: string

    @Prop()
    description: string

    @Prop()
    phone: string
}

export const UserSchema = SchemaFactory.createForClass(User)
