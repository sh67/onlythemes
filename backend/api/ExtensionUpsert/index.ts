﻿import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { CosmosClient } from "@azure/cosmos";

import { Extension } from "../Models/extension";

const endpoint = process.env.cosmosDbEndpoint;
const key = process.env.cosmosDbKey;
const cosmosClient = new CosmosClient({ endpoint, key });

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

  const extension: Extension = context.bindings.extension;

  context.log(`DataParser: ${extension.displayName}`);

  if (extension) {

    try {
      const { database } = await cosmosClient.databases.createIfNotExists({ id: "onlyThemesDb" });
      const { container } = await database.containers.createIfNotExists({ id: "extensions" });
      const { resource } = await container.items.upsert(extension);

      context.res = {
        status: 200,
        body: resource.id
      };
    }
    catch (err) {
      context.res = {
        status: 500,
        body: err
      };
    }
  }

  context.res = {
    status: 404
  };
};

export default httpTrigger;
