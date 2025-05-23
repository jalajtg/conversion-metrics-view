
import { FaqItem, FaqQueryParams } from '@/types/faq';
import { supabase } from '@/integrations/supabase/client';

// Mock data for now
const mockFaqs: FaqItem[] = [
  {
    id: '1',
    question: 'How do I create a new product?',
    answer: 'To create a new product, navigate to the Products section and click on the "Add Product" button. Fill in all required fields and click Save.',
    category: 'Products',
    createdAt: new Date(2023, 4, 15).toISOString(),
  },
  {
    id: '2',
    question: 'How do I track my sales performance?',
    answer: 'You can track your sales performance on the Dashboard. It shows all your key metrics including leads, conversations, and paid amounts.',
    category: 'Sales',
    createdAt: new Date(2023, 5, 20).toISOString(),
  },
  {
    id: '3',
    question: 'Can I export my data to Excel?',
    answer: 'Yes, you can export your data by clicking on the export button on any data table. You can choose between CSV and Excel formats.',
    category: 'Data',
    createdAt: new Date(2023, 6, 5).toISOString(),
  },
  {
    id: '4',
    question: 'How do I update my profile information?',
    answer: 'To update your profile, click on your avatar in the top right corner and select "Profile". You can then edit your information and save changes.',
    category: 'Account',
    createdAt: new Date(2023, 7, 12).toISOString(),
  },
  {
    id: '5',
    question: 'What does the "Cost per Lead" metric mean?',
    answer: 'Cost per Lead is the total cost divided by the number of leads generated. It helps you understand how cost-effective your lead generation efforts are.',
    category: 'Metrics',
    createdAt: new Date(2023, 8, 8).toISOString(),
  },
  {
    id: '6',
    question: 'How do I set up notifications?',
    answer: 'To set up notifications, go to Settings and select the Notifications tab. You can choose which events trigger notifications and how you want to receive them.',
    category: 'Settings',
    createdAt: new Date(2023, 9, 25).toISOString(),
  },
  {
    id: '7',
    question: 'Is my data secure?',
    answer: 'Yes, we use industry-standard encryption and security practices to protect your data. All information is stored securely and access is strictly controlled.',
    category: 'Security',
    createdAt: new Date(2023, 10, 3).toISOString(),
  },
  {
    id: '8',
    question: 'Can I add multiple team members?',
    answer: 'Yes, on premium plans you can add team members by going to Settings > Team. You can assign different roles and permissions to each team member.',
    category: 'Teams',
    createdAt: new Date(2023, 11, 14).toISOString(),
  },
  {
    id: '9',
    question: 'How are conversations tracked?',
    answer: 'Conversations are tracked whenever you log an interaction with a lead. This can be a phone call, email, or meeting. Each interaction is counted as a conversation.',
    category: 'Metrics',
    createdAt: new Date(2024, 0, 7).toISOString(),
  },
  {
    id: '10',
    question: 'What payment methods are accepted?',
    answer: 'We accept all major credit cards, PayPal, and bank transfers for annual subscriptions. You can update your payment method in the Billing section.',
    category: 'Billing',
    createdAt: new Date(2024, 1, 22).toISOString(),
  },
  {
    id: '11',
    question: 'How do I cancel my subscription?',
    answer: 'To cancel your subscription, go to Settings > Billing and click on "Cancel Subscription". Your account will remain active until the end of the current billing period.',
    category: 'Billing',
    createdAt: new Date(2024, 2, 18).toISOString(),
  },
  {
    id: '12',
    question: 'Can I change my subscription plan?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. Go to Settings > Billing and select "Change Plan" to see available options.',
    category: 'Billing',
    createdAt: new Date(2024, 3, 5).toISOString(),
  },
];

export const fetchFaqs = async (params: FaqQueryParams): Promise<{ data: FaqItem[], count: number }> => {
  // This would be a real Supabase query in production
  // const { data, error, count } = await supabase
  //   .from('faqs')
  //   .select('*', { count: 'exact' })
  //   .ilike('question', `%${params.search || ''}%`)
  //   .order(params.sortBy || 'createdAt', { ascending: params.sortOrder === 'asc' })
  //   .range((params.page - 1) * params.pageSize, params.page * params.pageSize - 1);

  // For now, let's implement the filtering, sorting, and pagination in JS
  let filteredData = [...mockFaqs];
  
  // Search implementation
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filteredData = filteredData.filter(
      faq => faq.question.toLowerCase().includes(searchLower) || 
             faq.answer.toLowerCase().includes(searchLower) ||
             faq.category.toLowerCase().includes(searchLower)
    );
  }
  
  // Sorting implementation
  if (params.sortBy) {
    filteredData.sort((a: any, b: any) => {
      const aValue = a[params.sortBy as keyof FaqItem];
      const bValue = b[params.sortBy as keyof FaqItem];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return params.sortOrder === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      return params.sortOrder === 'asc' 
        ? (aValue > bValue ? 1 : -1) 
        : (aValue < bValue ? 1 : -1);
    });
  }
  
  // Pagination calculation
  const count = filteredData.length;
  const start = (params.page - 1) * params.pageSize;
  const end = start + params.pageSize;
  const paginatedData = filteredData.slice(start, end);
  
  return { data: paginatedData, count };
};

export const getFaqCategories = async (): Promise<string[]> => {
  // This would be a real Supabase query in production
  // const { data } = await supabase
  //   .from('faqs')
  //   .select('category')
  //   .distinct();
  
  // return data?.map(item => item.category) || [];
  
  // For now, extract categories from mock data
  const categories = new Set(mockFaqs.map(faq => faq.category));
  return Array.from(categories);
};
