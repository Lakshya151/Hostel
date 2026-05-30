const mongoose=require('mongoose');

async function main() {
    await mongoose.connect(process.env.MONGO_URI);
}

module.exports=main;