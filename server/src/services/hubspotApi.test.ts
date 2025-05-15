import { createContact, getAllStages, createDealWithContactAssociation } from "./hubspotApi";
import { hubspotClient } from "../utils/http";

describe("Hubspot API Service", () => {
    it("should return stage data for a given objectType and pipelineId", async () => {
        const mockStages = { results: [{ id: "1", label: "stage" }] };
        (hubspotClient.get as jest.Mock).mockResolvedValueOnce({ data: mockStages });

        const result = await getAllStages("deals", "pipeline-123");

        expect(hubspotClient.get).toHaveBeenCalledWith("/crm/v3/pipelines/deals/pipeline-123/stages");
        expect(result).toEqual(mockStages);
    });

    it("should create a deal with correct association", async () => {
        const mockStages = {
            results: [
                { id: "stage-1", label: "label 1" },
                { id: "stage-2", label: "funds_received" },
            ],
        };
        const mockDealResponse = { id: "deal-123", properties: {} };

        (hubspotClient.get as jest.Mock).mockResolvedValueOnce({ data: mockStages });
        (hubspotClient.post as jest.Mock).mockResolvedValueOnce({ data: mockDealResponse });

        const result = await createDealWithContactAssociation("contact-123", {
            pipeline: "default",
            dealstage: "funds_received",
            dealname: "Test Deal",
            amount: 1000,
        });

        expect(hubspotClient.get).toHaveBeenCalledWith("/crm/v3/pipelines/deals/default/stages");
        expect(hubspotClient.post).toHaveBeenCalledWith("/crm/v3/objects/deals", {
            properties: {
                pipeline: "default",
                dealstage: "stage-2",
                dealname: "Test Deal",
                amount: 1000,
            },
            associations: [{
                to: { id: "contact-123" },
                types: [{
                    associationCategory: "HUBSPOT_DEFINED",
                    associationTypeId: 3,
                }],
            }],
        });
        expect(result).toEqual(mockDealResponse);
    });

    it("should throw an error if contact with email exists", async () => {
        (hubspotClient.post as jest.Mock).mockResolvedValueOnce({
            data: { total: 1, results: [] },
        });

        await expect(createContact("test@example.com", "Test Name")).rejects.toThrow(
            "A contact with the email 'test@example.com' already exists!"
        );
    });

    it("should create a new contact if it doesn't exist", async () => {
        (hubspotClient.post as jest.Mock)
            .mockResolvedValueOnce({ data: { total: 0, results: [] } }) // search
            .mockResolvedValueOnce({ data: { id: "contact-123", properties: {} } }); // create

        const result = await createContact("new@example.com", "New Name");

        expect(hubspotClient.post).toHaveBeenCalledWith("/crm/v3/objects/contacts", {
            properties: {
                email: "new@example.com",
                firstname: "New Name",
                lastname: "",
            },
        });

        expect(result).toEqual({ id: "contact-123", properties: {} });
    });
});
