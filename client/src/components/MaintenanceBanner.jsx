import React, { useEffect, useState } from 'react';
import { getSettings } from '../services/settingsService';

export default function MaintenanceBanner() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    getSettings()
      .then(setSettings)
      .catch(() => {}); // fails silently - the site just runs as normal
  }, []);

  if (!settings?.maintenanceMode) return null;

  return (
    <div className="bg-yellow-400 text-yellow-900 text-sm text-center py-2 px-4 font-medium">
      {settings.maintenanceMessage}
    </div>
  );
}