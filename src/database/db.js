import { MongoClient} from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);

try {
    await mongoClient.connect();
    console.log("Mongo conectado!")
    
} catch (err) {
    console.log(err)
}

const db = mongoClient.db("myWallet");
export const usersCollection = db.collection("users");
export const movementsCollection = db.collection("movement")
export const sessionsCollection = db.collection("sessions")
