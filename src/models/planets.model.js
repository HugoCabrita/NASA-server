const { parse } = require('csv-parse');
const fs = require ("fs");
const path = require('path');

const planets = require ('./planets.mongo.js');

let habitablePlanets=[];

function isHabitablePlanet(planet) {
    return planet ['koi_disposition'] === 'CONFIRMED' 
    && (planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11 ) 
    && (planet['koi_prad']< 1.6);
}

function loadPlanets() {
  return new Promise ((resolve, reject) => {
    fs.createReadStream(path.join(__dirname,'..','..','data','Kepler_data.csv'))
    .pipe(parse({
      comment : '#',
      columns : true,
    }))
    .on('data', async (data) =>{
      if(isHabitablePlanet(data))
      {
        //habitablePlanets.push(data.kepler_name);
        //  insert + update = upsert
        savePlanet(data);
      }
    })
    .on('error', (err)=> {
      console.log(err);
      reject(err);
    })
    .on('end', async () => {
      planetsFound =await getAllPlanets();
      const countPlanetsFound= planetsFound.length;
      console.log(`${countPlanetsFound} habitable planets found`);

      resolve();
    });
  });
}

async function getAllPlanets() {
  console.log('Model getAllPlanets');
  //return habitablePlanets;
   const planetsFound= await planets.find({},{
     '_id': 0,
     '__v': 0,
   });
   return planetsFound;//jsonToArray(planetsFound);
}

async function savePlanet(planet)
{
  try {
    await planets.updateOne({
      keplerName: planet.kepler_name,
    }, {
      keplerName: planet.kepler_name,
    }, {
      upsert:true,
    });
  } catch(err)
  {
    console.error(`Could not save planet: ${err}`);
  }
 
}

function jsonToArray(jsonArray)
{
  let array=[];
  for(let i=0; i<jsonArray.length; i++)
  {
    array.push(jsonArray[0]);
  }
  return array;
}
module.exports = {
    loadPlanets,
    getAllPlanets,
};
