const mongoose = require('mongoose');

module.exports = async () => {
    const mongoUri = "mongodb+srv://Anurag:jH7ncwOx8kefLVlD@cluster0.lrkzpsr.mongodb.net/?retryWrites=true&w=majority";
    try {
        const connect = await mongoose.connect(mongoUri, {
            useNewUrlParser: true, 
            useUnifiedTopology: true, 
        });
        console.log('mongoDB connected:',connect.connection.host);
    } catch (e) {
        console.log(error);
        process.exit(1);
    }
    
};


//This has to be done only once , 
// After this there is no need to create this connection again and again, 
// just copy and paste this code in next project, This code is working as a boilerplate.