/**
 * Customer Notification Module
 * 
 * Sends notifications to customers when task status changes.
 * Currently a stub — replace with Twilio/SendGrid integration.
 */

export type NotificationEvent = 'EN_ROUTE' | 'ARRIVED' | 'MATERIALS_VERIFIED' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED';

interface NotificationPayload {
    orderId: string;
    customerName: string;
    customerPhone?: string;
    customerEmail?: string;
    eventType: NotificationEvent;
    trackingUrl: string;
    data?: Record<string, unknown>;
}

const MESSAGE_TEMPLATES: Record<NotificationEvent, string> = {
    EN_ROUTE:           '🚗 작업자가 출발했습니다. 지도에서 위치를 확인하세요: {trackingUrl}',
    ARRIVED:            '📍 작업자가 현장에 도착했습니다.',
    MATERIALS_VERIFIED: '📦 자재 확인이 완료되었습니다. 곧 설치가 시작됩니다.',
    IN_PROGRESS:        '🔧 설치 작업이 진행 중입니다.',
    COMPLETED:          '✅ 작업이 완료되었습니다. 검수를 기다리고 있습니다.',
    VERIFIED:           '🎉 모든 작업이 완료되고 검수가 승인되었습니다. 감사합니다!',
};

/**
 * Send a notification to the customer.
 * 
 * In production:
 * - Replace with Twilio SMS for phone notifications
 * - Replace with SendGrid/Resend for email notifications
 * - Add Kakao AlimTalk for Korean market
 */
export async function notifyCustomer(payload: NotificationPayload): Promise<void> {
    const template = MESSAGE_TEMPLATES[payload.eventType];
    if (!template) return;

    const message = template.replace('{trackingUrl}', payload.trackingUrl);

    // ─── STUB: Console logging only ───
    console.log(`[NOTIFICATION] To: ${payload.customerName}`);
    console.log(`  Phone: ${payload.customerPhone ?? 'N/A'}`);
    console.log(`  Email: ${payload.customerEmail ?? 'N/A'}`);
    console.log(`  Event: ${payload.eventType}`);
    console.log(`  Message: ${message}`);
    console.log(`  Tracking: ${payload.trackingUrl}`);

    // ─── TODO: Production implementation ───
    // const NOTIFICATION_API = process.env.NOTIFICATION_WEBHOOK_URL;
    // if (NOTIFICATION_API) {
    //     await fetch(NOTIFICATION_API, {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({ ...payload, message }),
    //     });
    // }
}

/**
 * Build the customer tracking URL for an order.
 */
export function buildTrackingUrl(orderId: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return `${baseUrl}/track/${orderId}`;
}
