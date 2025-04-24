import { startMongoContainer } from "./mongo";

module.exports = async () => {
    global.__MONGO_URI__ = (await startMongoContainer()).uri;
    process.env.MONGO_URI = global.__MONGO_URI__;
    process.env.MONGO_DBNAME = "testdb";
};
