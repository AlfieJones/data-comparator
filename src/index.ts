import Avj from "ajv";
import { inferSchema } from "./compare/calculatePrimitive";

const ajv = new Avj();

interface MockedResponse {
  data: Record<string, unknown>;
  schema: Record<string, unknown>;
}

interface MockRequest {
  endpoint: string;
  data: Record<string, unknown>;
  method: string;
}

const mockedResponses: Record<string, MockedResponse> = {};

function getKey(endpoint: string, method: string): string {
  return `${method.toUpperCase()} ${endpoint}`;
}

async function mockData(req: Request): Promise<Record<string, unknown>> {
  const { endpoint, data, method } = (await req.json()) as MockRequest;

  if (mockedResponses[getKey(endpoint, method)]) {
    const { schema, data: mockedData } =
      mockedResponses[getKey(endpoint, method)];

    if (ajv.validate(schema, data)) return mockedData;
  }

  const newSchema = inferSchema(data);

  console.log("schema", newSchema);

  mockedResponses[getKey(endpoint, method)] = {
    data: data,
    schema: newSchema,
  };

  return data;
}

Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/mock.js")
      return new Response(Bun.file(`${import.meta.dir}/mock.js`));

    if (url.pathname === "/register.js")
      return new Response(Bun.file(`${import.meta.dir}/register.js`));

    if (url.pathname === "/mock") {
      return new Response(
        await mockData(req).then((data) => JSON.stringify(data)),
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          },
        }
      );
    }

    return new Response("404 Not Found", { status: 404 });
  },
});

console.log("Running");
