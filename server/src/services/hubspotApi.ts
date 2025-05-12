import {
    ContactInfo,
    CreateAddFundsDealSchema,
    CreateExchangeDealSchema,
    GetAllStagesResponse,
    ObjectType,
    SearchForContactsResponse,
} from "../types/hubspotApi";
import { hubspotClient } from "../utils/http";

export const getAllStages = async (objectType: ObjectType, pipelineId: string) => {
    const { data } = await hubspotClient.get<GetAllStagesResponse>(`/crm/v3/pipelines/${objectType}/${pipelineId}/stages`);
    return data;
}

export const createDealWithContactAssociation = async (
    contactID: string,
    properties: CreateExchangeDealSchema["properties"] | CreateAddFundsDealSchema["properties"]
) => {
    const { results } = await getAllStages("deals", properties.pipeline);
    let stageID = ""

    for(const stage of results) {
        if(stage.label === properties.dealstage) {
            stageID = stage.id
        }
    }

    const { data } = await hubspotClient.post(`/crm/v3/objects/deals`, {
        properties: { ...properties, dealstage: stageID },
        associations: [{
            to: {
                id: contactID,
            },
            types: [{
                associationCategory: "HUBSPOT_DEFINED",
                associationTypeId: 3, // deals to contact
            }],
        }],
    });
    return data;
};

export const createContact = async (email: string, name: string) => {
    const res = await hubspotClient.post<SearchForContactsResponse>(`/crm/v3/objects/contacts/search`, { 
        filterGroups: [{
            filters: [{
                propertyName: "email",
                operator: "EQ",
                value: email
            }]
        }] 
    })

    if(res.data.total > 0) {
        throw new Error(`A contact with the email '${email}' already exists!`);
    }
    
    const { data } = await hubspotClient.post<ContactInfo>(`/crm/v3/objects/contacts`, {
        properties: {
            email,
            firstname: name,
            lastname: ""
        }
    })

    return data
}