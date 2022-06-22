# Vitae BBS Infra

スレッド式掲示板のCDK。

再現する手順は https://zenn.dev/link/comments/45620464c40f80 で解説しています。

## 手で設定する項目

### Route53

Hosted Zoneの作成は手で行います。

### SES

ドメインの認証などの設定は手動でしておきます。(CDK・cloud formationsが対応していないのでorz)


## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template
