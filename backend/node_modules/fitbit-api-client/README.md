# Fitbit API SDK

## ⚠️ This SDK is not ready for production

## Features
- OAuth2.0 Support
- Intraday Support

## Installation
```bash
npm install fitbit-api-client
```

## How to use
```ts
import { FitbitClient } from 'fitbit-api-client';

const client = new FitbitClient({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
});
```