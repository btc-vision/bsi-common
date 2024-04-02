import { Db, ObjectId } from 'mongodb';
import * as fs from 'fs';
import * as path from 'path';

export class DBTestHelper {
    public static async readFileNames(folderPath: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            fs.readdir(folderPath, (err, files) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(files.map(file => path.basename(file)));
            });
        });
    }

    public static async setupDatabaseForTests(db: Db,
        testDirectory: string) {

        const directoryPath = path.join(testDirectory, 'data');
        const filenames: string[] = await DBTestHelper.readFileNames(directoryPath);

        for (let i = 0; i < filenames.length; i++) {
            const file = filenames[i];
            console.log(`Reading: ${file}`);

            const data = fs.readFileSync(path.join(directoryPath, file), "utf-8");

            const documents: any[] = JSON.parse(data);

            const updatedDocuments = documents.map(doc => ({
                ...doc,
                _id: new ObjectId(doc._id),
            }));

            console.log(`Cleaning to collection: ${path.parse(file).name}`);
            await db.collection(`${path.parse(file).name}`).deleteMany();

            console.log(`Importing to collection: ${path.parse(file).name}`);
            await db.collection(`${path.parse(file).name}`).insertMany(updatedDocuments);
        }
    }
}