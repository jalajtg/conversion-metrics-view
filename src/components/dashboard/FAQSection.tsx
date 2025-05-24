
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, MessageCircle } from 'lucide-react';
import { useFAQs } from '@/hooks/useFAQs';
import type { DashboardFilters } from '@/types/dashboard';

interface FAQSectionProps {
  filters: DashboardFilters;
}

export function FAQSection({ filters }: FAQSectionProps) {
  const { data: faqs, isLoading } = useFAQs(filters);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-700 rounded mb-4 w-64"></div>
        <div className="h-64 bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div id="faq-section" className="space-y-6">
      <div className="flex items-center gap-3">
        <HelpCircle className="h-8 w-8 text-theme-blue" />
        <h2 className="text-2xl sm:text-3xl font-bold gradient-text">Most Frequently Asked Questions</h2>
      </div>
      
      <Card className="bg-theme-dark-card border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-theme-blue" />
            Top Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!faqs || faqs.length === 0 ? (
            <div className="text-center py-8">
              <HelpCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No frequently asked questions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={faq.id} className="flex items-center justify-between p-4 bg-theme-dark-lighter rounded-lg border border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-theme-blue/20 text-theme-blue rounded-full font-semibold">
                      {index + 1}
                    </div>
                    <span className="text-white text-sm sm:text-base">{faq.question}</span>
                  </div>
                  <div className="flex items-center gap-2 text-theme-blue">
                    <MessageCircle className="h-4 w-4" />
                    <span className="font-semibold">{faq.asked_count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
