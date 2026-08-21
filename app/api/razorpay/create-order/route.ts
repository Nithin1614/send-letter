import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, currency = 'INR', receipt, notes } = body;

    const key_id =
      process.env.RAZORPAY_KEY_ID ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      'rzp_live_TSJV45tYjYOUu5';
    const key_secret =
      process.env.RAZORPAY_KEY_SECRET ||
      'Y79ioO39glp8Lh22VnbKjvFR';

    if (!key_id || !key_secret) {
      console.error('Razorpay credentials missing in environment variables.');
      return NextResponse.json(
        { success: false, error: 'Razorpay configuration error: missing API credentials.' },
        { status: 500 }
      );
    }

    // Convert amount to paise (1 INR = 100 paise)
    // If client sent rupees (e.g. 49), convert to 4900 paise. If already in paise (>= 100), validate minimum.
    let amountInPaise = Math.round(Number(amount));
    if (amountInPaise < 100) {
      // Assuming amount was provided in rupees (e.g. 49 -> 4900 paise)
      amountInPaise = Math.round(Number(amount) * 100);
    }

    if (amountInPaise < 100) {
      return NextResponse.json(
        { success: false, error: 'Minimum order amount must be at least ₹1 (100 paise).' },
        { status: 400 }
      );
    }

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    const orderOptions = {
      amount: amountInPaise,
      currency: currency.toUpperCase(),
      receipt: receipt || `rec_${Date.now().toString().slice(-8)}`,
      notes: {
        platform: 'Send Letter Atelier Patronage',
        ...(notes || {}),
      },
    };

    const order = await razorpay.orders.create(orderOptions);

    return NextResponse.json({
      success: true,
      order_id: order.id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id,
    });
  } catch (error: any) {
    console.error('Razorpay create-order error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create Razorpay order.',
      },
      { status: 500 }
    );
  }
}
