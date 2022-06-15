import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { StageProps } from './stage-props';

export class VitaeBbsDynamoDbStack extends Stack {
    constructor(scope: Construct, id: string, props: StackProps & StageProps) {
        super(scope, id, props);

        const suffix = props.stage[0].toUpperCase() + props.stage.slice(1)

        const userTable = new dynamodb.Table(this, `User`, {
            tableName: `User${suffix}`,
            partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        });

        const userIdentityTable = new dynamodb.Table(this, `UserIdentity`, {
            tableName: `UserIdentity${suffix}`,
            partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        });
        userIdentityTable.addGlobalSecondaryIndex({
            indexName: 'userIdIndex',
            partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING }
        });
        userIdentityTable.addGlobalSecondaryIndex({
            indexName: 'emailIndex',
            partitionKey: { name: 'email', type: dynamodb.AttributeType.STRING }
        });

        const groupTable = new dynamodb.Table(this, `Group`, {
            tableName: `Group${suffix}`,
            partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        });

        const membershipTable = new dynamodb.Table(this, `Membership`, {
            tableName: `Membership${suffix}`,
            partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        });

        membershipTable.addGlobalSecondaryIndex({
            indexName: 'groupIdIndex',
            partitionKey: { name: 'groupId', type: dynamodb.AttributeType.STRING },
        });
        membershipTable.addGlobalSecondaryIndex({
            indexName: 'userIdIndex',
            partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
        });

        const threadTable = new dynamodb.Table(this, `Thread`, {
            tableName: `Thread${suffix}`,
            partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        });
        threadTable.addGlobalSecondaryIndex({
            indexName: 'groupIdIndex',
            partitionKey: { name: 'groupId', type: dynamodb.AttributeType.STRING }
        })

        const threadCommentTable = new dynamodb.Table(this, `ThreadComment`, {
            tableName: `ThreadComment${suffix}`,
            partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        });
        threadCommentTable.addGlobalSecondaryIndex({
            indexName: 'threadIdIndex',
            partitionKey: { name: 'threadId', type: dynamodb.AttributeType.STRING }
        })
    }
}
