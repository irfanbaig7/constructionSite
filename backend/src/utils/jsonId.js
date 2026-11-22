export default function jsonId(schema) {
    schema.set("toJSON", {
        versionKey: false,
        transform: (_doc, ret) => {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.password;
            return ret;
        },
    });
}