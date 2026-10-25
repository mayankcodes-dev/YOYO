import mongoose from 'mongoose';

const newsletterSchema = new mongoose.Schema({
    email: {
        type:      String,
        required:  true,
        unique:    true,
        lowercase: true,
        trim:      true,
        match:     [/^\S+@\S+\.\S+$/, 'Invalid email'],
    },
    subscribedAt: { type: Date, default: Date.now },
    active:       { type: Boolean, default: true },
}, { timestamps: true });

const Newsletter = mongoose.model('Newsletter', newsletterSchema);
export default Newsletter;
