declare module 'nodemailer' {
  export interface SendMailOptions {
    from?: string;
    to: string;
    subject: string;
    text?: string;
    html?: string;
  }

  export interface SentMessageInfo {
    messageId: string;
  }

  export interface Transporter {
    sendMail(mailOptions: SendMailOptions): Promise<SentMessageInfo>;
  }

  export interface CreateTransportOptions {
    service?: string;
    auth?: {
      user?: string;
      pass?: string;
    };
  }

  export function createTransport(options: CreateTransportOptions): Transporter;
}
