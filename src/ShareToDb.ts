import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';

const relativePath = path.resolve(__dirname, '../data-output/statsOutput.json');

export async function insertDataToMongoDB() {
  try {
    const data = JSON.parse(fs.readFileSync(relativePath, 'utf8'));
    const client = new MongoClient('mongodb://localhost:27017');

    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Successfully connected to MongoDB.');

    const db = client.db('MTDatabase');
    const collection = db.collection('MTCollection');

    console.log('Inserting data...');
    await collection.insertOne(data);
    console.log('Data inserted successfully.');

    console.log('Closing connection...');
    await client.close();
    console.log('Connection closed successfully.');
  } catch (err) {
    console.error('An error occurred:', err);
  }
}
insertDataToMongoDB();
