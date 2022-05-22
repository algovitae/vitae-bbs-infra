#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { VitaeBbsInfraStack } from '../lib/vitae-bbs-infra-stack';
import { VitaeBbsDynamoDbStack } from '../lib/vitae-bbs-dynamodb-stack';

const app = new cdk.App();

const stage = app.node.tryGetContext("stage")

if (!stage) {
  throw "stage not specified"
}

new VitaeBbsDynamoDbStack(app, 'VitaeBbsDynamoDbStack', {
  stage
});