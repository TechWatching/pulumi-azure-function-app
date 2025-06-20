import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure-native";
import { storage } from "@pulumi/azure-native";
import { AppServicePlan, WebApp } from "@pulumi/azure-native/web";
import { RoleAssignment } from "@pulumi/azure-native/authorization";
import { azureBuiltInRoles } from "./azureBuiltInRoles";

export interface FunctionAppArgs {
  resourceGroupName: pulumi.Input<string>;
  runtime: pulumi.Input<azure.types.input.web.FunctionsRuntimeArgs>;
  maximumInstanceCount?: pulumi.Input<number>;
  instanceMemoryMB?: pulumi.Input<number>;
  appSettings?: pulumi.Input<azure.types.input.web.NameValuePairArgs[]>;
}

export class FunctionAppComponent extends pulumi.ComponentResource {

  constructor(name: string, args: FunctionAppArgs, opts?: pulumi.ComponentResourceOptions) {
    super("azure-native:functionapp:FunctionAppComponent", name, {}, opts);

    const resourceOptions: pulumi.ResourceOptions = { parent: this };

    const storageAccount = new azure.storage.StorageAccount(name, {
      resourceGroupName: args.resourceGroupName,
      allowBlobPublicAccess: false,
      kind: azure.storage.Kind.StorageV2,
      sku: {
        name: azure.storage.SkuName.Standard_LRS,
      },
    }, resourceOptions);

    const blobContainer = new storage.BlobContainer('deploymentPackageContainer', {
      resourceGroupName: args.resourceGroupName,
      accountName:storageAccount.name,
      containerName: 'deploymentpackage',    }, resourceOptions);

    const servicePlan = new AppServicePlan(name, {
      resourceGroupName: args.resourceGroupName,
      sku: {
        tier: 'FlexConsumption',
        name: 'FC1'
      },
      reserved: true
    }, resourceOptions);

    // Prepare app settings by merging defaults with custom settings
    const defaultAppSettings = [
      {
        name: 'AzureWebJobsStorage__accountName',
        value: storageAccount.name
      }
    ];

    const allAppSettings = args.appSettings
      ? pulumi.all([args.appSettings]).apply(([customSettings]) => [...defaultAppSettings, ...customSettings])
      : defaultAppSettings;

    const functionApp = new WebApp(name, {
      resourceGroupName: args.resourceGroupName,
      kind: 'functionapp,linux',
      serverFarmId: servicePlan.id,
      identity: {
        type: 'SystemAssigned'
      },
      siteConfig: {
        appSettings: allAppSettings
      },
      functionAppConfig: {
        deployment: {
          storage: {
            type: 'blobContainer',
            value: pulumi.interpolate`${storageAccount.primaryEndpoints.blob}${blobContainer.name}`,
            authentication: {
              type: 'SystemAssignedIdentity'
            }
          }
        },
        scaleAndConcurrency: {
          instanceMemoryMB: args.instanceMemoryMB || 2048,
          maximumInstanceCount: args.maximumInstanceCount || 100,
        },
        runtime: args.runtime
      }
    }, resourceOptions);

    const roleAssignment = new RoleAssignment('storageBlobDataContributor', {
      roleDefinitionId: azureBuiltInRoles.storageBlobDataContributor,
      scope: storageAccount.id,
      principalId: functionApp.identity.apply(p => p!.principalId),
      principalType: 'ServicePrincipal'
    }, resourceOptions);

    this.registerOutputs({
      storageAccountName: storageAccount.name,
      functionAppName: functionApp.name,
      servicePlanName: servicePlan.name,
      functionAppUrl: functionApp.hostNames
    });
  }
}