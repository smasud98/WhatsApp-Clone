import mongoose from 'mongoose'

const whatsAppSchema = mongoose.Schema({
    message: String,
    name: String,
    timestamp: String,
    received: Boolean
})

export default mongoose.model('messagecontents', whatsAppSchema);