import React from 'react';

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
        {children}
      </div>
    </div>
  );
}

export default function HowToUse() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">How to Use CampusMarket</h1>

      <Section title="1. Browsing items">
        <p>
          The Home page shows Featured Items, ranked by what&apos;s getting the most
          views and favorites, along with a Just Listed row for the newest posts. Use
          the search bar or the <strong>Browse</strong> page to filter by category,
          county/residence, condition, and price range.
        </p>
      </Section>

      <Section title="2. Viewing a product & contacting the seller">
        <p>
          Tap any listing to open its product page, where you can see all the photos,
          price, condition, and location. There&apos;s no in-app payment or checkout &mdash;
          tap <strong>Contact Seller on WhatsApp</strong> to message the seller directly
          and arrange payment and pickup yourselves.
        </p>
      </Section>

      <Section title="3. Cart (your shortlist)">
        <p>
          Adding an item to your <strong>Cart</strong> doesn&apos;t buy or reserve it &mdash;
          it&apos;s just a shortlist so you can gather a few things you&apos;re interested in
          before messaging sellers about them.
        </p>
      </Section>

      <Section title="4. Selling an item">
        <p>
          Tap <strong>Sell Item</strong> (the + button in the mobile nav, or the link in
          the top menu) to list something. You&apos;ll need to be logged in &mdash; your name
          and WhatsApp number are pulled from your profile automatically, so the form
          only asks for the product details: photos (up to 5), category, price, condition,
          and location.
        </p>
      </Section>

      <Section title="5. Managing your listings">
        <p>
          Your <strong>Dashboard</strong> ("My Products") lists everything you&apos;ve
          posted. From there you can edit or delete a listing, and change its status
          between <strong>Available</strong>, <strong>Reserved</strong>, and{' '}
          <strong>Sold</strong> as buyers contact you.
        </p>
      </Section>

      <Section title="6. Saved items">
        <p>
          Tap the heart icon on any listing to favorite it. Find everything you&apos;ve
          saved later on the <strong>Saved</strong> page.
        </p>
      </Section>

      <Section title="7. Wanted board">
        <p>
          Looking for something that isn&apos;t listed yet? Post a request on the{' '}
          <strong>Wanted</strong> board so sellers with a matching item can reach out to
          you.
        </p>
      </Section>

      <Section title="8. Your profile">
        <p>
          Update your name, WhatsApp number, location, and avatar from{' '}
          <strong>Profile</strong> &mdash; this information is what gets attached to every
          item you list. You can also toggle dark mode from the icon in the top navigation
          bar.
        </p>
      </Section>
    </div>
  );
}