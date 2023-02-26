import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

interface User {
    name: string;
    email: string;
    password: string;
    pic: string;
}

export interface UserDocument extends User, mongoose.Document {
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, unique: true, required: true },
        password: { type: String, required: true },
        pic: { type: String, default: 'https://picsum.photos/200' }
    },
    {
        timestamps: true
    }
);

userSchema.pre('save', async function (next) {
    let user = this as UserDocument;
    if (!user.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    const hash = bcrypt.hashSync(user.password, salt);

    user.password = hash;
    return next();
});

userSchema.methods.comparePassword = async function name(candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
};

const UserModel = mongoose.model<UserDocument>('User', userSchema);

export default UserModel;
