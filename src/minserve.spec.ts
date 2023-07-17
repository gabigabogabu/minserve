import { IncomingMessage } from "http";
import { ServerResponse } from "node:http";
import { minserve } from "./minserve";

describe("handler", () => {
    const getExampleRequest = (
        params: Partial<IncomingMessage>
    ): Partial<IncomingMessage> => {
        return {
            url: "/foo",
            headersDistinct: { test: ["header"] },
            method: "GET",
            ...params,
        };
    };

    const getMockResponse = (
        params: Partial<ServerResponse>
    ): Partial<ServerResponse> => {
        return {
            setHeader: jest.fn(),
            end: jest.fn(),
            on: jest.fn(),
            write: jest.fn(),
            ...params,
        };
    };

    describe("request", () => {
        it("should parse request and forward to handler", async () => {
            const mockRequestHandler = jest.fn();
            const server = minserve({ requestHandler: mockRequestHandler });
            const fakeRequest = getExampleRequest({});
            const mockResponse = getMockResponse({});

            const handled = server.emit("request", fakeRequest, mockResponse);

            expect(handled).toBe(true);
            expect(mockRequestHandler).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: "/foo",
                    headers: { test: ["header"] },
                    method: "GET",
                })
            );
            expect(mockRequestHandler).toHaveBeenCalledTimes(1);
        });
    });

    describe("response", () => {
        it("should set headers from handler response", (done) => {
            const mockRequestHandler = jest.fn().mockReturnValue({
                statusCode: 200,
                headers: { foo: "bar" },
                body: "foo",
            });
            const server = minserve({ requestHandler: mockRequestHandler });
            const fakeRequest = getExampleRequest({});

            let actualHeaders: {};
            const mockResponse = getMockResponse({
                setHeader: jest.fn().mockImplementation((key, value) => {
                    actualHeaders = { [key]: value };
                }),
                end: jest.fn().mockImplementation(() => {
                    expect(actualHeaders).toStrictEqual({ foo: "bar" });
                    done();
                }),
            });

            server.emit("request", fakeRequest, mockResponse);
        });

        it("should write body from handler response", (done) => {
            const mockRequestHandler = jest.fn().mockReturnValue({
                statusCode: 200,
                headers: { foo: "bar" },
                body: "foo",
            });
            const server = minserve({ requestHandler: mockRequestHandler });
            const fakeRequest = getExampleRequest({});

            let actualBody = "";

            const mockResponse = getMockResponse({
                write: jest.fn().mockImplementation((body) => {
                    actualBody = body;
                }),
                end: jest.fn().mockImplementation(() => {
                    expect(actualBody).toBe("foo");
                    done();
                }),
            });

            server.emit("request", fakeRequest, mockResponse);
        });

        it("should register error handler", (done) => {
            const mockRequestHandler = jest.fn().mockReturnValue({
                statusCode: 200,
                headers: { foo: "bar" },
                body: "foo",
            });

            const server = minserve({ requestHandler: mockRequestHandler });

            const fakeRequest = getExampleRequest({});

            const mockResponse = getMockResponse({
                on: jest.fn().mockImplementation((event, listener) => {
                    expect(event).toBe("error");
                    expect(listener).toBeInstanceOf(Function);
                    done();
                }),
            });

            server.emit("request", fakeRequest, mockResponse);
        });
    });
});
