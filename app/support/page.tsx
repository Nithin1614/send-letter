'use client';

import { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Tier {
  id: string;
  amount: number;
  name: string;
  desc: string;
  badge?: string;
  popular?: boolean;
}

const TIERS: Tier[] = [
  {
    id: 't1',
    amount: 49,
    name: 'Supporter',
    desc: 'Covers letter delivery & unseal servers for 100+ readers.',
    badge: 'Starter',
  },
  {
    id: 't2',
    amount: 99,
    name: 'Believer',
    desc: 'Funds real-time wax seal physics & private storage vaults.',
    badge: 'Most Popular',
    popular: true,
  },
  {
    id: 't3',
    amount: 249,
    name: 'Patron',
    desc: 'Keeps Send Letter completely ad-free, private, & independent.',
    badge: 'Champion',
  },
];

export default function SupportPage() {
  const [selectedTier, setSelectedTier] = useState<string>('t2');
  const [customAmount, setCustomAmount] = useState<string>('10');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const customInputRef = useRef<HTMLInputElement>(null);
  const [supporterName, setSupporterName] = useState<string>('');
  const [supporterMessage, setSupporterMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<{
    paymentId: string;
    orderId: string;
    amount: number;
    name: string;
    tier: string;
  } | null>(null);

  const handleSelectCustom = () => {
    setIsCustom(true);
    setTimeout(() => {
      customInputRef.current?.focus();
      customInputRef.current?.select();
    }, 50);
  };

  // Compute active payment amount in INR
  const activeAmount = isCustom
    ? Math.max(1, parseInt(customAmount, 10) || 1)
    : TIERS.find((t) => t.id === selectedTier)?.amount || 99;

  const activeTierName = isCustom
    ? 'Custom Patronage'
    : TIERS.find((t) => t.id === selectedTier)?.name || 'Believer';

  // Confetti on success
  useEffect(() => {
    if (paymentSuccess && typeof window !== 'undefined') {
      import('canvas-confetti').then((confetti) => {
        confetti.default({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899'],
        });
      }).catch(() => {});
    }
  }, [paymentSuccess]);

  // Razorpay Checkout Handler
  async function handleCheckout() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (typeof window === 'undefined' || !(window as any).Razorpay) {
        throw new Error('Payment gateway is loading. Please try again in 2 seconds.');
      }

      // 1. Create order on backend
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: activeAmount,
          currency: 'INR',
          notes: {
            supporter_name: supporterName.trim() || 'Anonymous Patron',
            supporter_message: supporterMessage.trim() || 'No message',
            tier_name: activeTierName,
          },
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.error || 'Failed to initialize payment session.');
      }

      const keyId =
        orderData.key_id ||
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
        'rzp_live_TSJV45tYjYOUu5';

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Send Letter',
        description: `Support Send Letter — ${activeTierName}`,
        order_id: orderData.order_id || orderData.orderId,
        theme: {
          color: '#6366f1',
          backdrop_color: 'rgba(5, 5, 8, 0.85)',
        },
        prefill: {
          name: supporterName || '',
        },
        notes: {
          tier: activeTierName,
          supporter: supporterName || 'Anonymous',
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
          },
          escape: true,
          backdropclose: false,
        },
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          try {
            // 3. Cryptographic Signature Verification
            const verifyRes = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                supporter_name: supporterName || 'Anonymous Patron',
                supporter_message: supporterMessage || '',
                tier_name: activeTierName,
                amount: activeAmount,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              setPaymentSuccess({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                amount: activeAmount,
                name: supporterName || 'Anonymous Patron',
                tier: activeTierName,
              });
            } else {
              setErrorMessage(
                verifyData.error || 'Payment signature verification failed. Please contact support.'
              );
            }
          } catch (err: any) {
            setErrorMessage(err.message || 'Error confirming transaction.');
          } finally {
            setIsLoading(false);
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);

      rzp.on('payment.failed', function (resp: any) {
        setIsLoading(false);
        setErrorMessage(
          resp.error?.description || 'Transaction was declined or cancelled. Please try again.'
        );
      });

      rzp.open();
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMessage(err.message || 'An error occurred starting checkout.');
      setIsLoading(false);
    }
  }

  function handleCopyPaymentId(id: string) {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  }

  return (
    <>
      {/* Razorpay Standard Checkout SDK */}
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <Navbar />

      <main
        style={{
          minHeight: '100vh',
          background: '#090a0f',
          color: '#f3f4f6',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, "Helvetica Neue", sans-serif',
          padding: '40px 1.25rem 90px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle Modern Ambient Mesh Background */}
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '800px',
            height: '450px',
            background:
              'radial-gradient(circle at 50% 30%, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.06) 45%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div style={{ maxWidth: 1040, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* ── SUCCESS VIEW ── */}
          {paymentSuccess ? (
            <div
              style={{
                maxWidth: 580,
                margin: '40px auto',
                background: 'rgba(17, 19, 28, 0.85)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: 24,
                padding: '44px 32px',
                textAlign: 'center',
                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(99, 102, 241, 0.15)',
                backdropFilter: 'blur(16px)',
              }}
            >
              {/* Modern Success Checkmark */}
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  boxShadow: '0 0 24px rgba(16, 185, 129, 0.45)',
                  fontSize: 28,
                  color: '#ffffff',
                }}
              >
                ✓
              </div>

              <span
                style={{
                  display: 'inline-block',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#10b981',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  padding: '4px 12px',
                  borderRadius: 20,
                  marginBottom: 12,
                }}
              >
                Payment Confirmed
              </span>

              <h2 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 10px', color: '#ffffff' }}>
                Thank You, {paymentSuccess.name}!
              </h2>

              <p
                style={{
                  fontSize: 15,
                  color: '#9ca3af',
                  lineHeight: 1.6,
                  maxWidth: 440,
                  margin: '0 auto 28px',
                }}
              >
                Your contribution of <strong style={{ color: '#ffffff' }}>₹{paymentSuccess.amount}</strong> for the{' '}
                <span style={{ color: '#818cf8' }}>{paymentSuccess.tier}</span> tier directly supports independent development and keeps Send Letter 100% free for everyone.
              </p>

              {/* Modern Receipt Card */}
              <div
                style={{
                  background: 'rgba(10, 11, 16, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 16,
                  padding: '16px 20px',
                  textAlign: 'left',
                  marginBottom: 32,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  fontSize: 13,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#6b7280' }}>Payment ID</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <code style={{ color: '#818cf8', fontWeight: 600 }}>{paymentSuccess.paymentId}</code>
                    <button
                      onClick={() => handleCopyPaymentId(paymentSuccess.paymentId)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: copiedId ? '#10b981' : '#9ca3af',
                        cursor: 'pointer',
                        fontSize: 12,
                        padding: '2px 6px',
                      }}
                    >
                      {copiedId ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>Order Reference</span>
                  <span style={{ color: '#d1d5db' }}>{paymentSuccess.orderId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>Status</span>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>● Settled</span>
                </div>
              </div>

              <Link
                href="/create"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  color: '#ffffff',
                  padding: '14px 28px',
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 600,
                  textDecoration: 'none',
                  boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)',
                }}
              >
                Compose a Letter →
              </Link>
            </div>
          ) : (
            /* ── MODERN 2-COLUMN CHECKOUT ── */
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: 48,
                alignItems: 'start',
                marginTop: 20,
              }}
            >
              {/* LEFT COLUMN: Creator Story & Impact */}
              <div>
                {/* Creator Badge */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 30,
                    padding: '6px 14px 6px 6px',
                    marginBottom: 24,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#ffffff',
                    }}
                  >
                    SL
                  </div>
                  <span style={{ fontSize: 13, color: '#d1d5db', fontWeight: 500 }}>
                    Support Send Letter &amp; Creator
                  </span>
                </div>

                <h1
                  style={{
                    fontSize: 'clamp(28px, 3.5vw, 38px)',
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    lineHeight: 1.15,
                    color: '#ffffff',
                    margin: '0 0 12px',
                  }}
                >
                  Support Send Letter.
                </h1>

                <p
                  style={{
                    fontSize: 15,
                    color: '#9ca3af',
                    lineHeight: 1.6,
                    margin: '0 0 26px',
                  }}
                >
                  100% free, private, and ad-free. Your support directly powers real-time unsealing servers and independent craftsmanship.
                </p>

                {/* Feature Value Grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: 'rgba(99, 102, 241, 0.12)',
                        border: '1px solid rgba(99, 102, 241, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#818cf8',
                        fontSize: 14,
                        flexShrink: 0,
                      }}
                    >
                      ⚡
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#f3f4f6' }}>
                        Zero Ads &amp; 100% Private
                      </div>
                      <div style={{ fontSize: 12.5, color: '#9ca3af', lineHeight: 1.4 }}>
                        No trackers, no advertisers, zero monetization of letters.
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: 'rgba(16, 185, 129, 0.12)',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#34d399',
                        fontSize: 14,
                        flexShrink: 0,
                      }}
                    >
                      🛡️
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#f3f4f6' }}>
                        Direct Creator &amp; Server Backing
                      </div>
                      <div style={{ fontSize: 12.5, color: '#9ca3af', lineHeight: 1.4 }}>
                        Every contribution goes directly into server hosting, database uptime, and new 3D features.
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: 'rgba(245, 158, 11, 0.12)',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fbbf24',
                        fontSize: 14,
                        flexShrink: 0,
                      }}
                    >
                      ★
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#f3f4f6' }}>
                        Instant 1-Tap UPI &amp; Cards
                      </div>
                      <div style={{ fontSize: 12.5, color: '#9ca3af', lineHeight: 1.4 }}>
                        Quick checkout with Google Pay, PhonePe, Paytm, and Cards.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Modern Payment Module */}
              <div
                style={{
                  background: 'rgba(15, 17, 26, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 24,
                  padding: '32px 28px',
                  boxShadow:
                    '0 24px 60px -12px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                {/* Step 1: Select Tier Cards */}
                <div style={{ marginBottom: 26 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      marginBottom: 14,
                    }}
                  >
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Choose an amount
                    </label>
                    <span style={{ fontSize: 13, color: '#6366f1', fontWeight: 600 }}>One-time contribution</span>
                  </div>

                  {/* 3 Tier Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 12 }}>
                    {TIERS.map((tier) => {
                      const isSelected = !isCustom && selectedTier === tier.id;
                      return (
                        <button
                          key={tier.id}
                          type="button"
                          onClick={() => {
                            setIsCustom(false);
                            setSelectedTier(tier.id);
                          }}
                          style={{
                            background: isSelected
                              ? 'linear-gradient(145deg, rgba(99, 102, 241, 0.18) 0%, rgba(79, 70, 229, 0.28) 100%)'
                              : 'rgba(255, 255, 255, 0.03)',
                            border: isSelected
                              ? '2px solid #6366f1'
                              : '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: 14,
                            padding: '14px 10px',
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          {tier.popular && (
                            <span
                              style={{
                                position: 'absolute',
                                top: -9,
                                background: '#6366f1',
                                color: '#ffffff',
                                fontSize: 9,
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                padding: '2px 7px',
                                borderRadius: 10,
                                letterSpacing: '0.04em',
                              }}
                            >
                              Popular
                            </span>
                          )}
                          <span
                            style={{
                              fontSize: 18,
                              fontWeight: 800,
                              color: isSelected ? '#ffffff' : '#e5e7eb',
                            }}
                          >
                            ₹{tier.amount}
                          </span>
                          <span style={{ fontSize: 11, color: isSelected ? '#a5b4fc' : '#6b7280', fontWeight: 500 }}>
                            {tier.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Amount Box (Clean, Large, Numeric Input) */}
                  <div
                    onClick={handleSelectCustom}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: isCustom
                        ? 'linear-gradient(145deg, rgba(99, 102, 241, 0.16) 0%, rgba(79, 70, 229, 0.26) 100%)'
                        : 'rgba(255, 255, 255, 0.03)',
                      border: isCustom ? '2px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 14,
                      padding: '14px 18px',
                      cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      boxShadow: isCustom ? '0 0 20px rgba(99, 102, 241, 0.22)' : 'none',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: isCustom ? '#ffffff' : '#e5e7eb',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <span style={{ color: '#818cf8' }}>✦</span> Custom Amount
                      </div>
                      <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                        Type any amount (min ₹1)
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        background: isCustom ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.35)',
                        border: isCustom ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: 10,
                        padding: '6px 14px',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectCustom();
                      }}
                    >
                      <span
                        style={{
                          color: isCustom ? '#818cf8' : '#9ca3af',
                          fontSize: 20,
                          fontWeight: 800,
                        }}
                      >
                        ₹
                      </span>
                      <input
                        ref={customInputRef}
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min="1"
                        max="100000"
                        value={customAmount}
                        onChange={(e) => {
                          setIsCustom(true);
                          setCustomAmount(e.target.value);
                        }}
                        onFocus={() => setIsCustom(true)}
                        placeholder="10"
                        style={{
                          width: '85px',
                          background: 'transparent',
                          border: 'none',
                          color: '#ffffff',
                          fontSize: 20,
                          fontWeight: 800,
                          textAlign: 'right',
                          outline: 'none',
                          fontFamily: 'inherit',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Step 2: Supporter Name & Note */}
                <div style={{ marginBottom: 24 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#9ca3af',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      marginBottom: 10,
                    }}
                  >
                    Personalize your support
                  </label>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input
                      type="text"
                      placeholder="Your Name (optional)"
                      value={supporterName}
                      onChange={(e) => setSupporterName(e.target.value)}
                      maxLength={40}
                      style={{
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 12,
                        padding: '12px 14px',
                        color: '#ffffff',
                        fontSize: 14,
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s',
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = '#6366f1')}
                      onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)')}
                    />

                    <textarea
                      placeholder="Leave a message for the creator (optional)"
                      value={supporterMessage}
                      onChange={(e) => setSupporterMessage(e.target.value)}
                      maxLength={240}
                      rows={2}
                      style={{
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 12,
                        padding: '10px 14px',
                        color: '#ffffff',
                        fontSize: 14,
                        outline: 'none',
                        resize: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s',
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = '#6366f1')}
                      onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)')}
                    />
                  </div>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div
                    style={{
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: 10,
                      padding: '10px 14px',
                      color: '#f87171',
                      fontSize: 13,
                      marginBottom: 16,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <span>⚠️</span> {errorMessage}
                  </div>
                )}

                {/* Step 3: Checkout Action Button */}
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isLoading || activeAmount < 1}
                  style={{
                    width: '100%',
                    background: isLoading
                      ? 'rgba(79, 70, 229, 0.5)'
                      : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: 14,
                    padding: '16px 20px',
                    color: '#ffffff',
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  {isLoading ? (
                    <>
                      <span
                        style={{
                          width: 16,
                          height: 16,
                          border: '2px solid rgba(255,255,255,0.3)',
                          borderTopColor: '#ffffff',
                          borderRadius: '50%',
                          display: 'inline-block',
                          animation: 'spin 0.8s linear infinite',
                        }}
                      />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Pay ₹{activeAmount} with Razorpay</span>
                      <span style={{ fontSize: 18 }}>→</span>
                    </>
                  )}
                </button>

                {/* Modern Security & Payment Logos Footnote */}
                <div
                  style={{
                    marginTop: 18,
                    textAlign: 'center',
                    fontSize: 12,
                    color: '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <span style={{ color: '#10b981' }}>🔒</span>
                  <span>Secured by Razorpay · UPI · Cards · Netbanking</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
