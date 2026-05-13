import { useState, useEffect, useCallback } from 'react';
import { getLandingContent, updateLandingContent } from '../lib/contentService';

const defaultContent = {
  heroTitle: "Exchange Skills. Learn Anything.",
  heroSubtitle: "Connect with thousands of learners worldwide. Swap your expertise and master new skills for free.",
  heroCta: "Get Started Free",
  featuresTitle: "Everything you need to master new skills",
  featuresSubtitle: "Our platform provides the perfect ecosystem for skill exchange and peer-to-peer learning.",
  features: [
    { icon: "Zap", title: "Smart Matching", description: "Our AI finds the perfect skill-swap partner based on your goals." },
    { icon: "Shield", title: "Verified Skills", description: "Earn trust badges as you complete sessions and receive ratings." },
    { icon: "MessageSquare", title: "Real-time Chat", description: "Connect instantly with your partners to coordinate learning." }
  ],
  howItWorksTitle: "How SkillBridge Works",
  howItWorksSubtitle: "Start your learning journey in three simple steps.",
  steps: [
    { number: "01", title: "Create Profile", description: "List the skills you have and the ones you want to learn." },
    { number: "02", title: "Match & Connect", description: "Browse profiles or let our AI suggest perfect matches for you." },
    { number: "03", title: "Start Swapping", description: "Schedule a session and start learning from your peer." }
  ],
  testimonialsTitle: "Trusted by thousands of learners",
  testimonialsSubtitle: "See how SkillBridge has helped people around the world master new skills and connect with mentors.",
  testimonials: [
    { name: "Priya Sharma", role: "UI Designer → React Developer", text: "I taught Figma and learned React in return. Within 3 months, I landed a full-stack role.", color: "#a855f7", avatar: "priya_sharma" },
    { name: "Rahul Verma", role: "Python Dev → Spanish Speaker", text: "Met my swap partner Lucia through SkillBridge. Best exchange ever!", color: "#06b6d4", avatar: "rahul_verma" }
  ],
  footerTagline: "The world's largest peer-to-peer skill exchange platform."
};

export function useLandingContent() {
  const [content, setContent] = useState(defaultContent);
  const [loading, setLoading] = useState(true);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    const data = await getLandingContent();
    if (data) {
      setContent(data);
    }
    setLoading(false);
  }, []);

  const saveContent = async (newContent: typeof defaultContent) => {
    setContent(newContent);
    await updateLandingContent(newContent);
  };

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return { content, loading, setContent, saveContent, refresh: fetchContent };
}


