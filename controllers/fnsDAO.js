import dotenv from "dotenv"
import mongodb from "mongodb"
const ObjectId = mongodb.ObjectId

dotenv.config()
let itinerary

export default class ItineraryDAO {
    static async injectDB(conn) {
        if (itinerary) {
            return
        }
        try {
            itinerary = await conn.db(process.env.ITINERARY_NS).collection(process.env.COLLECTION)
        } catch (e) {
            console.error(`Unable to establish collection handles in userDAO: ${e}`)
        }
    }

    //itinerary.insertOne returns either an object with {acknowledged: true, insertId: ObjectId}, or an error
    static async signUp(name, username, password) {
        try {
            const newUser = {
                _id: ObjectId(),
                name: name,
                username: username,
                password: password,
                lists: {}
            }
            return await itinerary.insertOne(newUser)
        } catch (e) {
            console.log(`Unable to create user: ${e}`)
            return {error: e}
        }
    }

    //.findOne returns either the document searched or null if none exist
    //The passwords are hashed, so will have to pull out password and then compare
    static async signIn(username) {
        try {
            let query = {
                username: {$eq: username},
            }
            let cursor = await itinerary.findOne(query)
            return cursor
        } catch (e) {
            console.log(`Unable to find user: ${e}`)
            return null
        }
    }

    //.updateOne returns {matchedCount, modifiedCount}
    static async changeLists(user_id, newLists) {
        try {
            let query = { "_id": ObjectId(user_id) }
            let update = { "$set": { "lists": newLists } }
            let cursor = await itinerary.updateOne(query, update)
            return cursor
        } catch (e) {
            console.log(`Unable to change list: ${e}`)
            return null
        }
    }
}