const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config();

const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGO_URI)
    .then(() =>{
        console.log("Connecté à MongoDB")
    })
    .catch((err) => console.error(err));

app.listen(PORT, () => console.log(`server démarré sur le port ${PORT}`));