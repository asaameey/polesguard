# AWS IoT Core Setup Guide for Pole Monitoring System

## Prerequisites

- AWS Account with IoT Core access
- AWS CLI configured with credentials
- Your Vercel deployment URL (e.g., https://your-app.vercel.app)
- API key or authentication token for webhook calls

## Step 1: Create AWS IoT Policy

Create a policy that allows devices to publish to MQTT topics.

```bash
aws iot create-policy \
  --policy-name "PoleMonitoringDevicePolicy" \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": "iot:Connect",
        "Resource": "arn:aws:iot:*:*:client/*"
      },
      {
        "Effect": "Allow",
        "Action": "iot:Publish",
        "Resource": "arn:aws:iot:*:*:topicfilter/$aws/things/*/shadow/update"
      },
      {
        "Effect": "Allow",
        "Action": "iot:Receive",
        "Resource": "arn:aws:iot:*:*:topicfilter/$aws/things/*/shadow/get/accepted"
      },
      {
        "Effect": "Allow",
        "Action": "iot:Subscribe",
        "Resource": "arn:aws:iot:*:*:topicfilter/$aws/things/*/shadow/*"
      }
    ]
  }'
```

## Step 2: Create AWS IoT Thing Type

```bash
aws iot create-thing-type \
  --thing-type-name "UtilityPole" \
  --thing-type-properties '{
    "thingTypeDescription": "Utility pole with IoT monitoring sensors",
    "searchableAttributes": ["poleId", "location", "region"]
  }'
```

## Step 3: Create a Device Certificate

For each pole device, create an X.509 certificate:

```bash
aws iot create-keys-and-certificate \
  --set-as-active \
  --certificate-pem-outfile cert.pem \
  --public-key-outfile public.key \
  --private-key-outfile private.key
```

Save the certificate ARN from the output - you'll need it in the next step.

```bash
# Get your AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION="us-east-1"  # Change to your region

# Get the root CA certificate
wget https://www.amazontrust.com/repository/AmazonRootCA1.pem
```

## Step 4: Attach Policy to Certificate

```bash
CERTIFICATE_ARN=$(aws iot list-certificates --query 'certificates[0].certificateArn' --output text)

aws iot attach-policy \
  --policy-name "PoleMonitoringDevicePolicy" \
  --target "$CERTIFICATE_ARN"
```

## Step 5: Create AWS IoT Thing

For each pole, create a "thing" (device) in AWS IoT:

```bash
POLE_ID="POLE-001"
DEVICE_NAME="pole-001-device"

aws iot create-thing \
  --thing-name "$DEVICE_NAME" \
  --thing-type-name "UtilityPole" \
  --thing-attributes '{"poleId":"'$POLE_ID'", "location":"Downtown Grid A"}'

# Attach the certificate to the thing
aws iot attach-thing-principal \
  --thing-name "$DEVICE_NAME" \
  --principal "$CERTIFICATE_ARN"
```

## Step 6: Get Your AWS IoT Endpoint

```bash
aws iot describe-endpoint \
  --endpoint-type iot:Data-ATS
```

The output will contain the `endpointAddress`. It should look like:
```
xxxxxxx-ats.iot.us-east-1.amazonaws.com
```

## Step 7: Create AWS IoT Rules Engine Rule

The Rules Engine routes MQTT messages to your API endpoint.

```bash
aws iot put-topic-rule \
  --rule-name PoleMonitoringToAPI \
  --topic-rule-payload '{
    "ruleDisabled": false,
    "sql": "SELECT * FROM \"$aws/things/+/shadow/update\" WHERE state.reported.current_A IS NOT NULL",
    "actions": [
      {
        "http": {
          "url": "https://your-app.vercel.app/api/iot/telemetry",
          "confirmationUrl": "",
          "headers": {
            "Content-Type": "application/json",
            "Authorization": "Bearer YOUR_SECRET_API_KEY"
          },
          "encoding": "UTF-8"
        }
      }
    ]
  }'
```

**Important**: Replace:
- `https://your-app.vercel.app` with your actual Vercel deployment URL
- `YOUR_SECRET_API_KEY` with a secure API key (store in Vercel env vars)

## Step 8: Create IAM Role for Rules Engine

The Rules Engine needs permissions to call your HTTP endpoint:

```bash
# Create trust policy
cat > trust-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "iot.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Create IAM role
aws iam create-role \
  --role-name IoTRulesEngineRole \
  --assume-role-policy-document file://trust-policy.json

# Attach policy for HTTP actions
cat > http-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "iot:publish"
      ],
      "Resource": [
        "arn:aws:iot:*:*:topicfilter/*"
      ]
    }
  ]
}
EOF

aws iam put-role-policy \
  --role-name IoTRulesEngineRole \
  --policy-name IoTHTTPPolicy \
  --policy-document file://http-policy.json
```

## Step 9: Configure Device Provisioning (Optional but Recommended)

For automated device registration, use Fleet Provisioning:

```bash
# Create provisioning template
aws iot create-provisioning-template \
  --template-name "PoleMonitoringTemplate" \
  --enabled \
  --provisioning-role-arn "arn:aws:iam::$AWS_ACCOUNT_ID:role/IoTProvisioningRole" \
  --template-body '{
    "Parameters": {
      "AWS::IoT::Certificate::Id": {
        "Type": "String"
      },
      "poleId": {
        "Type": "String"
      }
    },
    "Resources": {
      "thing": {
        "Type": "AWS::IoT::Thing",
        "Properties": {
          "ThingName": {
            "Fn::Sub": "pole-${poleId}-device"
          },
          "ThingTypeName": "UtilityPole",
          "ThingGroups": ["PoleMonitoring"],
          "AttributePayload": {
            "poleId": {
              "Ref": "poleId"
            }
          }
        }
      },
      "certificate": {
        "Type": "AWS::IoT::Certificate",
        "Properties": {
          "CertificateId": {
            "Ref": "AWS::IoT::Certificate::Id"
          },
          "Status": "ACTIVE"
        }
      },
      "policy": {
        "Type": "AWS::IoT::Policy",
        "Properties": {
          "PolicyName": "PoleMonitoringDevicePolicy"
        }
      }
    }
  }'
```

## Step 10: Store Device Credentials in Database

After creating devices in AWS IoT, save the certificates to your database for future reference:

```bash
# Example using the API - call this after device creation
curl -X POST https://your-app.vercel.app/api/devices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "poleId": "POLE-001",
    "deviceName": "pole-001-device",
    "certificateArn": "arn:aws:iot:us-east-1:123456789:cert/abcdef123456",
    "publicKey": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----",
    "privateKey": "-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
  }'
```

## Testing Device Connection

### 1. Test MQTT Connection

```bash
# Install mosquitto-clients
# macOS: brew install mosquitto-clients
# Ubuntu: sudo apt-get install mosquitto-clients

mosquitto_pub \
  --cafile AmazonRootCA1.pem \
  --cert cert.pem \
  --key private.key \
  -h xxxxxxx-ats.iot.us-east-1.amazonaws.com \
  -p 8883 \
  -q 1 \
  -t '$aws/things/pole-001-device/shadow/update' \
  -m '{
    "state": {
      "reported": {
        "deviceName": "pole-001-device",
        "poleId": "POLE-001",
        "current_A": 145.5,
        "voltage_V": 235.2,
        "temperature_C": 45.3,
        "tilt_degrees": 1.2,
        "vibration_level": 2.1
      }
    }
  }'
```

### 2. Test API Endpoint

```bash
curl -X POST https://your-app.vercel.app/api/iot/telemetry \
  -H "Content-Type: application/json" \
  -d '{
    "deviceName": "pole-001-device",
    "poleId": "POLE-001",
    "current_A": 145.5,
    "voltage_V": 235.2,
    "temperature_C": 45.3,
    "tilt_degrees": 1.2,
    "vibration_level": 2.1
  }'
```

Expected response:
```json
{
  "success": true,
  "poleId": 1,
  "status": "normal",
  "alertsCreated": 0
}
```

## Security Best Practices

1. **Rotate Certificates Regularly**
   - Set up certificate rotation every 12-24 months
   - Use AWS IoT Device Provisioning for automated rotation

2. **Use Thing Groups for Organization**
   ```bash
   aws iot create-thing-group \
     --thing-group-name "PoleMonitoring" \
     --thing-group-properties '{
       "description": "All utility pole monitoring devices"
     }'
   ```

3. **Enable AWS IoT Logs**
   ```bash
   aws iot set-v2-logging-options \
     --role-arn "arn:aws:iam::$AWS_ACCOUNT_ID:role/IoTLoggingRole" \
     --default-log-level "INFO" \
     --enabled
   ```

4. **Monitor with CloudWatch**
   - Track failed connections
   - Monitor message publishing rates
   - Alert on certificate expiration

5. **Implement Rate Limiting**
   - In AWS IoT Rules Engine
   - In your API endpoint (`/api/iot/telemetry`)
   - Per-device basis

## Troubleshooting

### Certificate Connection Issues
```bash
# Verify certificate is attached to policy
aws iot list-attached-policies --target "$CERTIFICATE_ARN"

# Verify certificate is active
aws iot describe-certificate --certificate-id "cert-id"

# Check certificate expiration
openssl x509 -in cert.pem -noout -dates
```

### MQTT Connection Fails
- Check certificate paths and permissions
- Verify AmazonRootCA1.pem is current
- Ensure thing principal is attached: `aws iot list-principal-things --principal "$CERTIFICATE_ARN"`

### Rules Engine Not Triggering
- Verify topic subscription matches MQTT publish topic
- Check CloudWatch logs: `aws logs tail /aws/iot/rules/PoleMonitoringToAPI --follow`
- Ensure HTTP endpoint is accessible and returning 200 OK

### API Endpoint Not Receiving Data
- Verify endpoint URL is correct
- Check firewall/security group rules
- Ensure API is returning proper HTTP status codes
- Monitor API logs for errors

## Scaling Considerations

For thousands of poles:
- **Device Provisioning**: Use Fleet Provisioning for automated registration
- **MQTT Optimization**: Use message batching, compress payloads
- **Database**: Consider partitioning sensor_readings table by time
- **Caching**: Cache active alerts in Redis/Upstash
- **Webhooks**: Use SNS/SQS for reliable message delivery to your API

## References

- [AWS IoT Core Documentation](https://docs.aws.amazon.com/iot/latest/developerguide/)
- [MQTT 3.1.1 Specification](http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html)
- [AWS IoT Security Best Practices](https://docs.aws.amazon.com/iot/latest/developerguide/security-best-practices.html)
- [AWS IoT Rules Engine](https://docs.aws.amazon.com/iot/latest/developerguide/iot-rules.html)
