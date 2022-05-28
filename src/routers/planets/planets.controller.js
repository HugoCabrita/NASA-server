const {getAllPlanets,planets} = require ('../../models/planets.model.js');

async function httpGetAllPlanets(req,res)
{
	console.log('controller httpGetAllPlanets!');
	return res.status(200).json(await getAllPlanets());
	
}

module.exports = {
    httpGetAllPlanets,
};