const http = require('http');
require('dotenv').config();

const {mongoConnect} = require('./services/mongo.js');
const app =require('./app.js');
const {loadPlanets} = require('./models/planets.model.js');
const {loadLaunchesData} = require('./models/launches.model.js');

const PORT = process.env.PORT;

const server = http.createServer(app);

async function startServer(){
    await mongoConnect();
    await loadPlanets();
    await loadLaunchesData();
}

server.listen(PORT,()=>{
    console.log(`Listening on port ${PORT}...`);
});

startServer();

// app.listen();


