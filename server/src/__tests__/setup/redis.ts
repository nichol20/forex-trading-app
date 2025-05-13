import { GenericContainer, StartedTestContainer } from "testcontainers";

let container: StartedTestContainer;

export const startRedisContainer = async (): Promise<{
    container: StartedTestContainer;
    uri: string;
}> => {
    container = await new GenericContainer("redis:8.0.0-alpine")
        .withExposedPorts(6379)
        .start();

    const port = container.getMappedPort(6379);
    const host = container.getHost();
    const uri = `redis://${host}:${port}`;

    return { container, uri };
};

export const stopRedisContainer = async (): Promise<void> => {
    if (container) {
        await container.stop();
    }
};
