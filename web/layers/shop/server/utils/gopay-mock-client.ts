import type {
  GopayPaymentState,
  CreateGopayPaymentInput,
  GopayClient,
  GopayPayment,
} from "../../shared/utils/gopay"

// A GoPay stand-in that never leaves the machine, so the payment flow can be
// walked in dev without credentials. State lives in process memory — a dev
// fixture, not a store. See docs/shop.md, „Payment and GoPay“.

export interface MockPayment {
  id: string
  state: GopayPaymentState
  orderId: number
  priceCzk: number
  courseTitle: string
  payerEmail: string
  returnUrl: string
  notificationUrl: string
}

const payments = new Map<string, MockPayment>()

export function mockGatewayPath(paymentId: string): string {
  return `/platba-mock/${paymentId}`
}

// Numeric like GoPay's own ids, and unique across dev-server restarts so a
// new Order never collides with the `gopay_payment_id` of an older one.
function nextPaymentId(): string {
  return `${Date.now()}${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`
}

export function readMockPayment(paymentId: string): MockPayment | undefined {
  return payments.get(paymentId)
}

export function recordMockPaymentState(
  paymentId: string,
  state: GopayPaymentState,
): MockPayment | undefined {
  const payment = payments.get(paymentId)
  if (payment === undefined) {
    return undefined
  }
  const settled = { ...payment, state }
  payments.set(paymentId, settled)
  return settled
}

function toGopayPayment(payment: MockPayment, origin: string): GopayPayment {
  return {
    id: payment.id,
    state: payment.state,
    gwUrl: new URL(mockGatewayPath(payment.id), origin).href,
  }
}

// `origin` is where the browser reached this server, not the configured site
// URL: in dev those differ, and a mock gateway that sent the Student to the
// deployed site — or called its notification route — would be a trap.
export function createGopayMockClient(origin: string): GopayClient {
  return {
    async createPayment(input: CreateGopayPaymentInput): Promise<GopayPayment> {
      const payment: MockPayment = {
        id: nextPaymentId(),
        state: "CREATED",
        orderId: input.orderId,
        priceCzk: input.priceCzk,
        courseTitle: input.courseTitle,
        payerEmail: input.payerEmail,
        returnUrl: input.returnUrl,
        notificationUrl: input.notificationUrl,
      }
      payments.set(payment.id, payment)
      return toGopayPayment(payment, origin)
    },

    async inquirePayment(paymentId: string): Promise<GopayPayment> {
      const payment = payments.get(paymentId)
      if (payment === undefined) {
        throw new Error(`Mock GoPay knows no Payment ${paymentId}`)
      }
      return toGopayPayment(payment, origin)
    },

    async refundPayment(paymentId: string): Promise<void> {
      recordMockPaymentState(paymentId, "REFUNDED")
    },
  }
}
