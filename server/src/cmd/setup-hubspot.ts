import "dotenv/config";
import { getAllStages } from "../services/hubspotApi";
import {
    CreateAPropertyGroup,
    CreateDealStageSchema,
    CreatePropertySchema,
    ObjectType,
    PropertyInfo,
    ReadAllPropertiesResponse,
    ReadAllPropertyGroupsResponse,
    StageInfo,
} from "../types/hubspotApi";
import { hubspotClient } from "../utils/http";

const createPropertyGroupIfDoesNotExist = async (
    objectType: ObjectType,
    name: string,
    label: string
) => {
    const res = await hubspotClient.get<ReadAllPropertyGroupsResponse>(
        `/crm/v3/properties/${objectType}/groups`
    );
    for (const group of res.data.results) {
        if (group.name === name) {
            return;
        }
        if (group.label === label) {
            throw new Error(`A property group with the label '${label}' already exists`)
        }
    }
    const { data } = await hubspotClient.post<CreateAPropertyGroup>(
        `/crm/v3/properties/${objectType}/groups`,
        {
            name: name,
            label,
            displayOrder: 0,
        }
    );

    return data;
};

const createPropertyIfDoesNotExist = async (
    objectType: ObjectType,
    property: CreatePropertySchema
) => {
    const res = await hubspotClient.get<ReadAllPropertiesResponse>(
        `/crm/v3/properties/${objectType}`
    );
    for (const p of res.data.results) {
        if (p.name === property.name) {
            return;
        }
    }

    const { data } = await hubspotClient.post<PropertyInfo>(
        `/crm/v3/properties/${objectType}`,
        property
    );
    return data;
};

const propertyGroups: {
    objectType: ObjectType;
    name: string;
    label: string;
}[] = [
    {
        name: "forex_trading",
        objectType: "deals",
        label: "Forex trading",
    },
    {
        name: "forex_trading",
        objectType: "contacts",
        label: "Forex trading",
    },
];

const customDealProperties: CreatePropertySchema[] = [
    {
        name: "from_currency",
        label: "From currency",
        type: "enumeration",
        fieldType: "select",
        groupName: "forex_trading",
        options: [
            { label: "USD", value: "USD" },
            { label: "GBP", value: "GBP" },
        ],
    },
    {
        name: "to_currency",
        label: "To currency",
        type: "enumeration",
        fieldType: "select",
        groupName: "forex_trading",
        options: [
            { label: "USD", value: "USD" },
            { label: "GBP", value: "GBP" },
        ],
    },
    {
        name: "exchange_rate",
        label: "Exchange rate (forex trading)",
        type: "number",
        fieldType: "number",
        groupName: "forex_trading",
    },
    {
        name: "output",
        label: "Output",
        type: "number",
        fieldType: "number",
        groupName: "forex_trading",
    },
];

const generateProperties = async () => {
    console.log("Generating property groups...");
    for (const propertyGroup of propertyGroups) {
        const propGroupInfo = await createPropertyGroupIfDoesNotExist(
            propertyGroup.objectType,
            propertyGroup.name,
            propertyGroup.label
        );
        if(!propGroupInfo) {
            console.log(`${propertyGroup.name} already exists`);
            continue;
        }
        console.log(`${propGroupInfo.name} created successfully`);
    }

    console.log("Generating custom properties...");
    for (const prop of customDealProperties) {
        const propInfo = await createPropertyIfDoesNotExist("deals", prop);
        if(!propInfo) {
            console.log(`${prop.name} already exists`);
            continue;
        }
        console.log(`${propInfo.name} created successfully`);
    }
};

const createDealStageIfDoesNotExist = async (stage: CreateDealStageSchema) => {
    const { results } = await getAllStages("deals", "default");
    for(const stg of results) {
        if(stg.label === stage.label) {
            return
        }
    }

    const { data } = await hubspotClient.post<StageInfo>(`/crm/v3/pipelines/deals/default/stages`, stage)
    return data
}

const dealStages: CreateDealStageSchema[] = [
    {
        displayOrder: 0,
        label: "exchange_executed",
        metadata: {
            probability: 1
        }
    },
    {
        displayOrder: 0,
        label: "funds_received",
        metadata: {
            probability: 1
        }
    },
]

const generateDealStages = async () => {
    console.log("Generating deal stages...")
    for(const stage of dealStages) {
        const stageInfo = await createDealStageIfDoesNotExist(stage)
        if(!stageInfo) {
            console.log(`${stage.label} stage already exists`);
            continue;
        }
        console.log(`${stageInfo.label} stage created successfully`)
    }
}

const main = async () => {
    await generateDealStages();
    await generateProperties();
}

main();