//we used this in order to manage DB cnx efficiently cz each invocation of serverless func could result 
//in anew cnx to the DBwhich is innefficient and can exhaust DB resources
 //if we werent cashing our cnx it would be making new cnx to the DB 
  //but by caching our cnx or the promise of a cnx all the subsequent invocationscan reuse the existing cnx if its open
  //or just try to create a new one, its much more efficient

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
//here we initialised a cashed variable 
//we attempt to retrieve a mongoose property from the global object
//node js has gobal object provides a space to store global variables
//the cached variable is intent to hold a cashed cnx to our DB
let cached = (global as any).mongoose || { conn: null, promise: null };///if we dnt hve already a mongoose cashed connection we re gonna set it to an empty object

export const connectToDatabase = async () => {
  // Checking if cached is already connected
  if (cached.conn) {
    return cached.conn;
  }

  // Connecting to an already existing cached connection or creating a new one
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is missing');
  }

  try {
    cached.promise = cached.promise || mongoose.connect(MONGODB_URI, {
      dbName: 'evently',
      bufferCommands: false,
      useUnifiedTopology: true, // Add this option if not already present
    } as any);

    cached.conn = await cached.promise;

    return cached.conn;
  } catch (error: any) {
    console.error('Error creating user:', error);
    throw new Error(`Internal Server Error ${error}`);
  }
}



//now that we hve our cnx we can start creating our models:user model, category, event, order.... where we define schemas