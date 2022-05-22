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
            partitionKey: { name: 'user_id', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        });

        const userIdentityTable = new dynamodb.Table(this, `UserIdentity`, {
            tableName: `UserIdentity${suffix}`,
            partitionKey: { name: 'email', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        }).addGlobalSecondaryIndex({
            indexName: 'user_id_idx',
            partitionKey: { name: 'user_id', type: dynamodb.AttributeType.STRING }
        });

        const groupTable = new dynamodb.Table(this, `Group`, {
            tableName: `Group${suffix}`,
            partitionKey: { name: 'group_id', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        });

        const membershipTable = new dynamodb.Table(this, `Membership`, {
            tableName: `Membership${suffix}`,
            partitionKey: { name: 'user_id', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'group_id', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        }).addGlobalSecondaryIndex({
            indexName: 'group_id_user_id_idx',
            partitionKey: { name: 'group_id', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'user_id', type: dynamodb.AttributeType.STRING },
        });

        const threadTable = new dynamodb.Table(this, `Thread`, {
            tableName: `Thread${suffix}`,
            partitionKey: { name: 'group_id', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'thread_id', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        })

        const threadCommentTable = new dynamodb.Table(this, `ThreadComment`, {
            tableName: `ThreadComment${suffix}`,
            partitionKey: { name: 'thread_id', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'comment_id', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        })
    }
}
