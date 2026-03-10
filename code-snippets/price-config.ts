/**
 * pricing-config.ts
 *
 * This example shows how a Node.js application can load merchant pricing
 * configuration from an external JSON file delivered through a CDN.
 *
 * Design goals:
 * - keep pricing configuration outside of the main application codebase
 * - fail safely when configuration is missing or invalid
 * - validate data before using it in business logic
 * - make the code easy to test and maintain
 */

export type MerchantPricing = {
  merchantId: string;
  planName: string;
  monthlyPrice: number;
  features: string[];
};

export type PricingConfig = {
  version: string;
  updatedAt: string;
  merchants: MerchantPricing[];
};

/**
 * A domain-specific error makes operational issues easier to understand
 * in logs and monitoring systems.
 */
export class PricingConfigError extends Error {
  public readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "PricingConfigError";
    this.cause = cause;
  }
}

/**
 * A small runtime validator protects the application from malformed
 * configuration files. In a bigger production system, this could also
 * be implemented with a schema validation library such as zod or joi.
 */
function isMerchantPricing(value: unknown): value is MerchantPricing {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.merchantId === "string" &&
    typeof candidate.planName === "string" &&
    typeof candidate.monthlyPrice === "number" &&
    Array.isArray(candidate.features) &&
    candidate.features.every((feature) => typeof feature === "string")
  );
}

function isPricingConfig(value: unknown): value is PricingConfig {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.version === "string" &&
    typeof candidate.updatedAt === "string" &&
    Array.isArray(candidate.merchants) &&
    candidate.merchants.every(isMerchantPricing)
  );
}

/**
 * Pricing configuration is usually environment-dependent, so we keep the
 * URL in an environment variable. This also makes local development and
 * test environments easier to configure.
 */
function getPricingConfigUrl(): string {
  const url = process.env.PRICING_CONFIG_URL;

  if (!url) {
    throw new PricingConfigError(
}
