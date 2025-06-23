# 🚀 FunctionApp Component

> A powerful Pulumi component that deploys Azure Function Apps with managed storage, service plans, and security configurations.

## ✨ Key Features

• **Serverless Deployment**
  ◦ Deploys to Azure Functions on Linux
  ◦ FlexConsumption service plan
  ◦ Automatic scaling configuration

• **Storage & Security**
  ◦ Managed Azure Storage Account
  ◦ Blob container for deployment packages
  ◦ System-assigned managed identity
  ◦ Built-in role assignments

• **Configuration & Monitoring**
  ◦ Custom app settings support
  ◦ Configurable runtime settings
  ◦ Memory and instance scaling controls

## 🛠️ Installation

```bash
# Install using GitHub token
GITHUB_TOKEN=$(gh auth token) pulumi package add https://github.com/TechWatching/pulumi-azure-function-app
```

## 📝 Usage Examples

### TypeScript Implementation

#### Basic Function App

```typescript
import * as pulumi from "@pulumi/pulumi";
import { FunctionAppComponent } from "functionapp";

const functionApp = new FunctionAppComponent("my-function-app", {
    resourceGroupName: "my-resource-group",
    runtime: {
        name: "node",
        version: "20"
    }
});

export const functionAppName = functionApp.functionAppName;
export const functionAppUrl = functionApp.functionAppUrl;
```

#### Advanced Configuration

```typescript
import * as pulumi from "@pulumi/pulumi";
import { FunctionAppComponent } from "functionapp";

const functionApp = new FunctionAppComponent("my-function-app", {
    resourceGroupName: "my-resource-group",
    runtime: {
        name: "python",
        version: "3.11"
    },
    maximumInstanceCount: 200,
    instanceMemoryMB: 4096,
    appSettings: [
        {
            name: "CUSTOM_SETTING",
            value: "custom-value"
        },
        {
            name: "API_URL",
            value: "https://api.example.com"
        }
    ]
});

export const functionAppName = functionApp.functionAppName;
export const functionAppUrl = functionApp.functionAppUrl;
export const storageAccountName = functionApp.storageAccountName;
```

## 📚 API Documentation

### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| resourceGroupName | string | Yes | Azure resource group name |
| runtime | RuntimeArgs | Yes | Function runtime configuration |
| maximumInstanceCount | number | No | Maximum scaling instances (default: 100) |
| instanceMemoryMB | number | No | Memory per instance in MB (default: 2048) |
| appSettings | NameValuePairArgs[] | No | Custom application settings |

### Output Values

| Property | Type | Description |
|----------|------|-------------|
| functionAppName | string | Function App name |
| functionAppUrl | string[] | Function App URLs |
| storageAccountName | string | Storage account name |
| servicePlanName | string | App Service Plan name |

## 🔧 Resource Creation

The component creates the following Azure resources:

1. **Storage** `[Storage Account, Blob Container]`
   ◦ Storage Account (Standard_LRS)
   ◦ Deployment package container
   ◦ Secure blob access configuration

2. **Compute** `[App Service Plan, Function App]`
   ◦ FlexConsumption App Service Plan
   ◦ Linux-based Function App
   ◦ System-assigned managed identity

3. **Security** `[Role Assignments]`
   ◦ Storage Blob Data Contributor role
   ◦ Managed identity authentication
   ◦ Secure storage access

4. **Configuration** `[App Settings, Runtime]`
   ◦ Default storage connection settings
   ◦ Custom application settings
   ◦ Runtime version configuration

## 🔒 Security Considerations

• All resources use managed identities for authentication
• Storage accounts have public blob access disabled
• Role assignments follow least privilege principle
• System-assigned identity for secure resource access
• Deployment packages stored in private blob containers

## 📄 License

This component is licensed under the MIT License.