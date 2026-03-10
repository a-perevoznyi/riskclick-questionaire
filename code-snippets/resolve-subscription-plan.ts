/**
 * resolve-subscription-plan.ts
 *
 * This example shows how application business logic can consume pricing
 * configuration without being tightly coupled to configuration storage.
 *
 * The main idea:
 * - a separate service owns pricing configuration generation
 * - the application only reads already prepared pricing data
 * - business logic stays simple and focused
 */

import {
  getMerchantPricing,
  MerchantPricing,
} from "./pricing-config";

export type ResolvedSubscriptionPlan = {
  merchantId: string;
  planName: string;
  monthlyPrice: number;
  features: string[];
  source: "remote-config" | "default-fallback";
};

/**
 * In production systems it is useful to have a predictable fallback.
 * This protects the application from total failure if:
 * - a merchant is missing in the config
 * - configuration is temporarily unavailable
 * - the merchant is in onboarding state
 *
 * The exact fallback policy depends on the business rules.
 */
function buildDefaultPlan(merchantId: string): ResolvedSubscriptionPlan {
  return {
    merchantId,
    planName: "default",
    monthlyPrice: 0,
    features: [],
    source: "default-fallback",
  };
}

/**
 * Maps config data to the shape used by the application.
 *
 * Keeping this transformation in a dedicated function helps when the
 * external config format and internal domain model evolve separately.
 */
function mapPricingToResolvedPlan(
  pricing: MerchantPricing
): ResolvedSubscriptionPlan {
  return {
    merchantId: pricing.merchantId,
    planName: pricing.planName,
    monthlyPrice: pricing.monthlyPrice,
    features: pricing.features,
    source: "remote-config",
  };
}

/**
 * Resolves the final subscription plan for a merchant.
 *
 * This function is intentionally small because the business flow should
 * stay readable. Any low-level details such as fetch logic, validation,
 * and parsing are handled in the pricing-config module.
 */
export async function resolveSubscriptionPlan(
  merchantId: string
): Promise<ResolvedSubscriptionPlan> {
  try {
    const pricing = await getMerchantPricing(merchantId);

    if (!pricing) {
      return buildDefaultPlan(merchantId);
    }

    return mapPricingToResolvedPlan(pricing);
  } catch (error) {
    /**
     * In a real enterprise system, this is where we would normally:
     * - write structured logs
     * - emit metrics
     * - create monitoring alerts if the error rate becomes high
     *
     * For this example, we return a safe fallback to keep the system stable.
     */
    console.error("Failed to resolve merchant pricing", {
      merchantId,
      error,
    });

    return buildDefaultPlan(merchantId);
  }
}
