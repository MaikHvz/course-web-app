import { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } from 'transbank-sdk';

const isProduction = process.env.NODE_ENV === 'production' && process.env.WEBPAY_ENVIRONMENT === 'production';

let txOptions: Options;

if (isProduction) {
  txOptions = new Options(
    process.env.WEBPAY_COMMERCE_CODE || '',
    process.env.WEBPAY_API_KEY || '',
    Environment.Production
  );
} else {
  // Entorno de Pruebas (Integración)
  txOptions = new Options(
    IntegrationCommerceCodes.WEBPAY_PLUS,
    IntegrationApiKeys.WEBPAY,
    Environment.Integration
  );
}

export const webpayTransaction = new WebpayPlus.Transaction(txOptions);
