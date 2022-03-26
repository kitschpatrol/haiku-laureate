import { Handler } from "@netlify/functions";
import { generateHaikuForAddress } from "../../src/main";

const handler: Handler = async (event, context) => {
  let response = {};

  // Check for address
  if (event.queryStringParameters.address == undefined || event.queryStringParameters.address.length == 0) {
    response["status"] = "error";
    response["reason"] = 'You need to pass a URL-encoded "address" query parameter';
  } else {
    const address = event.queryStringParameters.address;
    response["address"] = address;

    try {
      const haiku = await generateHaikuForAddress(address);
      response["status"] = "success";
      response["haiku"] = haiku;
    } catch (error) {
      response["status"] = "error";
      response["reason"] = error.message;
    }
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "access-control-allow-origin": "https://frontiernerds.com",
      // "access-control-allow-origin": "*",
    },
    body: JSON.stringify(response),
  };
};

export { handler };
