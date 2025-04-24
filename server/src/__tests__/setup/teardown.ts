import { stopMongoContainer } from "./mongo";

module.exports = async () => {
    await stopMongoContainer();
};
