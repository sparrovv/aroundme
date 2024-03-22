import { findPopularPlaces } from './oai';


// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config({
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  path: require("path").resolve(__dirname, "./../../.env"),
});

describe('findPopularPlaces', () => {
    it('should  find popular places', async () => {
        const response = await findPopularPlaces('Krakow', 'Poland')
        
        expect(response).toEqual([])
        expect(response.length).toEqual(6)
    },{timeout: 100000});
})