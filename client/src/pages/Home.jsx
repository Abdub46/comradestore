import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Hero from '../components/Hero';
import CategoryList from '../components/CategoryList';
import ProductRowCard from '../components/ProductRowCard';
import PulseRow from '../components/pulse/PulseRow';
import WelcomeBack from '../components/pulse/WelcomeBack';
import MarketPulseStrip from '../components/pulse/MarketPulseStrip';
import AroundYouSection from '../components/pulse/AroundYouSection';
import WantedSection from '../components/pulse/WantedSection';
import { getPulse } from '../services/pulseService';
import { useAuth } from '../contexts/AuthContext';
import { getGuestLastVisit, recordGuestVisitNow } from '../utils/lastVisit';

export default function Home() {
  const { user } = useAuth();

  // Logged-in users' last visit is tracked server-side (User.lastSeenAt),
  // so we only need to read/pass a "since" timestamp for guests.
  const guestSince = !user ? getGuestLastVisit() : null;

  const { data, isLoading } = useQuery({
    queryKey: ['pulse', user?._id || 'guest'],
    queryFn: () => getPulse(guestSince ? { since: guestSince } : {}),
  });

  // Record "now" as this guest's last visit once the page has actually
  // loaded pulse data for this session, so their NEXT visit compares
  // against today rather than today comparing against itself.
  useEffect(() => {
    if (!user && data) {
      recordGuestVisitNow();
    }
  }, [user, data]);

  return (
    <div>
      <Hero />

      <WelcomeBack data={data?.sinceLastVisit} isLoading={isLoading} />

      <CategoryList />

      <PulseRow
        title="Trending on Campus"
        subtitle="These items are getting attention right now."
        items={data?.trending || []}
        isLoading={isLoading}
        emptyMessage="Nothing trending yet."
        renderCard={({ product }) => (
          <ProductRowCard
            key={product._id}
            product={product}
            topLeftBadge={`👀 ${product.views}`}
          />
        )}
      />

      <PulseRow
        title="Just Listed"
        items={data?.justListed || []}
        isLoading={isLoading}
        emptyMessage="No new listings yet. Check back soon."
        renderCard={(product) => <ProductRowCard key={product._id} product={product} showPostedTime />}
      />

      <PulseRow
        title="Price Drops"
        items={data?.priceDrops || []}
        isLoading={isLoading}
        emptyMessage="No price drops right now."
        renderCard={(product) => (
          <ProductRowCard key={product._id} product={product} oldPrice={product.previousPrice} />
        )}
      />

      <AroundYouSection
        residence={data?.residence}
        products={data?.aroundYou || []}
        isLoading={isLoading}
      />

      <WantedSection items={data?.wanted || []} isLoading={isLoading} />

      <MarketPulseStrip data={data?.marketPulse} isLoading={isLoading} />
    </div>
  );
}