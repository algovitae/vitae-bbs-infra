#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { VitaeBbsDynamoDbStack } from '../lib/vitae-bbs-dynamodb-stack';
import { VitaeBbsApigwStack } from '../lib/vitae-bbs-apigw-stack';
import { VitaeBbsKmsStack } from '../lib/vitae-bbs-kms';

const app = new cdk.App();

const stage = app.node.tryGetContext("stage")

if (!stage) {
  throw "stage not specified"
}


new VitaeBbsKmsStack(app, 'VitaeBbsKmsStack', {
  stage
})

new VitaeBbsDynamoDbStack(app, 'VitaeBbsDynamoDbStack', {
  stage
});

new VitaeBbsApigwStack(app, 'VitaeBbsApigwStack', {
  stage
})