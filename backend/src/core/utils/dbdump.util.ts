import { spawn } from 'child_process';
import { Response } from 'express';
import * as archiver from 'archiver';
import path from 'path';
import fs from 'fs';

/**
 * Streams a MongoDB database dump directly to the Express response object using mongodump.
 * @param res Express Response object
 * @param mongoUri MongoDB connection string
 * @param filename Desired name of the downloaded file
 */
export const streamDatabaseDump = (res: Response, mongoUri: string, filename: string) => {
    const timestamp = Date.now();
    const tempDir = path.join(process.cwd(), 'dumps', `temp_${timestamp}`);
    
    // Ensure dumps directory exists
    const dumpsDir = path.join(process.cwd(), 'dumps');
    if (!fs.existsSync(dumpsDir)) {
        fs.mkdirSync(dumpsDir, { recursive: true });
    }

    // Run mongodump to output into the temp directory
    const dumpProcess = spawn('mongodump', ['--uri', mongoUri, '--out', tempDir]);

    dumpProcess.on('close', (code) => {
        if (code === 0) {
            // Mongodump finished successfully, stream as zip
            res.setHeader('Content-Type', 'application/zip');
            // Change extension to .zip
            const zipFilename = filename.endsWith('.gz') ? filename.replace('.gz', '.zip') : `${filename}.zip`;
            res.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`);

            const archive = new archiver.ZipArchive({
                zlib: { level: 9 } // maximum compression
            });

            archive.on('error', (err: any) => {
                console.error('Error zipping dump folder:', err);
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Failed to generate zip file' });
                }
            });

            archive.on('end', () => {
                // Cleanup temp folder after zipping is done
                if (fs.existsSync(tempDir)) {
                    fs.rmSync(tempDir, { recursive: true, force: true });
                }
            });

            // Pipe archive data to the response
            archive.pipe(res);

            // Append the folder contents to the zip
            archive.directory(tempDir, false);

            archive.finalize();
        } else {
            console.error(`mongodump process exited with code ${code}`);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Failed to generate database dump' });
            }
            if (fs.existsSync(tempDir)) {
                fs.rmSync(tempDir, { recursive: true, force: true });
            }
        }
    });

    dumpProcess.stderr.on('data', (data) => {
        console.error(`[mongodump]: ${data}`);
    });
};
