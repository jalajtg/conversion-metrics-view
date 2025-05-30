
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, MessageCircle, TrendingUp } from 'lucide-react';
import type { DashboardFilters } from '@/types/dashboard';

interface FAQSectionProps {
  filters: DashboardFilters;
  unifiedData?: any;
}

export function FAQSection({ filters, unifiedData }: FAQSectionProps) {
  const faqs = unifiedData?.faqs || [];
  const isLoading = !unifiedData;

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 sm:h-8 bg-gray-700 rounded mb-4 w-48 sm:w-64"></div>
        <Card className="bg-theme-dark-card border-gray-800">
          <CardHeader>
            <div className="h-5 sm:h-6 bg-gray-700 rounded w-24 sm:w-32"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 sm:h-16 bg-gray-700 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div id="faq-section" className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="p-2 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20">
          <HelpCircle className="h-6 w-6 sm:h-8 sm:w-8 text-orange-400" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
            <span className="sm:hidden">FAQ's</span>
            <span className="hidden sm:inline">Most Frequently Asked Questions</span>
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm">Top questions from your patients and visitors</p>
        </div>
      </div>
      
      <Card className="bg-gradient-to-br from-theme-dark-card to-theme-dark-lighter border border-gray-700/50 shadow-2xl">
        <CardHeader className="border-b border-gray-700/50 p-4 sm:p-6">
          <CardTitle className="text-white flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400" />
              </div>
              <span className="text-sm sm:text-base">Popular Questions</span>
            </div>
            <span className="text-xs sm:text-sm font-normal text-gray-400 sm:ml-auto">
              {faqs?.length || 0} total questions
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {!faqs || faqs.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-orange-500/10 to-red-500/10 mb-4">
                <HelpCircle className="h-6 w-6 sm:h-8 sm:w-8 text-orange-400" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-white mb-2">No questions yet</h3>
              <p className="text-gray-400 text-sm">No frequently asked questions found</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {faqs.map((faq: any, index: number) => (
                <div 
                  key={faq.id} 
                  className="group relative p-3 sm:p-5 rounded-xl border border-gray-700/50 transition-all duration-300 hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/10"
                  style={{
                    background: `linear-gradient(135deg, rgba(249, 115, 22, ${0.03 + index * 0.01}) 0%, rgba(239, 68, 68, ${0.03 + index * 0.01}) 100%)`
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-sm sm:text-lg flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium text-sm sm:text-lg leading-relaxed break-words">
                          {faq.question}
                        </h3>
                        <p className="text-gray-400 text-xs sm:text-sm mt-1">
                          Frequently asked by patients
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500/10 to-red-500/10 px-3 py-2 sm:px-4 rounded-full self-start sm:self-auto">
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-orange-400" />
                      <span className="font-bold text-orange-400 text-sm sm:text-lg">
                        {faq.asked_count}
                      </span>
                      <span className="text-gray-400 text-xs sm:text-sm">
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
