import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendCreatorPatronageAlert } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      supporter_name,
      supporter_message,
      tier_name,
      amount,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required Razorpay payment verification fields (order_id, payment_id, signature).',
        },
        { status: 400 }
      );
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_secret) {
      console.error('RAZORPAY_KEY_SECRET is not configured in environment variables.');
      return NextResponse.json(
        { success: false, error: 'Server configuration error: missing payment secret.' },
        { status: 500 }
      );
    }

    // HMAC SHA256 Signature generation: order_id + "|" + payment_id
    const generatedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // Secure timing-safe buffer comparison to prevent timing attacks
    const isAuthentic = crypto.timingSafeEqual(
      Buffer.from(generatedSignature, 'utf-8'),
      Buffer.from(razorpay_signature, 'utf-8')
    );

    if (!isAuthentic) {
      console.warn('Razorpay signature verification mismatch for order:', razorpay_order_id);
      return NextResponse.json(
        {
          success: false,
          error: 'Payment verification failed: Invalid transaction signature.',
        },
        { status: 400 }
      );
    }

    // Payment successfully verified
    console.log(`✅ Razorpay Payment Verified: ${razorpay_payment_id} for Order: ${razorpay_order_id}`);

    // Automatically dispatch email alert to the creator (nithinpenmetsa16@gmail.com)
    sendCreatorPatronageAlert({
      supporterName: supporter_name || 'Anonymous Patron',
      supporterMessage: supporter_message || '',
      amount: Number(amount) || 0,
      tierName: tier_name || 'Supporter',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    }).catch((emailErr) => {
      console.error('[CREATOR PATRONAGE EMAIL FAILED]', emailErr);
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully. Thank you for supporting the creator!',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      verifiedAt: new Date().toISOString(),
      details: {
        supporter_name: supporter_name || 'Anonymous Patron',
        tier_name: tier_name || 'Supporter',
        amount: amount || 0,
      },
    });
  } catch (error: any) {
    console.error('Razorpay verify-payment error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An unexpected error occurred during payment verification.',
      },
      { status: 500 }
    );
  }
}
