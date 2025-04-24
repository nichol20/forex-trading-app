import { GenericContainer, StartedTestContainer } from "testcontainers";

let container: StartedTestContainer;

export const startMongoContainer = async () => {
    container = await new GenericContainer("mongo:8.0.8")
        .withExposedPorts(27017)
        .withEnvironment({
            MONGO_INITDB_ROOT_USERNAME: "admin",
            MONGO_INITDB_ROOT_PASSWORD: "password123",
        })
        .start();

    const port = container.getMappedPort(27017);
    const host = container.getHost();
    const uri = `mongodb://admin:password123@${host}:${port}`;

    return {
        container,
        uri,
    };
};

export const stopMongoContainer = async () => {
    if (container) {
        await container.stop();
    }
};
