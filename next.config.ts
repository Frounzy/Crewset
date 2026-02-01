import createNextIntlPlugin from 'next-intl/plugin';
import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*',
      }
    ],
  },
  serverExternalPackages: ['iyzipay'],
};

export default withSentryConfig(
  withNextIntl(nextConfig),
  {
    org: "crewset",
    project: "crewset-saas",
    silent: !process.env.CI,
  }
);
