declare module 'sepay-pg-node' {
  export interface CheckoutCreateParams {
    merchant?: string;
    secret?: string;
    sandbox?: boolean;
    order_amount: number;
    order_currency: string;
    order_description: string;
    order_invoice_number: string;
    success_url: string;
    error_url: string;
    cancel_url: string;
  }

  export interface CheckoutCreateResult {
    url: string;
  }

  export interface SepayClient {
    checkout: {
      create(params: CheckoutCreateParams): Promise<CheckoutCreateResult>;
    };
  }

  const sepayClient: SepayClient;
  export default sepayClient;
}
