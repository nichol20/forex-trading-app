import { Currency } from "../utils/currency";

export type ObjectType = "deals" | "contacts"; // there's more
type PropertyFieldType =
    | "textarea"
    | "text"
    | "date"
    | "file"
    | "number"
    | "select"
    | "radio"
    | "checkbox"
    | "booleancheckbox"
    | "calculation_equation";
type PropertyType =
    | "string"
    | "number"
    | "date"
    | "datetime"
    | "enumeration"
    | "bool";

interface PropertyBase {
    name: string;
    label: string;
    type: PropertyType;
    fieldType: PropertyFieldType;
    groupName: string;
}

interface PropertyGroupInfo {
    name: string;
    label: string;
    displayOrder: number;
    archived: boolean;
}

interface PropertyInfo extends PropertyBase {
    createdUserId: string;
    updatedUserId: string;
    hidden: boolean;
    modificationMetadata: {
        readOnlyOptions: boolean;
        readOnlyValue: boolean;
        readOnlyDefinition: boolean;
        archivable: boolean;
    };
    displayOrder: number;
    description: string;
    showCurrencySymbol: boolean;
    hubspotDefined: boolean;
    formField: boolean;
    createdAt: string;
    archivedAt: string;
    archived: boolean;
    referencedObjectType: string;
    options: {
        hidden: boolean;
        displayOrder: number;
        description: string;
        label: string;
        value: string;
    }[];
    calculationFormula: string;
    hasUniqueValue: boolean;
    calculated: boolean;
    externalOptions: boolean;
    updatedAt: string;
    dataSensitivity: string;
}

type ReadAPropertyGroupResponse = PropertyGroupInfo;
interface ReadAllPropertyGroupsResponse {
    results: PropertyGroupInfo[];
}
type CreateAPropertyGroup = PropertyGroupInfo; // 201

interface ReadAllPropertiesResponse {
    results: PropertyInfo[];
}

interface StageInfo {
    label: string;
    displayOrder: number;
    metadata: { isClosed: boolean; probability: string };
    id: string;
    createdAt: string;
    updatedAt: string;
    writePermissions: string;
    archived: boolean;
}

interface GetAllStagesResponse {
    results: StageInfo[];
}

interface CreateDealStageSchema {
    metadata: {
        probability: number;
    };
    displayOrder: number;
    label: string;
}

interface CreateDealStageResponse {}

interface CreateEnumerationPropertySchema extends PropertyBase {
    type: "enumeration";
    fieldType: "select";
    options: {
        label: string;
        value: string;
    }[];
}

type CreatePropertySchema = PropertyBase | CreateEnumerationPropertySchema;

interface DealInfo {
    id: string
    properties: {
        amount: string
        amount_in_home_currency: string
        closedate: string
        createdate: string
        days_to_close: string
        dealname: string
        dealstage: string
        num_associated_contacts: string
        num_notes: string
        pipeline: string
        [key: string]: string
    },
    createdAt: string
    updatedAt: string
    archived: boolean
}

type CreateDealResponse = DealInfo

interface AssociationSchema {
    to: {
        id: number;
    };
    types: {
        associationCategory:
            | "HUBSPOT_DEFINED"
            | "USER_DEFINED"
            | "INTEGRATOR_DEFINED";
        associationTypeId: number;
    }[];
}

interface CreateDealSchema {
    properties: {
        dealname: string;
        pipeline: "default";
        dealstage: string;
        [key: string]: string | number;
    };
    associations: AssociationSchema[];
}

interface CreateExchangeDealSchema extends CreateDealSchema {
    properties: {
        dealname: string;
        pipeline: "default";
        dealstage: "exchange_executed";
        from_currency: Currency;
        to_currency: Currency;
        exchange_rate: number;
        amount: number;
        output: number;
    };
}

interface CreateAddFundsDealSchema extends CreateDealSchema {
    properties: {
        dealname: string;
        pipeline: "default";
        dealstage: "funds_received";
        amount: number;
    };
}

interface ContactInfo {
    id: string;
    createdAt: string;
    archived: boolean;
    archivedAt: string;
    updatedAt: string;
    properties: {
        email: string;
        lastname: string;
        firstname: string;
        createdate: string;
        lastmodifieddate: string;
        [key: string]: string;
    };
}

interface SearchForContactsResponse {
    total: number
    paging: {
    next: {
            link: string
            after: string
        }
    }
    results: ContactInfo[]
}