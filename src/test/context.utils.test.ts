import { describe, expect, test } from "@jest/globals";
import { v4 as uuid_v4 } from "uuid";
import { contextBuilder } from "../utils/context.utils";
import { Exception, ExceptionType } from "../models/exception.model";
import fs from "fs";
import moment from "moment";

describe("bapContextBuilder", () => {
  it("throws an exception if context is missing", async () => {
    try {
      await contextBuilder(null, "someAction");
    } catch (error) {
      expect(error).toEqual(
        new Exception(ExceptionType.Context_NotFound, "Context not found", 404)
      );
    }
  });

  it("throws an exception if context domain is missing", async () => {
    try {
      await contextBuilder({}, "someAction");
    } catch (error) {
      expect(error).toEqual(
        new Exception(
          ExceptionType.Context_DomainNotFound,
          "Domain not found in the context",
          404
        )
      );
    }
  });
  it('throws an exception if both context version and core_version are missing', async () => {
    const context = { domain: 'someDomain', action: 'someAction' };
    await expect(contextBuilder(context, 'someAction')).rejects.toThrowErrorMatchingSnapshot();
  });

  it("builds bapContext with minimum required fields", async () => {
    const result = await contextBuilder(
      {
        domain: "mobility",
        core_version: "0.9.4",
        bap_id: "mobility@beckn.io",
        bap_uri: "mobility@beckn.io",
        country: "INDIA",
        action: "search",
        city: "CHENNAI",
        bpp_id: "becknsandbox@becknprotocol.io",
        bpp_uri: "becknsandbox@becknprotocol.io",
        transaction_id: "1234",
      },
      "search"
    );

    expect(result).toMatchObject({
      domain: "mobility",
        core_version: "0.9.4",
        bap_id: "mobility@beckn.io",
        bap_uri: "mobility@beckn.io",
        country: "INDIA",
        action: "search",
        city: "CHENNAI",
        bpp_id: "becknsandbox@becknprotocol.io",
        bpp_uri: "becknsandbox@becknprotocol.io",
        transaction_id: "1234",
      ttl: expect.any(String),
      timestamp: expect.any(String),
      message_id: expect.any(String),
    });
  });

  it("builds bapContext with minimum required fields", async () => {
    const result = await contextBuilder(
      {
        domain: "mobility",
        version: "1.1.0",
        bap_id: "mobility@beckn.io",
        bap_uri: "mobility@beckn.io",
        location: {
          city: {
              name: "Bangalore",
              code: "std:080"
          },
          country: {
              name: "India",
              code: "IND"
          }
      },
        action: "search",
        bpp_id: "becknsandbox@becknprotocol.io",
        bpp_uri: "becknsandbox@becknprotocol.io",
        transaction_id: "123",
      },
      "search"
    );

    expect(result).toMatchObject({
      domain: "mobility",
      version: "1.1.0",
      bap_id: "mobility@beckn.io",
      bap_uri: "mobility@beckn.io",
      location: {
        city: {
            name: "Bangalore",
            code: "std:080"
        },
        country: {
            name: "India",
            code: "IND"
        }
    },
      action: "search",
      bpp_id: "becknsandbox@becknprotocol.io",
      bpp_uri: "becknsandbox@becknprotocol.io",
      transaction_id: "123",
      ttl: expect.any(String),
      timestamp: expect.any(String),
      message_id: expect.any(String),
    });
  });
  it('reads context schema based on context version', async () => {
    fs.promises.readFile = jest.fn().mockResolvedValue(JSON.stringify({}));
    const result = await contextBuilder(
      {
        domain: "mobility",
        core_version: "0.9.4",
        bap_id: "mobility@beckn.io",
      bap_uri: "mobility@beckn.io",
        country: "INDIA",
        action: "search",
        city: "CHENNAI",
        bpp_id: "becknsandbox@becknprotocol.io",
      bpp_uri: "becknsandbox@becknprotocol.io",
       
        transaction_id: "123",
      },
      "search"
    );
    expect(fs.promises.readFile).toHaveBeenCalledWith(expect.stringContaining('schemas/context_0.9.4.json'));
  });

  it('reads context schema based on core_version if version is missing', async () => {
    fs.promises.readFile = jest.fn().mockResolvedValue(JSON.stringify({}));
    const result = await contextBuilder(
      {
        domain: "mobility",
        core_version: "0.9.4",
        bap_id: "mobility@beckn.io",
      bap_uri: "mobility@beckn.io",
        country: "INDIA",
        action: "search",
        city: "CHENNAI",
        bpp_id: "becknsandbox@becknprotocol.io",
      bpp_uri: "becknsandbox@becknprotocol.io",
        transaction_id: "123",
      },
      "search"
    );
    expect(fs.promises.readFile).toHaveBeenCalledWith(expect.stringContaining('schemas/context_0.9.4.json'));
  });
  
 
 
  it('uses provided context.action for action parsing', async () => {
   
    const result = await contextBuilder(
      {
        domain: "mobility",
        core_version: "0.9.4",
        bap_id: "mobility@beckn.io",
      bap_uri: "mobility@beckn.io",
        country: "INDIA",
        action: "search",
        city: "CHENNAI",
        bpp_id: "becknsandbox@becknprotocol.io",
      bpp_uri: "becknsandbox@becknprotocol.io",
        transaction_id: "123",
      },
      "search"
    );

    expect(result.action).toEqual(expect.objectContaining({}));
  });

  
   it('handles missing schema file', async () => {
    fs.promises.readFile = jest.fn().mockRejectedValue(new Error('File not found'));
    const context = {
      domain: "mobility",
      core_version: "0.9.4",
      bap_id: "mobility@beckn.io",
    bap_uri: "mobility@beckn.io",
      country: "INDIA",
      action: "search",
      city: "CHENNAI",
      bpp_id: "becknsandbox@becknprotocol.io",
    bpp_uri: "becknsandbox@becknprotocol.io",
      transaction_id: "132",
    };

    await expect(contextBuilder(context, 'someAction')).rejects.toThrowErrorMatchingSnapshot();
  });

});
