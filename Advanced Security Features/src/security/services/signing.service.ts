import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";

@Injectable()
export class SigningService {
  private readonly algorithm = "sha256";

  constructor(private configService: ConfigService) {}

  private getSigningKey(): string {
    const key = this.configService.get<string>("SIGNING_SECRET");
    if (!key) {
      throw new Error("SIGNING_SECRET not configured");
    }
    return key;
  }

  // API request signing
  signRequest(
    method: string,
    url: string,
    body: any,
    timestamp: number
  ): string {
    const signingKey = this.getSigningKey();
    const payload = `${method}${url}${JSON.stringify(body || {})}${timestamp}`;

    return crypto
      .createHmac(this.algorithm, signingKey)
      .update(payload)
      .digest("hex");
  }

  verifySignature(
    method: string,
    url: string,
    body: any,
    timestamp: number,
    signature: string
  ): boolean {
    const expectedSignature = this.signRequest(method, url, body, timestamp);
    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  }

  // JWT-like token signing
  signToken(payload: object, expiresIn: number = 3600): string {
    const header = { alg: "HS256", typ: "JWT" };
    const now = Math.floor(Date.now() / 1000);
    const tokenPayload = {
      ...payload,
      iat: now,
      exp: now + expiresIn,
    };

    const headerEncoded = Buffer.from(JSON.stringify(header)).toString(
      "base64url"
    );
    const payloadEncoded = Buffer.from(JSON.stringify(tokenPayload)).toString(
      "base64url"
    );

    const signature = crypto
      .createHmac(this.algorithm, this.getSigningKey())
      .update(`${headerEncoded}.${payloadEncoded}`)
      .digest("base64url");

    return `${headerEncoded}.${payloadEncoded}.${signature}`;
  }

  verifyToken(token: string): any {
    const [headerEncoded, payloadEncoded, signature] = token.split(".");

    const expectedSignature = crypto
      .createHmac(this.algorithm, this.getSigningKey())
      .update(`${headerEncoded}.${payloadEncoded}`)
      .digest("base64url");

    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature, "base64url"),
        Buffer.from(expectedSignature, "base64url")
      )
    ) {
      throw new Error("Invalid token signature");
    }

    const payload = JSON.parse(
      Buffer.from(payloadEncoded, "base64url").toString()
    );

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error("Token expired");
    }

    return payload;
  }
}
