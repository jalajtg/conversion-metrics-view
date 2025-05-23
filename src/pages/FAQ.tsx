
import React from 'react';
import { FaqList } from '@/components/faq/FaqList';
import { HelpCircle } from 'lucide-react';

export default function FAQPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-theme-blue/10">
          <HelpCircle className="h-6 w-6 text-theme-blue" />
        </div>
        <div>
          <h1 className="text-2xl font-bold gradient-text">Frequently Asked Questions</h1>
          <p className="text-gray-400">Find answers to common questions about our platform</p>
        </div>
      </div>
      
      <div className="bg-theme-dark-card rounded-xl p-6 border border-gray-800">
        <FaqList />
      </div>
    </div>
  );
}
