const axios = require ('axios');

const launchesDataBase = require ('./launches.mongo.js');
const planets = require ('./planets.mongo.js');
//const launches = new Map();

const DEFAULT_FLIGHT_NUMBER =  99;

// const launch ={
//   flightNumber: 100,//flight_number
//   mission: 'Kepler exploration X',//name
//   rocket: 'Explorer IS1',  //rocket.name
//   launchDate: new Date('December 27, 2030'),//date_local
//   target: 'Kepler-442 b',//not applicable
//   customers: ['ZTM','NASA'],//payload.customers for each payload
//   upcoming: true,//upcoming
//   success: true,//success
// };

//saveLaunch(launch);
//launches.set(launch.flightNumber,launch); old, save to memory not mongoDB
const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function populateLaunches(){
  console.log('Downloading launch data...');
  const response = await axios.post(SPACEX_API_URL,{
    query:{},
    options: {
      pagination: false,
      populate:[
        {
          path: 'rocket',
          select: {
            name: 1
          }
        },
        {
          path: 'payloads',
          select: {
            'customers': 1
          }
        }
      ]
    }
  });

  if(response.status !== 200){
    console.log('Problem downloading launch data');
    throw new Error ('Launch data download failed');
  }

  const launchDocs = response.data.docs;
  
  for(const launchDoc of launchDocs) {
    const payload = launchDoc['payloads'];
    const customers = payload.flatMap((payload) => {
      return payload['customers'];
    });

    const launch = {
      flightNumber: launchDoc['flight_number'],
      mission: launchDoc['name'],
      rocket: launchDoc['rocket']['name'],
      launchDate: launchDoc['date_local'],
      upcoming: launchDoc['upcoming'],
      success: launchDoc['success'],
      customers,
    };
    if(launch.success === null)
    {
      launch.success=true;
    }
    console.log(`${launch.flightNumber}: ${launch.mission} success: ${launch.success}`);
    saveLaunch(launch);
  }
}

async function loadLaunchesData(){
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: 'falcon 1',
    mission: 'FalconSat',
  });
  if(firstLaunch) {
    console.log('Launch data already loaded!');
    return;
  } else{
    await populateLaunches();
  }
}

async function findLaunch(filter){
  return await launchesDataBase.findOne(filter);
}

async function existsLaunchWithId(launchId){
  //return launches.has(launchId);
  return await  findLaunch({
    flightNumber: launchId,
  });
}

async function getLatestFlightNumber(){
  const latestLaunch = await launchesDataBase
  .findOne()
  .sort('-flightNumber');

  if(!latestLaunch)
  {
    return DEFAULT_FLIGHT_NUMBER;
  }

  return latestLaunch.flightNumber;
}

async function getAllLaunches(skip, limit)
{
//  console.log('Model getAllLaunches');
 // return Array.from(launches.values());
 return await launchesDataBase
  .find({},{'_id': 0, '__v':0})
  .sort({flightNumber: 1})
  .skip(skip)
  .limit(limit);
}

async function saveLaunch(launch){
  
  await launchesDataBase.findOneAndUpdate({
    flightNumber: launch.flightNumber,
  },launch,{
    upsert: true
  });

}



async function scheduleNewLaunch(launch){
  const planet = await planets.findOne({
    keplerName: launch.target,
  });

  if(!planet)
  {
    throw new Error('No matching planet found');
  }else
  {
    const newFlightNumber=await getLatestFlightNumber() +1;
    const newLaunch =Object.assign(launch, {
      success: true,
      upcoming: true,
      customers: ['Zero to Master','NASA'],
      flightNumber:newFlightNumber,
    });
    
    await saveLaunch(newLaunch);
  }
}

// function addNewLaunch(launch){
//   lastFlightNumber++;
//   launches.set(
//     lastFlightNumber,
//     Object.assign(launch, {
//       success: true,
//       upcoming: true,
//       customers: ['Zero to Master','NASA'],
//       flightNumber:lastFlightNumber,
//     }),
//   );
// }

async function abortLaunchById(launchId){
  const aborted = await launchesDataBase.updateOne({
    flightNumber: launchId,
  },{
    upcoming: false,
    success: false,
  });
  console.log(JSON.stringify(aborted));
  return aborted.modifiedCount === 1;
    //launches.delete(launchId);
    // const aborted = launches.get(launchId);
    // aborted.upcoming = false;
    // aborted.success = false;
    // return aborted;
}

module.exports ={
  loadLaunchesData,
    existsLaunchWithId,
    getAllLaunches,
    scheduleNewLaunch,
    abortLaunchById,
};