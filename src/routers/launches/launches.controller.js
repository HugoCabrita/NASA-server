const {
	getAllLaunches,
	scheduleNewLaunch,
	existsLaunchWithId,
	abortLaunchById,
}=require('../../models/launches.model.js');

const {
	getPagination,
} = require ('../../services/query.js');

async function httpGetAllLaunches(req,res){
	console.log(JSON.stringify(req.query));
	const {skip, limit}= getPagination(req.query);
	const launches = await getAllLaunches(skip, limit);
	return res.status(200).json(launches);
}

async function httpAddNewLaunch(req, res) {
	const launch = req.body;
	if(!launch.mission || !launch.rocket || !launch.launchDate || !launch.target)
	{
		return res.status(400).json({
			error : 'Missing required launch property',
		});
	}

	launch.launchDate = new Date(launch.launchDate);
	//if (launch.launchDate.toString() === 'Invalid Date'){
	if (isNaN(launch.launchDate)){
		return res.status(400).json({
			error : 'Invalid launch date',
		});
	}
	await scheduleNewLaunch(launch);
	res.status(201).json(launch);
}

async function httpAbortLaunch(req, res){
	const launchId=+req.params.id;

	const existsLaunch= await existsLaunchWithId(launchId);
	//if launch not exist
	if (!existsLaunch){
		return res.status(404).json({
			error: 'Launch not found',
		});
	}
	
	const aborted = await abortLaunchById(launchId);
	if(!aborted){
		res.status(400).json({
			error: 'Launch not aborted',
		});
	}
	return res.status(200).json({
		ok: true,
	});
}

module.exports= {
	httpGetAllLaunches,
	httpAddNewLaunch,
	httpAbortLaunch,
}