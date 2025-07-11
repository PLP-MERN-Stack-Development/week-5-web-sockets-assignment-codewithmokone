const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const database = await mongoose.connect(process.env.MONGOOSE_URI)
        if(database){
            console.log("MongoDB Connected");
        }
    } catch (error) {
        console.log("DB connection error: ", error);
    }
}

module.exports = connectDB;