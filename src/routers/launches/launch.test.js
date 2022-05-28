const request = require('supertest');

const app =require('../../app.js');
const {
  mongoConnect,
  mongoDisconnect,
} = require ('../../services/mongo.js');
describe ('Launches API',() => {
  beforeAll(() => {
    mongoConnect();
  });
  afterAll(async () => {
    await mongoDisconnect();
  });
  describe('Test GET /launches', () => {
    test('It should respond with 200 success',async()=>{
        const response = await request(app)
          .get('/v1/launches')
          .expect('Content-Type',/json/)
          .expect(200);
  //      .expect(response.statusCode).toBe(200);
    });
  });
  
  describe('Test POST /launches', () => {
    const completeLauchData = {
      mission : 'USS Enterprise',
      rocket : 'NCC 1701-D',
      target : 'Kepler-296 f',
      launchDate : 'January 4, 2028', 
    };
    const  launchDataWithoutTheDate = {
      mission : 'USS Enterprise',
      rocket : 'NCC 1701-D',
      target : 'Kepler-296 f',
    };
  
    const launchDataWithIvalidDate = {
      mission : 'USS Enterprise',
      rocket : 'NCC 1701-D',
      target : 'Kepler-296 f',
      launchDate : 'zoot', 
    };
  
  
      test('It should respond with 201 created', async ()=>{
        const response = await request(app)
          .post('/v1/launches')
          .send(completeLauchData)
          .expect('Content-Type',/json/)
          .expect(201);
  
        const requestData = new Date(completeLauchData.launchDate).valueOf();
        const responseDate = new Date(response.body.launchDate).valueOf();
  
        expect(responseDate).toBe(requestData);
        expect(response.body).toMatchObject(launchDataWithoutTheDate);
      });
      test ('It should catch missing required properties', async ()=>{
        const response = await request(app)
          .post('/v1/launches')
          .send(launchDataWithoutTheDate)
          .expect('Content-Type',/json/)
          .expect(400);
  
        expect(response.body).toStrictEqual({
          error : 'Missing required launch property',
      })
      });
      test ('It should catch invalid dates', async ()=>{
        const response = await request(app)
          .post('/v1/launches')
          .send(launchDataWithIvalidDate)
          .expect('Content-Type',/json/)
          .expect(400);
  
        expect(response.body).toStrictEqual({
          error : 'Invalid launch date',
      })
      });
  })
});


