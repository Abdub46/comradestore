import React, { useState } from 'react';

export default function ContactUs() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Note: no backend endpoint is wired up yet, so this only confirms
    // locally for now. Let us know when you want this actually emailed/saved.
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-4">✅</p>
        <h1 className="text-xl font-semibold mb-2">Thank you, {form.name}!</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Your message has been received. We&apos;ll get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Contact Us</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Name</label>
          <input
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            className="mt-1 w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            className="mt-1 w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Phone Number</label>
          <input
            name="phone"
            required
            value={form.phone}
            onChange={handleChange}
            className="mt-1 w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Message</label>
          <textarea
            name="message"
            rows={5}
            required
            value={form.message}
            onChange={handleChange}
            className="mt-1 w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-600"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-primary-600 text-white font-semibold py-2.5 rounded-md hover:bg-primary-700"
        >
          Send Message
        </button>
      </form>
    </div>
  );
}