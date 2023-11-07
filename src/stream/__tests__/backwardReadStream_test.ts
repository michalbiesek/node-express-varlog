import { createBackwardReadStream } from '../backwardReadStream';
import tmp from 'tmp';
import fs from 'fs';


describe('BackwardReadStream', () => {

    // Define an array of highWaterMark values to test
    const highWaterMarkValues = [2, 1024];

    // Create a test for each highWaterMark value
    highWaterMarkValues.forEach((highWaterMark) => {
        test(`should read data from the stream with highWaterMark ${highWaterMark}`, (done) => {
            const testData = ['Line 1\n', 'Line 2\n', 'Line 3\n'];
            const testStr = testData.join('');

            // Create a temporary file
            const tempFile = tmp.fileSync();

            // Write the test data to the temporary file
            fs.writeFileSync(tempFile.name, testStr);

            const stream = createBackwardReadStream(tempFile.name, true, undefined, { highWaterMark: highWaterMark });

            // Create a buffer to hold the data read from the stream
            let dataBuffer = Buffer.from('');

            // Listen for 'data' events and append data to the buffer
            stream.on('data', (chunk: any) => {
                dataBuffer = Buffer.concat([dataBuffer, chunk]);
            });

            // // Listen for the 'end' event, which signals the end of data
            stream.on('end', () => {
                // Convert the buffer to a string and compare it to the test data
                const receivedData = dataBuffer.toString();
                const reverseData = testData.reverse().join('');
                expect(receivedData).toBe(reverseData);

                done();
            });
        });
    });

    test.only('should handle error when opening the file', (done) => {
        const tempFile = tmp.fileSync();

        jest.spyOn(fs, 'open').mockImplementation((_path, callback) => {
            callback(new Error('Simulated open error'), -1);
          });
    
        const stream = createBackwardReadStream(tempFile.name, true ,undefined);
    
        stream.on('error', (error) => {
          expect(error.message).toBe('Simulated open error');
          done();
        });
    });
});