const isNumber = (data: unknown): data is number => typeof data === "number";
const isString = (data: unknown): data is string => typeof data === "string";
const isBoolean = (data: unknown): data is boolean => typeof data === "boolean";
const isArray = (data: unknown): data is unknown[] => Array.isArray(data);
const isObject = (data: unknown): data is Record<string, unknown> =>
  typeof data === "object" && !isArray(data);

type JSONSchemaType =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "object"
  | "array"
  | "null";

// JSON schema has the following types:
// string, number, integer, boolean, object, array, null
// This function will determine the type of the data
export function calculateRawType(data: unknown): JSONSchemaType {
  if (isNumber(data)) return "number";
  if (isString(data)) return "string";
  if (isBoolean(data)) return "boolean";
  if (isArray(data)) return "array";
  if (isObject(data)) return "object";
  if (data === null) return "null";

  throw new Error("Unknown type");
}

function inferObjectType(
  data: Record<string, unknown>,
  schema: Record<string, unknown> = {}
): Record<string, unknown> {
  for (const key in data) {
    const value = calculateRawType(data[key]);
    if (value === "object") {
      schema[key] = {
        type: value,
        properties: inferObjectType(data[key] as Record<string, unknown>),
      };
    } else if (value === "array") {
      const itemTypes = inferArrayType(data[key] as unknown[]);

      schema[key] = {
        type: value,
        items: {
          type: "array",
          items: itemTypes,
        },
      };
    } else {
      schema[key] = { type: value };
    }
  }

  return schema;
}

export function inferSchema(
  data: Record<string, unknown>
): Record<string, unknown> {
  if (isArray(data)) {
    const itemTypes = inferArrayType(data);

    return {
      $schema: "http://json-schema.org/draft-07/schema#",
      type: "array",
      items: itemTypes,
    };
  }

  return {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: inferObjectType(data),
  };
}

function inferArrayType(data: unknown[]): Record<string, unknown> {
  const schemas = data.map((item) => {
    const objectType = calculateRawType(item);

    if (objectType === "object") {
      return {
        type: "object",
        properties: inferObjectType(item as Record<string, unknown>),
      };
    } else if (objectType === "array") {
      return { type: "array", items: inferArrayType(item as unknown[]) };
    } else {
      return { type: objectType };
    }
  }) as Record<string, unknown>[];

  const uniqueSchemas = Array.from(
    new Set(schemas.map((schema) => JSON.stringify(schema)))
  ).map((schema) => JSON.parse(schema));

  if (uniqueSchemas.length === 0) {
    return { type: "null" };
  }

  if (uniqueSchemas.length === 1) {
    return uniqueSchemas[0];
  }

  return {
    anyOf: uniqueSchemas,
  };
}
