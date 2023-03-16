const mongoose = require('mongoose');
const DB = process.env.DATABASE_URL

mongoose.connect(DB).then(() => {
    console.log('DB connected ..');
}).catch((err) => {
    console.log(`found error message >> ${err}`);
})