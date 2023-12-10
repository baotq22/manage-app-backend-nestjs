import { diskStorage } from "multer"

export const storageConfig = (folder: string) =>
    diskStorage({
        destination: "public/uploads/images",
        filename: (req, file, cb) => {
            cb(null, file.originalname)
        }
    })
