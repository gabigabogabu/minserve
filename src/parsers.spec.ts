import { EventEmitter } from "node:stream";
import { MinserveRequest } from "./MinserveRequest";
import { parseFormBody, parseJsonBody, parsePathParams, parseQueryParams, parseStringBody, readBody } from "./parsers";

describe("parsers", () => {
    const setupFakeRequest = (
        request: Partial<Omit<MinserveRequest, "body">>
    ): { request: MinserveRequest; fakeEventEmitter: EventEmitter } => {
        const fakeEventEmitter: EventEmitter = new EventEmitter();
        const registerBodyChunkListener = (
            listener: (chunk: Uint8Array) => void | Promise<void>
        ) => {
            fakeEventEmitter.on("data", (chunk) => listener(chunk));
        };
        const registerBodyEndListener = (listener: () => void | Promise<void>) => {
            fakeEventEmitter.on("end", () => listener());
        };
        const registerBodyErrorListener = (
            listener: (err: Error) => void | Promise<void>
        ) => {
            fakeEventEmitter.on("err", (err) => listener(err));
        };

        return {
            request: {
                body: {
                    registerBodyChunkListener,
                    registerBodyEndListener,
                    registerBodyErrorListener,
                },
                url: "/foo",
                headers: {},
                method: "GET",
                ...request,
            },
            fakeEventEmitter,
        };
    };

    describe("readBody", () => {
        it("should return a buffer", async () => {
            const { request: given, fakeEventEmitter } = setupFakeRequest({});

            const actualPromise = readBody(given as MinserveRequest);

            const data: Uint8Array = new TextEncoder().encode("foo");
            fakeEventEmitter.emit("data", data);
            fakeEventEmitter.emit("end");

            const actual = await actualPromise;
            expect(actual).toEqual(Buffer.from("foo"));
        });
    });

    describe("parseStringBody", () => {
        it.each([
            {
                name: "parse a valid string",
                given: "foo",
                expected: "foo",
            },
            {
                name: "parse an empty string",
                given: "",
                expected: "",
            },
            {
                name: "parse an empty body",
                given: undefined,
                expected: "",
            },
        ])("should $name", async ({ given, expected }) => {
            const { request, fakeEventEmitter } = setupFakeRequest({});

            const actualPromise = parseStringBody(request);

            const data: Uint8Array = new TextEncoder().encode(given);
            fakeEventEmitter.emit("data", data);
            fakeEventEmitter.emit("end");

            const actual = await actualPromise;
            expect(actual).toEqual(expected);
        });

        // TODO test failure modes
    });

    describe("parseJsonBody", () => {
        it.each([
            {
                name: "parse a valid json",
                body: { foo: "bar" },
            },
            {
                name: "parse an empty json object",
                body: {},
            },
            {
                name: "parse an empty json array",
                body: [],
            },
            {
                name: "parse an empty json string",
                body: "",
            },
            {
                name: "parse an empty json number",
                body: 1,
            },
        ])("should $name", async ({ body }) => {
            const { request, fakeEventEmitter } = setupFakeRequest({});

            const actualPromise = parseJsonBody(request);

            const data: Uint8Array = new TextEncoder().encode(JSON.stringify(body));
            fakeEventEmitter.emit("data", data);
            fakeEventEmitter.emit("end");

            const actual = await actualPromise;
            expect(actual).toEqual(body);
        });

        it("should throw for invalid json", async () => {
            const { request: given, fakeEventEmitter } = setupFakeRequest({});

            const actualPromise = parseJsonBody(given as MinserveRequest);

            const data: Uint8Array = new TextEncoder().encode("foo");
            fakeEventEmitter.emit("data", data);
            fakeEventEmitter.emit("end");

            expect(async () => await actualPromise).rejects.toThrow(
                "Unexpected token o in JSON at position 1"
            );
        });

        it("should throw for empty body", async () => {
            const { request: given, fakeEventEmitter } = setupFakeRequest({});

            const actualPromise = parseJsonBody(given as MinserveRequest);

            fakeEventEmitter.emit("end");

            expect(async () => await actualPromise).rejects.toThrow(
                "Unexpected end of JSON input"
            );
        });
    });

    describe("parseFormBody", () => {
        it.each([
            {
                name: "parse a valid form",
                given: "foo=bar",
                expected: { foo: ["bar"] },
            },
            {
                name: "parse a valid form with multiple values",
                given: "foo=bar&foo=baz",
                expected: { foo: ["bar", "baz"] },
            },
            {
                name: "parse a valid form with multiple keys",
                given: "foo=bar&baz=qux",
                expected: { foo: ["bar"], baz: ["qux"] },
            },
            {
                name: "should parse a valid form with multiple keys and values",
                given: "foo=bar&foo=baz&qux=quux&qux=corge",
                expected: { foo: ["bar", "baz"], qux: ["quux", "corge"] },
            },
            {
                name: "should parse an empty form",
                given: "",
                expected: {},
            },
        ])("should $name", async ({ given, expected }) => {
            const { request, fakeEventEmitter } = setupFakeRequest({});

            const actualPromise = parseFormBody(request);

            const data: Uint8Array = new TextEncoder().encode(given);
            fakeEventEmitter.emit("data", data);
            fakeEventEmitter.emit("end");

            const actual = await actualPromise;
            expect(actual).toEqual(expected);
        });

        // TODO test failure modes
    });

    describe("parseUrlParams", () => {
        it.each([
            {
                name: "should parse a valid url",
                given: "http://localhost:8080?foo=bar",
                expected: { foo: ["bar"] },
            },
            {
                name: "should parse a valid url with multiple values",
                given: "http://localhost:8080?foo=bar&foo=baz",
                expected: { foo: ["bar", "baz"] },
            },
            {
                name: "should parse a valid url with multiple keys",
                given: "http://localhost:8080?foo=bar&baz=qux",
                expected: { foo: ["bar"], baz: ["qux"] },
            },
            {
                name: "should parse a valid url with multiple keys and values",
                given: "http://localhost:8080?foo=bar&foo=baz&qux=quux&qux=corge",
                expected: { foo: ["bar", "baz"], qux: ["quux", "corge"] },
            },
            {
                name: "should parse an empty url",
                given: "http://localhost:8080",
                expected: {},
            },
            {
                name: "should parse an empty url with a trailing question mark",
                given: "http://localhost:8080?",
                expected: {},
            },
            {
                name: "should parse a valid url with brackets",
                given: "http://localhost:8080?foo[]=bar&foo[]=baz",
                expected: { foo: ["bar", "baz"] },
            },
        ])("should $name", ({ given, expected }) => {
            const actual = parseQueryParams({ url: given } as MinserveRequest);

            expect(actual).toEqual(expected);
        });

        // TODO test failure modes
    });

    describe("parsePathParams", () => {
        it.each([
            {
                name: "parse a valid path",
                given: "/1",
                givenPattern: "/id",
                expected: { id: ["1"] },
            },
            {
                name: "parse a valid path with multiple params",
                given: "/1/2",
                givenPattern: "/id/id2",
                expected: { id: ["1"], id2: ["2"] },
            },
            {
                name: "parse a valid path with repeating pattern",
                given: "/1/2",
                givenPattern: "/id/id",
                expected: { id: ["1", "2"] },
            },
            {
                name: "parse a valid path with repeating pattern with longer pattern",
                given: "/1/2",
                givenPattern: "/id/id/id",
                expected: { id: ["1", "2", undefined] },
            },
            {
                name: "parse a valid path with repeating pattern with shorter pattern",
                given: "/1/2/3",
                givenPattern: "/id/id",
                expected: { id: ["1", "2"] },
            },
            {
                name: "parse a valid path with multiple params and a trailing slash",
                given: "/1/2/",
                givenPattern: "/id/id2",
                expected: { id: ["1"], id2: ["2"] },
            },
            {
                name: "parse a valid path with multiple params and a query string",
                given: "/1/2?foo=bar",
                givenPattern: "/id/id2",
                expected: { id: ["1"], id2: ["2"] },
            },
            {
                name: "parse a valid path with multiple params and a trailing slash and a query string",
                given: "/1/2/?foo=bar",
                givenPattern: "/id/id2",
                expected: { id: ["1"], id2: ["2"] },
            },
            {
                name: "should parse a valid path with a shorter pattern",
                given: "/foo/1/bar",
                givenPattern: "/foo/id",
                expected: { id: ["1"], foo: ["foo"] },
            },
            {
                name: "should parse a valid path with a longer pattern",
                given: "/foo/1",
                givenPattern: "/foo/id/bar",
                expected: { id: ["1"], foo: ["foo"], bar: [undefined] },
            },
        ])("should $name", ({ given, givenPattern, expected }) => {
            const actual = parsePathParams(
                { url: given } as MinserveRequest,
                givenPattern
            );

            expect(actual).toEqual(expected);
        });
    });
});
