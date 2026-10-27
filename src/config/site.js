// Single source of truth for the deployed URL. Used for canonical, Open Graph,
// sitemap.xml and robots.txt. Change it once your Vercel domain is final.
export const SITE_URL = 'https://zachary-dev.vercel.app';

export const SITE = {
  url: SITE_URL,
  title: 'Zachary Belmonte — Web, App & Game Developer',
  description:
    'Portfolio of Zachary Belmonte, an IT student building web apps, mobile apps and Roblox games. Open to internships (OJT).',
  ogImage: `${SITE_URL}/og.png`,
  themeColor: '#5b5bd6',
};

// Contact form endpoint (Web3Forms). The key comes from VITE_FORM_KEY.
export const FORM_ENDPOINT = 'https://api.web3forms.com/submit';
