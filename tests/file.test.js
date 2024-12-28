const request = require('supertest');
const app = require('../server');
const { connect, closeDatabase, clearDatabase } = require('./setup');
const File = require('../models/File');

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

describe('File Upload', () => {
    it('should upload a file successfully', async () => {
        const response = await request(app)
            .post('/api/files')
            .attach('myfile', '__tests__/testfiles/test.txt')
            .set('Authorization', `Bearer ${global.testToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('downloadLink');
    });
});