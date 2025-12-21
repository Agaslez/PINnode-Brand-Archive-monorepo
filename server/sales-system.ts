// Complete Product Sales System with Subscription Management
import { Router } from 'express';
import { generateCompleteProductZip } from './complete-product-export';

const router = Router();

// Sales and subscription endpoints
router.post('/api/create-product-package', async (req, res) => {
  try {
    const {
      brandName,
      prompt,
      includeApps = true,
      includePayments = true,
      stripeProductId,
      paypalButtonId,
      demoVideoUrl,
      appDownloads
    } = req.body;

    if (!brandName || !prompt) {
      return res.status(400).json({
        error: 'Brand name and prompt are required'
      });
    }

    const zipBuffer = await generateCompleteProductZip({
      brandName,
      prompt,
      includeApps,
      includePayments,
      stripeProductId,
      paypalButtonId,
      demoVideoUrl,
      appDownloads
    });

    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${brandName.toLowerCase().replace(/[^a-z0-9]/g, '')}-complete-package.zip"`,
      'Content-Length': zipBuffer.length.toString()
    });

    res.send(zipBuffer);

  } catch (error) {
    console.error('Error generating product package:', error);
    res.status(500).json({
      error: 'Failed to generate product package',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Stripe integration endpoints
router.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { priceId, brandName, successUrl, cancelUrl } = req.body;

    if (!priceId) {
      return res.status(400).json({ error: 'Price ID is required' });
    }

    // Mock Stripe session creation (replace with actual Stripe integration)
    const mockSession = {
      id: `cs_test_${Date.now()}`,
      url: `https://checkout.stripe.com/pay/cs_test_${Date.now()}`,
      success_url: successUrl || `${req.get('origin')}/success`,
      cancel_url: cancelUrl || `${req.get('origin')}/cancel`,
      price_id: priceId,
      brand_name: brandName
    };

    res.json(mockSession);

  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({
      error: 'Failed to create checkout session',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PayPal integration endpoints
router.post('/api/create-paypal-order', async (req, res) => {
  try {
    const { planId, brandName } = req.body;

    if (!planId) {
      return res.status(400).json({ error: 'Plan ID is required' });
    }

    // Mock PayPal order creation (replace with actual PayPal integration)
    const mockOrder = {
      id: `PAYPAL_ORDER_${Date.now()}`,
      status: 'CREATED',
      links: [
        {
          href: `https://api.sandbox.paypal.com/v2/checkout/orders/PAYPAL_ORDER_${Date.now()}`,
          rel: 'self',
          method: 'GET'
        },
        {
          href: `https://www.sandbox.paypal.com/checkoutnow?token=PAYPAL_ORDER_${Date.now()}`,
          rel: 'approve',
          method: 'GET'
        }
      ],
      plan_id: planId,
      brand_name: brandName
    };

    res.json(mockOrder);

  } catch (error) {
    console.error('Error creating PayPal order:', error);
    res.status(500).json({
      error: 'Failed to create PayPal order',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Subscription management endpoints
router.get('/api/subscription-plans', (req, res) => {
  const plans = {
    free: {
      id: 'free',
      name: 'Darmowy',
      price: 0,
      currency: 'PLN',
      interval: 'month',
      features: [
        'Podstawowe funkcje AI',
        '100 zapytań/miesiąc',
        'Standardowe szablony',
        'Wsparcie społeczności'
      ],
      limits: {
        queries_per_month: 100,
        templates: 'basic',
        support: 'community'
      }
    },
    pro: {
      id: 'pro',
      name: 'Pro',
      price: 49,
      currency: 'PLN',
      interval: 'month',
      features: [
        'Wszystkie funkcje AI',
        'Unlimited zapytania',
        'Personalizowane szablony',
        'Integracje premium',
        'Priorytetowe wsparcie',
        'Eksport zaawansowany'
      ],
      limits: {
        queries_per_month: -1, // unlimited
        templates: 'premium',
        support: 'priority',
        integrations: true,
        advanced_export: true
      },
      stripe_price_id: 'price_pro_monthly_pln',
      paypal_plan_id: 'P-5ML4271244454362WXNWU5NQ'
    },
    enterprise: {
      id: 'enterprise',
      name: 'Enterprise',
      price: null, // Custom pricing
      currency: 'PLN',
      interval: 'month',
      features: [
        'Wszystko z Pro',
        'Dedykowane wdrożenie',
        'Custom integracje',
        'SLA 99.99%',
        'Dedykowany manager',
        'White-label opcje'
      ],
      limits: {
        queries_per_month: -1,
        templates: 'enterprise',
        support: 'dedicated',
        integrations: true,
        advanced_export: true,
        whitelabel: true,
        custom_deployment: true,
        sla: '99.99%'
      },
      contact_required: true
    }
  };

  res.json(plans);
});

// App download endpoints
router.get('/api/app-downloads/:brandName', (req, res) => {
  const { brandName } = req.params;
  const cleanBrandName = brandName.toLowerCase().replace(/[^a-z0-9]/g, '');

  const downloads = {
    windows: {
      url: `/downloads/${cleanBrandName}-setup.exe`,
      version: '1.0.0',
      size: '127 MB',
      requirements: 'Windows 10+',
      architecture: '64-bit'
    },
    macos: {
      url: `/downloads/${cleanBrandName}.dmg`,
      version: '1.0.0',
      size: '98 MB',
      requirements: 'macOS 11.0+',
      architecture: 'Universal Binary'
    },
    android: {
      url: `https://play.google.com/store/apps/details?id=com.${cleanBrandName}`,
      version: '1.0.0',
      size: '45 MB',
      requirements: 'Android 8.0+',
      package_name: `com.${cleanBrandName}`
    },
    ios: {
      url: `https://apps.apple.com/app/${cleanBrandName}`,
      version: '1.0.0',
      size: '52 MB',
      requirements: 'iOS 14.0+',
      bundle_id: `com.${cleanBrandName}.app`
    },
    web: {
      url: `https://${cleanBrandName}.com`,
      version: '1.0.0',
      requirements: 'Modern web browser',
      features: ['PWA support', 'Offline mode', 'Push notifications']
    }
  };

  res.json(downloads);
});

// Analytics and metrics endpoints
router.get('/api/sales-analytics/:brandName', (req, res) => {
  const { brandName } = req.params;
  const { timeframe = '30d' } = req.query;

  // Mock analytics data (replace with actual analytics)
  const analytics = {
    brand_name: brandName,
    timeframe,
    metrics: {
      total_downloads: Math.floor(Math.random() * 10000) + 1000,
      active_subscriptions: Math.floor(Math.random() * 500) + 50,
      conversion_rate: (Math.random() * 5 + 10).toFixed(2) + '%',
      revenue: {
        total: Math.floor(Math.random() * 50000) + 10000,
        currency: 'PLN',
        growth: (Math.random() * 20 + 5).toFixed(1) + '%'
      }
    },
    downloads_by_platform: {
      windows: Math.floor(Math.random() * 3000) + 500,
      macos: Math.floor(Math.random() * 2000) + 300,
      android: Math.floor(Math.random() * 4000) + 800,
      ios: Math.floor(Math.random() * 3500) + 600,
      web: Math.floor(Math.random() * 5000) + 1000
    },
    subscription_breakdown: {
      free: Math.floor(Math.random() * 1000) + 200,
      pro: Math.floor(Math.random() * 400) + 80,
      enterprise: Math.floor(Math.random() * 20) + 5
    },
    geographic_distribution: {
      poland: 45,
      germany: 20,
      united_states: 15,
      united_kingdom: 8,
      france: 5,
      other: 7
    }
  };

  res.json(analytics);
});

// Newsletter subscription endpoint
router.post('/api/newsletter-subscribe', async (req, res) => {
  try {
    const { email, brandName, source = 'landing_page' } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    // Mock newsletter subscription (replace with actual service like Mailchimp, SendGrid)
    const subscription = {
      id: `sub_${Date.now()}`,
      email,
      brand_name: brandName,
      source,
      status: 'subscribed',
      subscribed_at: new Date().toISOString(),
      preferences: {
        product_updates: true,
        marketing: true,
        tips_and_tricks: true
      }
    };

    // Here you would integrate with your email service
    console.log('Newsletter subscription:', subscription);

    res.json({
      success: true,
      message: 'Dziękujemy za subskrypcję! Sprawdź swoją skrzynkę email.',
      subscription_id: subscription.id
    });

  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    res.status(500).json({
      error: 'Failed to subscribe to newsletter',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Contact form endpoint (for Enterprise inquiries)
router.post('/api/contact-enterprise', async (req, res) => {
  try {
    const {
      name,
      email,
      company,
      message,
      brandName,
      estimatedUsers
    } = req.body;

    if (!name || !email || !company || !message) {
      return res.status(400).json({
        error: 'Name, email, company, and message are required'
      });
    }

    // Mock contact form submission (replace with actual CRM integration)
    const inquiry = {
      id: `inq_${Date.now()}`,
      name,
      email,
      company,
      message,
      brand_name: brandName,
      estimated_users: estimatedUsers,
      status: 'new',
      priority: estimatedUsers > 100 ? 'high' : 'medium',
      created_at: new Date().toISOString()
    };

    // Here you would integrate with your CRM or send notification email
    console.log('Enterprise inquiry:', inquiry);

    res.json({
      success: true,
      message: 'Dziękujemy za zapytanie! Skontaktujemy się w ciągu 24 godzin.',
      inquiry_id: inquiry.id
    });

  } catch (error) {
    console.error('Error processing enterprise contact:', error);
    res.status(500).json({
      error: 'Failed to process contact form',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Health check endpoint
router.get('/api/sales/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      product_generation: 'operational',
      payment_processing: 'operational',
      app_downloads: 'operational',
      analytics: 'operational',
      notifications: 'operational'
    },
    version: '1.0.0'
  });
});

export default router;