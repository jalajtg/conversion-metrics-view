
import { supabase } from "@/integrations/supabase/client";

export const createDummyDataForUser = async () => {
  try {
    console.log('Starting dummy data creation...');
    
    // First check if user already has clinics
    const { data: existingClinics } = await supabase
      .from("clinics")
      .select("id")
      .limit(1);
    
    if (existingClinics && existingClinics.length > 0) {
      console.log('User already has clinics, skipping dummy data creation');
      return;
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user found');
      return;
    }

    console.log('Creating dummy clinics...');
    
    // Create dummy clinics
    const { data: clinics, error: clinicsError } = await supabase
      .from("clinics")
      .insert([
        {
          name: 'Downtown Medical Center',
          address: '123 Main Street, New York, NY 10001',
          phone: '+1-555-0123',
          email: 'contact@downtownmedical.com',
          owner_id: user.id
        },
        {
          name: 'Westside Health Clinic',
          address: '456 Oak Avenue, Los Angeles, CA 90210',
          phone: '+1-555-0456',
          email: 'info@westsidehealth.com',
          owner_id: user.id
        },
        {
          name: 'Northshore Family Practice',
          address: '789 Pine Road, Chicago, IL 60601',
          phone: '+1-555-0789',
          email: 'hello@northshorefamily.com',
          owner_id: user.id
        }
      ])
      .select();

    if (clinicsError) {
      console.error('Error creating clinics:', clinicsError);
      return;
    }

    if (!clinics || clinics.length === 0) {
      console.error('No clinics were created');
      return;
    }

    console.log('Created clinics:', clinics);

    // Create dummy products for each clinic
    const products = [
      // Downtown Medical Center
      { name: 'General Consultation', description: 'Standard medical consultation and examination', price: 150.00, clinic_id: clinics[0].id },
      { name: 'Blood Test Package', description: 'Comprehensive blood work and analysis', price: 85.00, clinic_id: clinics[0].id },
      { name: 'X-Ray Examination', description: 'Digital X-ray imaging service', price: 120.00, clinic_id: clinics[0].id },
      
      // Westside Health Clinic
      { name: 'Dental Cleaning', description: 'Professional dental cleaning and check-up', price: 95.00, clinic_id: clinics[1].id },
      { name: 'Physical Therapy Session', description: 'One-hour physical therapy treatment', price: 110.00, clinic_id: clinics[1].id },
      { name: 'Vaccination Service', description: 'Standard vaccination administration', price: 45.00, clinic_id: clinics[1].id },
      
      // Northshore Family Practice
      { name: 'Pediatric Consultation', description: 'Specialized consultation for children', price: 135.00, clinic_id: clinics[2].id },
      { name: 'Annual Health Checkup', description: 'Comprehensive annual health examination', price: 200.00, clinic_id: clinics[2].id },
      { name: 'Flu Shot', description: 'Seasonal influenza vaccination', price: 35.00, clinic_id: clinics[2].id }
    ];

    console.log('Creating dummy products...');
    const { data: createdProducts, error: productsError } = await supabase
      .from("products")
      .insert(products)
      .select();

    if (productsError) {
      console.error('Error creating products:', productsError);
      return;
    }

    console.log('Created products:', createdProducts);

    if (!createdProducts || createdProducts.length === 0) {
      console.error('No products were created');
      return;
    }

    // Create dummy leads
    const leads = [
      // Downtown Medical Center leads
      { client_name: 'John Smith', email: 'john.smith@email.com', phone: '+1-555-1001', status: 'new', product_id: createdProducts[0].id, clinic_id: clinics[0].id },
      { client_name: 'Sarah Johnson', email: 'sarah.johnson@email.com', phone: '+1-555-1002', status: 'contacted', product_id: createdProducts[1].id, clinic_id: clinics[0].id },
      
      // Westside Health Clinic leads
      { client_name: 'Mike Wilson', email: 'mike.wilson@email.com', phone: '+1-555-2001', status: 'qualified', product_id: createdProducts[3].id, clinic_id: clinics[1].id },
      { client_name: 'Emily Davis', email: 'emily.davis@email.com', phone: '+1-555-2002', status: 'new', product_id: createdProducts[4].id, clinic_id: clinics[1].id },
      
      // Northshore Family Practice leads
      { client_name: 'Robert Brown', email: 'robert.brown@email.com', phone: '+1-555-3001', status: 'converted', product_id: createdProducts[6].id, clinic_id: clinics[2].id },
      { client_name: 'Lisa Garcia', email: 'lisa.garcia@email.com', phone: '+1-555-3002', status: 'contacted', product_id: createdProducts[7].id, clinic_id: clinics[2].id }
    ];

    console.log('Creating dummy leads...');
    const { data: createdLeads, error: leadsError } = await supabase
      .from("leads")
      .insert(leads)
      .select();

    if (leadsError) {
      console.error('Error creating leads:', leadsError);
      return;
    }

    console.log('Created leads:', createdLeads);

    // Create dummy costs
    const costs = [
      { product_id: createdProducts[0].id, amount: 25.00, description: 'Marketing campaign - Google Ads', clinic_id: clinics[0].id },
      { product_id: createdProducts[1].id, amount: 15.00, description: 'Facebook advertising', clinic_id: clinics[0].id },
      { product_id: createdProducts[3].id, amount: 30.00, description: 'Local newspaper ad', clinic_id: clinics[1].id },
      { product_id: createdProducts[4].id, amount: 20.00, description: 'Referral program costs', clinic_id: clinics[1].id },
      { product_id: createdProducts[6].id, amount: 18.00, description: 'Social media promotion', clinic_id: clinics[2].id },
      { product_id: createdProducts[7].id, amount: 35.00, description: 'Direct mail campaign', clinic_id: clinics[2].id }
    ];

    console.log('Creating dummy costs...');
    const { error: costsError } = await supabase
      .from("costs")
      .insert(costs);

    if (costsError) {
      console.error('Error creating costs:', costsError);
      return;
    }

    // Create dummy sales (for converted leads)
    if (createdLeads && createdLeads.length > 4) {
      const sales = [
        { lead_id: createdLeads[4].id, product_id: createdProducts[6].id, amount: 135.00, clinic_id: clinics[2].id }
      ];

      console.log('Creating dummy sales...');
      const { error: salesError } = await supabase
        .from("sales")
        .insert(sales);

      if (salesError) {
        console.error('Error creating sales:', salesError);
      }
    }

    // Create dummy appointments
    if (createdLeads && createdLeads.length > 2) {
      const appointments = [
        { 
          lead_id: createdLeads[2].id, 
          type: 'booking', 
          status: 'confirmed', 
          scheduled_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
          clinic_id: clinics[1].id 
        },
        { 
          lead_id: createdLeads[1].id, 
          type: 'verbal', 
          status: 'pending', 
          scheduled_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
          clinic_id: clinics[0].id 
        }
      ];

      console.log('Creating dummy appointments...');
      const { error: appointmentsError } = await supabase
        .from("appointments")
        .insert(appointments);

      if (appointmentsError) {
        console.error('Error creating appointments:', appointmentsError);
      }
    }

    // Create dummy conversations
    if (createdLeads && createdLeads.length > 1) {
      const conversations = [
        { 
          lead_id: createdLeads[0].id, 
          notes: 'Initial contact made. Patient interested in general consultation for annual checkup.', 
          clinic_id: clinics[0].id 
        },
        { 
          lead_id: createdLeads[3].id, 
          notes: 'Discussed physical therapy options. Patient recovering from knee injury.', 
          clinic_id: clinics[1].id 
        }
      ];

      console.log('Creating dummy conversations...');
      const { error: conversationsError } = await supabase
        .from("conversations")
        .insert(conversations);

      if (conversationsError) {
        console.error('Error creating conversations:', conversationsError);
      }
    }

    console.log('Dummy data creation completed successfully!');
  } catch (error) {
    console.error('Error creating dummy data:', error);
  }
};
