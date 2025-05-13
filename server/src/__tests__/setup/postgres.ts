import path from "path";
import { GenericContainer, StartedTestContainer } from "testcontainers";

let container: StartedTestContainer;

export const startPostgresContainer = async () => {
    container = await new GenericContainer("postgres:17.4-alpine")
        .withExposedPorts(5432)
        .withEnvironment({
            POSTGRES_USER: "admin",
            POSTGRES_PASSWORD: "password123"
        })
        .withCopyFilesToContainer([{
            source: path.resolve(__dirname, "../../../prepare-db.sql"),
            target: "/docker-entrypoint-initdb.d/prepare-db.sql"
        }])
        .start();

    const port = container.getMappedPort(5432);
    const host = container.getHost();
    const uri = `postgresql://admin:password123@${host}:${port}/forex`;

    return {
        container,
        uri,
    };
};

export const stopPostgresContainer = async () => {
    if (container) {
        await container.stop();
    }
};
