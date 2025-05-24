
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, MessageCircle, TrendingUp } from 'lucide-react';
import { useFAQs } from '@/hooks/useFAQs';
import type { DashboardFilters } from '@/types/dashboard';

interface FAQSectionProps {
  filters: DashboardFilters;
}

export function FAQSection({ filters }: FAQSectionProps) {
  const { data: faqs, isLoading } = useFAQs(filters);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-700 rounded mb-4 w-64"></div>
        <Card className="bg-theme-dark-card border-gray-800">
          <CardHeader>
            <div className="h-6 bg-gray-700 rounded w-32"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-700 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div id="faq-section" className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20">
          <HelpCircle className="h-8 w-8 text-orange-400" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
            Most Frequently Asked Questions
          </h2>
          <p className="text-gray-400">Top questions from your patients and visitors</p>
        </div>
      </div>
      
      <Card className="bg-gradient-to-br from-theme-dark-card to-theme-dark-lighter border border-gray-700/50 shadow-2xl">
        <CardHeader className="border-b border-gray-700/50">
          <CardTitle className="text-white flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <MessageCircle className="h-5 w-5 text-orange-400" />
            </div>
            Popular Questions
            <span className="ml-auto text-sm font-normal text-gray-400">
              {faqs?.length || 0} total questions
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {!faqs || faqs.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-orange-500/10 to-red-500/10 mb-4">
                <HelpCircle className="h-8 w-8 text-orange-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No questions yet</h3>
              <p className="text-gray-400">No frequently asked questions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div 
                  key={faq.id} 
                  className="group relative p-5 rounded-xl border border-gray-700/50 transition-all duration-300 hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/10"
                  style={{
                    background: `linear-gradient(135deg, rgba(249, 115, 22, ${0.03 + index * 0.01}) 0%, rgba(239, 68, 68, ${0.03 + index * 0.01}) 100%)`
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium text-lg leading-relaxed">
                          {faq.question}
                        </h3>
                        <p className="text-gray-400 text-sm mt-1">
                          Frequently asked by patients
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500/10 to-red-500/10 px-4 py-2 rounded-full">
                      <TrendingUp className="h-4 w-4 text-orange-400" />
                      <span className="font-bold text-orange-400 text-lg">
                        {faq.asked_count}
                      </span>
                      <span className="text-gray-400 text-sm">
                        {faq.asked_count === 1 ? 'time' : 'times'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Subtle hover effect indicator */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
