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

const testData = {
  name: "John",
  age: 30,
  isStudent: false,
  subjects: ["Math", "English"],
  address: {
    city: "New York",
    zip: 10001,
  },
  isEmployed: null,
};

function generateSchema(
  data: Record<string, unknown>,
  schema: Record<string, unknown> = {}
): Record<string, unknown> {
  for (const key in data) {
    const value = calculateRawType(data[key]);
    if (value === "object") {
      schema[key] = {
        type: value,
        properties: generateSchema(data[key] as Record<string, unknown>),
      };
    } else {
      schema[key] = { type: value };
    }
  }

  return schema;
}

console.log(generateSchema(testData));
