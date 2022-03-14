import { jest } from "@jest/globals";
import { generateHaikuForAddress } from "../src/main";

describe("generate haiku for a dense address", () => {
  jest.setTimeout(60 * 1000);
  const address = "123 William Street, New York NY";

  it(`wrote a haiku for an ${address}:`, async () => {
    const result = await generateHaikuForAddress(address);
    console.log(result);
    expect(result).not.toBe("");
  });
});

describe("generate haiku for a sparse address", () => {
  jest.setTimeout(60 * 1000);
  const address = "106 3rd St Climax, Kansas";

  it(`wrote a haiku for an ${address}:`, async () => {
    const result = await generateHaikuForAddress(address);
    console.log(result);
    expect(result).not.toBe("");
  });
});

describe("handle invalid address", () => {
  jest.setTimeout(60 * 1000);
  const address = "adfkjsdjlkf sdflksadflkjsdf";

  //https://jestjs.io/docs/tutorial-async#error-handling
  it("should throw an error", async () => {
    expect.assertions(1);
    try {
      await generateHaikuForAddress(address);
    } catch (e) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(e).not.toBeUndefined();
    }
  });
});
